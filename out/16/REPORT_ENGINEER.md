# Program Totality Report — Engineer View

**EvidencePack Version:** 1.0
**Tool Version:** 0.1.0
**Generated:** 2026-02-15T08:38:56.804169+00:00
**Mode:** github
**Run ID:** 845f4708ae19

---

## PTA Contract Audit — Run 845f4708ae19

### 1. System Snapshot

| Measure | Value |
|---------|-------|
| Files Analyzed | 229 |
| Files Seen (incl. skipped) | 229 |
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

## Verified: Access/Control/UI

### Private API endpoints are protected with an API key provided in the `x-api-key` header.
Confidence: 100%
- Evidence: `SECURITY.md:15-35` (hash: `37c573459866`)
- Evidence: `README.md:33-35` (hash: `f91edca1f756`)

### Per-IP and in-memory rate limiting is enforced: public (100/min, 10/sec), private (50/min, 5/sec); limits reset on restart.
Confidence: 100%
- Evidence: `SECURITY.md:27-29` (hash: `5a910933cb8e`)
- Evidence: `SECURITY.md:63` (hash: `65adef960db9`)

### HALO-RECEIPTS features an operator UI for receipt verification, audit governance, banner state management, and receipt comparison.
Confidence: 100%
- Evidence: `client/src/App.tsx:8,49` (hash: `2424fdc75e7f`)
- Evidence: `client/src/components/app-sidebar.tsx` (hash: `2b06a59b93bc`)

## Verified: Architecture Snapshot

### HALO-RECEIPTS is implemented as a fullstack monolith with a Node.js backend using Express.js, PostgreSQL as the database, and a React/Tailwind client.
Confidence: 100%
- Evidence: `README.md:59-61` (hash: `78ea33acf1a7`)
- Evidence: `package.json:56,60,66` (hash: `e049b398be36`)
- Evidence: `drizzle.config.ts:10` (hash: `d3b6ea7904ab`)
- Evidence: `tailwind.config.ts:5` (hash: `27074cf34f55`)

### Node.js 20+ is required for running HALO-RECEIPTS.
Confidence: 100%
- Evidence: `README.md:23` (hash: `def6eeff4ef7`)
- Evidence: `package.json:7` (hash: `fd240a9dc053`)
- Evidence: `.replit:1` (hash: `21d3b40c804c`)
- Evidence: `replit.nix:3` (hash: `b6d70b4bbe78`)

### Persistent application state is stored exclusively in PostgreSQL version 14 or above.
Confidence: 100%
- Evidence: `README.md:24` (hash: `953d061df568`)
- Evidence: `drizzle.config.ts:10` (hash: `d3b6ea7904ab`)
- Evidence: `.env.example:5` (hash: `aeaa5d08ab01`)
- Evidence: `.replit:1` (hash: `21d3b40c804c`)

### The project uses Drizzle ORM for schema management, migrations, and type safety.
Confidence: 100%
- Evidence: `drizzle.config.ts:1-14` (hash: `1f5c93c3d974`)
- Evidence: `package.json:53,54` (hash: `c65672bd1705`)

### Express.js is used for REST API endpoints, and Zod is used for API input validation.
Confidence: 100%
- Evidence: `package.json:56,80` (hash: `e049b398be36`)

### The UI is built with React, shadcn/ui, Tailwind CSS, and Wouter for routing.
Confidence: 100%
- Evidence: `package.json:66,59,71,78` (hash: `bd12df8fa4a7`)
- Evidence: `client/src/App.tsx:43` (hash: `89a61ecabb0a`)
- Evidence: `client/src/components/app-sidebar.tsx` (hash: `2b06a59b93bc`)

### All cryptographic verification (hash/signature) is implemented in Node.js using the built-in crypto module, with no browser-based validation.
Confidence: 100%
- Evidence: `README.md:63` (hash: `2fe302f52dae`)

### Default HTTP port for HALO-RECEIPTS is 5000.
Confidence: 100%
- Evidence: `README.md:47` (hash: `a07ec05533ad`)
- Evidence: `.env.example:14` (hash: `d1fd3ffd349f`)
- Evidence: `.replit:10,14` (hash: `47abfb4488e8`)
- Evidence: `STATE.md:12` (hash: `b47d81a8906e`)

## Verified: Capability Map

### Receipts and audit chains use SHA-256 for hashes and Ed25519 for signatures.
Confidence: 100%
- Evidence: `README.md:73` (hash: `afc1b335ae60`)
- Evidence: `STATE.md:17-18` (hash: `4e7c26bc17e2`)
- Evidence: `STATE.md:59` (hash: `021fb596db81`)

### Receipts use a canonical JSON structure (c14n-v1) and support chain continuity, kill switch, and immutable locking.
Confidence: 100%
- Evidence: `README.md:74-76` (hash: `4fbb6124742c`)
- Evidence: `STATE.md:20-22` (hash: `e2626a9e3962`)

### Audit logging uses an append-only, hash-chained event log with both partial and strict verification endpoints, and provides tamper-evidence.
Confidence: 100%
- Evidence: `STATE.md:25,56-73,91-92,163-176` (hash: `df297c047824`)

### LLM integration is used for transcript observation and tri-sensor analysis; it does not perform content moderation or 'truth' judgment.
Confidence: 100%
- Evidence: `replit.md:17-21` (hash: `698e2c7b1753`)
- Evidence: `STATE.md:140` (hash: `73456045c53d`)
- Evidence: `STATE.md:85-90` (hash: `0bd6ff48312a`)
- Evidence: `STATE.md:80-81` (hash: `d970abf3af89`)
- Evidence: `STATE.md:23` (hash: `e3b0c44298fc`)

### Forensic export packs can be created and verified using CLI scripts, and support offline verification and key rotation.
Confidence: 100%
- Evidence: `STATE.md:122-126` (hash: `b7070daf5698`)
- Evidence: `scripts/export_forensic_pack.ts:1` (hash: `6b1a96c08114`)
- Evidence: `scripts/verify_forensic_pack.ts:1` (hash: `5fb7a929bdd5`)
- Evidence: `scripts/ci-forensic-gate.sh:42,52` (hash: `d37376e1a8f9`)
- Evidence: `replit.md:41,43` (hash: `e47a41da9290`)

## Verified: Identity of Target System

### HALO-RECEIPTS is a Node.js-based forensic verification system for AI conversation transcripts.
Confidence: 100%
- Evidence: `README.md:1-9` (hash: `07dc5b73acd7`)
- Evidence: `replit.md:1-4` (hash: `3aa23edfc5d9`)
- Evidence: `package.json:2` (hash: `a1f1a980b4b8`)

### HALO-RECEIPTS provides cryptographic verification, timestamped and chained receipts, immutable storage, kill switch, audit trail, and forensic export for AI conversation transcripts.
Confidence: 100%
- Evidence: `README.md:3,9` (hash: `b75c1d3a5898`)
- Evidence: `README.md:59-63` (hash: `78ea33acf1a7`)
- Evidence: `README.md:71-79` (hash: `5957f86fba0f`)
- Evidence: `replit.md:4,9-41` (hash: `99c104ed635e`)

### HALO-RECEIPTS is not a database management system (DBMS) and only uses PostgreSQL for persistent storage.
Confidence: 100%
- Evidence: `README.md:24,61` (hash: `953d061df568`)
- Evidence: `drizzle.config.ts:10` (hash: `d3b6ea7904ab`)

## Verified: Integration Surface

### Public verification endpoint is available and does not require authentication.
Confidence: 100%
- Evidence: `README.md:71-79` (hash: `5957f86fba0f`)
- Evidence: `STATE.md:37,101` (hash: `015fbc3afc30`)

### All endpoints use JSON as data format, both for input and output.
Confidence: 100%
- Evidence: `SECURITY.md:21` (hash: `ddcb39e871d7`)
- Evidence: `STATE.md:36-46` (hash: `e3b0c44298fc`)

### Forensic export packs are in JSON format encompassing events, checkpoints, and a manifest.
Confidence: 100%
- Evidence: `STATE.md:125,126` (hash: `58700e777542`)

## Verified: Operational Reality

### For production, HALO-RECEIPTS must be run behind a TLS-terminating reverse proxy.
Confidence: 100%
- Evidence: `SECURITY.md:54,81` (hash: `07d374b5bf1c`)

### Rate limiting and operational metrics are in-memory and not cluster-safe; they reset on restart.
Confidence: 100%
- Evidence: `STATE.md:184` (hash: `39bc391ed092`)

### All operational secrets and credentials must be provided solely via environment variables (not hardcoded).
Confidence: 100%
- Evidence: `.env.example:10,23` (hash: `eebb9b859fec`)
- Evidence: `README.md:34` (hash: `0af0ca748c51`)

## Verified: Security Posture

### SHA-256 is used for all hashes and Ed25519 for all digital signatures in receipts and audit chains.
Confidence: 100%
- Evidence: `README.md:73` (hash: `afc1b335ae60`)
- Evidence: `STATE.md:17-18` (hash: `4e7c26bc17e2`)
- Evidence: `STATE.md:115-120` (hash: `4972ee0b6342`)

### The API key (`API_KEY` env var) is required for accessing private endpoints and is never logged.
Confidence: 100%
- Evidence: `SECURITY.md:15` (hash: `37c573459866`)
- Evidence: `.env.example:10` (hash: `eebb9b859fec`)
- Evidence: `SECURITY.md:17` (hash: `eab7a271aea5`)

### Session data is secured and hashed/signed using the `SESSION_SECRET` value from the environment.
Confidence: 100%
- Evidence: `SECURITY.md:71` (hash: `be27b812c304`)
- Evidence: `.env.example:23` (hash: `f7e2d4342e03`)

### Secure HTTP headers such as X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and Permissions-Policy are enforced to enhance security.
Confidence: 100%
- Evidence: `SECURITY.md:32-36` (hash: `9902d509ea6f`)

### LLM sensor components cannot access system or verification data; there is explicit protection against capability escalation.
Confidence: 100%
- Evidence: `SECURITY.md:39-41` (hash: `cd49493901b7`)
- Evidence: `STATE.md:90,161` (hash: `8cd14caa7c5f`)

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

## Snippet Hashes (76 total)

- `015fbc3afc30`
- `021fb596db81`
- `0794f4df286f`
- `07d374b5bf1c`
- `07dc5b73acd7`
- `0af0ca748c51`
- `0bd6ff48312a`
- `0ebfefe42fb5`
- `1f5c93c3d974`
- `21d3b40c804c`
- `21f1677c8f4f`
- `2424fdc75e7f`
- `27074cf34f55`
- `290051cb4627`
- `2b06a59b93bc`
- `2fe302f52dae`
- `37c573459866`
- `37e5ee1c04fb`
- `39bc391ed092`
- `3a2dc0ae21eb`
- ... and 56 more
