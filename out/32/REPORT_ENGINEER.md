# Program Totality Report — Engineer View

**EvidencePack Version:** 1.0
**Tool Version:** 0.1.0
**Generated:** 2026-02-15T10:32:27.750088+00:00
**Mode:** replit
**Run ID:** 4d2f0cf0a5f2

---

## PTA Contract Audit — Run 4d2f0cf0a5f2

### 1. System Snapshot

| Measure | Value |
|---------|-------|
| Files Analyzed | 178 |
| Files Seen (incl. skipped) | 204 |
| Files Skipped | 26 |
| Claims Extracted | 30 |
| Claims with Deterministic Evidence | 30 |
| Unknown Governance Categories | 9 |
| Verified Structural Categories | 0 |
| Partial Coverage | Yes |

### 2. Deterministic Coverage Index (DCI v1)

**Score:** 100.00%
**Formula:** `verified_claims / total_claims`

30 of 30 extracted claims contain hash-verified evidence.

This measures claim-to-evidence visibility only.
It does not measure code quality, security posture, or structural surface coverage.

### 3. Reporting Completeness Index (RCI)

**Score:** 61.67%
**Formula:** `average(claims_coverage, unknowns_coverage, howto_completeness)`

| Component | Score |
|-----------|-------|
| claims_coverage | 100.00% |
| unknowns_coverage | 0.00% |
| howto_completeness | 85.00% |

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

## Verified: API

### All backend APIs are exposed via REST endpoints under the /api/ URL prefix.
Confidence: 100%
- Evidence: `replit.md:43,47` (hash: `b5225b713362`)

## Verified: API Authentication

### Protected API endpoints require the ADMIN_KEY secret to be passed as a header or via .env.
Confidence: 100%
- Evidence: `server/routes.ts:34` (hash: `e2bf4a7a579d`)

## Verified: Analyzer Core

### Static code and configuration analysis is performed by a Python 3.11+ CLI built with Typer, optionally invoking OpenAI LLMs for inference.
Confidence: 100%
- Evidence: `pyproject.toml:5–12` (hash: `aa7c5d87614c`)
- Evidence: `replit.md:54–66` (hash: `ffe1d23f37ee`)

## Verified: Analyzer Determinism

### Deterministic analysis (disabling the LLM component) is supported via a --no-llm CLI flag or env configuration.
Confidence: 80%
- Evidence: `README.md:61–65` (hash: `30995d62ae80`)

## Verified: Analyzer LLM Integration

### LLM-powered inference uses the OpenAI API and is only enabled if the API key and base URL environment variables are set.
Confidence: 100%
- Evidence: `server/replit_integrations/audio/client.ts:10–11` (hash: `05da5f1b1281`)
- Evidence: `replit.md:66` (hash: `54ee60d5bee0`)

## Verified: Architecture Snapshot

### The system uses a monorepo structure with three main zones: client (React), server (Express/TypeScript), and shared (Types and schemas).
Confidence: 100%
- Evidence: `replit.md:11–18` (hash: `40ac4297a2c9`)

## Verified: Backend Architecture

### The backend is a Node.js 20+ server using Express 5, implemented in TypeScript, and uses Drizzle ORM for database access.
Confidence: 100%
- Evidence: `replit.md:41–45` (hash: `500e08fb1b8f`)
- Evidence: `package.json:52` (hash: `e049b398be36`)
- Evidence: `package.json:49` (hash: `c65672bd1705`)

## Verified: Data & Security Posture

### All secrets such as database credentials and API keys are accessed only by environment variable reference, never as values in code or logs.
Confidence: 100%
- Evidence: `drizzle.config.ts:3–13` (hash: `a19790628fbe`)
- Evidence: `README.md:146` (hash: `68ac2dc8bd72`)

## Verified: Database Layer

### All persistent state is stored in PostgreSQL 14+ with the connection string referenced in the DATABASE_URL environment variable.
Confidence: 100%
- Evidence: `drizzle.config.ts:3–13` (hash: `a19790628fbe`)
- Evidence: `server/db.ts:7,13` (hash: `a19790628fbe`)

## Verified: Database Migrations

### Database schema migration is automated via drizzle-kit and triggered with npm run db:push.
Confidence: 100%
- Evidence: `package.json:11` (hash: `3a8be55004c2`)

## Verified: Dependencies

### Frontend dependencies include React 18, Vite, Tailwind CSS, shadcn/ui, React Query, Wouter, and Framer Motion.
Confidence: 100%
- Evidence: `package.json:65` (hash: `bd12df8fa4a7`)
- Evidence: `package.json:105` (hash: `b731619bba59`)
- Evidence: `tailwind.config.ts:107` (hash: `1b1811e9df4e`)

### Backend dependencies include Express 5, Drizzle ORM, pg, express-session, connect-pg-simple, TypeScript, and tsx.
Confidence: 100%
- Evidence: `package.json:52` (hash: `e049b398be36`)
- Evidence: `package.json:49` (hash: `c65672bd1705`)
- Evidence: `package.json:62` (hash: `c0ddb2654ff4`)
- Evidence: `package.json:53` (hash: `abb52cbb888c`)
- Evidence: `package.json:47` (hash: `6441207d984d`)

### The Python analyzer requires GitPython, jsonschema, openai, python-dotenv, rich, and typer as dependencies.
Confidence: 100%
- Evidence: `pyproject.toml:7–12` (hash: `59f7a0cb3010`)

## Verified: Development/Production Parity

### Unified scripts and mono-repo structure enable consistent developer and production environments.
Confidence: 90%
- Evidence: `.replit:1–4` (hash: `a5be1ce88381`)
- Evidence: `package.json:6–12` (hash: `3dcf7fcb2304`)

## Verified: Environment Variable Requirements

### Critical runtime secrets required include DATABASE_URL, ADMIN_KEY, ANALYZER_TIMEOUT_MS, AI_INTEGRATIONS_OPENAI_API_KEY, and AI_INTEGRATIONS_OPENAI_BASE_URL.
Confidence: 95%
- Evidence: `drizzle.config.ts:3–13` (hash: `a19790628fbe`)
- Evidence: `server/routes.ts:34,243` (hash: `e2bf4a7a579d`)
- Evidence: `server/replit_integrations/audio/client.ts:10–11` (hash: `05da5f1b1281`)

## Verified: Forensic Evidence & Tamper Proofing

### All analysis claims are hash-verified against the source code blobs at the time of extraction for forensic integrity.
Confidence: 100%
- Evidence: `README.md:132–134` (hash: `87c85e98aeb0`)

## Verified: Forensic Packs

### Operators can export and offline verify forensic packs of claims and evidence using TypeScript scripts in /scripts.
Confidence: 90%
- Evidence: `package.json:8–11` (hash: `79d8bdf275d6`)

## Verified: Frontend Architecture

### The frontend is a React 18 single-page app, bootstrapped with Vite, using Wouter for routing, shadcn/ui, Tailwind CSS, React Query, and Framer Motion.
Confidence: 100%
- Evidence: `replit.md:23–29` (hash: `1412db9c89fd`)

## Verified: Frontend Build/Paths

### The Vite config sets the root to client, the output directory to dist/public, and includes aliasing for @, @shared, and @assets.
Confidence: 80%
- Evidence: `vite.config.ts:29–31` (hash: `44adb1751881`)
- Evidence: `vite.config.ts:24–26` (hash: `4a85dc017fd3`)

## Verified: Health and Readiness

### Health status is checked via /api/health and readiness via /api/ready endpoints.
Confidence: 100%
- Evidence: `server/routes.ts:55` (hash: `f7ba68760271`)

## Verified: Identity of Target System

### The system is not a dynamic or runtime security scanner, deployment platform, real-time collaboration tool, database engine, or generic file archival tool.
Confidence: 100%
- Evidence: `README.md:4` (hash: `e3b0c44298fc`)
- Evidence: `README.md:134` (hash: `1898369ac446`)

## Verified: Job and Output

### The analyzer produces evidence-bound technical dossiers, claims, and runbooks in JSON and Markdown, with file and line references.
Confidence: 90%
- Evidence: `README.md:9–19` (hash: `f501ae412cdb`)
- Evidence: `replit.md:4,11,13` (hash: `e3b0c44298fc`)

## Verified: Logging & Observability

### Structured NDJSON logs are written to out/_log/analyzer.ndjson and health checks are available via HTTP endpoints.
Confidence: 100%
- Evidence: `server/routes.ts:12,14` (hash: `06aead72c082`)
- Evidence: `server/routes.ts:55` (hash: `f7ba68760271`)

## Verified: Nix Packages

### On Replit, the environment provides Nix packages: cargo, libiconv, libxcrypt, python312Packages.pytest_7, and rustc.
Confidence: 100%
- Evidence: `.replit:7` (hash: `0c9bc1be0df4`)

## Verified: Production Binding

### The server binds to all interfaces (0.0.0.0) and uses the PORT environment variable with a default of 5000.
Confidence: 100%
- Evidence: `server/index.ts:92,96` (hash: `75d345a78f84`)

## Verified: Project Initialization

### Project setup requires Node.js 20+, Python 3.11+, PostgreSQL 14+, and system utilities jq and unzip.
Confidence: 90%
- Evidence: `.replit:1` (hash: `a5be1ce88381`)
- Evidence: `.replit:7` (hash: `0c9bc1be0df4`)
- Evidence: `pyproject.toml:5` (hash: `aa7c5d87614c`)

## Verified: Session Management

### Session state is managed using express-session, with persistence via connect-pg-simple storing session data in the PostgreSQL database.
Confidence: 100%
- Evidence: `package.json:53` (hash: `abb52cbb888c`)
- Evidence: `package.json:47` (hash: `6441207d984d`)

## Verified: Source Schema Sharing

### Type definitions and API route contracts are shared via the shared/ directory to prevent type drift between frontend and backend.
Confidence: 100%
- Evidence: `replit.md:17` (hash: `6ff71f3c7f43`)

## Verified: Startup & Runtime

### The backend server starts with npm run dev in development and npm run start in production, serving on port 5000 by default.
Confidence: 100%
- Evidence: `.replit:2` (hash: `96fa2e5505e4`)
- Evidence: `package.json:9` (hash: `020435ddf436`)
- Evidence: `.replit:14` (hash: `2cb616fc39c1`)

## Verified: Static Asset Handling

### In production mode, static assets are served using server/static.ts.
Confidence: 80%
- Evidence: `replit.md:41–45` (hash: `500e08fb1b8f`)

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

## Snippet Hashes (51 total)

- `020435ddf436`
- `05da5f1b1281`
- `06aead72c082`
- `0c9bc1be0df4`
- `1412db9c89fd`
- `1898369ac446`
- `1b1811e9df4e`
- `1f70e6a77d42`
- `232f2a0c483a`
- `2cb616fc39c1`
- `30995d62ae80`
- `3a8be55004c2`
- `3dcf7fcb2304`
- `40ac4297a2c9`
- `44adb1751881`
- `46effdb3adbb`
- `4994405dd75c`
- `4a85dc017fd3`
- `500e08fb1b8f`
- `54ee60d5bee0`
- ... and 31 more
