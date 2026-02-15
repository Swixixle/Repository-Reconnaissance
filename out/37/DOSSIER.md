# HALO-RECEIPTS Forensic Verification System — Program Totality Analyzer Dossier

---

## 1. Identity of Target System

**What is it?**
- HALO-RECEIPTS is a "Forensic Verification System for AI Conversation Transcripts." It establishes cryptographic proof, immutable storage, and forensic trails for AI-generated conversation receipts. Its focus is on integrity, accountability, and compliant auditability for transcript data (README.md:3,9; replit.md:4).

**What is it NOT?**
- It is **not** a general-purpose database, a full content moderation system, a real-time monitoring platform, nor a truth-judgment system (docs/NON_GOALS.md referenced in replit.md:55).
- It does **not** provide network security (e.g., TLS termination), nor protect against a fully-privileged DBA (SECURITY.md:44–51).
- It is **not** a data science platform or AI pipeline; it is a forensic overlay for transcript verification and audit.

**Epistemic status:** VERIFIED (README.md:3,9,11; replit.md:4; SECURITY.md:44–51)


---

## 2. Purpose & Jobs-to-be-done

- Guarantee forensic, cryptographically verifiable records for AI conversation transcripts.
- Prove (cryptographically) that transcripts and receipt chains have not been tampered with.
- Detect any modification, deletion, or unauthorized insertions in the receipt and audit chain.
- Provide operators and auditors tools to export, verify, and independently validate the integrity on or off the system.
- Support regulatory compliance in domains needing strong evidentiary chains (healthcare, regulated AI, etc.)

**Epistemic status:** VERIFIED (README.md:9,73–82; replit.md:4,11–23; STATE.md:16–80)


---

## 3. Capability Map

**Core Capabilities (VERIFIED):**
- Receipt verification (SHA-256, Ed25519 chaining/signatures) (README.md:73–75; replit.md:12,18)
- Canonicalization to prevent hash ambiguities (README.md:74; STATE.md:20)
- Immutable, locked storage of verified receipts (README.md:75; replit.md:14)
- Kill switch disables interpretation (README.md:76; replit.md:15)
- Append-only interpretation and tri-sensor analysis (README.md:77–78; replit.md:16–17)
- Tamper-evident forensic packs & public verification (README.md:82; replit.md:22,26)
- Append-only, hash-chained audit log (STATE.md:24–25; replit.md:29)
- Export & offline verification utilities (README.md:123–125; scripts/)
- Audit chain partial/strict verify, including cursor-based range verification (STATE.md:71–72)
- LLM sensor integration, strictly isolated from verification logic (replit.md:20,90; STATE.md:160)
- Rate limiting, API keys, session secret enforcement (SECURITY.md:25–28,83–85)
- Security headers and input validation (SECURITY.md:31–37,20–23)

**Auxiliary/Operational (VERIFIED):**
- Structured logging for all key actions (STATE.md:106)
- Health/readiness endpoints, instrumentation counters (STATE.md:31,76,92)
- Ed25519-signed checkpoints, with interval and anchor-backends (replit.md:36,45)
- Multi-mode checkpoint anchoring (LogOnly/S3Worm/Rfc3161/MultiAnchor) (replit.md:45)
- CI proof runs, drift guard, release artifact supply chain (replit.md:39–42,57–59)

**Partial/Not in scope (as explicitly forbidden or not found — VERIFIED):**
- No in-place data edits; no mock/prod ambiguity (STATE.md:188–193)
- Not responsible for TLS/network security (SECURITY.md:54–55)
- No distributed rate limiting (SECURITY.md:63)
- No real-time moderation, content filtering, or operator behavior evaluation (docs/NON_GOALS.md, referenced in replit.md:55)

---

## 4. Architecture Snapshot

**System Style:** Tiered monorepo: React/TS client, Express.js (Node.js) backend, PostgreSQL (drizzle-orm) (README.md:59–61)

**Key Tech Stack:**
- Backend: Node.js 20+, Express.js, Drizzle ORM, Zod validation (README.md:60–62)
- Frontend: React + TypeScript + Tailwind CSS (README.md:59, tailwind.config.ts)
- Persistence: PostgreSQL (README.md:61, drizzle.config.ts)
- Build & toolchain: tsx, drizzle-kit, TypeScript, Vite for client (package.json, vite.config.ts)
- Auth: API_KEY via header (SECURITY.md:15; .env.example:10)
- Process scripts: npm/yarn lifecycle, with db:push, dev, build, and start (package.json:6–11; .replit)

**Deployment Style:**
- Can run locally or on Replit (README.md:15–18)
- Replit profile defines module deps (Node 20, PostgreSQL), PORT 5000, and a run button workflow ('.replit':1,10,14,22–23,39)

**Database Migration:** drizzle-kit, schema at ./shared/schema.ts (drizzle.config.ts:8–9)

**Epistemic status:** VERIFIED (README.md:57–62,71; drizzle.config.ts; package.json; .replit; tailwind.config.ts; vite.config.ts)

---

## 5. How to Use the Target System (Operator Manual)

### Prerequisites

1. Ensure you have **Node.js 20+**, **npm**, and **PostgreSQL 14+** installed. (README.md:23–24)
2. Optionally, install **yarn** if preferred, plus **drizzle-kit** (DB migration) and **tsx** (build/dev scripts). (README.md:25)
3. Clone the repository via git (inferred – implied for code management).
4. If using Replit, these are auto-provisioned (see ".replit":1).

---

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```
   (README.md:29)

---

### Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   (README.md:33–34)
2. Set **DATABASE_URL** to your PostgreSQL connection string. (README.md:34; .env.example:5)
3. Set **API_KEY** for authenticating private endpoints. (".env.example":10)
4. For production, generate a **cryptographically strong SESSION_SECRET**. (SECURITY.md:84; .env.example:23)
5. Configure optional variables as required (e.g., TRANSCRIPT_MODE, PORT, checkpoint settings etc.; see .env.example:13–29).

---

### Database Setup

1. Push schema to PostgreSQL (bootstrap database):
   ```bash
   npm run db:push
   ```
   (README.md:39; package.json:11)
   - *Note*: Explicit migration/init sequence details are not provided. See "Unknowns". 

---

### Running the system

#### Development:

1. Start the development server:
   ```bash
   npm run dev
   ```
   (README.md:44; package.json:7)

   - For Replit: The workspace "run" button runs `npm run dev` as well (.replit:2,22–23,39).

#### Production:

1. Build the application:
   ```bash
   npm run build
   ```
   (README.md:52; package.json:8)

2. Start the production server:
   ```bash
   npm run start
   ```
   - Ensure you've set `NODE_ENV=production`. (README.md:53; package.json:9)

---

### Usage Examples

- **Health check (liveness):**
  ```bash
  curl http://localhost:5000/api/health
  ```
  (docs/API_CONTRACTS.md:9–21)
- **Readiness check:**
  ```bash
  curl http://localhost:5000/api/ready
  ```
  (docs/API_CONTRACTS.md:22–35)
- **Audit chain verify (API key required):**
  ```bash
  curl -H "x-api-key: $API_KEY" http://localhost:5000/api/audit/verify
  ```
  (docs/API_CONTRACTS.md:64–79)
- **Export forensic pack:**
  ```bash
  npx tsx scripts/export_forensic_pack.ts --output pack.json
  ```
  (scripts/ci-forensic-gate.sh:42)
- **Offline verify of forensic pack:**
  ```bash
  npx tsx scripts/verify_forensic_pack.ts pack.json
  ```
  (scripts/ci-forensic-gate.sh:52)

---

### Verification

- Check health endpoint returns JSON `{status: "ok"}`:
  ```bash
  curl http://localhost:5000/api/health
  ```
  (docs/API_CONTRACTS.md:9–21)
- Readiness (`/api/ready`) shows DB and audit status.
- Audit verify (`/api/audit/verify`) returns chain status, checked events, first bad seq, etc.
- Tamper detection: Export a forensic pack, alter it as described, and confirm offline verify reports BROKEN (scripts/ci-forensic-gate.sh:65–77).

---

### Common Failure Scenarios

| Symptom | Cause | Fix |
|---|---|---|
| API returns `database unavailable`/503 | PostgreSQL down or `DATABASE_URL` wrong | Start DB, fix connection string (.env) |
| Private endpoint returns auth error | API_KEY header missing or incorrect | Add `x-api-key` with correct value |
| Audit verify reports BROKEN | Data tampered, DBA modified | Audit DB for breaches, restore backup |
| Dev/start fails w/ missing module | Dependencies not installed or Node.js version mismatch | Run `npm install`, confirm Node.js version |

---

## 6. Integration Surface

### APIs

**Stable endpoints:**
- `GET /api/health`
- `GET /api/ready`
- `GET /api/audit/verify` (API key required)
- `GET /api/health/metrics` (API key required)
- `GET /api/proofpack/:receiptId`
- `POST /api/lantern/followup` (only for VERIFIED receipts)
- Many operator endpoints (for views, export, etc.) (replit.md:26–29; docs/API_CONTRACTS.md)

**Contracts:**
- Input/output via canonicalized JSON, strict validation using Zod (SECURITY.md:20; replit.md:13)

**Authentication:**
- `x-api-key` HTTP header required for all non-public endpoints (SECURITY.md:15, .env.example:10)

**Rate Limiting:**
- Per-IP, per-endpoint rate caps, responses include `X-RateLimit-*` headers (SECURITY.md:25–29)

**Data export/import:**
- Forensic packs: Canonical JSON including events, checkpoints, manifest (STATE.md:122–125)

### Webhooks/SDKs

- NONE found. System is REST-only. (INFERRED; add to Unknowns if required evidence)

### Data Formats

- JSON; Canonicalization rules strictly enforced for audit chain (STATE.md:26; replit.md:13)
- Forensic export specs in docs/FORENSIC_EXPORT_PACK.md

---

## 7. Data & Security Posture

### Storage

- Audit events, receipts, checkpoints stored in PostgreSQL 14+ (drizzle.schema, implied by drizzle.config.ts:9, .env.example:5)
- Receipt records are immutable upon verification lock (README.md:75; STATE.md:21)

### Cryptography

- SHA-256 for receipt chain, Ed25519 signatures for checkpoints (README.md:73,136; replit.md:12,36)
- Checkpoint anchor modes: LogOnly, S3Worm, RFC3161 TSA, MultiAnchor (replit.md:45; .env.example:29)

### Authentication/Authorization

- API KEY in x-api-key header; must be a cryptographically strong random string in production (SECURITY.md:84; .env.example:10)
- SESSION_SECRET required for session/user state (SECURITY.md:71–74; .env.example:23)
- Authz distinguished between public (verification, health) and private (admin/export, verify) endpoints (SECURITY.md:14–16)

### Secret Handling

- Secrets provided via environment variables only; values never logged or exported (SECURITY.md:17,90)
- **NONE** of API_KEY, SESSION_SECRET, DB URI are output in logs by design (SECURITY.md:90)

### Input Validation & Limits

- Zod schema validation of request bodies (SECURITY.md:20; replit.md:14)
- POST/PUT require `application/json` only; bodies limited to 1MB (SECURITY.md:21,23)
- Rate limiting enforced; in-memory only (SECURITY.md:25–28,62)

### Network

- No built-in TLS; must be fronted by a reverse proxy (nginx, Replit deployments, etc.) (SECURITY.md:81)

---

## 8. Operational Reality

**Minimum Footprint:**
- Node.js 20+, npm, PostgreSQL 14+, at least a single instance.
- Correct .env configuration, DB provisioned up front.

**Maintenance:**
- Ensure secrets remain strong; rotate API_KEY and SESSION_SECRET as needed (SECURITY.md:84)
- **No backup/restore scripts for database found.** (UNKNOWN)

**Runtime:**
- Must run behind TLS-terminating proxy in production (SECURITY.md:81)
- Health and readiness endpoints can be polled for availability
- Process scripts are npm-based; no systemd/docker/k8s recipes found (UNKNOWN)

**Troubleshooting:**
- Most operator errors have a clear mapping (see "How to Use" above).
- All audit trail, policy, adapter, rate-limit events are logged structurally in JSON (STATE.md:106)
- In-memory counters and rate limits reset on process restart; not persisted (STATE.md:184–185)

---

## 9. Maintainability & Change Risk

**Positives:**
- Strong CI (GitHub Actions): typecheck, db:push, test, boundary/canon drift guard, proof runs, and supply-chain signatures for release bundles (STATE.md:110–114; replit.md:39–42,57–58).
- Golden tests for canonicalization, chain, API boundaries (STATE.md:196–201).
- Reasonably modular with clear scripts for export/import, keys, etc.

**Risks & Known Tech Debt:**
- Large routes.ts file (>2000 lines), planned for split (STATE.md:182).
- Rate-limiter and all counters are in-memory only; subject to loss on restarts (STATE.md:184–185).
- Some LLM adapters are stubbed (not fully implemented)—not a core risk for forensics (STATE.md:181).
- No explicit documentation/scripts for backup & restore, process orchestration, or key rotation processes (UNKNOWN).
- Security relies on correct secret handling in ops environment (explicitly warned) (SECURITY.md:84).
- Partial coverage of integration and migration in docs (see Unknowns).

---

## 10. Replit Execution Profile

- Modules: nodejs-20, web, postgresql-16 ('.replit':1)
- Exposes localPort 5000 externally as 80 ('.replit':10–11)
- Workspace run (`runButton`) is mapped to `npm run dev` ('.replit':22–23,39)
- [deployment] section sets production start to `node ./dist/index.cjs` and build to `npm run build` ('.replit':18–19)
- Userenv.dev sets a default VITE_DEV_API_KEY for dev UX ('.replit':45)
- Integration: [agent] supports GitHub imports (.replit:48)

---

## 11. Unknowns / Missing Evidence

**Database migrations/init:**  
- No explicit, detailed migration/init command flow beyond `npm run db:push`. No evidence of manual DB setup or more complex bootstrap sequences.  
  > Evidence needed: Lines describing a migration run, e.g., drizzle-kit push with specific environment, or manual schema SQL.

**Frontend build/test/deploy for full production:**  
- No explicit end-to-end production deployment steps (i.e., both backend and static frontend assets), nor confirmation of hosting setup for static files.
  > Evidence needed: Docs or scripts lines showing e.g. Vite build and static serving, deployment flow with both client and backend.

**Secrets on infra:**  
- No evidence of secrets management or .env handling for team/hosted context (e.g. .env provisioning on container/orch).
  > Evidence needed: Dockerfile, orchestrator config, or secrets manager hooks.

**Logging, backup, and process control:**  
- No log file location, backup/restore procedure for DB, or systemd/Docker/K8s process scripting found.
  > Evidence needed: Lines referencing log paths/scripts, backup strategy, systemd/docker/k8s manifest.

**Key rotation / distribution evidence:**  
- No operator manual or code references for key rotation/validation.
  > Evidence needed: Docs or scripts describing Ed25519 keyring rotation/checks, or secret distribution protocol.

**Webhooks, External SDKs:**  
- No webhooks or SDK interfaces surfaced.
  > Evidence needed: API docs or server code exposing webhook/SDK endpoints.

---

## 12. Receipts (Evidence Index)

Each claim above is anchored to and evidenced by at least the following file/line locations:

- *README.md*: 3,9,11,15–18,23–29,33–35,39,44,47,49,52–62,71–83
- *replit.md*: 4,11–61,26–29,36,39–46,54,55
- *SECURITY.md*: 7–13,14–17,20–23,25–30,31–37,44–91
- *STATE.md*: 12,16–80,110–125,149–193,196–211,184–185
- *drizzle.config.ts*: 8–9
- *package.json*: 6–11,59–61
- *.env.example*: 5,10,13,14,18,23,27–29
- *.replit*: 1,2,14,22–23,39,10–11,45,18–19,48
- *vite.config.ts*: 6–40
- *tailwind.config.ts*: 5
- *scripts/ci-forensic-gate.sh*: 42,52,65–77
- *docs/API_CONTRACTS.md*: 9–21,22–35,64–79
- *docs/NON_GOALS.md*: referenced in replit.md:55

**(Additional lines referenced in "How to Use" not individually enumerated; see section for precise mapping.)**

---

# End of Dossier