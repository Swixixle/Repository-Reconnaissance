# DOSSIER: **HALO-RECEIPTS — AI Conversation Transcript Forensic Verification System**

---

## 1. Identity of Target System

**What is it?**

- **HALO-RECEIPTS** is a Node.js-based forensic verification system for AI conversation transcripts (README.md:1-9, replit.md:1-4, package.json:2) — VERIFIED
- Provides cryptographic verification, timestamped and chained receipts, immutable storage, kill switch, audit trail, and forensic export for AI conversation transcripts (README.md:3,9,59-63,71-79, replit.md:4,9-41) — VERIFIED

**What is it NOT?**

- Not a real-time content moderation or truth judgment platform (docs/NON_GOALS.md referenced in replit.md:55, README.md:9, STATE.md:193) — INFERRED
- Not built for bulk, high-throughput stream ingestion or multi-tenant environments (INFERRED — no horizontal scaling or sharding mentioned)
- Not a DBMS, only uses PostgreSQL for data storage (README.md:24,61; drizzle.config.ts:10) — VERIFIED
- Not a general-purpose AI observability, nor an immutable DB, nor a generic governance platform (replit.md:56) — VERIFIED

---

## 2. Purpose & Jobs-to-be-done

- **Primary Purpose:** To ensure tamper-evident forensic proof for AI conversation transcripts, enabling cryptographic verification, immutable storage, and actionable forensic/audit capabilities for trust, regulatory, and research use cases (README.md:3,9; replit.md:4,12-23,29,36-38,52) — VERIFIED
- **Jobs-to-be-done:**
    - Verifying and locking receipt hashes and signatures for transcript events
    - Chaining, timestamping, and auditing forensic events
    - Providing operator-manageable kill switch controls (irreversible disabling of interpretation per receipt)
    - Supporting tri-sensor LLM analysis & export of forensic packs for third-party, offline or regulatory audit
    - Delivery of a UI for operators to explore, verify, compare, and export receipts (README.md:9,71-79,140-147; replit.md:17-23,25,31,38,49) — VERIFIED

---

## 3. Capability Map

**Forensic & Cryptographic:**
- SHA-256 hash & Ed25519 signature verification of receipts & audit chains (README.md:73, STATE.md:17-18,115, STATE.md:59) — VERIFIED
- Canonical (c14n-v1) JSON structure/hashing, chain continuity, kill switch, immutable locking (README.md:74-76, STATE.md:20-22) — VERIFIED

**Audit:**
- Append-only, hash-chained event log with verification endpoint, partial/strict verification, and tamper evidence (STATE.md:25,56-73,91-92,163-176) — VERIFIED

**Analysis:**
- LLM integration for transcript observation (paraphrase, ambiguity, but not truth), tri-sensor architecture, forensic detectors for risk/PII, research dataset export (replit.md:17-21, STATE.md:140,85-90,80-81,23,140) — VERIFIED

**Access/Control/UI:**
- API key-secured endpoints, per-IP rate limiting, session secret management, permissions boundaries (SECURITY.md:15-35, README.md:33-35) — VERIFIED
- Operator UI with receipt verification, banner state, audit governance, receipt comparison (README.md:140-147; client/src/App.tsx:8,49; client/src/components/app-sidebar.tsx) — VERIFIED

**Export / Forensics:**
- Tamper-evident forensic export packs, offline verification scripts, and key rotation/anchor chain support (STATE.md:122-126, 115-121; scripts/export_forensic_pack.ts, scripts/verify_forensic_pack.ts referenced in HOWTO, scripts/ci-forensic-gate.sh, replit.md:41,43) — VERIFIED

---

## 4. Architecture Snapshot

- **Type:** Fullstack monolith (Node.js backend w/ Express.js, PostgreSQL DB, React/Tailwind client) (README.md:59-61; package.json:56,60,66; drizzle.config.ts:10; tailwind.config.ts:5) — VERIFIED
- **Key Components:**
    - Node.js 20+ app, built with TypeScript (README.md:23, package.json:7)
    - PostgreSQL (>=14) used for all persistent storage (README.md:24, drizzle.config.ts:10)
    - Drizzle ORM for schema, migration, type safety (drizzle.config.ts:1-14, package.json:53,54)
    - Express.js for REST APIs, with Zod validation (package.json:56,80; STATE.md:95)
    - UI built with React, shadcn/ui, Tailwind CSS, Wouter router (package.json:66,59,71,78; client/src/App.tsx:43, client/src/components/app-sidebar.tsx)
    - All cryptographic functions in Node.js crypto, no browser-based signature or hash validation (README.md:63, STATE.md:59)
    - GitHub integration (optional; uses REPLIT_CONNECTORS_HOSTNAME, etc.) (README.md:70, .env.example:27-29) — VERIFIED

- **Port/Exposure:**
    - Default listen: HTTP port 5000 (README.md:47, .env.example:14, .replit:10,14, .replit:40, STATE.md:12) — VERIFIED

- **Replit Execution Profile:**  
    - Primary run: `npm run dev` for local dev (.replit:2,37-39)
    - Build (`npm run build`) and production run via `node ./dist/index.cjs` for deployments (.replit:18-19)
    - PostgreSQL service enabled (`modules = ["nodejs-20", "web", "postgresql-16"]`) (.replit:1) — VERIFIED

---

## 5. How to Use the Target System

### **A. Prerequisites**

1. **Install:**
    - Node.js (version 20+) — REQUIRED  
    - PostgreSQL (version 14+) — REQUIRED  
    - npm or yarn (any recent version) — REQUIRED  
    - Drizzle ORM and tsx — installed via npm install  
    - Unix tools: curl, python3, jq, unzip for CI/ops scripts — RECOMMENDED  
    - Git for clone/update; Replit for fast onboarding OPTIONAL (README.md:23-25, HOWTO.prereqs) — VERIFIED

2. **Ensure PostgreSQL is running and accessible.**

### **B. Installation**

1. Clone repo, open directory.
2. Install NPM dependencies:
    - `npm install` (README.md:29) — VERIFIED
3. Copy example config:  
    - `cp .env.example .env`
4. Edit `.env`:
    - Set `DATABASE_URL` to a real PostgreSQL connection string  
    - Set `API_KEY` to your secret key (default for dev: dev-test-key-12345)
    - Set a strong `SESSION_SECRET`
    - Adjust other config as needed (.env.example:5,10,23,13,14,18) — VERIFIED

5. Set up DB schema:
    - `npm run db:push` to initialize tables (README.md:39) — VERIFIED

### **C. Development Run**

1. Start dev server with:
    - `npm run dev`  
      — launches web UI/REST API at [http://localhost:5000](http://localhost:5000) (README.md:44,47, .env.example:14, STATE.md:12) — VERIFIED

### **D. Production Run**

1. Build:
    - `npm run build`
2. Launch server:
    - `npm run start` (README.md:52-53) — VERIFIED

### **E. Usage Examples**

**All API requests (private endpoints) require the `x-api-key` header.**
- List Receipts:  
  `curl -H 'x-api-key: <API_KEY>' http://localhost:5000/api/receipts` (docs/API_CONTRACTS.md:84-92)

- Audit Chain Verify:  
  `curl -H 'x-api-key: <API_KEY>' http://localhost:5000/api/audit/verify` (docs/API_CONTRACTS.md:64-73)

- Public Verify (no auth):  
  `curl -X POST http://localhost:5000/api/public/verify -d @receipt.json` (docs/API_CONTRACTS.md:174-182)

- Health Check:  
  `curl http://localhost:5000/api/health` (docs/API_CONTRACTS.md:9-19)

- Export/Verify Forensic Pack:  
  `npx tsx scripts/export_forensic_pack.ts --output /tmp/pack.json && npx tsx scripts/verify_forensic_pack.ts /tmp/pack.json` (scripts/ci-forensic-gate.sh:42,52)

### **F. Verification/Test**

- Run all tests/E2E suite:  
  `npx vitest run --config vitest.config.ts` (STATE.md:212)
- Check liveness:  
  `curl http://localhost:5000/api/health && curl http://localhost:5000/api/ready` (STATE.md:204-205)

---

### **Common Failure Scenarios & Remediation**

- **API 503 / readiness fails:** PostgreSQL not running, or `DATABASE_URL` is wrong — Start DB, check/update URL (.env.example:5, SECURITY.md:82)
- **401/403 Denied:** API_KEY missing/incorrect — Ensure header and .env agree (SECURITY.md:72)
- **Receipt cannot be locked/interpreted:** It's not verified or is kill-switched/locked — Must first verify receipt; locked/kill-switched receipts cannot be interpreted (SECURITY.md:143,168,133)
- **Audit verify BROKEN:** Audit trail tampered; investigate and restore original DB (STATE.md:209)
- **429 Rate Limit:** Too many requests — Wait, retry, check SECURITY.md:27-29

---

## 6. Integration Surface

- **RESTful API endpoints**
    - `/api/receipts`, `/api/audit/verify`, `/api/public/verify`, `/api/health`, `/api/ready`, `/api/health/metrics`, `/api/proofpack/:receiptId`, `/api/lantern/*` (docs/API_CONTRACTS.md [index], STATE.md:36-76) — VERIFIED
    - Auth via `x-api-key` for private endpoints (SECURITY.md:15)
    - Public verification is available (no auth required) (README.md:71-79, STATE.md:37,101)
- **Webhooks/SDKs:**  
    - UNKNOWN — evidence needed: no explicit webhook/SDK interface found.
- **Data Formats:**
    - JSON across all endpoints (SECURITY.md:21, STATE.md:36-46)
    - Forensic export packs: JSON structure with events, checkpoints, version, and manifest (STATE.md:125, docs/FORENSIC_EXPORT_PACK.md referenced in STATE.md:126)
- **Scripts:**
    - TypeScript and shell CLI scripts for export and verification (scripts/export_forensic_pack.ts, scripts/verify_forensic_pack.ts, scripts/ci-forensic-gate.sh)
- **Optional GitHub integration (if connectors configured):**
    - Environment variables for host/ID/renewal (README.md:70, .env.example:27-29)

---

## 7. Data & Security Posture

**Storage:**
- All persistent state in PostgreSQL (README.md:24, drizzle.config.ts:10)
- Forensic event log (audit chain) and receipts chain structure; implementation uses Drizzle ORM for primary schema (drizzle.config.ts:9, STATE.md:25-29) — VERIFIED

**Cryptography:**
- SHA-256 for hashes; Ed25519 for signatures, with chain and checkpointing (README.md:73, STATE.md:17,18,115-120) — VERIFIED

**Auth:**
- API key (env: `API_KEY`) via `x-api-key` header (SECURITY.md:15, .env.example:10)
- Session signing/hashing with `SESSION_SECRET` (SECURITY.md:71, .env.example:23)
- No secrets or API keys are ever logged (SECURITY.md:17,90)

**Rate Limiting/Security Boundaries:**
- Per-IP/in-memory rate limiting: public (100/min, 10/sec), private (50/min, 5/sec); headers reported; resets on restart (SECURITY.md:27-29,63,184) — VERIFIED

**Headers:**
- Secure HTTP headers enforced (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, modern XSS handling) (SECURITY.md:32-36)

**Isolation:**
- LLMs never see verification or system data—no capability escalation risk from LLM sensor integration (SECURITY.md:39-41, STATE.md:90,161)

**Secrets:**
- All secrets referenced by env var name only (`API_KEY`, `SESSION_SECRET`, etc.) (.env.example:10,23, README.md:34)

---

## 8. Operational Reality

- **Runtime:**
    - Node.js (20+), PostgreSQL >=14, NPM packages (.replit:1, README.md:23-25)
    - For dev, run with `npm run dev`; for prod, build (`npm run build`), then start (`npm run start`)
- **Database:**
    - Must be bootstrapped via `npm run db:push`; requires persistence and access for operation (README.md:39)
- **Maintenance:**
    - Rate limiting and metrics are in-memory (reset on restart, not cluster-safe; see STATE.md:184)
    - No explicit mention of backup/restore, but DB integrity is critical (STATE.md:209,163-176)
- **Secops/Operational:**
    - Environment variables must be set for secrets and DB URL
    - Should always be run behind TLS-terminating reverse proxy (SECURITY.md:54,81)
    - Log files contain structured, non-secret data for security event forensics (STATE.md:106-110, SECURITY.md:87-90)
    - Health endpoints available for liveness/readiness (STATE.md:37,43, STATE.md:204-205)
- **Update/Patch:**
    - Standard npm update, DB migration via Drizzle ORM; no dedicated patch/upgrade system noted — INFERRED

---

## 9. Maintainability & Change Risk

**Maintainability:**
- All core logic is TypeScript, with type safety and validation at API boundaries (README.md:62, STATE.md:95, package.json:10)
- Database schema and migration handled by Drizzle ORM (drizzle.config.ts:9)
- Lint/type/test/CI pipeline enforced (STATE.md:111; .github/workflow/ci.yml referenced)
- Key critical files are large (e.g., routes.ts > 2000 lines per STATE.md:182; candidate for future refactor)
- Test coverage is high, 42 golden/integration/edge/canon tests (STATE.md:194-212)
- Canonicalization/crypto functions drift-guarded via scripts in CI (.github/workflows/ci.yml, scripts/ci-canon-drift-guard.sh; referenced in STATE.md:113)

**Change Risk:**
- Modifying hash/canonicalize/signature routines will risk data unreadability and breaking the audit chain and forensic verifications.
- Changes to the DB schema must go through Drizzle migrations.
- Breaking/altering rate limit logic can impact DoS risk.
- No automatic handling for key/secret rotation (see Unknowns).  
- **Highest risk**: touching immutable chain/audit code, relaxing input validation, changing public proof APIs.

---

## 10. Unknowns / Missing Evidence

**A. Frontend Build & Hosting:**  
- How the client is built/started for production, especially split/static hosting, is not explicitly documented (HOWTO.unknowns, HOWTO.missing_evidence_requests, README.md:52) — UNKNOWN — evidence needed: Explicit frontend deployment/run steps and expected hosting approach.

**B. Database Bootstrap/Migrations:**  
- No explicit SQL schema/init commands are shown, only Drizzle push; no guidance for restoring from backup, nor handling migrations on stateful upgrades (HOWTO.unknowns, drizzle.config.ts:9, HOWTO.missing_evidence_requests) — UNKNOWN — evidence needed: Initial SQL schema or migration strategy confirmation.

**C. API Key & Secret Rotation:**  
- No evidence for secure generation, rotation, audit, or revocation of production API keys/session secrets (HOWTO.unknowns) — UNKNOWN — evidence needed: Process, tooling, or script to securely (re-)generate credentials.

**D. Webhook & SDK Integration:**  
- No evidence for consumption via webhooks or language SDKs other than REST/CLI and cURL (HOWTO.unknowns) — UNKNOWN — evidence needed: Explicit webhook or SDK interface/samples.

**E. User/Role Management:**  
- No instruction for user management, RBAC, or admin UI (HOWTO.missing_evidence_requests, STATE.md:224—RBAC is punchlist only) — UNKNOWN

---

## 11. Receipts (Evidence Index)

Below is every source snippet referenced above (by file and line number):

- **README.md:1-147** (Overview, job, capabilities, install/run, UI, API)  
- **replit.md:1-61** (Technical purpose, architectural/capability mapping, non-goals)  
- **drizzle.config.ts:1-14** (Database config, ORM, migrations)  
- **.env.example:5,10,13,14,18,23,27-29** (All env vars)  
- **SECURITY.md:5-92** (What is/isn’t protected, auth/rate/headers)  
- **STATE.md:12,13,17-23,25-147,149-193,194-225** (Endpoints, data shape, test, invariants)  
- **client/src/App.tsx:8,43,49** (UI boot, banners, navigation)  
- **client/src/components/app-sidebar.tsx** (UI navigation)  
- **tailwind.config.ts:5** (UI client build scope)  
- **package.json:2,6-12,53-56,60,66,104,105** (Node/React dependencies, dev build, start, check)  
- **.replit:1-2,10,14,18-19,37-39,40** (Replit execution, port, run profiles, env)  

---

**If you need operational confidence in any UNKNOWN area, request the explicit artifact/file listed above.**

---

**Dossier generated from static analysis only. No runtime or pen-test assertions are made. All epistemic status is anchored to cited source excerpts.**