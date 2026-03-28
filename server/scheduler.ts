/**
 * Time-based evidence trail scheduler (node-cron + BullMQ).
 * Master switch: DEBRIEF_SCHEDULER_ENABLED=true and DEBRIEF_CHAIN_ENABLED.
 */
import path from "node:path";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import cron from "node-cron";
import { eq, and, ne } from "drizzle-orm";
import { db } from "./db";
import { scheduledTargets, projects } from "@shared/schema";
import { analyzerQueue } from "./queue/analyzer-queue";
import type { AnalyzerJobData } from "./queue/analyzer-worker";
import { hostedHttpsGitToIngestInput } from "./ingestion/ingest";
import { finalizeGapReceipt } from "./receiptChainFinalize";
import { isChainFeatureEnabled } from "./chain/receiptCanonical";

const tzDefault = () => process.env.DEBRIEF_SCHEDULER_TIMEZONE || "UTC";

export function intervalToMs(interval: string): number {
  switch (interval) {
    case "three_daily":
      return 8 * 3600 * 1000;
    case "daily":
      return 24 * 3600 * 1000;
    case "weekly":
      return 7 * 24 * 3600 * 1000;
    default:
      return Number.POSITIVE_INFINITY;
  }
}

function cronForInterval(interval: string): string[] {
  switch (interval) {
    case "three_daily":
      return ["0 6 * * *", "0 14 * * *", "0 22 * * *"];
    case "daily":
      return ["0 6 * * *"];
    case "weekly":
      return ["0 6 * * 1"];
    default:
      return [];
  }
}

async function recordGapPython(targetId: string, gapStart: string, gapEnd: string): Promise<void> {
  const outDir = path.join(process.cwd(), "out", "gap_runs", targetId, String(Date.now()));
  await fs.mkdir(outDir, { recursive: true });
  const python = process.env.PYTHON_EXEC_PATH || "python3";
  const code = await new Promise<number>((resolve) => {
    const proc = spawn(
      python,
      [
        "-m",
        "server.analyzer.analyzer_cli",
        "record-gap",
        "--target-id",
        targetId,
        "--output-dir",
        outDir,
        "--gap-start",
        gapStart,
        "--gap-end",
        gapEnd,
        "--scheduled",
      ],
      { cwd: process.cwd(), env: { ...process.env, PTA_CHAIN_STATE_DIR: process.env.PTA_CHAIN_STATE_DIR || path.join(process.cwd(), "out", "chain_state") } },
    );
    proc.on("close", (c) => resolve(c ?? 1));
  });
  if (code !== 0) {
    console.error(`[scheduler] record-gap failed exit=${code} target=${targetId}`);
    return;
  }
  const receiptPath = path.join(outDir, "receipt.json");
  await finalizeGapReceipt({ targetId, receiptPath });
}

async function maybeRecordGapBeforeRun(target: typeof scheduledTargets.$inferSelect): Promise<void> {
  const ms = intervalToMs(target.interval);
  if (!Number.isFinite(ms)) return;
  const threshold = Date.now() - 1.5 * ms;
  const last = target.lastRunAt ? new Date(target.lastRunAt).getTime() : 0;
  if (last > 0 && last < threshold) {
    const gapStart = new Date(last).toISOString();
    const gapEnd = new Date().toISOString();
    console.log(`[scheduler] gap receipt for ${target.id} (${target.interval})`);
    await recordGapPython(target.id, gapStart, gapEnd);
  }
}

async function enqueueForTarget(target: typeof scheduledTargets.$inferSelect, catchUp: boolean) {
  const q = analyzerQueue();
  if (!q) {
    console.warn("[scheduler] BullMQ not configured — cannot enqueue");
    return;
  }
  let projectId = target.debriefProjectId ?? null;
  if (projectId == null) {
    const [p] = await db
      .select()
      .from(projects)
      .where(eq(projects.url, target.repoUrl))
      .limit(1);
    projectId = p?.id ?? null;
  }
  if (projectId == null) {
    console.error("[scheduler] no project for target", target.id);
    return;
  }
  let ingestInput;
  try {
    ingestInput = hostedHttpsGitToIngestInput(target.repoUrl);
  } catch {
    ingestInput = { type: "github" as const, url: target.repoUrl };
  }
  const payload: AnalyzerJobData = {
    projectId,
    ingestInput,
    reportAudience: "pro",
    chainContext: {
      scheduledTargetId: target.id,
      triggeredBy: "scheduler",
      scheduled: true,
      catchUp,
    },
  };
  await q.add("analyze", payload, { jobId: `sched-${target.id}-${Date.now()}` });
  console.log(`[scheduler] enqueued analyze project=${projectId} target=${target.id} catchUp=${catchUp}`);
}

const registered: { stop: () => void }[] = [];

export function startScheduler(): void {
  if (process.env.DEBRIEF_SCHEDULER_ENABLED !== "1" && process.env.DEBRIEF_SCHEDULER_ENABLED !== "true") {
    console.log("[scheduler] disabled (DEBRIEF_SCHEDULER_ENABLED)");
    return;
  }
  if (!isChainFeatureEnabled()) {
    console.log("[scheduler] skipped (DEBRIEF_CHAIN_ENABLED off)");
    return;
  }

  void (async () => {
    const rows = await db
      .select()
      .from(scheduledTargets)
      .where(and(eq(scheduledTargets.active, true), ne(scheduledTargets.interval, "manual")));
    const tz = tzDefault();
    for (const t of rows) {
      const crons = cronForInterval(t.interval);
      const useTz = t.timezone || tz;
      for (const expr of crons) {
        const task = cron.schedule(
          expr,
          () => {
            void (async () => {
              const fresh = await db.select().from(scheduledTargets).where(eq(scheduledTargets.id, t.id)).limit(1);
              const row = fresh[0];
              if (!row || !row.active || row.interval === "manual") return;
              try {
                await maybeRecordGapBeforeRun(row);
                await enqueueForTarget(row, false);
              } catch (e) {
                console.error("[scheduler] tick error", e);
              }
            })();
          },
          { timezone: useTz },
        );
        registered.push({ stop: () => task.stop() });
        console.log(`[scheduler] registered ${expr} tz=${useTz} target=${t.id}`);
      }
      const ms = intervalToMs(t.interval);
      if (Number.isFinite(ms)) {
        const last = t.lastRunAt ? new Date(t.lastRunAt).getTime() : 0;
        if (last === 0 || Date.now() - last > 1.5 * ms) {
          void enqueueForTarget(t, true).catch((e) => console.error("[scheduler] catch-up", e));
        }
      }
    }
  })().catch((e) => console.error("[scheduler] startup", e));
}

export async function getSchedulerStatus(): Promise<{
  targets: Array<{
    id: string;
    repoUrl: string;
    interval: string;
    timezone: string;
    active: boolean;
    lastRunAt: string | null;
    lastReceiptHash: string | null;
    chainLength: number;
    missed: boolean;
  }>;
}> {
  const rows = await db.select().from(scheduledTargets).where(eq(scheduledTargets.active, true));
  const out = [];
  for (const t of rows) {
    const ms = intervalToMs(t.interval);
    const last = t.lastRunAt ? new Date(t.lastRunAt).getTime() : 0;
    const missed = Number.isFinite(ms) && last > 0 && Date.now() - last > 1.5 * ms;
    out.push({
      id: t.id,
      repoUrl: t.repoUrl,
      interval: t.interval,
      timezone: t.timezone,
      active: t.active,
      lastRunAt: t.lastRunAt ? new Date(t.lastRunAt).toISOString() : null,
      lastReceiptHash: t.lastReceiptHash,
      chainLength: t.chainLength,
      missed,
    });
  }
  return { targets: out };
}
