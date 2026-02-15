# Program Totality Report — Engineer View

**EvidencePack Version:** 1.0
**Tool Version:** 0.1.0
**Generated:** 2026-02-15T10:37:22.611866+00:00
**Mode:** github
**Run ID:** bd4fb3a19c0f

---

## PTA Contract Audit — Run bd4fb3a19c0f

### 1. System Snapshot

| Measure | Value |
|---------|-------|
| Files Analyzed | 382 |
| Files Seen (incl. skipped) | 382 |
| Files Skipped | 0 |
| Claims Extracted | 30 |
| Claims with Deterministic Evidence | 30 |
| Unknown Governance Categories | 9 |
| Verified Structural Categories | 0 |
| Partial Coverage | No |

### 2. Deterministic Coverage Index (DCI v1)

**Score:** 100.00%
**Formula:** `verified_claims / total_claims`

30 of 30 extracted claims contain hash-verified evidence.

This measures claim-to-evidence visibility only.
It does not measure code quality, security posture, or structural surface coverage.

### 3. Reporting Completeness Index (RCI)

**Score:** 58.67%
**Formula:** `average(claims_coverage, unknowns_coverage, howto_completeness)`

| Component | Score |
|-----------|-------|
| claims_coverage | 100.00% |
| unknowns_coverage | 0.00% |
| howto_completeness | 76.00% |

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

### Lantern's frontend is implemented using React, bundled via Vite, styled with Tailwind, and utilizes shadcn/ui and TypeScript.
Confidence: 95%
- Evidence: `LANTERN_SYSTEM_SNAPSHOT.md:36` (hash: `ecca1e04beb0`)
- Evidence: `vite.config.ts:2` (hash: `edf1f0b3b89a`)
- Evidence: `vite.config.ts:12` (hash: `dee512048913`)
- Evidence: `components.json:2-3` (hash: `4b0cdfbb4dae`)

### Lantern's backend consists of an Express server used primarily for serving static assets and providing API placeholders, but is not connected to data curation or extraction processes.
Confidence: 90%
- Evidence: `LANTERN_SYSTEM_SNAPSHOT.md:36` (hash: `ecca1e04beb0`)
- Evidence: `AUDIT_REPORT.md:42` (hash: `93b3b8789278`)
- Evidence: `package.json:60` (hash: `e049b398be36`)

### The main system of record for Lantern packs and dossiers is the browser's localStorage under the key 'lantern_packs'.
Confidence: 95%
- Evidence: `AUDIT_REPORT.md:56` (hash: `5fe83c25f922`)

### An optional PostgreSQL backend is scaffolded using Drizzle ORM, but is not active or used by default.
Confidence: 90%
- Evidence: `AUDIT_REPORT.md:53` (hash: `1c5505324396`)
- Evidence: `drizzle.config.ts:10` (hash: `d3b6ea7904ab`)

### All Lantern extraction and heuristic core logic is implemented in dependency-minimized, deterministic modules designed to be isolated from external state.
Confidence: 90%
- Evidence: `LANTERN_CORE_BOUNDARY.md:6-70` (hash: `a51078da972d`)

## Verified: Capability Map

### Lantern's entity extraction is accomplished using strictly rule-based, deterministic logic without predictive or machine learning capabilities.
Confidence: 90%
- Evidence: `M2_SUMMARY.md:34-43` (hash: `e3b0c44298fc`)
- Evidence: `LANTERN_CORE_BOUNDARY.md:37` (hash: `8e02c89b9e6f`)

### Heuristic analytical findings, such as influence hubs and funding flows, are computed only from curated data and are subject to explicit minimum data thresholds.
Confidence: 85%
- Evidence: `LANTERN_SYSTEM_SNAPSHOT.md:60-82` (hash: `bec8baa9fb0d`)

### Lantern allows export of all analytical artifacts as Markdown files with YAML frontmatter and appends a SHA-256 fingerprint for auditability.
Confidence: 95%
- Evidence: `LANTERN_SYSTEM_SNAPSHOT.md:36-38` (hash: `ecca1e04beb0`)
- Evidence: `LANTERN_SYSTEM_SNAPSHOT.md:111` (hash: `9df584a2e10b`)

### No auto-updating of analytical artifacts is performed after a report is generated.
Confidence: 90%
- Evidence: `LANTERN_SYSTEM_SNAPSHOT.md:119-122` (hash: `db15bf6205c2`)

### Lantern’s extraction and analysis do not make network calls; all processing is local by default.
Confidence: 85%
- Evidence: `AUDIT_REPORT.md:47` (hash: `10891d81e149`)

## Verified: Data & Security Posture

### There is no evidence of encryption for data at rest in browser localStorage.
Confidence: 80%
- Evidence: `AUDIT_REPORT.md:56-57` (hash: `5fe83c25f922`)

### Session and authentication-related dependencies (passport, express-session, connect-pg-simple) are present, but there is no evidence that they are actively wired to backend handlers.
Confidence: 85%
- Evidence: `package.json:55-72` (hash: `6441207d984d`)

### The /api/config endpoint's public_readonly flag controls whether the UI offers editing capabilities.
Confidence: 90%
- Evidence: `client/src/lib/config.tsx:26` (hash: `0b95083d9b32`)
- Evidence: `client/src/App.tsx:45,95` (hash: `55c37afb82ab`)

### There is no evidence of any telemetry or analytics or third-party tracking scripts being used in the system.
Confidence: 90%
- Evidence: `AUDIT_REPORT.md:49` (hash: `6ed62e009bcd`)

### SHA-256 hashing is used to generate fingerprints of dossiers and reports for integrity checking.
Confidence: 85%
- Evidence: `LANTERN_SYSTEM_SNAPSHOT.md:110` (hash: `cc567e2b0326`)

## Verified: How to Use

### Node.js (v16 or later, v20 recommended) and npm are required to run Lantern, as well as a modern browser for the UI.
Confidence: 90%
- Evidence: `README.md:26-27` (hash: `159847245e8b`)
- Evidence: `.github/workflows/ci.yml:20` (hash: `60c0823c9611`)

### Optional PostgreSQL usage is available but only needed for running migration commands, not standard operation.
Confidence: 85%
- Evidence: `drizzle.config.ts:3` (hash: `a19790628fbe`)
- Evidence: `.replit:1` (hash: `21d3b40c804c`)

## Verified: Identity of Target System

### Lantern is not an autonomous verdict-issuing, truth-predicting, or fact-generating system and does not provide recommendations, inferences, or forecasts.
Confidence: 90%
- Evidence: `LANTERN_SYSTEM_SNAPSHOT.md:15-20` (hash: `e3b0c44298fc`)

## Verified: Integration Surface

### The system provides the /api/config endpoint (returns `public_readonly`) and demo/testing endpoints for authentication, but there is no evidence for /api/report or /api/report/generate being implemented.
Confidence: 85%
- Evidence: `client/src/lib/config.tsx:19-26` (hash: `0e6c227658ca`)
- Evidence: `client/src/App.tsx:56-119` (hash: `0ffb5005c452`)

### All core extraction logic is implemented internally; there is no use of external SDKs in the extraction process.
Confidence: 90%
- Evidence: `LANTERN_CORE_BOUNDARY.md:8-23` (hash: `f77c913cb4a0`)

## Verified: Maintainability & Change Risk

### The extraction core is strictly modular, isolated, and designed to minimize dependencies, emphasizing maintainability and correctness.
Confidence: 90%
- Evidence: `LANTERN_CORE_BOUNDARY.md:4-105` (hash: `6421842ae9bc`)

### TypeScript's strict type checking (strict: true) is enforced for the codebase.
Confidence: 85%
- Evidence: `tsconfig.json:10` (hash: `bfaef2ee17bd`)

### Regression and unit testing for core extraction outputs is present and run for all pull requests.
Confidence: 85%
- Evidence: `BOOK_OF_FIXES.md:91-103` (hash: `5c4b0e685e44`)
- Evidence: `.github/workflows/ci.yml:27-31` (hash: `71ba8a769f6c`)

## Verified: Operational Reality

### Lantern runs fully client-side for main workflows; the server currently acts only as a static asset host.
Confidence: 85%
- Evidence: `AUDIT_REPORT.md:42` (hash: `93b3b8789278`)
- Evidence: `LANTERN_SYSTEM_SNAPSHOT.md:36` (hash: `ecca1e04beb0`)

### There is no Dockerfile or default containerization setup; a Replit profile provides the dev environment.
Confidence: 85%
- Evidence: `.replit:1-7` (hash: `21d3b40c804c`)

### No automated database migration or backup job is active unless PostgreSQL/Drizzle is enabled and runs manually.
Confidence: 85%
- Evidence: `AUDIT_REPORT.md:70` (hash: `7a6001b20895`)
- Evidence: `drizzle.config.ts:3` (hash: `a19790628fbe`)

### Data in browser localStorage is volatile; user data loss can occur if the browser cache or storage is cleared, and regular export is recommended.
Confidence: 90%
- Evidence: `AUDIT_REPORT.md:70` (hash: `7a6001b20895`)
- Evidence: `AUDIT_REPORT.md:56-57` (hash: `5fe83c25f922`)

## Verified: Purpose & Jobs-to-be-done

### Lantern's core purpose is to extract structured data (entities, quotes, metrics, events) from unstructured text with precise provenance offsets, enabling evidentiary reporting and curation.
Confidence: 90%
- Evidence: `LANTERN_SYSTEM_SNAPSHOT.md:50-60` (hash: `105044217e1c`)

## Verified: Running & Upgrades

### Development uses the command `npm run dev` to run both client and server with hot reload; production uses `npm run build` then `npm start`.
Confidence: 90%
- Evidence: `README.md:40` (hash: `21f1677c8f4f`)
- Evidence: `README.md:57-58` (hash: `16c0e4305ac2`)
- Evidence: `.replit:2` (hash: `96fa2e5505e4`)
- Evidence: `.replit:22-23` (hash: `857b4f2e0ed6`)

## Verified: Unknowns / Missing Evidence

### No direct evidence exists for the implementation and runtime enforcement of authenticated backend routes or crypto integrations.
Confidence: 80%
- Evidence: `LANTERN_SYSTEM_SNAPSHOT.md:11` (hash: `e3b0c44298fc`)
- Evidence: `AUDIT_REPORT.md:53` (hash: `1c5505324396`)

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
| deployment_topology | UNKNOWN | No matching infrastructure/config artifacts found in file index |
| runtime_iam | UNKNOWN | No matching infrastructure/config artifacts found in file index |
| logging_sink | UNKNOWN | No matching infrastructure/config artifacts found in file index |
| monitoring_alerting | UNKNOWN | No matching infrastructure/config artifacts found in file index |
| backup_retention | UNKNOWN | No matching infrastructure/config artifacts found in file index |
| data_residency | UNKNOWN | No matching infrastructure/config artifacts found in file index |

## Snippet Hashes (51 total)

- `00c61c5cacb3`
- `065a6a01dd6f`
- `06bf4af99102`
- `0b95083d9b32`
- `0dd0428ef4df`
- `0e36bc3f0879`
- `0e6c227658ca`
- `0ffb5005c452`
- `105044217e1c`
- `10891d81e149`
- `159847245e8b`
- `16c0e4305ac2`
- `1c5505324396`
- `21d3b40c804c`
- `21f1677c8f4f`
- `2cb616fc39c1`
- `3129632804d4`
- `3a2dc0ae21eb`
- `41222fc1af2f`
- `499a1a83dfb9`
- ... and 31 more
