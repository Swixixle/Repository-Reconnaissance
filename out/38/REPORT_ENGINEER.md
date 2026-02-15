# Program Totality Report — Engineer View

**EvidencePack Version:** 1.0
**Tool Version:** 0.1.0
**Generated:** 2026-02-15T10:43:53.912169+00:00
**Mode:** github
**Run ID:** 689a2984ecfd

---

## PTA Contract Audit — Run 689a2984ecfd

### 1. System Snapshot

| Measure | Value |
|---------|-------|
| Files Analyzed | 191 |
| Files Seen (incl. skipped) | 191 |
| Files Skipped | 0 |
| Claims Extracted | 30 |
| Claims with Deterministic Evidence | 27 |
| Unknown Governance Categories | 9 |
| Verified Structural Categories | 0 |
| Partial Coverage | No |

### 2. Deterministic Coverage Index (DCI v1)

**Score:** 90.00%
**Formula:** `verified_claims / total_claims`

27 of 30 extracted claims contain hash-verified evidence.

This measures claim-to-evidence visibility only.
It does not measure code quality, security posture, or structural surface coverage.

### 3. Reporting Completeness Index (RCI)

**Score:** 53.33%
**Formula:** `average(claims_coverage, unknowns_coverage, howto_completeness)`

| Component | Score |
|-----------|-------|
| claims_coverage | 90.00% |
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

## Verified: API Surface

### The REST API is mounted under /api/, all requests/response bodies are JSON and Zod-validated, with documented endpoints such as /api/health, /api/ready, /api/projects, /api/audit/verify.
Confidence: 100%
- Evidence: `shared/routes.ts:1–40` (hash: `06bca167dd16`)
- Evidence: `replit.md:43–47` (hash: `b5225b713362`)

## Verified: Analyzer

### The analyzer can optionally use an LLM for interpretive analysis but defaults to deterministic (no LLM) operation.
Confidence: 100%
- Evidence: `README.md:77–83` (hash: `451bb62e67ab`)
- Evidence: `pyproject.toml:9` (hash: `b6da08317c6d`)

## Verified: Architecture Snapshot

### PTA frontend is built with React 18 (TypeScript, Vite), Wouter for routing, shadcn/ui (Radix UI), and TailwindCSS, managing state/data with TanStack React Query.
Confidence: 100%
- Evidence: `tailwind.config.ts:1–108` (hash: `31d5ee63d324`)
- Evidence: `vite.config.ts:1–40` (hash: `96baf42b9597`)
- Evidence: `client/requirements.md:1–15` (hash: `8b78543399bb`)

### The PTA backend is implemented with Node.js 20, Express 5, Drizzle ORM, esbuild, and includes session management with express-session and connect-pg-simple.
Confidence: 100%
- Evidence: `package.json:7–53` (hash: `fd240a9dc053`)
- Evidence: `drizzle.config.ts:1–14` (hash: `1f5c93c3d974`)
- Evidence: `replit.md:39–54` (hash: `3e4f72540881`)

### PTA requires PostgreSQL 14+ for persistent storage of projects, analyses, and conversations, with Drizzle migrations and env-driven database connectivity.
Confidence: 100%
- Evidence: `drizzle.config.ts:3–13` (hash: `a19790628fbe`)
- Evidence: `replit.md:71–78` (hash: `a01caa356215`)

### The Python-based analyzer is invoked as a child process by the Express API, provides deterministic structural analysis, and can produce outputs like operate.json and claims.json.
Confidence: 100%
- Evidence: `README.md:54–62` (hash: `e0d3fc4976e2`)
- Evidence: `pyproject.toml:22–23` (hash: `11923c6d7780`)
- Evidence: `replit.md:54–68` (hash: `ffe1d23f37ee`)

## Verified: Backend/Dependencies

### Major backend dependencies include Express 5, Drizzle ORM, esbuild for building, connect-pg-simple for session store, pg for PostgreSQL connectivity, express-session for session management, and Zod for schema validation.
Confidence: 100%
- Evidence: `package.json:47–53` (hash: `6441207d984d`)
- Evidence: `package-lock.json:62–64` (hash: `09cc01dbb8d0`)

## Verified: Build & Deployment

### Development server is started with npm run dev; production build is performed by npm run build, and production server starts with npm run start.
Confidence: 100%
- Evidence: `package.json:7–9` (hash: `fd240a9dc053`)
- Evidence: `.replit:2–19` (hash: `96fa2e5505e4`)

## Verified: Capability Map

### PTA supports deterministic boot/install surveys, operator runbook synthesis, REST API surface extraction, explicit evidence/unknowns labeling, Replit-specific awareness, forensic export/verification, LLM-assisted findings, and audit chain verification.
Confidence: 100%
- Evidence: `README.md:151–163` (hash: `46fe1f323990`)

## Verified: Configuration

### Critical configuration variables include DATABASE_URL, API_KEY, and SESSION_SECRET, to be set in the .env file.
Confidence: 100%
- Evidence: `drizzle.config.ts:3–5` (hash: `a19790628fbe`)
- Evidence: `package.json:53` (hash: `abb52cbb888c`)

## Verified: Data Storage

### PTA stores projects, analyses, session tokens, and chat logs (if applicable) in PostgreSQL, as defined in Drizzle schema.
Confidence: 90%
- Evidence: `drizzle.config.ts:9–13` (hash: `1d784df9809a`)

## Verified: Frontend/Build

### The frontend build is handled via Vite and TypeScript, configured to output to dist/public.
Confidence: 100%
- Evidence: `vite.config.ts:30–33` (hash: `14825b8b5896`)

## Verified: Frontend/Config

### TypeScript path aliases are set for shared types (as @shared/*) and assets/components/libraries for clean import structure.
Confidence: 100%
- Evidence: `tsconfig.json:18–21` (hash: `4563730f6bb6`)
- Evidence: `vite.config.ts:22–28` (hash: `27d9d7188f34`)

## Verified: Frontend/Dependencies

### Frontend main dependencies are React 18, Vite, TailwindCSS, shadcn/ui (Radix UI), TanStack React Query, Wouter router, and Zod for shared types.
Confidence: 100%
- Evidence: `package.json:16–79` (hash: `74f2ea8118e2`)
- Evidence: `vite.config.ts:1–40` (hash: `96baf42b9597`)

## Verified: Frontend/Styling

### Frontend uses TailwindCSS for styling, extended with custom color/tokens and animation configuration.
Confidence: 100%
- Evidence: `tailwind.config.ts:1–108` (hash: `31d5ee63d324`)

## Verified: Identity of Target System

### Program Totality Analyzer (PTA) consists of a deterministic, evidence-citing analyzer CLI and libraries (Python) and a full-stack web app (Node.js/Express + React/Vite) for project management, analyses, and dossier/receipt review.
Confidence: 100%
- Evidence: `docs/dossiers/lantern_program_totality_dossier.md:3–15` (hash: `6d14363bfa74`)

## Verified: Install/Prereqs

### To run PTA, required tools are Node.js (20+), npm, TypeScript, Python 3.11+, PostgreSQL 14+, jq, unzip, and drizzle-kit.
Confidence: 100%
- Evidence: `pyproject.toml:5` (hash: `aa7c5d87614c`)

## Verified: Python Analyzer/Dependencies

### The Python analyzer requires Python 3.11+, and depends on gitpython, jsonschema, openai, python-dotenv, rich, and typer.
Confidence: 100%
- Evidence: `pyproject.toml:5–13` (hash: `aa7c5d87614c`)

## Verified: Replit Execution Profile

### On Replit, PTA launches with npm run dev by default, exposes port 5000 mapped to 80, automatically detects Replit execution, and uses Vite plugins for dev error overlays.
Confidence: 90%
- Evidence: `.replit:2–14` (hash: `96fa2e5505e4`)
- Evidence: `vite.config.ts:4–21` (hash: `9d68ed6be8c0`)

## Verified: Runtime Environment

### The main server runs as a Node.js process for both development and production; developed with live reload via tsx/Vite, built for production using npm run build.
Confidence: 100%
- Evidence: `.replit:2–14` (hash: `96fa2e5505e4`)
- Evidence: `package.json:7–9` (hash: `fd240a9dc053`)

### The PTA system provides a Dockerfile for multi-stage build and exposes port 5000, but does not include Docker Compose, systemd, or reverse-proxy integration guides.
Confidence: 100%
- Evidence: `.replit:10–11` (hash: `47abfb4488e8`)
- Evidence: `README.md:56` (hash: `4bc5d8e7df37`)

## Verified: Security

### Session cookies are encrypted/signed using the SESSION_SECRET as configured for express-session.
Confidence: 100%
- Evidence: `package.json:53` (hash: `abb52cbb888c`)

### Secrets such as API keys and database credentials are never committed to the repository and are referenced only by name in .env files, using python-dotenv and Node env.
Confidence: 100%
- Evidence: `README.md:146` (hash: `68ac2dc8bd72`)

### Database connections are presumed encrypted via Postgres driver, though no explicit TLS configuration evidence is found.
Confidence: 80%
- Evidence: `docs/dossiers/lantern_program_totality_dossier.md:214` (hash: `e90d68b63498`)

## Verified: Security/Posture

### Audit logging is implemented as a hash-linked, append-only chain, verifiable via API endpoints or forensic packs.
Confidence: 90%
- Evidence: `docs/dossiers/lantern_program_totality_dossier.md:29–30` (hash: `ef17b12b3e9b`)

## Verified: Session/Auth

### No OAuth or password register/login flows are present—API access is enforced via API_KEY only.
Confidence: 80%
- Evidence: `drizzle.config.ts:3–5` (hash: `a19790628fbe`)

## Verified: Type Safety

### API contracts and shared types are managed with TypeScript and Zod, and located in the shared directory.
Confidence: 100%
- Evidence: `vite.config.ts:25` (hash: `5ac860c2c519`)
- Evidence: `tsconfig.json:20` (hash: `d0a99206dd38`)

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

## Snippet Hashes (48 total)

- `020435ddf436`
- `06bca167dd16`
- `09cc01dbb8d0`
- `11923c6d7780`
- `14825b8b5896`
- `1d784df9809a`
- `1f5c93c3d974`
- `232f2a0c483a`
- `235fdc0ab0a3`
- `27d9d7188f34`
- `31d5ee63d324`
- `3a8be55004c2`
- `3e4f72540881`
- `451bb62e67ab`
- `4563730f6bb6`
- `46fe1f323990`
- `47abfb4488e8`
- `4994405dd75c`
- `4bc5d8e7df37`
- `4be7c6195f60`
- ... and 28 more
