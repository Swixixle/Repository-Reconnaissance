# Architecture

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
- Extracts owner, repo, ref, commit SHA from push and pull_request event payloads
- Deduplicates: if the same (owner, repo, SHA) was processed within 6 hours, returns the existing run

### Background Worker (`server/ci-worker.ts`)

- Starts automatically on server boot via `setInterval` (every 5 seconds)
- Also exposed as `POST /api/ci/worker/tick` for manual/fallback triggering

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
2. Update the run to RUNNING
3. Clone the repo to a temp directory (`CI_TMP_DIR`, default `/tmp/ci`)
   - Uses `git clone --depth 1` then `git checkout <sha>` for the exact commit
   - If `GITHUB_TOKEN` is set, injects it into the clone URL for private repos
4. Spawn the Python analyzer CLI as a child process
5. On success: extract summary counts from `operate.json`, update run to SUCCEEDED, job to DONE
6. On failure: increment attempts, update error, check if max attempts reached

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

### Failure Modes

| Scenario | Behavior |
|----------|----------|
| Invalid webhook signature | 401 returned, no run created |
| Clone fails (bad SHA, no access) | Job error recorded, attempts incremented, retried up to 3x |
| Analyzer timeout | Process killed after `ANALYZER_TIMEOUT_MS` (default 10 min), treated as failure |
| Worker crashes mid-job | Lease expires after 5 min, another worker picks up the job |
| 3 consecutive failures | Job marked DEAD, run marked FAILED with last error |
| Duplicate webhook (same SHA) | Deduplicated, returns existing run ID |

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `GITHUB_WEBHOOK_SECRET` | For webhooks | — | HMAC-SHA256 signature verification |
| `GITHUB_TOKEN` | For private repos | — | Git clone authentication |
| `CI_TMP_DIR` | No | `/tmp/ci` | Temp directory for cloned repos |
| `ANALYZER_TIMEOUT_MS` | No | `600000` (10 min) | Analyzer process timeout |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | For LLM mode | — | OpenAI API key |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | For LLM mode | — | OpenAI API base URL |
