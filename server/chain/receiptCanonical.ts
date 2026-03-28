import crypto from "node:crypto";

/** Match Python `receipt_chain.canonical_json_bytes` (sorted keys, compact separators). */
export function sortKeysDeep(value: unknown): unknown {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  const o = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(o).sort()) {
    out[k] = sortKeysDeep(o[k]);
  }
  return out;
}

export function canonicalReceiptJson(obj: unknown): string {
  return `${JSON.stringify(sortKeysDeep(obj))}`;
}

export function receiptDocumentSha256(doc: Record<string, unknown>): string {
  return crypto.createHash("sha256").update(canonicalReceiptJson(doc), "utf8").digest("hex");
}

export function signingPayloadBytes(doc: Record<string, unknown>): Buffer {
  const toSign: Record<string, unknown> = { ...doc };
  delete toSign.signature;
  delete toSign.chain_signature_algorithm;
  return Buffer.from(canonicalReceiptJson(toSign), "utf8");
}

export function isChainFeatureEnabled(): boolean {
  const v = process.env.DEBRIEF_CHAIN_ENABLED ?? "true";
  return v === "1" || v.toLowerCase() === "true" || v.toLowerCase() === "yes";
}
