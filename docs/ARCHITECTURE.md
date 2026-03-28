
# Architecture

Last updated: 2026-03-28

## Documentation Links

- [API](API.md): Endpoint contracts and authentication model
- [Data Model](DATA_MODEL.md): Database schema
- [Runbook](RUNBOOK.md): Operations, health checks, common failures

## Code Pointers
- Node server routes: [server/routes.ts](../server/routes.ts); chain/target routes: [server/routes/targets-chain.ts](../server/routes/targets-chain.ts)
- Scheduler: [server/scheduler.ts](../server/scheduler.ts); receipt finalize: [server/receiptChainFinalize.ts](../server/receiptChainFinalize.ts)
- BullMQ queue: [server/queue/analyzer-queue.ts](../server/queue/analyzer-queue.ts); worker: [server/queue/analyzer-worker.ts](../server/queue/analyzer-worker.ts); standalone worker entry: [server/analyzer-worker-entry.ts](../server/analyzer-worker-entry.ts)
- Analysis orchestration: [server/runProjectAnalysis.ts](../server/runProjectAnalysis.ts)
- Python CLI: [server/analyzer/analyzer_cli.py](../server/analyzer/analyzer_cli.py) (re-exports [server/analyzer/src/analyzer_cli.py](../server/analyzer/src/analyzer_cli.py)); core analyzer: [server/analyzer/src/analyzer.py](../server/analyzer/src/analyzer.py)
- Drizzle schema (incl. chain tables): [shared/schema.ts](../shared/schema.ts)
- React routes: [client/src/App.tsx](../client/src/App.tsx); targets UI: [client/src/pages/targets.tsx](../client/src/pages/targets.tsx); timeline: [client/src/pages/Timeline.tsx](../client/src/pages/Timeline.tsx)
- Desktop: [client/src-tauri/tauri.conf.json](../client/src-tauri/tauri.conf.json)

## High-Level Components

```
GitHub Webhook ──► Express API ──► ci_runs / ci_jobs (PostgreSQL)
                                         │
                                         ▼
                                   Background Worker
                                   (polls every 5s)
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │  1. Shallow git clone │
                              │  2. Run analyzer CLI  │
                              │  3. Store artifacts   │
                              └──────────────────────┘
                                         │
                                         ▼
                              out/ci/<run_id>/
                              (operate.json, DOSSIER.md, etc.)

React UI (/ci) ◄── polls ──► GET /api/ci/runs
```

### Product analysis path + evidence chain (BullMQ)

When **Redis** is configured and **`DEBRIEF_USE_BULLMQ=1`**, interactive analysis and scheduler-driven runs typically enqueue jobs on queue **`debrief-analyzer`** instead of blocking the API process:

```
React UI / API POST ──► Queue (BullMQ / Redis) ──► Worker (analyzer-worker)
                                │                         │
                                │                         ├── ingest (clone / unzip)
                                │                         ├── runProjectAnalysis → Python analyzer_cli
                                │                         └── finalizeAnalysisReceiptChain (DB + alerts)
                                ▼
                     PostgreSQL: projects, runs, analyses,
                                scheduled_targets, receipt_chain
```

- **Scheduler** (`DEBRIEF_SCHEDULER_ENABLED=true`, `DEBRIEF_CHAIN_ENABLED`): **node-cron** loads active rows from **`scheduled_targets`**, may record a **gap** via Python `record-gap`, then **enqueues** a job with `chainContext` (`triggeredBy: "scheduler"`).
- **Filesystem receipts** (Python): canonical JSON + optional **HMAC / Ed25519** signatures under `PTA_CHAIN_STATE_DIR` (default `out/chain_state`).
- **Database mirror**: **`receipt_chain`** rows store hashes, sequence, diff/CVE/auth deltas, anomaly flags; **`GET /api/targets/:id/chain/verify`** checks ordering/consistency.

Without BullMQ (`DEBRIEF_USE_BULLMQ` unset or no `REDIS_URL`), the queue wrapper returns null and analysis uses synchronous paths in the API process (see `useQueueForAnalyzer` call sites).

## Components

### Web Layer (Express + React)

- **Express API** (`server/routes.ts`): REST endpoints for project analysis and the CI feed. Serves the React SPA via Vite middleware in development, static files in production.
- **React SPA** (`client/src/`): Single-page application with pages for project analysis, results viewing, and the CI feed at `/ci`.

### CI Feed Pipeline

The CI feed is an event-driven static analysis pipeline:

1. **Intake**: GitHub webhook (`POST /api/webhooks/github`) or manual enqueue (`POST /api/ci/enqueue`)
2. **Storage**: Creates a `ci_runs` row (status: QUEUED) and a `ci_jobs` row (status: READY)
3. **Processing**: Background worker picks up READY jobs and runs the analyzer
4. **Output**: Artifacts stored to `out/ci/<run_id>/`, summary extracted from `operate.json`

### Webhook Receiver

- Validates `X-Hub-Signature-256` using HMAC-SHA256 with `GITHUB_WEBHOOK_SECRET`
- Checks buffer length equality before `crypto.timingSafeEqual` to avoid crypto errors
- **Replay Protection**: Implements delivery ID deduplication using the `X-GitHub-Delivery` header
  - Stores each unique delivery ID in the `webhook_deliveries` table
  - If a delivery ID is seen again (e.g., GitHub webhook redelivery), returns `202 Accepted` with `{"ok": true, "deduped": true}`
  - Prevents duplicate CI runs from webhook replays
- Extracts owner, repo, ref, commit SHA from push and pull_request event payloads
- **SHA-based deduplication**: If the same (owner, repo, SHA) was processed within 6 hours, returns the existing run

### Background Worker (`server/ci-worker.ts`)

- Starts automatically on server boot via `setInterval` (every 5 seconds)
- Also exposed as `POST /api/ci/worker/tick` for manual/fallback triggering

#### Security & Workspace Management

- **Workspace Isolation**: Each job runs in a dedicated directory `${CI_TMP_DIR}/run-${runId}`
- **Automatic Cleanup**: Workspace directories are deleted after job completion (success or failure)
  - Set `CI_PRESERVE_WORKDIR=true` to preserve workspaces for debugging
- **Token Safety**: All git URLs containing `GITHUB_TOKEN` are sanitized before logging using `sanitizeGitUrl()`
- **Disk Space Guard**: Checks free disk space before processing each job
  - Fails immediately if free space is below 1GB or below 5% of total disk
  - Prevents disk exhaustion from large repository clones

#### Job Leasing Strategy

```sql
SELECT j.id, j.run_id
FROM ci_jobs j
WHERE j.status = 'READY'
   OR (j.status = 'LEASED' AND j.leased_until < NOW())
ORDER BY j.id
LIMIT 1
FOR UPDATE SKIP LOCKED
```

- **`FOR UPDATE SKIP LOCKED`**: Prevents multiple workers from picking the same job. If a row is already locked by another transaction, it is skipped rather than blocking.
- **Lease timeout**: 5 minutes (`leased_until`). If a worker crashes mid-job, the lease expires and another worker can pick it up.
- **Max attempts**: 3. After 3 failures, the job is marked DEAD and the corresponding run is marked FAILED.

#### Processing Steps

1. Lease the job (update status to LEASED, set `leased_until`)
2. **Disk space check**: Verify CI_TMP_DIR has sufficient free space (>1GB or >5%)
3. Update the run to RUNNING
4. Create isolated workspace directory `${CI_TMP_DIR}/run-${runId}`
5. Clone the repo to the workspace
   - Uses `git clone --depth 1` then `git checkout <sha>` for the exact commit
   - If `GITHUB_TOKEN` is set, injects it into the clone URL for private repos (sanitized in logs)
6. Spawn the Python analyzer CLI as a child process
7. On success: extract summary counts from `operate.json`, update run to SUCCEEDED, job to DONE
8. On failure: increment attempts, update error, check if max attempts reached
9. **Cleanup**: Delete workspace directory (unless `CI_PRESERVE_WORKDIR=true`)

### Analyzer (`server/analyzer/`)

Two strictly separated layers:

1. **Structural layer** (deterministic): File indexing, pattern matching, evidence extraction with SHA-256 snippet hashes. Always runs. Outputs are reproducible.
2. **Semantic layer** (LLM-powered, optional): Architecture interpretation, risk assessment, integration analysis. Requires OpenAI API keys. Outputs carry confidence scores.

The `--no-llm` flag produces only structural output. The CI worker runs the analyzer with default settings (both layers if API keys are available).

### Database (PostgreSQL)

Tables relevant to CI feed:

**`ci_runs`**
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (generated) |
| `repo_owner` | text | GitHub org/user |
| `repo_name` | text | Repository name |
| `ref` | text | Branch/tag |
| `commit_sha` | text | Full 40-char SHA |
| `event_type` | text | push, pull_request, manual |
| `status` | text | QUEUED, RUNNING, SUCCEEDED, FAILED |
| `created_at` | timestamp | When the run was created |
| `started_at` | timestamp | When processing began |
| `finished_at` | timestamp | When processing ended |
| `error` | text | Error message if failed |
| `out_dir` | text | Path to output artifacts |
| `summary_json` | jsonb | Summary counts from operate.json |

**`ci_jobs`**
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (generated) |
| `run_id` | uuid | Foreign key to ci_runs |
| `status` | text | READY, LEASED, DONE, DEAD |
| `attempts` | integer | Number of processing attempts |
| `leased_until` | timestamp | Lease expiry for concurrency |
| `last_error` | text | Error from most recent attempt |

**`webhook_deliveries`**
| Column | Type | Description |
|--------|------|-------------|
| `delivery_id` | text | Primary key, GitHub's X-GitHub-Delivery header |
| `event` | text | Event type (push, pull_request, etc.) |
| `repo_owner` | text | Repository owner (nullable) |
| `repo_name` | text | Repository name (nullable) |
| `received_at` | timestamp | When the webhook was first received |

### Time-based evidence trail (`shared/schema.ts`)

**`scheduled_targets`** — one row per registered repo/interval for the evidence trail: `repo_url`, `interval` (`three_daily` \| `daily` \| `weekly` \| `manual`), `timezone`, `active`, `last_run_at`, `last_receipt_hash`, `chain_length`, optional `alert_email` / `alert_webhook`, link to `debrief_project_id`.

**`receipt_chain`** — append-only ledger keyed by `target_id` → `scheduled_targets.id`: `chain_sequence`, `receipt_hash`, `previous_receipt_hash`, `receipt_type`, `scheduled`, `triggered_by`, `timestamp`, diff/CVE/endpoint/auth JSON blobs, `anomaly_flagged` / `anomaly_reason`, optional `receipt_document` snapshot. Indexed by `(target_id, chain_sequence)`.

### Web UI: targets and timeline

- **`/targets`** — list/create scheduled targets (`client/src/pages/targets.tsx`), backed by `GET/POST /api/targets` and related routes in `server/routes/targets-chain.ts`.
- **`/timeline/:targetId`** — reads chain history for visualization (`client/src/pages/Timeline.tsx`), using chain APIs such as `GET /api/targets/:targetId/chain` and export/verify endpoints.

### Desktop shell (Tauri 2)

- **Config:** `client/src-tauri/tauri.conf.json` — `productName` **Debrief**, `devUrl` **http://localhost:5000**, `frontendDist` **`../../dist/public`**, `beforeBuildCommand` runs **`npm run build`** from repo root.
- The desktop app is a **host window** around the same SPA; API calls target the running backend (local or remote depending on build/env). No separate analyzer binary in Tauri.

### Failure Modes

| Scenario | Behavior |
|----------|----------|
| Invalid webhook signature | 401 returned, no run created |
| Replay webhook (duplicate delivery ID) | 202 returned with `deduped: true`, no run created |
| Clone fails (bad SHA, no access) | Job error recorded, attempts incremented, retried up to 3x |
| Low disk space (< 1GB or < 5%) | Job fails immediately with `ci_tmp_dir_low_disk` error, no clone attempted |
| Analyzer timeout | Process killed after `ANALYZER_TIMEOUT_MS` (default 10 min), treated as failure |
| Worker crashes mid-job | Lease expires after 5 min, another worker picks up the job |
| 3 consecutive failures | Job marked DEAD, run marked FAILED with last error |
| Duplicate webhook (same SHA) | Deduplicated, returns existing run ID |

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `GITHUB_WEBHOOK_SECRET` | For webhooks | — | HMAC-SHA256 signature verification |
| `GITHUB_TOKEN` | For private repos | — | Git clone authentication (sanitized in logs) |
| `CI_TMP_DIR` | No | `/tmp/ci` | Temp directory for cloned repos |
| `CI_PRESERVE_WORKDIR` | No | `false` | Set to `true` to preserve workspace directories after job completion (for debugging) |
| `ANALYZER_TIMEOUT_MS` | No | `600000` (10 min) | Analyzer process timeout |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | For LLM mode | — | OpenAI API key |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | For LLM mode | — | OpenAI API base URL |

## Node ↔ Python Process Orchestration

Node.js invokes Python via child_process.spawn or exec.
- Data is transported as JSON via stdout.
- Errors are propagated by exit code and stderr output.
- Timeout is handled by ANALYZER_TIMEOUT_MS environment variable.
- No explicit retry logic is implemented.
- Resource constraints are set by process timeout and environment.
- Concurrency is managed by job queue; each analysis runs in a dedicated workspace directory.
