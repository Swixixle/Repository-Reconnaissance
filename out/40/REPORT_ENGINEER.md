# Program Totality Report — Engineer View

**EvidencePack Version:** 1.0
**Tool Version:** 0.1.0
**Generated:** 2026-02-15T12:17:57.210565+00:00
**Mode:** replit
**Run ID:** 81ac6b22f5af

---

## PTA Contract Audit — Run 81ac6b22f5af

### 1. System Snapshot

| Measure | Value |
|---------|-------|
| Files Analyzed | 187 |
| Files Seen (incl. skipped) | 213 |
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

**Score:** 64.67%
**Formula:** `average(claims_coverage, unknowns_coverage, howto_completeness)`

| Component | Score |
|-----------|-------|
| claims_coverage | 100.00% |
| unknowns_coverage | 0.00% |
| howto_completeness | 94.00% |

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

### The backend is an Express 5 (TypeScript) application running on Node.js.
Confidence: 100%
- Evidence: `package.json:52` (hash: `e049b398be36`)
- Evidence: `.replit:1` (hash: `a5be1ce88381`)

### The frontend is a React 18 application built with TypeScript and Vite.
Confidence: 100%
- Evidence: `package.json:65` (hash: `bd12df8fa4a7`)
- Evidence: `vite.config.ts:2` (hash: `edf1f0b3b89a`)

### Static analysis capabilities are provided by a Python 3.11+ engine using the Typer CLI.
Confidence: 100%
- Evidence: `.replit:1` (hash: `a5be1ce88381`)
- Evidence: `pyproject.toml:5` (hash: `aa7c5d87614c`)
- Evidence: `pyproject.toml:12` (hash: `2528e7d7b2c3`)
- Evidence: `pyproject.toml:23` (hash: `3263a101c35b`)

### The database is PostgreSQL 16+, accessed via Drizzle ORM and Zod schemas.
Confidence: 100%
- Evidence: `.replit:1` (hash: `a5be1ce88381`)
- Evidence: `package.json:49-50` (hash: `c65672bd1705`)
- Evidence: `replit.md:80-81` (hash: `a01caa356215`)

## Verified: Backend Dependencies

### The backend uses the pg Node.js driver for PostgreSQL support.
Confidence: 100%
- Evidence: `package.json:64` (hash: `09cc01dbb8d0`)

## Verified: Backend Dependencies / Security

### The backend enables express-session, connect-pg-simple, and memorystore for session management.
Confidence: 100%
- Evidence: `package.json:47-57` (hash: `6441207d984d`)

## Verified: Build/Install

### TypeScript and Python artifacts are built using `npm run build`.
Confidence: 100%
- Evidence: `package.json:8` (hash: `79d8bdf275d6`)

## Verified: Code Structure

### TypeScript compiler paths alias client code as '@/*' and shared code as '@shared/*'.
Confidence: 100%
- Evidence: `tsconfig.json:19-20` (hash: `8d885adc2606`)

## Verified: Data & Security Posture

### All database state is stored in PostgreSQL.
Confidence: 100%
- Evidence: `server/db.ts:13` (hash: `111f33de9945`)

### Webhook requests are authenticated using HMAC-SHA256 with a shared secret.
Confidence: 100%
- Evidence: `server/routes.ts:198` (hash: `19a51aee36f0`)

### Admin routes require authentication using the `ADMIN_KEY` env variable.
Confidence: 100%
- Evidence: `server/routes.ts:36` (hash: `e2bf4a7a579d`)

### No secret values are checked into the repository; only environment variable names are exposed.
Confidence: 100%
- Evidence: `README.md:211-216` (hash: `431bcf6183ed`)

### Analyzer uses static checks for symlinks, path containment, and traversal protection.
Confidence: 100%
- Evidence: `README.md:212-215` (hash: `394fca0ca143`)

### Only environment variable names (never values) are ever exposed in application output.
Confidence: 100%
- Evidence: `README.md:216` (hash: `68ac2dc8bd72`)

## Verified: Frontend Tooling

### TanStack React Query is used for data fetching/state management in the frontend.
Confidence: 100%
- Evidence: `package.json:43` (hash: `e3c68edd1c1e`)

### Tailwind CSS Animate and @tailwindcss/typography are enabled as Tailwind plugins.
Confidence: 100%
- Evidence: `tailwind.config.ts:107` (hash: `1b1811e9df4e`)

## Verified: How to Use / Prerequisites

### Node.js 20+ is a required dependency for the Express/React app.
Confidence: 100%
- Evidence: `.replit:1` (hash: `a5be1ce88381`)

### npm is used as the Node package manager.
Confidence: 100%
- Evidence: `Dockerfile:6` (hash: `a0b0f10ae96d`)

### Python 3.11+ is a required dependency for the analyzer CLI.
Confidence: 100%
- Evidence: `.replit:1` (hash: `a5be1ce88381`)
- Evidence: `pyproject.toml:5` (hash: `aa7c5d87614c`)

### pip is the Python package manager used for installation.
Confidence: 100%
- Evidence: `pyproject.toml:6` (hash: `be2039d702c1`)

### Drizzle ORM/Kit is required as a DB migration tool.
Confidence: 100%
- Evidence: `package.json:49-50` (hash: `c65672bd1705`)
- Evidence: `package.json:99` (hash: `b1c885f71691`)

### Vite, esbuild, and tsx are used as build tools.
Confidence: 100%
- Evidence: `package.json:100-105` (hash: `aa4b19bac489`)

### Tailwind CSS is used for styling, via the Tailwind toolchain.
Confidence: 100%
- Evidence: `package.json:102` (hash: `bfc284655594`)
- Evidence: `postcss.config.js:3` (hash: `c17b19549699`)
- Evidence: `tailwind.config.ts:107` (hash: `1b1811e9df4e`)

### The system requires the following 8 secrets to be set as environment variables: DATABASE_URL, CI_TMP_DIR, GITHUB_TOKEN, ANALYZER_TIMEOUT_MS, ADMIN_KEY, GITHUB_WEBHOOK_SECRET, AI_INTEGRATIONS_OPENAI_API_KEY, AI_INTEGRATIONS_OPENAI_BASE_URL.
Confidence: 100%
- Evidence: `drizzle.config.ts:3-13` (hash: `a19790628fbe`)
- Evidence: `server/ci-worker.ts:68-126` (hash: `f0b3c470e005`)
- Evidence: `server/routes.ts:36-416` (hash: `e2bf4a7a579d`)
- Evidence: `server/replit_integrations/audio/client.ts:10-11` (hash: `05da5f1b1281`)

## Verified: Integration Surface

### The REST API is served under the `/api/` route.
Confidence: 100%
- Evidence: `replit.md:44` (hash: `b5225b713362`)

### There is a `/api/ci/health` endpoint for health checks.
Confidence: 100%
- Evidence: `replit.md:176` (hash: `1de47e8c3ce2`)

## Verified: LLM-powered Integrations

### LLM-powered features use OpenAI via API integration, with credentials passed as environment variables.
Confidence: 100%
- Evidence: `server/replit_integrations/audio/client.ts:1-11` (hash: `1d3dd608c3bb`)

## Verified: Runtime/Execution Profile

### The backend binds to port 5000 on all interfaces (0.0.0.0) by default.
Confidence: 100%
- Evidence: `.replit:14` (hash: `2cb616fc39c1`)
- Evidence: `server/index.ts:92-96` (hash: `75d345a78f84`)

### Replit environment requires modules: nodejs-20, python-3.11, postgresql-16.
Confidence: 100%
- Evidence: `.replit:1` (hash: `a5be1ce88381`)

### Nix packages required are cargo, libiconv, libxcrypt, python312Packages.pytest_7, and rustc.
Confidence: 100%
- Evidence: `.replit:7` (hash: `0c9bc1be0df4`)

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

## Snippet Hashes (53 total)

- `05da5f1b1281`
- `09cc01dbb8d0`
- `0c9bc1be0df4`
- `111f33de9945`
- `19a51aee36f0`
- `1b1811e9df4e`
- `1d3dd608c3bb`
- `1de47e8c3ce2`
- `2528e7d7b2c3`
- `2cb616fc39c1`
- `2e10aa950730`
- `3263a101c35b`
- `394fca0ca143`
- `431bcf6183ed`
- `4bc5d8e7df37`
- `5223ac65dd80`
- `6441207d984d`
- `68ac2dc8bd72`
- `7131d8b2d92e`
- `74071080c50d`
- ... and 33 more
