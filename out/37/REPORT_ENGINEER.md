# Program Totality Report — Engineer View

**EvidencePack Version:** 1.0
**Tool Version:** 0.1.0
**Generated:** 2026-02-15T10:42:46.272917+00:00
**Mode:** github
**Run ID:** f0e439f9c55e

---

## PTA Contract Audit — Run f0e439f9c55e

### 1. System Snapshot

| Measure | Value |
|---------|-------|
| Files Analyzed | 229 |
| Files Seen (incl. skipped) | 229 |
| Files Skipped | 0 |
| Claims Extracted | 30 |
| Claims with Deterministic Evidence | 29 |
| Unknown Governance Categories | 9 |
| Verified Structural Categories | 0 |
| Partial Coverage | No |

### 2. Deterministic Coverage Index (DCI v1)

**Score:** 96.67%
**Formula:** `verified_claims / total_claims`

29 of 30 extracted claims contain hash-verified evidence.

This measures claim-to-evidence visibility only.
It does not measure code quality, security posture, or structural surface coverage.

### 3. Reporting Completeness Index (RCI)

**Score:** 58.56%
**Formula:** `average(claims_coverage, unknowns_coverage, howto_completeness)`

| Component | Score |
|-----------|-------|
| claims_coverage | 96.67% |
| unknowns_coverage | 0.00% |
| howto_completeness | 79.00% |

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

### The system provides stable REST endpoints for health, readiness, audit verification, metrics, proofpacks, and follow-up actions.
Confidence: 100%
- Evidence: `docs/API_CONTRACTS.md:9–79` (hash: `5004e544db17`)
- Evidence: `replit.md:26–29` (hash: `8ef971eba2d9`)

### All non-public endpoints require authentication using the x-api-key header.
Confidence: 100%
- Evidence: `SECURITY.md:15–16` (hash: `37c573459866`)
- Evidence: `.env.example:10` (hash: `eebb9b859fec`)

### API input/output is always canonicalized JSON with strict schema validation (Zod).
Confidence: 100%
- Evidence: `SECURITY.md:20–21` (hash: `e321911e01d3`)
- Evidence: `replit.md:13` (hash: `2611b7b073a6`)

### No webhook or SDK integration endpoints are exposed; system is REST API only.
Confidence: 90%
- Evidence: `replit.md:26–29` (hash: `8ef971eba2d9`)

## Verified: Architecture Snapshot

### HALO-RECEIPTS uses a tiered monorepo architecture with a React/TypeScript client, Express.js (Node.js) backend, and PostgreSQL (via drizzle-orm).
Confidence: 100%
- Evidence: `README.md:59–61` (hash: `78ea33acf1a7`)
- Evidence: `drizzle.config.ts:8–9` (hash: `b8806770f21b`)
- Evidence: `tailwind.config.ts:5` (hash: `27074cf34f55`)

### The backend requires Node.js 20+ and uses Express.js, Drizzle ORM, and Zod validation.
Confidence: 100%
- Evidence: `README.md:60–62` (hash: `839b6cdd1e76`)
- Evidence: `package.json:13–81` (hash: `f7eebadd079d`)

### The frontend uses React, TypeScript, and Tailwind CSS.
Confidence: 100%
- Evidence: `README.md:59` (hash: `78ea33acf1a7`)
- Evidence: `tailwind.config.ts:1–107` (hash: `31d5ee63d324`)

### Persistence is provided by PostgreSQL database, with schema managed via drizzle-kit and defined in ./shared/schema.ts.
Confidence: 100%
- Evidence: `README.md:61` (hash: `7daa75cbdffb`)
- Evidence: `drizzle.config.ts:8–9` (hash: `b8806770f21b`)

### Build and toolchain components include tsx, drizzle-kit, TypeScript, and Vite for the client.
Confidence: 100%
- Evidence: `package.json:102–106` (hash: `88c4a316a07a`)
- Evidence: `vite.config.ts:1–40` (hash: `96baf42b9597`)

### Authentication on the backend is via an API_KEY passed in the x-api-key HTTP header.
Confidence: 100%
- Evidence: `SECURITY.md:15–16` (hash: `37c573459866`)
- Evidence: `.env.example:10` (hash: `eebb9b859fec`)

## Verified: Cryptography

### SHA-256 is used for chaining receipt hashes and Ed25519 is used for cryptographic signatures on checkpoints.
Confidence: 100%
- Evidence: `README.md:73–75` (hash: `afc1b335ae60`)
- Evidence: `replit.md:12,36` (hash: `abec2a9b4812`)

### Checkpoint anchor backends support LogOnly, S3Worm, and RFC3161 TSA, and can be used in multi-anchor configurations.
Confidence: 100%
- Evidence: `replit.md:45` (hash: `d9991dc12248`)
- Evidence: `.env.example:29` (hash: `30ec0e3c6118`)

## Verified: Dependencies

### Major backend dependencies include drizzle-orm, express, pg, zod, and drizzle-kit.
Confidence: 100%
- Evidence: `package.json:13–81` (hash: `f7eebadd079d`)

### Major frontend dependencies include react, react-dom, tailwindcss, vite, and zod.
Confidence: 100%
- Evidence: `package.json:13–81` (hash: `f7eebadd079d`)
- Evidence: `tailwind.config.ts:1–107` (hash: `31d5ee63d324`)

## Verified: Deployment Style

### HALO-RECEIPTS can be deployed locally or on Replit, with the Replit profile defining module dependencies and port mapping.
Confidence: 100%
- Evidence: `README.md:15–18` (hash: `b85acfde6149`)
- Evidence: `.replit:1–14` (hash: `21d3b40c804c`)

## Verified: Purpose & Jobs-to-be-done

### HALO-RECEIPTS provides cryptographically verifiable, forensic audit chains for AI-generated conversation transcripts, supporting export and independent offline verification.
Confidence: 100%
- Evidence: `README.md:73–82` (hash: `afc1b335ae60`)
- Evidence: `STATE.md:16–80` (hash: `9181a8f50959`)

## Verified: Runtime

### The minimum runtime requirement includes Node.js 20+, npm, and PostgreSQL 14+.
Confidence: 100%
- Evidence: `README.md:23–24` (hash: `def6eeff4ef7`)
- Evidence: `replit.nix:3–6` (hash: `b6d70b4bbe78`)

## Verified: Security Posture

### API_KEY and SESSION_SECRET must be cryptographically strong random strings in production and are provided via environment variables only.
Confidence: 100%
- Evidence: `SECURITY.md:84` (hash: `8e1b3dfc0333`)
- Evidence: `.env.example:10,23` (hash: `eebb9b859fec`)

### API secrets (API_KEY, SESSION_SECRET, DB URI) are designed never to be logged or exported by the system.
Confidence: 100%
- Evidence: `SECURITY.md:90` (hash: `7fa6c762902c`)

### All request bodies are strictly validated using Zod schemas, and no other content types except application/json are accepted for POST/PUT requests.
Confidence: 100%
- Evidence: `SECURITY.md:20–23` (hash: `e321911e01d3`)

### Per-IP, per-endpoint rate limiting is enforced in-memory, and responses include X-RateLimit-* headers.
Confidence: 100%
- Evidence: `SECURITY.md:25–28` (hash: `825bd4f610cb`)

### No built-in TLS; the system must be run behind a TLS-terminating reverse proxy such as nginx.
Confidence: 100%
- Evidence: `SECURITY.md:81` (hash: `58799d2389af`)

### Audit events, receipts, and checkpoints are stored in an immutable manner in PostgreSQL; modifying verified receipts is not supported.
Confidence: 100%
- Evidence: `STATE.md:21` (hash: `ae2e628ba10a`)
- Evidence: `README.md:75` (hash: `a88c861003a5`)

### Forensic verification of transcript receipts is performed via cryptographic chaining (SHA-256) and Ed25519 signature checkpoints.
Confidence: 100%
- Evidence: `README.md:73–75` (hash: `afc1b335ae60`)
- Evidence: `replit.md:12,18` (hash: `abec2a9b4812`)

### Session user state and session hashing for security auditing require the SESSION_SECRET environment variable.
Confidence: 100%
- Evidence: `.env.example:23` (hash: `f7e2d4342e03`)
- Evidence: `SECURITY.md:71–74` (hash: `be27b812c304`)

### Secrets (API_KEY, SESSION_SECRET, DB URI) are supplied exclusively by environment variables, not files or code.
Confidence: 100%
- Evidence: `SECURITY.md:17` (hash: `eab7a271aea5`)
- Evidence: `.env.example:1–29` (hash: `ecb0d89f8d97`)

### All import/export of receipts uses canonical JSON formats with strict rules to prevent audit chain ambiguity.
Confidence: 100%
- Evidence: `STATE.md:26` (hash: `d452aa80bd84`)
- Evidence: `replit.md:13` (hash: `2611b7b073a6`)

### No built-in network-level (TLS) security is provided, nor protection against a fully-privileged DBA.
Confidence: 100%
- Evidence: `SECURITY.md:44–51` (hash: `e3b0c44298fc`)

### In-memory rate limiting is used, but no distributed or persistent mechanism exists for rate limiting across multiple instances.
Confidence: 100%
- Evidence: `SECURITY.md:62–63` (hash: `6dc41df01d56`)
- Evidence: `STATE.md:184–185` (hash: `39bc391ed092`)

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

## Snippet Hashes (56 total)

- `21d3b40c804c`
- `21f1677c8f4f`
- `2611b7b073a6`
- `27074cf34f55`
- `290051cb4627`
- `30ec0e3c6118`
- `31d5ee63d324`
- `333069fdf796`
- `37c573459866`
- `39bc391ed092`
- `3a2dc0ae21eb`
- `5004e544db17`
- `505962fedbe9`
- `520a3db1dbde`
- `58799d2389af`
- `642899eba5a4`
- `66f70c1ce5e6`
- `684fad525f34`
- `6dc41df01d56`
- `78ea33acf1a7`
- ... and 36 more
