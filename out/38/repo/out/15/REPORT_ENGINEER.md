# Program Totality Report — Engineer View

**EvidencePack Version:** 1.0
**Tool Version:** 0.1.0
**Generated:** 2026-02-15T08:35:55.591909+00:00
**Mode:** replit
**Run ID:** 59b1f62af835

---

## PTA Contract Audit — Run 59b1f62af835

### 1. System Snapshot

| Measure | Value |
|---------|-------|
| Files Analyzed | 163 |
| Files Seen (incl. skipped) | 189 |
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

**Score:** 62.67%
**Formula:** `average(claims_coverage, unknowns_coverage, howto_completeness)`

| Component | Score |
|-----------|-------|
| claims_coverage | 100.00% |
| unknowns_coverage | 0.00% |
| howto_completeness | 88.00% |

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

### PTA's frontend is built using React (Wouter router), Tailwind, and shadcn/ui.
Confidence: 100%
- Evidence: `replit.md:23–27` (hash: `1412db9c89fd`)

### PTA's backend uses Express 5 running on Node.js 20, with Drizzle ORM and a REST API.
Confidence: 100%
- Evidence: `replit.md:41` (hash: `500e08fb1b8f`)
- Evidence: `package.json:7` (hash: `fd240a9dc053`)

### PTA's database layer uses PostgreSQL 14+ with Drizzle migrations.
Confidence: 100%
- Evidence: `drizzle.config.ts:10` (hash: `d3b6ea7904ab`)

### The Analyzer CLI for PTA is implemented in Python 3.11+ with Typer CLI, spawned by the server.
Confidence: 100%
- Evidence: `.replit:1` (hash: `a5be1ce88381`)
- Evidence: `pyproject.toml:5` (hash: `aa7c5d87614c`)
- Evidence: `server/routes.ts:104` (hash: `8f3b4ad61f72`)

### PTA's client build uses Vite, and the server build uses esbuild.
Confidence: 100%
- Evidence: `script/build.ts:39,49–61` (hash: `e67e7d5a74de`)

## Verified: Capability Map

### Static artifact scan functionality is implemented using Node.js and a Python CLI (Typer), called via child process spawn.
Confidence: 100%
- Evidence: `server/routes.ts:95–167` (hash: `76ee812bf011`)

### PTA supports deterministic structural runbook extraction with operate.py and does not require LLMs.
Confidence: 100%
- Evidence: `replit.md:61–65` (hash: `1a8008a3425c`)

### The LLM-powered architecture is available via the OpenAI API, gated by an explicit API key.
Confidence: 100%
- Evidence: `server/replit_integrations/audio/client.ts:10–11` (hash: `05da5f1b1281`)

## Verified: Data & Security Posture

### All persistent project, analysis, and claim data is stored in PostgreSQL, accessed via DATABASE_URL.
Confidence: 100%
- Evidence: `server/db.ts:7,13` (hash: `a19790628fbe`)

### All secret values required by PTA must be provided through the `.env` file and include DATABASE_URL, AI_INTEGRATIONS_OPENAI_API_KEY, AI_INTEGRATIONS_OPENAI_BASE_URL, and API_KEY.
Confidence: 100%
- Evidence: `drizzle.config.ts:3` (hash: `a19790628fbe`)
- Evidence: `server/replit_integrations/audio/client.ts:10` (hash: `05da5f1b1281`)
- Evidence: `README.md:34` (hash: `700f48e26e0c`)

### PTA code only references secret environment variable names; secret values themselves are never committed to the repository.
Confidence: 100%
- Evidence: `drizzle.config.ts:3,12` (hash: `a19790628fbe`)
- Evidence: `server/replit_integrations/audio/client.ts:10–11` (hash: `05da5f1b1281`)

### There is no direct evidence of disk-level encryption or PostgreSQL SSL configuration; PTA relies on the external database security posture.
Confidence: 80%
- Evidence: `drizzle.config.ts:10–13` (hash: `d3b6ea7904ab`)

## Verified: How to Use the Target System (Operator Manual)

### PTA requires Node.js 20+, Python 3.11+, and PostgreSQL 14+ as installation prerequisites.
Confidence: 100%
- Evidence: `.replit:1` (hash: `a5be1ce88381`)
- Evidence: `pyproject.toml:5` (hash: `aa7c5d87614c`)
- Evidence: `drizzle.config.ts:10` (hash: `d3b6ea7904ab`)

### To set up the database schema, PTA relies on the `npm run db:push` command, which applies Drizzle migrations.
Confidence: 100%
- Evidence: `package.json:11` (hash: `3a8be55004c2`)

### The development server starts with `npm run dev` for hot reload and monorepo operation.
Confidence: 100%
- Evidence: `.replit:2` (hash: `96fa2e5505e4`)

### For production deployment, PTA provides `npm run build` to build assets and `npm run start` to run the production server.
Confidence: 100%
- Evidence: `package.json:8,9` (hash: `79d8bdf275d6`)

## Verified: Identity of Target System

### The Program Totality Analyzer (PTA) is a full-stack static analysis platform implemented as a Node.js/Express/PostgreSQL/Drizzle/React monorepo, with a Python CLI for analysis.
Confidence: 100%
- Evidence: `README.md:3` (hash: `736d20de7995`)
- Evidence: `README.md:9` (hash: `f501ae412cdb`)
- Evidence: `README.md:60–61` (hash: `30995d62ae80`)
- Evidence: `replit.md:4,11–17` (hash: `e3b0c44298fc`)

### PTA is not a runtime security scanner or correctness verifier and does not observe or enforce at runtime.
Confidence: 100%
- Evidence: `README.md:5–6` (hash: `ece9dc51808b`)

### PTA relies on PostgreSQL for state and is not a database or storage engine itself.
Confidence: 100%
- Evidence: `drizzle.config.ts:10` (hash: `d3b6ea7904ab`)

## Verified: Integration Surface

### PTA's public integration surface is a REST API, including endpoints such as /api/health, /api/ready, /api/projects, and /api/projects/:id.
Confidence: 100%
- Evidence: `server/routes.ts:15–93` (hash: `ccd87d48a478`)

### API authentication for select endpoints requires an API_KEY header (x-api-key), as enforced in routes/middleware.
Confidence: 100%
- Evidence: `server/replit_integrations/audio/client.ts:10` (hash: `05da5f1b1281`)
- Evidence: `docs/dossiers/lantern_program_totality_dossier.md:151` (hash: `ab249b766ec2`)

### PTA supports integration with the OpenAI API, configured via explicit API key and base URL in the environment.
Confidence: 100%
- Evidence: `server/replit_integrations/audio/client.ts:10–11` (hash: `05da5f1b1281`)

## Verified: Maintainability & Change Risk

### PTA uses a monorepo setup with the shared/ directory enforcing consistent schemas and types across the stack.
Confidence: 100%
- Evidence: `replit.md:15–17` (hash: `540156e0c495`)

## Verified: Purpose & Jobs-to-be-done

### PTA rapidly generates technical dossiers (DOSSIER.md, claims.json, coverage.json) for a software target using only artifacts.
Confidence: 100%
- Evidence: `README.md:3,9,13–17` (hash: `736d20de7995`)
- Evidence: `README.md:90` (hash: `6c1c3108324a`)

### PTA extracts and structurally evidences system run commands, secrets, integration points, and operational risks.
Confidence: 100%
- Evidence: `README.md:13,65–73` (hash: `867ffae0803d`)

### PTA can optionally perform semantic (LLM-powered) analysis if configured.
Confidence: 100%
- Evidence: `README.md:75–80` (hash: `e3b0c44298fc`)
- Evidence: `server/replit_integrations/audio/client.ts:10` (hash: `05da5f1b1281`)

### PTA outputs operator manuals (how to run, verify, debug) with cited evidence.
Confidence: 100%
- Evidence: `README.md:13` (hash: `867ffae0803d`)
- Evidence: `README.md:141–150` (hash: `66876a3b303e`)

## Verified: Replit Execution Profile

### In Replit and default deployments, PTA binds to port 5000 (configurable via PORT) and listens on 0.0.0.0.
Confidence: 100%
- Evidence: `.replit:10,14` (hash: `47abfb4488e8`)
- Evidence: `server/index.ts:92,96` (hash: `75d345a78f84`)

### PTA's backend runs on Node.js (with implied TypeScript transpile via tsx) and PostgreSQL.
Confidence: 100%
- Evidence: `.replit:1` (hash: `a5be1ce88381`)
- Evidence: `package.json:7` (hash: `fd240a9dc053`)

### PTA lists Nix packages libxcrypt and python312Packages.pytest_7 for platform support in Replit-native execution.
Confidence: 100%
- Evidence: `.replit:7` (hash: `4d7fb33a174b`)

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

## Snippet Hashes (36 total)

- `020435ddf436`
- `05da5f1b1281`
- `1412db9c89fd`
- `1a8008a3425c`
- `1f70e6a77d42`
- `2cb616fc39c1`
- `30995d62ae80`
- `3a8be55004c2`
- `47abfb4488e8`
- `4994405dd75c`
- `4d7fb33a174b`
- `500e08fb1b8f`
- `540156e0c495`
- `66876a3b303e`
- `6c1c3108324a`
- `700f48e26e0c`
- `736d20de7995`
- `75d345a78f84`
- `76ee812bf011`
- `79d8bdf275d6`
- ... and 16 more
