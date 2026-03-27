/**
 * 24h Redis cache keyed by coarse repo fingerprint — wire when REDIS_URL present.
 */
import { createHash } from "node:crypto";
import type IORedis from "ioredis";
import Redis from "ioredis";

let _redis: Redis | null = null;

function redis(): Redis | null {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;
  if (!_redis) {
    const r = new Redis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy(times: number) {
        if (times > 10) return null;
        return Math.min(times * 200, 3000);
      },
    });
    r.on("error", (err) => console.error("[redis:analysis-cache]", err.message));
    _redis = r;
  }
  return _redis;
}

export function fingerprintFromPaths(paths: string[], sizes: number[], mtimesMs: number[]): string {
  const h = createHash("sha256");
  for (let i = 0; i < paths.length; i++) {
    h.update(paths[i] || "");
    h.update(String(sizes[i] ?? 0));
    h.update(String(mtimesMs[i] ?? 0));
  }
  return h.digest("hex");
}

export async function getCachedAnalysis(_fingerprint: string): Promise<unknown | null> {
  const r = redis();
  if (!r) return null;
  return null;
}

export async function setCachedAnalysis(_fingerprint: string, _payload: unknown, _ttlSec = 86_400): Promise<void> {
  const r = redis();
  if (!r) return;
}
