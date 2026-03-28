# Risks and Open Issues

Last updated: 2026-03-28

## Risk Register

| ID | Item | Type | Status | Risk / Impact | Mitigation / Next Step |
|----|------|------|--------|---------------|------------------------|
| R1 | Pygments CVE-2026-4539 | Security | Open | Transitive dependency (via `rich`); PyPI had no patched release above 2.19.2 at last `pip-audit` | Track [Pygments releases](https://pypi.org/project/Pygments/); upgrade when a fix ships; see `docs/internal/SECURITY_AUDIT.md` |
| R2 | Nodemailer v8 smoke test | Reliability | Open | `nodemailer` was upgraded to `^8.0.4` for advisories; `server/alertDispatch.ts` path not fully exercised against a real SMTP provider in CI | Run anomaly-email smoke in staging with live SMTP; confirm STARTTLS/auth behavior |
| R3 | TypeScript errors non-blocking | Code Quality | Open | `npm run check` runs `tsc` but is configured not to fail the repo workflow; error count can grow unnoticed | Track `docs/internal/TYPECHECK_TODO.md`; run `npx tsc --noEmit` on a schedule and trend the error count |
| R4 | Billing enforcement | Product | Open | `DEBRIEF_BILLING_ACTIVE=0` by default; `server/billing/credits.ts` skips deduction when inactive — Stripe UI/webhook exist but **no hard credit enforcement** for paid tiers until flag is on | Define go-live checklist: enable `DEBRIEF_BILLING_ACTIVE=1`, test deduct/refund paths, document in billing docs before offering paid plans |
| R5 | GitHub Action incomplete | DevEx | Open | `.github/debrief-action/` is a **template**: posts to a configurable API; PR comment polish and org-specific hosts may be unfinished | Treat as non-production until validated; extend `README` there with “not supported” vs “beta” or complete PR flow |
| R6 | ALLOWED_ORIGINS in production | Security | Mitigated | Previously easy to misconfigure silently | `server/index.ts` logs `[SECURITY] ALLOWED_ORIGINS is not set in production...` when unset/empty; ops should confirm this appears once on deploy if relying on same-origin only |
| R7 | Python analyzer test coverage | Testing | Open | `server/analyzer/src/analyzer.py` is **~1,970 lines**; foundational tests exist (`server/analyzer/tests/test_analyzer_core.py`, receipt chain tests, demos) but **core dossier/LLM paths are thin** | Grow pytest toward `dependency_graph`, full `receipt_chain`, and deterministic dossier edge cases; avoid network in unit tests |
| R8 | Chain HMAC vs Ed25519 | Security | Open | `server/analyzer/src/receipt_chain.py` supports **HMAC-SHA256** (`DEBRIEF_CHAIN_HMAC_SECRET`) and **Ed25519** (`DEBRIEF_CHAIN_SIGNING_PRIVATE_KEY` / `_PUBLIC_KEY`); shared secret is weaker for third-party verification | Prefer Ed25519 in production; document precedence in `.env.example` and `docs/SECURITY.md` |
| R9 | Cross-language canonical JSON | Reliability | Open | Node (`server/chain/receiptCanonical.ts`) and Python (`receipt_chain.canonical_json_bytes`) must agree for hash continuity when both touch receipts | Add an integration test: canonicalize a fixed object in both runtimes and assert identical bytes/digest (see also API `GET /api/targets/:id/chain/verify` vs on-disk `debrief verify-chain`) |
| R10 | Deployment guide drift | Operational | Open | `docs/DEPLOYMENT.md` still names **Asset-Analyzer / PTA** in places and predates chain/scheduler emphasis | Align copy with **Debrief**; verify Render sections mention `npm run db:push`, `DEBRIEF_CHAIN_ENABLED`, `DEBRIEF_SCHEDULER_ENABLED`, `REDIS_URL` + `DEBRIEF_USE_BULLMQ=1`, and separate worker process (`analyzer-worker-entry.ts`) |

## Known Gaps in Documentation and Operations

- **Architecture overview** — `docs/ARCHITECTURE.md` was CI-weighted; updated **2026-03-28** with chain, BullMQ, `scheduled_targets` / `receipt_chain`, timeline UI, and Tauri. Re-read after large features merge.

- **Deployment** — `docs/DEPLOYMENT.md` exists but should be audited for: Render env vars, `db:push`, chain flags, Redis for BullMQ, optional `DEBRIEF_RUN_ANALYZER_WORKER` split, and static asset path (`dist/public`).

- **Runbook** — `docs/RUNBOOK.md` now covers health endpoints, queue/scheduler/SMTP/chain failures, and DB tooling.

- **Contributor onboarding** — see root `ONBOARDING.md`.

- **Ownership** — Maintainer **Alex** ([Swixixle](https://github.com/Swixixle)); security disclosure: `docs/SECURITY.md`; primary hosting referenced in docs: **Render** (verify actual production URL in GitHub About).

- **Cross-language receipt verification** — Highest-value missing integration test for R9 (Python filesystem chain vs Node DB verification both exist; parity test does not).

- **Billing model documentation** — Intended enforcement is **credit deduction when `DEBRIEF_BILLING_ACTIVE=1`** (`server/billing/stripe.ts`, `credits.ts`); no separate product doc describes tiers vs limits — add when approaching revenue.
