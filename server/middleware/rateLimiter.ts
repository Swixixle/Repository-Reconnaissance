import rateLimit from "express-rate-limit";
import type { Request } from "express";

function shouldSkipRateLimit(): boolean {
  return (
    process.env.NODE_ENV === "test" ||
    process.env.ENV === "TEST" ||
    process.env.DISABLE_RATE_LIMITS === "1" ||
    process.env.VITEST === "true"
  );
}

function skipBillingAndGithubWebhooks(req: Request): boolean {
  const pathOnly = (req.originalUrl ?? req.url ?? "").split("?")[0];
  if (pathOnly.startsWith("/api/billing/webhook")) return true;
  if (pathOnly.startsWith("/api/webhooks/github")) return true;
  return false;
}

/** Standard API rate limit — 100 requests per 15 minutes per IP */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  skip: (req) => shouldSkipRateLimit() || skipBillingAndGithubWebhooks(req),
});

/** Strict limit for expensive operations (analyze, clone, queue jobs) */
export const heavyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Rate limit exceeded for analysis operations." },
  skip: () => shouldSkipRateLimit(),
});

/** Auth / session-sensitive endpoints */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many auth attempts." },
  skip: () => shouldSkipRateLimit(),
});

/** Applied to SPA HTML fallback only (GET/HEAD) — caps scripted index hammering */
export const spaFallbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  skip: () => shouldSkipRateLimit(),
});
