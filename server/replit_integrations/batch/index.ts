// STUB: Replit deployment integration — experimental batch helpers; not the primary Debrief API.
// Planned: Rate-limited batch calls for demos on Replit.
// Status: Not production-ready for standalone product SLAs. Do not expose to users without review.

export {
  batchProcess,
  batchProcessWithSSE,
  isRateLimitError,
  type BatchOptions,
} from "./utils";

