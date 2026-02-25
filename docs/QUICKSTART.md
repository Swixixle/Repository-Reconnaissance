
# QUICKSTART.md

## Prerequisites

- **Node.js version:** Not specified in package.json engines (confirm locally)
- **Package manager:** Use `npm` (lockfile not shown, scripts use npm)
- **Python requirement:** `.pythonlibs/bin/python3` required for analyzer runs (see `runAnalysis()` in `server/routes.ts`). In Replit, this is expected to exist; for local dev, ensure Python 3 is available and symlinked if needed.
- **Postgres requirement:** `DATABASE_URL` must be set (see `server/db.ts`)

## Install

- Run preflight checks:

```bash
make preflight
```

- Install dependencies:

```bash
npm ci
```

## Configure Environment

- Copy `.env.example` to `.env` and set required variables:

	- `DATABASE_URL` (Postgres URI)
	- `API_KEY` (required in production, optional in dev)
	- `ADMIN_KEY` (required in production for admin endpoints, optional in dev)
	- `GITHUB_WEBHOOK_SECRET` (required to accept webhooks)
	- `ANALYZER_TIMEOUT_MS` (optional, default 10min)
	- `DISABLE_RATE_LIMITS` (optional, for test/dev)
	- `PORT` (optional, default 3000)
	- `PYTHON_EXEC_PATH` (optional, default `.pythonlibs/bin/python3`)

## Database First Run

- Apply schema to database:

```bash
npm run db:push
```

This runs `drizzle-kit push` as configured in `drizzle.config.ts`. Migration directory is created on first run. No rollback automation present.

## Run

- Start the server:

```bash
npm run dev
```

- Worker loop starts automatically (see `startWorkerLoop()` in `server/routes.ts`)
- Analyzer runs asynchronously when triggered via "analyze" routes; Python is spawned as per `runAnalysis()`

## Verify (Smoke tests)

- Public health:

```bash
curl http://localhost:3000/health
```

- API health (with/without X-Api-Key):

```bash
curl -H "X-Api-Key: <your-api-key>" http://localhost:3000/api/health
```

- Authenticated endpoint (projects list):

```bash
curl -H "X-Api-Key: <your-api-key>" http://localhost:3000/api/projects
```

- Admin endpoint (analyzer log):

```bash
curl -H "X-Admin-Key: <your-admin-key>" http://localhost:3000/api/admin/analyzer-log
```

- Evidence verify endpoint (public):

```bash
curl -X POST http://localhost:3000/api/certificates/verify -d '{"bundle":{}}' -H "Content-Type: application/json"
```

## Common Failures

- 500 "API authentication not configured" (prod without API_KEY)
- 500 "Admin authentication not configured" (prod without ADMIN_KEY)
- 401 unauthorized for missing/wrong keys
- 500 webhook_not_configured if missing GITHUB_WEBHOOK_SECRET
- Analyzer failures:
	- python_not_found (.pythonlibs missing)
	- timeout_10m
	- missing_artifact: operate.json / DOSSIER.md / claims.json

## Log Locations

- Analyzer log file: `out/_log/analyzer.ndjson`

## Code Pointers

- `server/routes.ts` — Route registration, worker loop, analyzer orchestration
- `server/db.ts` — DB connection
- `drizzle.config.ts` — Migration config
- `.env.example` — Environment variables
- `server/analyzer/analyzer_cli.py` — Python entrypoint

## Code Pointers
- Server entry: server/index.ts
- Router: server/routes.ts
- DB schema: shared/schema.ts
- Auth middleware: server/routes.ts (requireDevAdmin)
- Migrations config: drizzle.config.ts
