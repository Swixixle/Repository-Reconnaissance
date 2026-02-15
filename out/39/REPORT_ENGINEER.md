# Program Totality Report — Engineer View

**EvidencePack Version:** 1.0
**Tool Version:** 0.1.0
**Generated:** 2026-02-15T11:10:28.913160+00:00
**Mode:** github
**Run ID:** 5b0cc16b4179

---

## PTA Contract Audit — Run 5b0cc16b4179

### 1. System Snapshot

| Measure | Value |
|---------|-------|
| Files Analyzed | 191 |
| Files Seen (incl. skipped) | 191 |
| Files Skipped | 0 |
| Claims Extracted | 30 |
| Claims with Deterministic Evidence | 26 |
| Unknown Governance Categories | 9 |
| Verified Structural Categories | 0 |
| Partial Coverage | No |

### 2. Deterministic Coverage Index (DCI v1)

**Score:** 86.67%
**Formula:** `verified_claims / total_claims`

26 of 30 extracted claims contain hash-verified evidence.

This measures claim-to-evidence visibility only.
It does not measure code quality, security posture, or structural surface coverage.

### 3. Reporting Completeness Index (RCI)

**Score:** 52.22%
**Formula:** `average(claims_coverage, unknowns_coverage, howto_completeness)`

| Component | Score |
|-----------|-------|
| claims_coverage | 86.67% |
| unknowns_coverage | 0.00% |
| howto_completeness | 70.00% |

RCI is a documentation completeness metric.
It is not a security score and does not imply structural sufficiency.

### 4. Structural Visibility (DCI v2)

**Status:** not_implemented
**Formula (reserved):** `verified_structural_items / total_structural_surface`

Routes, dependencies, schemas, and enforcement extractors are not active.
Structural surface visibility is intentionally reported as null rather than estimated.
This prevents silent overstatement of governance posture.

### 5. Epistemic Posture

PTA explicitly reports:
- What is deterministically verified.
- What is unknown.
- What is not implemented.
- What requires dedicated extractors.

There is no inference-based promotion from UNKNOWN to VERIFIED.

---

## Verified: Architecture Snapshot

### The frontend is implemented as a React 18 Single-Page Application using TypeScript, Wouter for routing, and shadcn/ui with Tailwind and Framer Motion for the UI.
Confidence: 100%
- Evidence: `replit.md:21–31` (hash: `781499375745`)
- Evidence: `client/requirements.md:2–4` (hash: `d45be2f83b30`)
- Evidence: `package.json:65,70,73` (hash: `bd12df8fa4a7`)

### The backend is a Node.js 20+ application using Express 5, exposing a REST API at /api/, written in TypeScript and bundled for production with esbuild, using Drizzle ORM for database access.
Confidence: 100%
- Evidence: `replit.md:41–46` (hash: `500e08fb1b8f`)
- Evidence: `package.json:49,52` (hash: `c65672bd1705`)

### Schema/type definitions are separated into a shared layer using Zod to prevent contract drift between components.
Confidence: 100%
- Evidence: `replit.md:17` (hash: `6ff71f3c7f43`)
- Evidence: `replit.md:94–95` (hash: `27e8f8ec309e`)
- Evidence: `replit.md:50` (hash: `361176aeb2f1`)

### The analyzer is a Python 3.11+ CLI built with Typer, orchestrating deterministic and LLM analysis modes and emitting all dossiers.
Confidence: 100%
- Evidence: `replit.md:54–61` (hash: `ffe1d23f37ee`)
- Evidence: `pyproject.toml:2,12` (hash: `f0d4a96fe7d6`)

### The system relies on an external PostgreSQL 14+ instance for persistent data storage, with schema and migrations managed by Drizzle Kit and configured via the environment variable DATABASE_URL.
Confidence: 100%
- Evidence: `drizzle.config.ts:3,10–12` (hash: `a19790628fbe`)

### Frontend assets are built using Vite and the server uses esbuild, with output in dist/public and dist/index.cjs, respectively.
Confidence: 100%
- Evidence: `vite.config.ts:29–31` (hash: `44adb1751881`)
- Evidence: `package.json:8` (hash: `79d8bdf275d6`)
- Evidence: `Dockerfile:11,15` (hash: `9729b411621b`)

## Verified: Capability Map

### All operator output and how-to steps are evidence-cited, with every step, port, config, and command mapped to its source via file:line:hash.
Confidence: 100%
- Evidence: `README.md:13–19` (hash: `70d33f05b06a`)
- Evidence: `README.md:164–173` (hash: `b7edf9475933`)

### The analyzer supports both structural deterministic mode (without LLM) and semantic LLM-augmented extraction, toggleable via a --no-llm flag.
Confidence: 100%
- Evidence: `README.md:59–67` (hash: `3e70dec9b544`)
- Evidence: `README.md:216–221` (hash: `e3b0c44298fc`)

### PTA can analyze GitHub URLs, local folders, or the current Replit workspace for artifacts.
Confidence: 100%
- Evidence: `README.md:42–57` (hash: `b41698313679`)
- Evidence: `replit.md:56–59` (hash: `22085c032d95`)

### PTA extracts referenced environment variables, API keys, and network ports used by the application.
Confidence: 100%
- Evidence: `README.md:70–71` (hash: `55f9671fedce`)
- Evidence: `drizzle.config.ts:3` (hash: `a19790628fbe`)

### PTA detects public and private API endpoints, operational gaps, missing evidence, and unknowns in the analysis.
Confidence: 100%
- Evidence: `README.md:156–162` (hash: `a982bf03455e`)
- Evidence: `README.md:173–174` (hash: `b29c58db2d6a`)

## Verified: Data & Security Posture

### All data persists in an external PostgreSQL database, connection configured by the DATABASE_URL environment variable.
Confidence: 100%
- Evidence: `drizzle.config.ts:3` (hash: `a19790628fbe`)
- Evidence: `drizzle.config.ts:10–12` (hash: `d3b6ea7904ab`)

### Secrets and sensitive runtime configuration are handled via environment variables; only their names are ever surfaced in analysis output, not values.
Confidence: 100%
- Evidence: `README.md:146` (hash: `68ac2dc8bd72`)
- Evidence: `drizzle.config.ts:3` (hash: `a19790628fbe`)

### Session authentication uses express-session with SESSION_SECRET and API access is guarded by API_KEY.
Confidence: 100%
- Evidence: `package.json:53` (hash: `abb52cbb888c`)

### OpenAI LLM integrations require AI_INTEGRATIONS_OPENAI_API_KEY and AI_INTEGRATIONS_OPENAI_BASE_URL in the environment; these are not required for deterministic mode.
Confidence: 100%
- Evidence: `README.md:85–86` (hash: `7fb69856946c`)

### Network port 5000 is the HTTP server default (settable by env), mapped externally to 80 by Replit and Docker.
Confidence: 100%
- Evidence: `.replit:10–11` (hash: `47abfb4488e8`)
- Evidence: `Dockerfile:18` (hash: `2ab60fd4a4e2`)

### The only configured external service contact is to OpenAI for optional LLM mode; no other external connections are evidenced.
Confidence: 100%
- Evidence: `README.md:85–86` (hash: `7fb69856946c`)

## Verified: Identity of Target System

### Program Totality Analyzer (PTA) does not perform any dynamic or interactive runtime analysis, such as program tracing or eBPF instrumentation.
Confidence: 100%
- Evidence: `README.md:5` (hash: `ece9dc51808b`)

### PTA is not a security proof, correctness checker, or compliance attestor.
Confidence: 100%
- Evidence: `README.md:5` (hash: `ece9dc51808b`)

### PTA is not a database product and requires an external PostgreSQL instance.
Confidence: 100%
- Evidence: `drizzle.config.ts:10–12` (hash: `d3b6ea7904ab`)

### PTA is not a deployment or containerization platform and is intended to be deployed behind a reverse proxy or inside a PaaS or host environment.
Confidence: 100%
- Evidence: `.replit:16–18` (hash: `a969737d1389`)

## Verified: Integration Surface

### All operations are exposed via well-documented REST API endpoints under the /api/ path, including /api/health, /api/ready, /api/audit/verify, and /api/receipts/:id/lock.
Confidence: 100%
- Evidence: `docs/dossiers/lantern_program_totality_dossier.md:160` (hash: `ff679a4bae68`)
- Evidence: `replit.md:43–52` (hash: `b5225b713362`)

### Private API endpoints require an API key to be sent in the x-api-key HTTP header for authentication.
Confidence: 100%
- Evidence: `docs/dossiers/lantern_program_totality_dossier.md:151` (hash: `ab249b766ec2`)

### All API payloads use JSON format and are validated using Zod schemas.
Confidence: 100%
- Evidence: `replit.md:42–43` (hash: `db5d6b0bd030`)
- Evidence: `package.json:79` (hash: `99a7ac896517`)

## Verified: Maintainability & Change Risk

### Shared schemas/types and deterministic extractors guard against contract drift and reduce the need for LLM involvement in most operator steps.
Confidence: 100%
- Evidence: `replit.md:17` (hash: `6ff71f3c7f43`)
- Evidence: `README.md:59–63` (hash: `3e70dec9b544`)

## Verified: Operational Reality

### System operation requires Node.js 20+ and Python 3.11+, with PostgreSQL online and reachable, and secrets properly configured in .env.
Confidence: 100%
- Evidence: `README.md:39` (hash: `e3b0c44298fc`)
- Evidence: `README.md:47` (hash: `f1b901847390`)
- Evidence: `replit.md:71–73` (hash: `a01caa356215`)
- Evidence: `Dockerfile:18` (hash: `2ab60fd4a4e2`)

## Verified Structural (deterministic extractors only)

- **dependencies**: not_implemented: requires lockfile parser (package-lock.json, requirements.txt, etc.)
- **enforcement**: not_implemented: requires auth/middleware pattern detector over source files
- **routes**: not_implemented: requires AST/regex route extractor over source files
- **schemas**: not_implemented: requires migration/model file parser

## Known Unknown Surface

| Category | Status | Notes |
|----------|--------|-------|
| tls_termination | UNKNOWN | No matching infrastructure/config artifacts found in file index |
| encryption_at_rest | UNKNOWN | No matching infrastructure/config artifacts found in file index |
| secret_management | UNKNOWN | No matching infrastructure/config artifacts found in file index |
| deployment_topology | UNKNOWN | Candidate artifact files found (Dockerfile) but artifact detector not yet implemented — cannot read/hash/verify file content |
| runtime_iam | UNKNOWN | No matching infrastructure/config artifacts found in file index |
| logging_sink | UNKNOWN | No matching infrastructure/config artifacts found in file index |
| monitoring_alerting | UNKNOWN | No matching infrastructure/config artifacts found in file index |
| backup_retention | UNKNOWN | No matching infrastructure/config artifacts found in file index |
| data_residency | UNKNOWN | No matching infrastructure/config artifacts found in file index |

## Snippet Hashes (50 total)

- `020435ddf436`
- `03b0895d239a`
- `22085c032d95`
- `232f2a0c483a`
- `27e8f8ec309e`
- `2ab60fd4a4e2`
- `361176aeb2f1`
- `3e70dec9b544`
- `44adb1751881`
- `4530c109285c`
- `46effdb3adbb`
- `47abfb4488e8`
- `500e08fb1b8f`
- `55f9671fedce`
- `68ac2dc8bd72`
- `6bfea429a287`
- `6ff71f3c7f43`
- `70d33f05b06a`
- `781499375745`
- `79d8bdf275d6`
- ... and 30 more
