/**
 * Standalone analyzer background worker entry point.
 *
 * Start this process on the Render "Background Worker" service with:
 *   node dist/server/queue/analyzer-worker.js
 *
 * Required environment variables:
 *   DATABASE_URL — PostgreSQL connection string
 *   REDIS_URL    — Redis connection string (reserved for future queue migration)
 *
 * Optional:
 *   WORKER_INTERVAL_MS — polling interval in milliseconds (default: 5000)
 */

import { startWorkerLoop, stopWorkerLoop } from "../ci-worker";

const intervalMs = parseInt(process.env.WORKER_INTERVAL_MS || "5000", 10);

console.log("[analyzer-worker] Starting background worker process");
console.log(`[analyzer-worker] Poll interval: ${intervalMs}ms`);

startWorkerLoop(intervalMs);

// Graceful shutdown
function shutdown(signal: string) {
  console.log(`[analyzer-worker] Received ${signal}, shutting down`);
  stopWorkerLoop();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
