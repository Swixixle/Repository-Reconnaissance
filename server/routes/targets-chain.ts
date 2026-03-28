import type { Express, Request, Response } from "express";
import { z } from "zod";
import crypto from "node:crypto";
import { eq, desc, and, sql, gte } from "drizzle-orm";
import { db } from "../db";
import { scheduledTargets, receiptChain } from "@shared/schema";
import { getAuth } from "../middleware/clerk";
import { ingest, hostedHttpsGitToIngestInput } from "../ingestion/ingest";
import type { IngestResult } from "../ingestion/types";
import { runProjectAnalysis } from "../runProjectAnalysis";
import { storage } from "../storage";
import { analyzerQueue } from "../queue/analyzer-queue";
import type { AnalyzerJobData } from "../queue/analyzer-worker";
import { sortKeysDeep, isChainFeatureEnabled } from "../chain/receiptCanonical";
import { verifyChainRowsOrdered } from "../chain/verifyChainRows";
import { finalizeAnalysisReceiptChain } from "../receiptChainFinalize";
import { getSchedulerStatus } from "../scheduler";
import { heavyLimiter } from "../middleware/rateLimiter";

export type ChainRouteGuards = {
  requireAuth: (req: any, res: any) => boolean;
  requireDevAdmin: (req: any, res: any) => boolean;
  rateLimit: () => boolean;
};

function sidecarFromIngest(p: IngestResult) {
  return {
    inputType: p.inputType,
    cleanup: p.cleanup,
    inputTypeDetail: p.inputTypeDetail,
    analysisMode: p.analysisMode,
    commitHash: p.commitHash,
    branch: p.branch,
    sourceUrl: p.sourceUrl,
    warnings: p.warnings,
  };
}

function resolveOwner(req: Request): string | null {
  const u = req.apiUser?.clerkUserId ?? null;
  if (u) return u;
  return getAuth(req as any).userId;
}

async function assertRepoReachable(url: string): Promise<void> {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    throw new Error("Invalid repository URL");
  }
  const res = await fetch(u.origin, {
    method: "HEAD",
    signal: AbortSignal.timeout(12_000),
  }).catch(() => null);
  if (!res || (res.status >= 400 && res.status !== 405)) {
    await fetch(u.href, { method: "GET", signal: AbortSignal.timeout(12_000), headers: { Range: "bytes=0-0" } }).catch(() => {
      throw new Error("Repository URL is not reachable");
    });
  }
}

const postTargetSchema = z.object({
  repo_url: z.string().url(),
  repo_name: z.string().optional(),
  target_label: z.string().optional(),
  interval: z.enum(["three_daily", "daily", "weekly", "manual"]),
  timezone: z.string().optional(),
  alert_email: z.union([z.string().email(), z.literal("")]).optional(),
  alert_webhook: z.union([z.string().url(), z.literal("")]).optional(),
});

const patchTargetSchema = z.object({
  target_label: z.string().optional(),
  interval: z.enum(["three_daily", "daily", "weekly", "manual"]).optional(),
  timezone: z.string().optional(),
  alert_email: z.union([z.string().email(), z.literal("")]).optional(),
  alert_webhook: z.union([z.string().url(), z.literal("")]).optional(),
  active: z.boolean().optional(),
});

function isAdminReq(req: Request): boolean {
  const required = process.env.ADMIN_KEY;
  if (!required || required.length === 0) {
    return process.env.NODE_ENV !== "production";
  }
  const provided = String(req.headers["x-admin-key"] || "");
  const maxLen = Math.max(provided.length, required.length);
  try {
    return (
      crypto.timingSafeEqual(
        Buffer.from(provided.padEnd(maxLen, "\0")),
        Buffer.from(required.padEnd(maxLen, "\0")),
      ) && provided.length === required.length
    );
  } catch {
    return false;
  }
}

export function mountTargetChainRoutes(app: Express, g: ChainRouteGuards): void {
  app.get("/api/scheduler/status", async (req: Request, res: Response) => {
    if (!g.rateLimit()) return res.status(429).json({ error: "Rate limit exceeded" });
    if (!g.requireDevAdmin(req, res)) return;
    const st = await getSchedulerStatus();
    res.json(st);
  });

  app.get("/api/targets", async (req: Request, res: Response) => {
    if (!g.rateLimit()) return res.status(429).json({ error: "Rate limit exceeded" });
    if (!g.requireAuth(req, res)) return;
    const owner = resolveOwner(req);
    const isAdmin = isAdminReq(req);

    let rows;
    if (isAdmin) {
      rows = await db.select().from(scheduledTargets).orderBy(desc(scheduledTargets.createdAt));
    } else if (owner) {
      rows = await db
        .select()
        .from(scheduledTargets)
        .where(eq(scheduledTargets.ownerId, owner))
        .orderBy(desc(scheduledTargets.createdAt));
    } else {
      rows = await db
        .select()
        .from(scheduledTargets)
        .where(sql`${scheduledTargets.ownerId} is null`)
        .orderBy(desc(scheduledTargets.createdAt));
    }
    res.json(rows);
  });

  app.post("/api/targets", heavyLimiter, async (req: Request, res: Response) => {
    if (!g.rateLimit()) return res.status(429).json({ error: "Rate limit exceeded" });
    if (!g.requireAuth(req, res)) return;
    if (!isChainFeatureEnabled()) {
      return res.status(503).json({ message: "Evidence chain feature disabled (DEBRIEF_CHAIN_ENABLED=false)" });
    }
    try {
      const body = postTargetSchema.parse(req.body);
      await assertRepoReachable(body.repo_url);
      const owner = resolveOwner(req);
      const label = body.target_label || body.repo_name || new URL(body.repo_url).pathname.replace(/^\//, "");
      const project = await storage.createProject(
        {
          url: body.repo_url,
          name: body.repo_name || label.slice(0, 120) || "repo",
          reportAudience: "pro",
          userId: req.apiUser?.id ?? undefined,
        },
        "github",
      );

      const [target] = await db
        .insert(scheduledTargets)
        .values({
          repoUrl: body.repo_url,
          repoName: body.repo_name ?? null,
          targetLabel: body.target_label ?? null,
          ownerId: owner,
          interval: body.interval,
          timezone: body.timezone || process.env.DEBRIEF_SCHEDULER_TIMEZONE || "UTC",
          debriefProjectId: project.id,
          alertEmail: body.alert_email || null,
          alertWebhook: body.alert_webhook || null,
        })
        .returning();

      const chainContext = {
        scheduledTargetId: target.id,
        triggeredBy: "api" as const,
        scheduled: false,
      };

      const q = analyzerQueue();
      if (q) {
        const payload: AnalyzerJobData = {
          projectId: project.id,
          ingestInput: hostedHttpsGitToIngestInput(body.repo_url),
          reportAudience: "pro",
          chainContext,
        };
        const job = await q.add("analyze", payload, { jobId: `target-genesis-${target.id}` });
        return res.status(201).json({ target, projectId: project.id, jobId: String(job.id) });
      }

      const ingestResult = await ingest(hostedHttpsGitToIngestInput(body.repo_url));
      const { insertedRunId, runDir } = await runProjectAnalysis({
        projectId: project.id,
        source: ingestResult.localPath,
        mode: "local",
        ingestMeta: sidecarFromIngest(ingestResult),
        reportAudience: "pro",
        skipCacheCheck: true,
        chainContext,
      });
      if (insertedRunId != null) {
        await finalizeAnalysisReceiptChain({
          chainContext,
          projectId: project.id,
          newRunDir: runDir,
          dbRunId: insertedRunId,
        });
      }
      return res.status(201).json({ target, projectId: project.id, runDir });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message || "validation" });
      }
      return res.status(400).json({ message: err?.message || "create failed" });
    }
  });

  async function loadTarget(req: Request, res: Response) {
    const id = req.params.targetId;
    const [row] = await db.select().from(scheduledTargets).where(eq(scheduledTargets.id, id)).limit(1);
    if (!row) {
      res.status(404).json({ message: "Target not found" });
      return null;
    }
    const owner = resolveOwner(req);
    if (!isAdminReq(req) && row.ownerId && owner !== row.ownerId) {
      res.status(403).json({ message: "Forbidden" });
      return null;
    }
    return row;
  }

  app.patch("/api/targets/:targetId", async (req: Request, res: Response) => {
    if (!g.rateLimit()) return res.status(429).json({ error: "Rate limit exceeded" });
    if (!g.requireAuth(req, res)) return;
    const row = await loadTarget(req, res);
    if (!row) return;
    try {
      const body = patchTargetSchema.parse(req.body);
      const upd: Record<string, unknown> = { updatedAt: new Date() };
      if (body.target_label !== undefined) upd.targetLabel = body.target_label;
      if (body.interval !== undefined) upd.interval = body.interval;
      if (body.timezone !== undefined) upd.timezone = body.timezone;
      if (body.alert_email !== undefined) upd.alertEmail = body.alert_email || null;
      if (body.alert_webhook !== undefined) upd.alertWebhook = body.alert_webhook || null;
      if (body.active !== undefined) upd.active = body.active;
      const [updated] = await db
        .update(scheduledTargets)
        .set(upd as any)
        .where(eq(scheduledTargets.id, row.id))
        .returning();
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ message: err?.message || "bad request" });
    }
  });

  app.delete("/api/targets/:targetId", async (req: Request, res: Response) => {
    if (!g.rateLimit()) return res.status(429).json({ error: "Rate limit exceeded" });
    if (!g.requireAuth(req, res)) return;
    const row = await loadTarget(req, res);
    if (!row) return;
    await db.update(scheduledTargets).set({ active: false, updatedAt: new Date() }).where(eq(scheduledTargets.id, row.id));
    res.json({ ok: true });
  });

  app.get("/api/targets/:targetId/chain", async (req: Request, res: Response) => {
    if (!g.rateLimit()) return res.status(429).json({ error: "Rate limit exceeded" });
    if (!g.requireAuth(req, res)) return;
    const row = await loadTarget(req, res);
    if (!row) return;
    const fromSeq = req.query.from ? Number(req.query.from) : null;
    const limit = 500;
    const items =
      fromSeq != null && !Number.isNaN(fromSeq)
        ? await db
            .select()
            .from(receiptChain)
            .where(and(eq(receiptChain.targetId, row.id), gte(receiptChain.chainSequence, fromSeq)))
            .orderBy(desc(receiptChain.chainSequence))
            .limit(limit)
        : await db
            .select()
            .from(receiptChain)
            .where(eq(receiptChain.targetId, row.id))
            .orderBy(desc(receiptChain.chainSequence))
            .limit(limit);
    items.reverse();
    res.json({ targetId: row.id, items, truncated: items.length >= limit });
  });

  app.get("/api/targets/:targetId/chain/verify", async (req: Request, res: Response) => {
    if (!g.rateLimit()) return res.status(429).json({ error: "Rate limit exceeded" });
    if (!g.requireAuth(req, res)) return;
    const row = await loadTarget(req, res);
    if (!row) return;
    const rows = await db
      .select()
      .from(receiptChain)
      .where(eq(receiptChain.targetId, row.id))
      .orderBy(receiptChain.chainSequence);
    const v = verifyChainRowsOrdered(rows);
    res.json({
      targetId: row.id,
      ...v,
      verification_log: v.verificationLog,
    });
  });

  app.get("/api/targets/:targetId/chain/export", async (req: Request, res: Response) => {
    if (!g.rateLimit()) return res.status(429).json({ error: "Rate limit exceeded" });
    if (!g.requireAuth(req, res)) return;
    const row = await loadTarget(req, res);
    if (!row) return;
    const chainRows = await db
      .select()
      .from(receiptChain)
      .where(eq(receiptChain.targetId, row.id))
      .orderBy(receiptChain.chainSequence);
    const v = verifyChainRowsOrdered(chainRows);
    const receipts = chainRows.map((r) => ({
      ...r,
      receipt_json: r.receiptDocument ?? {},
    }));
    const generatedBy = req.apiUser?.clerkUserId || (req.headers.authorization?.startsWith("Bearer dk_") ? "api" : "anon");
    const bundleCore = {
      export_version: "1.0",
      generated_at: new Date().toISOString(),
      generated_by: generatedBy,
      target: row,
      chain_verified: v.chainIntact,
      chain_length: chainRows.length,
      first_receipt_at: chainRows[0]?.timestamp?.toISOString?.() ?? null,
      last_receipt_at: chainRows[chainRows.length - 1]?.timestamp?.toISOString?.() ?? null,
      gaps_detected: v.gapsCount,
      anomalies_detected: v.anomaliesCount,
      receipts,
      verification_log: v.verificationLog,
    };
    const canonical = JSON.stringify(sortKeysDeep(bundleCore));
    const export_hash = crypto.createHash("sha256").update(canonical, "utf8").digest("hex");
    let export_signature = "";
    const pem =
      process.env.DEBRIEF_CHAIN_EXPORT_PRIVATE_KEY?.trim() ||
      process.env.DEBRIEF_CHAIN_SIGNING_PRIVATE_KEY?.trim();
    if (pem) {
      try {
        const key = crypto.createPrivateKey({ key: pem, format: "pem" });
        export_signature = crypto.sign(null, Buffer.from(export_hash, "utf8"), key).toString("hex");
      } catch {
        export_signature = "";
      }
    }
    const bundle = { ...bundleCore, export_hash, export_signature };
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${row.id}.debrief-chain.json"`);
    res.send(JSON.stringify(bundle, null, 2));
  });
}
