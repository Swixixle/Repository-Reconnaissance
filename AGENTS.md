# Debrief — Agent orientation

> Read this before writing any code. It is short on purpose.

## Names
- User-facing copy: **Debrief** only.
- Evidence/receipt/chain internals: **PTA (Proof Trust Anchor)** is acceptable in code and comments for that layer.
- npm package: `debrief`. Python distribution: `debrief-analyzer`. CLI: `debrief` (legacy alias `pta` exists — do not add new references to it).

## Stack at a glance
| Layer | Location |
|---|---|
| API server | `server/` (Express) |
| Web client | `client/` (React + Vite) |
| Desktop | `client/src-tauri/` (Tauri) |
| DB schema | `shared/schema.ts` (Drizzle + Postgres) |
| Python analyzer | `server/analyzer/` (Typer CLI) |
| Background jobs | Redis + BullMQ worker + `server/scheduler.ts` (node-cron) |

## Read before large edits
1. `ONBOARDING.md` — environment setup, secrets, first run
2. `docs/ARCHITECTURE.md` — CI vs BullMQ vs chain modes
3. `RISKS_AND_GAPS.md` — known gaps, deferred decisions
4. `.env.example` — required env vars

For chain/timeline work, also read:
- `server/scheduler.ts`
- `server/receiptChainFinalize.ts`
- `server/routes/targets-chain.ts`
- `shared/schema.ts` (tables: `scheduled_targets`, `receipt_chain`)

## Commands
```bash
npm run dev                          # local dev (server + client)
npm run build                        # production build
npm run test:unit                    # Vitest unit suite
npm run db:push                      # apply schema (requires DATABASE_URL)
pytest server/analyzer/tests/        # Python analyzer tests
debrief verify-chain <TARGET_UUID> [--json]   # filesystem chain verify
```

**Always run after non-trivial changes:**
```bash
npm run build && npm run test:unit
pytest server/analyzer/tests/
```

## Constraints
- **Do not commit `.env` or any secrets.** Use `.env.example` as the reference.
- **Do not touch `package-lock.json` or `uv.lock`** unless the task is explicitly dependency work.
- Prefer minimal diffs — match existing patterns and naming conventions.
- TypeScript has known non-blocking errors; see `docs/internal/TYPECHECK_TODO.md` before adding `// @ts-ignore`.
- Dependabot is configured in `.github/dependabot.yml` with grouped npm/pip/actions updates. The `cryptography` pip package has its own isolated group — do not merge it into the catch-all group.

## Security
- Do not open public GitHub issues for undisclosed vulnerabilities. See `docs/SECURITY.md`.
- `npm audit` was at 0 locally as of last audit; Dependabot alert counts in the GitHub UI can lag or include Actions/subfolder advisories — see `docs/internal/SECURITY_AUDIT.md` for current state.

## Docs index (full depth)
| File | Purpose |
|---|---|
| `README.md` | Quickstart, modes, chain overview |
| `ONBOARDING.md` | New engineer setup |
| `RISKS_AND_GAPS.md` | Risk register, known gaps |
| `docs/RUNBOOK.md` | Health endpoints, failure playbooks, DB, env |
| `docs/ARCHITECTURE.md` | System design (updated 2026-03-28) |
| `docs/CONTEXT.md` | Product and domain context |
| `docs/API.md` | API surface reference |
| `docs/internal/TYPECHECK_TODO.md` | TS debt tracker |
| `docs/internal/SECURITY_AUDIT.md` | npm/pip audit notes |
