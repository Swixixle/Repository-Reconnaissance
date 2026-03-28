import path from "node:path";
import fs from "node:fs/promises";
import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import { receiptChain, scheduledTargets, runs } from "@shared/schema";
import { receiptDocumentSha256, isChainFeatureEnabled } from "./chain/receiptCanonical";
import {
  computeStructuredDiff,
  detectAnomalies,
  summarizeDiffForCompliance,
  type StructuredDiff,
} from "./diffSummarizer";
import { sendAnomalyEmail, postAnomalyWebhook } from "./alertDispatch";

export type ChainContext = {
  scheduledTargetId: string;
  triggeredBy: "scheduler" | "manual" | "api";
  scheduled: boolean;
  catchUp?: boolean;
};

async function loadReceiptJson(runDir: string): Promise<Record<string, unknown> | null> {
  try {
    const p = path.join(runDir, "receipt.json");
    const raw = await fs.readFile(p, "utf8");
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function finalizeAnalysisReceiptChain(opts: {
  chainContext: ChainContext;
  projectId: number;
  newRunDir: string;
  dbRunId: number;
}): Promise<void> {
  if (!isChainFeatureEnabled()) {
    return;
  }
  const { chainContext, projectId, newRunDir, dbRunId } = opts;
  const receipt = await loadReceiptJson(newRunDir);
  if (!receipt || receipt.receipt_type === "gap") {
    return;
  }
  if (receipt.chain_sequence === undefined || receipt.chain_sequence === null) {
    return;
  }

  const [target] = await db
    .select()
    .from(scheduledTargets)
    .where(eq(scheduledTargets.id, chainContext.scheduledTargetId))
    .limit(1);
  if (!target) {
    console.warn("[chain] scheduled target not found", chainContext.scheduledTargetId);
    return;
  }

  const prevRows = await db
    .select()
    .from(receiptChain)
    .where(eq(receiptChain.targetId, chainContext.scheduledTargetId))
    .orderBy(desc(receiptChain.chainSequence))
    .limit(1);

  let prevRunDir: string | null = null;
  let structured: StructuredDiff;
  let diffSummary: string;

  if (prevRows.length === 0) {
    structured = computeStructuredDiff(null, newRunDir);
    diffSummary = await summarizeDiffForCompliance(structured);
  } else {
    const recent = await db
      .select()
      .from(runs)
      .where(eq(runs.projectId, projectId))
      .orderBy(desc(runs.createdAt))
      .limit(2);
    prevRunDir = recent[1]?.runDir ?? null;
    structured = computeStructuredDiff(prevRunDir, newRunDir);
    diffSummary = await summarizeDiffForCompliance(structured);
  }

  const anomaly = detectAnomalies(structured);
  const receiptHash = receiptDocumentSha256(receipt as Record<string, unknown>);
  const seq = Number(receipt.chain_sequence ?? 0);
  const ts = new Date(String(receipt.generated_at || new Date().toISOString()));

  await db.insert(receiptChain).values({
    targetId: chainContext.scheduledTargetId,
    runId: String(receipt.run_id || dbRunId),
    receiptHash,
    previousReceiptHash: (receipt.previous_receipt_hash as string | null) ?? null,
    chainSequence: seq,
    receiptType: String(receipt.receipt_type || "analysis"),
    scheduled: Boolean(chainContext.scheduled),
    triggeredBy: chainContext.triggeredBy,
    timestamp: ts,
    hasDiff: seq > 0,
    diffSummary,
    newCves: structured.newCves as unknown[],
    closedCves: structured.closedCves as unknown[],
    newEndpoints: structured.newEndpoints as unknown[],
    removedEndpoints: structured.removedEndpoints as unknown[],
    authChanges: structured.authChanges as unknown[],
    anomalyFlagged: anomaly.flagged,
    anomalyReason: anomaly.reason || null,
    receiptDocument: receipt as Record<string, unknown>,
  });

  await db
    .update(scheduledTargets)
    .set({
      lastRunAt: ts,
      lastReceiptHash: receiptHash,
      chainLength: seq + 1,
      updatedAt: new Date(),
    })
    .where(eq(scheduledTargets.id, chainContext.scheduledTargetId));

  if (anomaly.flagged && (target.alertEmail || target.alertWebhook)) {
    const label = target.targetLabel || target.repoName || target.repoUrl;
    if (target.alertEmail) {
      await sendAnomalyEmail({
        to: target.alertEmail,
        targetLabel: label,
        targetId: chainContext.scheduledTargetId,
        timestamp: ts.toISOString(),
        diffSummary,
        receiptHash,
        anomalyReason: anomaly.reason,
      }).catch((e) => console.error("[chain] email alert", e));
    }
    if (target.alertWebhook) {
      await postAnomalyWebhook(target.alertWebhook, {
        target_id: chainContext.scheduledTargetId,
        target_label: label,
        timestamp: ts.toISOString(),
        anomaly_reason: anomaly.reason,
        diff_summary: diffSummary,
        receipt_hash: receiptHash,
      }).catch((e) => console.error("[chain] webhook alert", e));
    }
  }
}

/** Persist a gap receipt produced by the Python `record-gap` command. */
export async function finalizeGapReceipt(opts: { targetId: string; receiptPath: string }): Promise<void> {
  if (!isChainFeatureEnabled()) return;
  const raw = await fs.readFile(opts.receiptPath, "utf8");
  const receipt = JSON.parse(raw) as Record<string, unknown>;
  const receiptHash = receiptDocumentSha256(receipt);
  const seq = Number(receipt.chain_sequence ?? 0);
  const ts = new Date(String(receipt.generated_at || new Date().toISOString()));

  await db.insert(receiptChain).values({
    targetId: opts.targetId,
    runId: String(receipt.run_id || `gap-${seq}`),
    receiptHash,
    previousReceiptHash: (receipt.previous_receipt_hash as string | null) ?? null,
    chainSequence: seq,
    receiptType: "gap",
    scheduled: Boolean(receipt.scheduled),
    triggeredBy: "scheduler",
    timestamp: ts,
    hasDiff: false,
    diffSummary: `Gap recorded: ${receipt.reason || "scheduled_run_missed"}`,
    newCves: [],
    closedCves: [],
    newEndpoints: [],
    removedEndpoints: [],
    authChanges: [],
    anomalyFlagged: false,
    anomalyReason: null,
    receiptDocument: receipt,
  });

  await db
    .update(scheduledTargets)
    .set({
      lastRunAt: ts,
      lastReceiptHash: receiptHash,
      chainLength: seq + 1,
      updatedAt: new Date(),
    })
    .where(eq(scheduledTargets.id, opts.targetId));
}
