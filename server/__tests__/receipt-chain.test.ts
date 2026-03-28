import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  receiptDocumentSha256,
  canonicalReceiptJson,
  sortKeysDeep,
  isChainFeatureEnabled,
  signingPayloadBytes,
} from "../chain/receiptCanonical";
import { createHmac } from "node:crypto";
import { verifyChainRowsOrdered, verifyReceiptSignatureSync } from "../chain/verifyChainRows";
import type { ReceiptChainRow } from "@shared/schema";

describe("receipt chain canonical + verify", () => {
  beforeEach(() => {
    process.env.DEBRIEF_CHAIN_HMAC_SECRET = "test-secret-unit";
  });
  afterEach(() => {
    delete process.env.DEBRIEF_CHAIN_HMAC_SECRET;
  });

  it("previous_receipt_hash matches canonical hash of prior document", () => {
    const a: Record<string, unknown> = {
      schema_version: "1.0",
      run_id: "r1",
      generated_at: "2026-01-01T00:00:00Z",
      chain_sequence: 0,
      previous_receipt_hash: null,
      receipt_type: "analysis",
      scheduled: false,
      note: "x",
    };
    const h = receiptDocumentSha256(a);
    const b: Record<string, unknown> = {
      ...a,
      run_id: "r2",
      chain_sequence: 1,
      previous_receipt_hash: h,
    };
    expect(receiptDocumentSha256(a)).toBe(h);
    expect(b.previous_receipt_hash).toBe(receiptDocumentSha256(a));
  });

  it("tampered receipt breaks hash link in verifyChainRowsOrdered", () => {
    const doc0: Record<string, unknown> = {
      chain_sequence: 0,
      previous_receipt_hash: null,
      receipt_type: "analysis",
      generated_at: "2026-01-01T00:00:00Z",
      run_id: "a",
    };
    const doc1Good: Record<string, unknown> = {
      chain_sequence: 1,
      previous_receipt_hash: receiptDocumentSha256(doc0),
      receipt_type: "analysis",
      generated_at: "2026-01-02T00:00:00Z",
      run_id: "b",
    };
    const doc1Bad: Record<string, unknown> = {
      ...doc1Good,
      previous_receipt_hash: "deadbeef",
    };
    const rowsGood: ReceiptChainRow[] = [
      {
        id: "1",
        targetId: "t",
        runId: "a",
        receiptHash: "h0",
        previousReceiptHash: null,
        chainSequence: 0,
        receiptType: "analysis",
        scheduled: false,
        triggeredBy: "manual",
        timestamp: new Date(),
        hasDiff: false,
        diffSummary: null,
        newCves: [],
        closedCves: [],
        newEndpoints: [],
        removedEndpoints: [],
        authChanges: [],
        anomalyFlagged: false,
        anomalyReason: null,
        receiptDocument: doc0,
      } as ReceiptChainRow,
      {
        id: "2",
        targetId: "t",
        runId: "b",
        receiptHash: "h1",
        previousReceiptHash: String(doc1Good.previous_receipt_hash),
        chainSequence: 1,
        receiptType: "analysis",
        scheduled: false,
        triggeredBy: "manual",
        timestamp: new Date(),
        hasDiff: true,
        diffSummary: "x",
        newCves: [],
        closedCves: [],
        newEndpoints: [],
        removedEndpoints: [],
        authChanges: [],
        anomalyFlagged: false,
        anomalyReason: null,
        receiptDocument: doc1Good,
      } as ReceiptChainRow,
    ];
    expect(verifyChainRowsOrdered(rowsGood).chainIntact).toBe(true);

    const rowsBad: ReceiptChainRow[] = [
      rowsGood[0],
      { ...rowsGood[1], receiptDocument: doc1Bad },
    ];
    expect(verifyChainRowsOrdered(rowsBad).chainIntact).toBe(false);
  });

  it("HMAC signature covers payload including chain fields", () => {
    const rec: Record<string, unknown> = {
      chain_sequence: 0,
      previous_receipt_hash: null,
      receipt_type: "analysis",
      scheduled: true,
      generated_at: "2026-01-01T00:00:00Z",
      run_id: "x",
    };
    const msg = signingPayloadBytes(rec);
    const sig = createHmac("sha256", "test-secret-unit").update(msg).digest("hex");
    const signed = { ...rec, signature: sig, chain_signature_algorithm: "HMAC-SHA256" };
    expect(verifyReceiptSignatureSync(signed).ok).toBe(true);
    signed.run_id = "y";
    expect(verifyReceiptSignatureSync(signed as Record<string, unknown>).ok).toBe(false);
  });

  it("export bundle hash is stable for sorted keys", () => {
    const o = { z: 1, a: { m: 2, b: 3 } };
    expect(canonicalReceiptJson(sortKeysDeep(o))).toMatch(/^\{"a":/);
  });

  it("DEBRIEF_CHAIN_ENABLED=false disables feature flag", () => {
    process.env.DEBRIEF_CHAIN_ENABLED = "false";
    expect(isChainFeatureEnabled()).toBe(false);
    process.env.DEBRIEF_CHAIN_ENABLED = "true";
    expect(isChainFeatureEnabled()).toBe(true);
  });
});

describe("diff summarizer structured output", () => {
  it("detects high CVSS anomaly", async () => {
    const { detectAnomalies } = await import("../diffSummarizer");
    const r = detectAnomalies({
      dependencies: [],
      newCves: [{ id: "CVE-1", cvss: 8.1 }],
      closedCves: [],
      newEndpoints: [],
      removedEndpoints: [],
      authChanges: [],
    });
    expect(r.flagged).toBe(true);
  });
});
