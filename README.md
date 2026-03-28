# Debrief

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Read any codebase. Get a verified plain-language brief.**

Debrief analyzes repositories and artifacts (Git hosts, archives, local paths where enabled) and produces plain-language reports, security and dependency posture, API surface maps, and structured JSON outputs. The internal evidence and signing layer is **PTA (Proof Trust Anchor)** — receipts, hashes, optional signatures, and the scheduled **time-based evidence trail** for drift and anomalies.

## Quickstart

```bash
npm install

python3 -m venv .venv
.venv/bin/pip install -e .

cp .env.example .env
# Set AI_INTEGRATIONS_OPENAI_API_KEY or OPENAI_API_KEY for LLM-backed runs.
# Set DATABASE_URL (and Redis if using BullMQ) for the full web app.

docker compose up -d   # optional: Postgres + Redis

npm run dev            # Express + Vite client (default http://localhost:5000)

# Node verification / dossier CLI (same as npm run reporecon)
npm run debrief -- --help

# Python analyzer CLI (after pip install -e .)
debrief analyze https://github.com/user/repo --output-dir ./out/run --mode learner
# Legacy entry point (deprecated): pta analyze …
```

## Modes

- **Open web** — Set `DEBRIEF_OPEN_WEB=1` and matching `VITE_DEBRIEF_OPEN_WEB` so the SPA can call the API without a shared API key (still rate-limited). See `docs/CONFIGURATION.md`.
- **Auth (Clerk)** — Optional sign-in for hosted multi-tenant setups; Clerk keys in `.env.example`.
- **Desktop (Tauri)** — Local shell around the same API:

```bash
npm run dev          # terminal 1 — API on PORT from .env (default 5000)
npm run desktop:dev  # terminal 2 — Tauri dev
```

## Time-Based Evidence Trail

Every analysis can participate in a **tamper-evident chain**: signed receipts linked in order, optional schedules (e.g. several times daily or on trigger), **gap** receipts when a run is missed, and **anomaly** signaling when posture changes between snapshots (e.g. auth on an endpoint). Export bundles a verifier can run offline. Product copy and scenarios are summarized above; engineering detail is in `docs/CONTEXT.md`, `docs/ARCHITECTURE.md`, and chain-related variables in `.env.example`.

## Configure

- **Environment:** `.env.example` (grouped by concern — LLM, server, DB, queue, auth, billing, chain, scheduler, alerts, desktop, CORS).
- **Deep dive:** `docs/CONFIGURATION.md`

## Deploy

See **`docs/DEPLOYMENT.md`** for production deployment notes.

## Architecture

High level: React (`client/`) → Express API (`server/`) → PostgreSQL / optional Redis / Python analyzer (`server/analyzer/`). Shared Drizzle schema and JSON contracts live under `shared/`. For diagrams and pipeline detail, read **`docs/ARCHITECTURE.md`** and **`docs/CONTEXT.md`**. Market and positioning: `docs/MARKET_CONTEXT.md`.

## Input types

GitHub, GitLab, Bitbucket, Replit, local folder (when allowed), zip upload, URL surface scan, audio (Whisper), pasted text, Notion (public page). See `docs/CONTEXT.md` for the ingestion router and APIs.

## Repo layout

| Path | Purpose |
|------|---------|
| `client/` | React UI, Vite, `src-tauri/` (desktop) |
| `server/` | Express API, worker, Python analyzer |
| `shared/` | Drizzle schema, routes, JSON schemas |
| `docs/` | Product and engineering docs |
| `extensions/`, `integrations/` | Editor and bot stubs |
| `out/` | **Local output — gitignored** |

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Nikodemus Systems.
