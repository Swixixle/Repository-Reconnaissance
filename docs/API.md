# API Reference

Base URL: `https://<your-app-domain>/api`

All endpoints return JSON. Error responses include a `message` field.

## Project Analysis

### `GET /api/projects`

List all projects.

**Response:**
```json
[
  {
    "id": 1,
    "url": "https://github.com/user/repo",
    "name": "repo",
    "mode": "github",
    "status": "completed",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### `POST /api/projects`

Create a new project.

**Request body:**
```json
{
  "url": "https://github.com/user/repo",
  "name": "repo",
  "mode": "github"
}
```

`mode` must be one of: `github`, `local`, `replit`.

### `GET /api/projects/:id`

Get a single project by ID.

### `GET /api/projects/:id/analysis`

Get analysis results for a project.

### `POST /api/projects/:id/analyze`

Trigger analysis for a project. Spawns the Python analyzer as a child process.

---

## Live Static CI Feed

### `POST /api/webhooks/github`

GitHub webhook receiver. Validates HMAC-SHA256 signature from the `X-Hub-Signature-256` header against the `GITHUB_WEBHOOK_SECRET` env var.

**Accepted events:** `push`, `pull_request`

**Headers required:**
- `X-Hub-Signature-256`: HMAC-SHA256 signature of the request body
- `X-GitHub-Event`: Event type (`push` or `pull_request`)
- `Content-Type`: `application/json`

**Response (success):**
```json
{
  "ok": true,
  "run_id": "9c0ed034-9242-4b46-ae22-1f3baa72f4c8"
}
```

**Response (deduplicated — same owner/repo/SHA within 6 hours):**
```json
{
  "ok": true,
  "run_id": "9c0ed034-9242-4b46-ae22-1f3baa72f4c8",
  "deduplicated": true
}
```

**Response (signature invalid):**
```
401 Unauthorized
```

### `GET /api/ci/runs`

List CI runs for a repository.

**Query parameters:**
| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| `owner` | Yes | — | Repository owner |
| `repo` | Yes | — | Repository name |
| `limit` | No | 50 | Max runs to return |

**Response:**
```json
{
  "ok": true,
  "runs": [
    {
      "id": "9c0ed034-9242-4b46-ae22-1f3baa72f4c8",
      "repoOwner": "octocat",
      "repoName": "hello-world",
      "ref": "main",
      "commitSha": "abc123def456789...",
      "eventType": "push",
      "status": "SUCCEEDED",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "startedAt": "2025-01-01T00:00:01.000Z",
      "finishedAt": "2025-01-01T00:01:30.000Z",
      "error": null,
      "outDir": "out/ci/9c0ed034-9242-4b46-ae22-1f3baa72f4c8",
      "summaryJson": {
        "boot_commands": 3,
        "endpoints": 5,
        "gaps": 2
      }
    }
  ]
}
```

### `GET /api/ci/runs/:id`

Get a single CI run by UUID.

**Response:** Same shape as a single item from the runs list above.

### `POST /api/ci/enqueue`

Manually enqueue a CI run (useful for testing without webhooks).

**Request body:**
```json
{
  "owner": "octocat",
  "repo": "hello-world",
  "ref": "main",
  "commit_sha": "abc123def456789abcdef1234567890abcdef123",
  "event_type": "manual"
}
```

**Response:**
```json
{
  "ok": true,
  "run_id": "9c0ed034-9242-4b46-ae22-1f3baa72f4c8"
}
```

If the same owner/repo/SHA was enqueued within the last 6 hours:
```json
{
  "ok": true,
  "run_id": "9c0ed034-9242-4b46-ae22-1f3baa72f4c8",
  "deduplicated": true
}
```

### `POST /api/ci/worker/tick`

Process one queued job. Fallback mechanism for environments where the background worker loop is not running.

**Response (job processed):**
```json
{
  "ok": true,
  "processed": true,
  "run_id": "9c0ed034-9242-4b46-ae22-1f3baa72f4c8"
}
```

**Response (no jobs):**
```json
{
  "ok": true,
  "processed": false
}
```

### `GET /api/ci/health`

Health check endpoint showing job queue status.

**Response:**
```json
{
  "ok": true,
  "jobs": {
    "READY": 2,
    "LEASED": 1,
    "DONE": 15,
    "DEAD": 0
  },
  "last_completed": {
    "id": "9c0ed034-9242-4b46-ae22-1f3baa72f4c8",
    "repoOwner": "octocat",
    "repoName": "hello-world",
    "status": "SUCCEEDED",
    "finishedAt": "2025-01-01T00:01:30.000Z"
  }
}
```

---

## Webhook Requirements

GitHub webhook configuration:

| Setting | Value |
|---------|-------|
| Payload URL | `https://<your-app-domain>/api/webhooks/github` |
| Content type | `application/json` |
| Secret | Must match `GITHUB_WEBHOOK_SECRET` env var exactly |
| Events | Push, Pull requests |

Signature verification uses HMAC-SHA256 with timing-safe comparison. The server checks the `X-Hub-Signature-256` header against the computed signature of the raw request body.
