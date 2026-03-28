# Onboarding — Debrief

Welcome. This document is the **start here** for engineers touching the repo.

---

## 1. What this is

**Debrief** is a full-stack product: users submit codebases (Git URLs, archives, local paths where enabled); a **Python analyzer** produces dossiers, structured JSON, and optional LLM narrative; **PostgreSQL** stores projects, runs, and (when enabled) the **time-based evidence chain**; **Redis + BullMQ** optionally offload long analyses to a worker; the **React** app includes **Targets** and **Timeline** for scheduled snapshots; **Tauri** wraps the same web UI for desktop. The internal signing/evidence layer is **PTA (Proof Trust Anchor)**. The codebase is **actively developed** — see `RISKS_AND_GAPS.md` for candid gaps.

---

## 2. Prerequisites

- **Node.js** — align with `package.json` / CI (Node **20+** recommended; lockfile tested in dev on v20).
- **Python** — **3.11+** (`pyproject.toml`: `requires-python = ">=3.11"`).
- **PostgreSQL** — required for the main app, Drizzle schema, chain tables.
- **Redis** — optional unless you use **BullMQ** (`DEBRIEF_USE_BULLMQ=1`) for analyzer jobs / scheduler enqueues.

---

## 3. Getting set up

```bash
git clone <repo-url>
cd PTA_REPO-RECON   # or your checkout folder name

cp .env.example .env
# Edit .env: DATABASE_URL, API keys, REDIS if using BullMQ, chain vars as needed.

npm install

python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e '.[dev]'

# Local data services (optional but typical)
docker compose up -d

# Apply DB schema
npm run db:push

# Dev server: Express API + Vite (default http://localhost:5000)
npm run dev
```

**Desktop:** with API running, `npm run desktop:dev` from repo root (see `client/src-tauri/tauri.conf.json`: `devUrl` → localhost:5000).

---

## 4. How the system works (brief)

1. **Ingestion** — `server/ingestion/*` resolves GitHub/GitLab/archives/local paths to a temp directory.
2. **Analysis** — Either inline or via **BullMQ** (`server/queue/analyzer-worker.ts`): `runProjectAnalysis` + Python **`analyzer_cli.py`** under `server/analyzer/`.
3. **Artifacts** — Runs land under `out/` (gitignored); metadata in `runs` / `analyses` tables.
4. **Receipt chain** — When `DEBRIEF_CHAIN_ENABLED`, Node finalizes rows in **`receipt_chain`** and Python may write under **`PTA_CHAIN_STATE_DIR`** / `out/chain_state`.
5. **Scheduler** — `server/scheduler.ts` uses **node-cron** + optional BullMQ enqueue for rows in **`scheduled_targets`**.
6. **UI** — `client/src/pages/targets.tsx`, `Timeline.tsx`; routes in `client/src/App.tsx`.

**Deeper reading:** `docs/ARCHITECTURE.md`, `docs/CONTEXT.md`, `docs/API.md`.

---

## 5. Running tests

```bash
# TypeScript / Node (Vitest)
npm run test:unit

# Python
pytest server/analyzer/tests/
```

Also run **`npm run build`** before release PRs.

---

## 6. Key files (first week)

| File | Role |
|------|------|
| `server/index.ts` | Express app bootstrap, CORS, middleware, scheduler start |
| `server/routes.ts` | Core API registration; health endpoints |
| `server/routes/targets-chain.ts` | Targets CRUD, `/api/scheduler/status`, chain verify/export |
| `server/scheduler.ts` | Cron + gap receipts + BullMQ enqueue for scheduled targets |
| `server/queue/analyzer-worker.ts` | BullMQ worker: ingest → `runProjectAnalysis` → chain finalize |
| `server/runProjectAnalysis.ts` | Orchestrates Python spawn, run dir, DB inserts |
| `server/receiptChainFinalize.ts` | Writes DB chain rows + anomaly alerts after runs |
| `shared/schema.ts` | Drizzle tables including `scheduled_targets`, `receipt_chain` |
| `server/analyzer/src/analyzer.py` | Main Python analysis pipeline |
| `server/analyzer/src/analyzer_cli.py` | Typer CLI: `analyze`, `verify-chain`, `record-gap`, etc. |
| `client/src/App.tsx` | SPA routes (`/targets`, `/timeline/:targetId`, …) |

---

## 7. Known issues

- **`RISKS_AND_GAPS.md`** — risk register and doc/deployment gaps.
- **`docs/internal/TYPECHECK_TODO.md`** — TypeScript debt; `npm run check` is non-blocking.

---

## 8. Good first tasks

1. **Cross-language canonical JSON test (R9)** — lock Node + Python receipt hashing contract.
2. **Expand pytest** around `dependency_graph.osv_query_batch` and `receipt_chain.verify_chain_for_target` edge cases (R7).
3. **Refresh `docs/DEPLOYMENT.md`** naming and Render + Redis + worker checklist (R10).
4. **Harden debrief-action README** or implement missing PR-comment path (R5).

---

## 9. Ownership and security

- **Maintainer:** Alex — GitHub **[@Swixixle](https://github.com/Swixixle)**.
- **Security vulnerabilities:** follow **`docs/SECURITY.md`** (do not file public issues for undisclosed vulns).
- **Infrastructure:** Primary deployment docs reference **Render** and managed Postgres/Redis; actual org credentials and service names live with the maintainer.
