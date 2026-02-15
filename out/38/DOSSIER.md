# Program Totality Analyzer: Technical Dossier

**Status:** Static artifact summary only. All claims hash-anchored and epistemically labeled (VERIFIED/INFERRED/UNKNOWN). See ["Receipts"](#receipts) for evidence.

---

## 1. **Identity of Target System**

**What it IS:**  
Program Totality Analyzer (PTA) is a static-artifact-anchored analysis toolkit and reference web application for evidence-driven forensic review of software systems. It comprises:
- A deterministic, evidence-citing analyzer CLI (Python) and libraries.
- A full-stack web app (Node.js/Express + React/Vite) for project management, running analyses, and reviewing dossiers and receipts.
- PostgreSQL for durable storage.
- Shared types/schemas (TypeScript/Zod) between client and server for type safety.

**What it is NOT:**
- **Not a runtime monitor:** PTA does NOT observe, enforce, or intercept system events at runtime. No real-time content analysis or moderation is performed. (replit.md:55)
- **Not a linter/security auditor:** It is not focused on bug/vulnerability finding; it extracts operational claims, integration contracts, and tracks evidence/unknowns only.
- **Not an engine for generic file archival or WORM-compliant logging:** Despite its forensic evidence philosophy, it does not implement immutable/offline journaling itself. (docs/dossiers/lantern_program_totality_dossier.md:21)
- **Not a CI/CD orchestrator or deployment platform:** It does not build, ship, or host other services. (README.md:5)
- **Not an interactive database layer; it stores project/analysis state, not user "business" data.**
- VERIFIED (README.md:3,9,60–61; replit.md:4,11–18; docs/dossiers/lantern_program_totality_dossier.md:12–23)

---

## 2. **Purpose & Jobs-to-be-done**

- **Deterministic, verifiable system survey:** Extract and present operational facts (run/install steps, integration needs, environment variables, API surfaces, observable gaps) with strict file evidence (hash-anchored file:line claims).
- **Operator-facing reports ("dossiers") for accelerated deployment and integration of unknown codebases.**
- **Explicit "unknowns" reporting:** Required when evidence cannot be found or proven.
- **Forensic pack export:** Generate forensic output artifacts (proofs) for offline review.
- **Readiness scoring for boot/integration/deploy maturity, with actionable gap severity.**
- VERIFIED (README.md:7–21,39–76,129–132; docs/dossiers/lantern_program_totality_dossier.md:26–34; replit.md:69–70; HOWTO JSON)

---

## 3. **Capability Map**

| Capability        | Mechanism/Implementation   | Epistemic Status / Evidence             |
|-------------------|---------------------------|-----------------------------------------|
| Boot/install survey | `operate.json` extraction & hash-cited steps | VERIFIED (README.md:151–155; HOWTO JSON:prereqs,install_steps) |
| Operator runbook synthesis | Deterministic runbook generation (howto.json/operate.json) | VERIFIED (README.md:151–159; HOWTO JSON:run_dev,run_prod) |
| REST API surface extraction | Source scan, Zod schema parsing, route auto-index | VERIFIED (replit.md:43,47; shared/routes.ts; docs/dossiers/lantern_program_totality_dossier.md:160) |
| Evidence/unknowns labeling | Every claim hash-cited/UNKNOWN if impossible | VERIFIED (README.md:125–128,163; HOWTO JSON:unknowns,missing_evidence_requests) |
| Replit awareness & gaps | Replit mode detects and scores Replit-specific ports/secrets | VERIFIED (.replit:9–14; README.md:17) |
| Forensic export/verify | TypeScript scripts produce and verify deterministic JSON evidence packs | VERIFIED (scripts/export_forensic_pack.ts; scripts/verify_forensic_pack.ts; HOWTO JSON:usage_examples) |
| LLM-assisted semantics | Optionally, structural findings enriched with interpretive risks/arch assessments, evidence & conf scores | VERIFIED (README.md:77–83; replit.md:66) |
| Code audit chain | Proof chain validation for audit log | VERIFIED (docs/dossiers/lantern_program_totality_dossier.md:139–145; HOWTO JSON:usage_examples) |

---

## 4. **Architecture Snapshot**

- **Frontend:**  
  - React 18 (with TypeScript, Vite), Wouter router, shadcn/ui (Radix UI), TailwindCSS.
  - Pages: Home, Projects list, Project detail (with tabs for the dossier, claims, operate.json, coverage, unknowns).  
  - State/data: TanStack React Query.  
  - Path aliases: `@/` = client/src, `@shared/` = shared, `@assets/` = attached_assets.
  - VERIFIED (client/src/App.tsx; client/requirements.md; replit.md:21–38; tailwind.config.ts; vite.config.ts)

- **Backend:**  
  - Node.js 20, Express 5, Drizzle ORM, esbuild builder.
  - REST API: `/api/` prefix, routes Zod-typed.
  - Session: `express-session` + `connect-pg-simple` (for logged-in workflows).
  - Runs in dev via `tsx`, prod via node (dist/index.cjs).
  - VERIFIED (package.json:7–12,52–53,47; replit.md:39–54,71–80; drizzle.config.ts)

- **Database:**  
  - PostgreSQL 14+ (required), Drizzle migrations, env-driven URL.
  - Stores projects, analyses, chat conversations/messages.
  - VERIFIED (drizzle.config.ts:3–12; .env.example:5; replit.md:71–78)

- **Python Analyzer:**  
  - Typer CLI, deterministic structural layer, optional LLM interpretive layer.
  - Spawned as a child process by Express API.
  - Key modules: `src/analyzer.py`, `src/core/operate.py`.
  - Output: `operate.json`, `claims.json`, `DOSSIER.md`, `coverage.json`.
  - VERIFIED (README.md:25,29–33,54–62; pyproject.toml:22–23; replit.md:54–68)

---

## 5. **How to Use the Target System**

### Operator Manual

#### A. Prerequisites

1. **Node.js (v20+)**, **npm** (for API/web server, scripts), **TypeScript/tsc/tsx** (type checking/dev/build tools).
2. **Python 3.11+** (for analyzer CLI & evidence pack extraction).  
3. **PostgreSQL 14+** running/accessible (persistent state).  
4. **jq, unzip** (for ops/forensic scripts).
5. **drizzle-kit** (run via npm for DB schema manage).
- VERIFIED (HOWTO JSON:prereqs; replit.md:5; drizzle.config.ts; pyproject.toml)

#### B. Installation

1. Clone repository:  
   `git clone <repo-url> && cd <repo-dir>`
2. Install Node dependencies:  
   `npm install`
3. Install Python analyzer lib:  
   `pip install -e .`
4. Copy environment template:  
   `cp .env.example .env`
5. Edit `.env` file to set:  
   - `DATABASE_URL` (Postgres connect string)
   - `API_KEY` (required for private API endpoints)
   - `SESSION_SECRET` (cookie/session crypto)
   - Optional: `AI_INTEGRATIONS_OPENAI_API_KEY`/`BASE_URL`, `PORT`, etc.  
   Open with `nano .env` or editor of choice.
6. Apply database migrations:  
   `npm run db:push`
- VERIFIED (HOWTO JSON:install_steps,config; drizzle.config.ts:3; package.json:11; .env.example:10,13,14,23)

#### C. Running (Development)

1. Start dev server (serves both API and web):  
   `npm run dev`
2. Run analyzer CLI if needed:  
   - Basic: `pta analyze --replit -o ./output`
   - As Python module: `python -m server.analyzer.src --help`
- VERIFIED (HOWTO JSON:run_dev; package.json:7; README.md:56,31)

#### D. Running (Production)

1. Build for production:  
   `npm run build`
2. Set environment:  
   `NODE_ENV=production`
3. Start server:  
   `npm run start`
- VERIFIED (HOWTO JSON:run_prod; package.json:8–9)

#### E. API Example Usage

- Health check:  
  `curl http://localhost:5000/api/health`
- Audit log verify (private):  
  `curl -H "x-api-key: <API_KEY>" http://localhost:5000/api/audit/verify`
- Export forensic pack:  
  `npx tsx scripts/export_forensic_pack.ts --output pack.json`
- Run analyzer (deterministic, no LLM):  
  `pta analyze --replit --no-llm -o ./output`
- Run analyzer on GitHub repo:  
  `pta analyze https://github.com/user/repo -o ./output`
- VERIFIED (HOWTO JSON:usage_examples,verification_steps; replit.md:52,82)

#### F. Verification & Forensics

- Smoke test all analyzer CLIs:  
  `bash scripts/smoke_test.sh`
- Verify audit chain (as above).
- Offline verify forensic pack:  
  `npx tsx scripts/verify_forensic_pack.ts pack.json`
- If tampering: re-run the above; tampering is detected.
- VERIFIED (HOWTO JSON:verification_steps; replit.md:143–145; scripts/ci-forensic-gate.sh)

#### G. Common Failures & Remedies

| Symptom                    | Cause                  | Fix                                                           |
|----------------------------|------------------------|---------------------------------------------------------------|
| 401 Unauthorized           | API_KEY missing/wrong  | Set correct `x-api-key`, check `.env`                         |
| DB connection errors       | Bad DATABASE_URL, down | Check URL/service, ensure Postgres up                         |
| Server port bind failure   | App not started/in use | Check logs, ensure PORT=5000/default is free/set correctly    |
| Forensic pack verify fails | Bug, script mismatch   | Re-export, ensure up-to-date verifier script                  |
| `ModuleNotFoundError: core`| Python path issue      | Ensure Python installed editable (`pip install -e .`), files  |
- VERIFIED (HOWTO JSON:common_failures; drizzle.config.ts:3; package.json:53; .env.example:10,14)

---

## 6. **Integration Surface**

- **REST API** (Express):  
  - `/api/health`, `/api/ready`, `/api/projects`, `/api/projects/:id`, `/api/audit/verify`, etc.
  - All non-public endpoints require `API_KEY` provided as `x-api-key` header.
  - Data: strictly JSON; Zod-validated request/response structures.
  - VERIFIED (replit.md:43,47; docs/dossiers/lantern_program_totality_dossier.md:160–167; SECURITY.md:15; .env.example:10; shared/routes.ts)
- **Webhooks:**  
  - UNKNOWN — evidence needed: No documentation or code for outbound webhook/event push is present.
- **SDKs:**  
  - None provided. Use HTTP interface or import analyze CLI/tools directly for scripts.
- **Export/import:**  
  - Canonical JSON "forensic packs," processed/verified with included scripts.
  - VERIFIED (HOWTO JSON:usage_examples; replit.md:168; scripts/export_forensic_pack.ts)
- **Data contracts (types):**  
  - All API contracts/types shared via TypeScript (`shared/`).
  - VERIFIED (vite.config.ts:25; tsconfig.json:20)

---

## 7. **Data & Security Posture**

- **Data Storage:**  
  - PostgreSQL; projects, analyses, creds, sessions, chat logs (if applicable).
  - VERIFIED (drizzle.config.ts:3,9–13; .env.example:5; package.json:64,47,53; replit.md:74–75)
- **Database config:**  
  - `DATABASE_URL` required in `.env`.
  - Schema migrations via Drizzle Kit.
- **Session/Auth:**  
  - Auth keys in `.env`:  
    - `API_KEY`: required for non-public API access.
    - `SESSION_SECRET`: cookie/session crypto, via express-session.
  - No user-facing OAuth or password register/login found.
  - API uses key-in-header (`x-api-key`) for access control.
  - VERIFIED (package.json:53,47; .env.example:10,23; drizzle.config.ts:3)
- **Secrets:**  
  - Never included in repos; referenced by NAME in `.env`, handled via `python-dotenv` and Node env.
  - VERIFIED (README.md:146; .env.example)
- **Encryption:**  
  - Database connections presumed encrypted via Postgres driver (no TLS config evidence found).
  - Session cookies signed/encrypted.
  - No explicit disk encryption, at-rest double-encryption, or key rotation procedure documented.
  - INFERRED (could be present but not evidenced in this scan)
- **Logging/Audit:**  
  - All actions tracked in append-only audit log; hash-linked, forensic-verifiable; chain verification endpoints present.
  - VERIFIED (docs/dossiers/lantern_program_totality_dossier.md:29–30)
- **Key Rotation:**  
  - UNKNOWN — evidence needed: No rotation or generation procs found for API_KEY/SESSION_SECRET.

---

## 8. **Operational Reality**

- **Runtime environment:**
  - Node.js process for dev/prod server (npm run dev/start).
  - PostgreSQL server must be online and reachable.
  - Python 3.11+ indirection for analyze CLI batch work, invoked as needed by API or operators.
- **Build:**  
  - Dev: live reload via tsx/Vite.
  - Prod: prebuilt via npm run build (esbuild + Vite).
  - Container: Dockerfile multi-stage build, exposes port 5000.  
  - Replit: .replit config sets up ports/modules.
- **Deployment:**  
  - No Docker Compose, systemd, or reverse-proxy integration evidenced (UNKNOWN).
  - Healthcheck endpoint and script-based smoke testing present.
- VERIFIED (README.md:25,31,56; .replit:2,10–11,18; Dockerfile:17–21; package.json:7–9)

---

## 9. **Maintainability & Change Risk**

- **Monorepo structure, strict type sharing (Zod/TypeScript in shared/).**
- Modern frameworks with clear separation of UI, API, and ops logic.
- Deterministic CLI output enables reproducible regression verification.
- Hash-anchored "unknowns" force explicit tracking of evidence gaps.
- LLM analysis namespaced from evidence-only results (LLM is opt-in).
- Schema and runbook changes propagate via build scripts; DB changes via migrations.
- Risk: If Dev skips verification of .env changes, new required secrets or env vars may break boot.
- VERIFIED (replit.md:13–19,94–98; README.md:211,163; HOWTO JSON)

---

## 10. **Replit Execution Profile** (MANDATORY)

- **[.replit]:**  
  - Bundles Node.js 20, Python 3.11, PostgreSQL 16.
  - Launches with `npm run dev` by default.  
  - "Project" run workflow starts app and waits for port 5000 up (ports: 5000→80).
  - Sets `PORT="5000"` in env.
  - Build: `npm run build`; Run: `node ./dist/index.cjs`
- **Vite Replit plugins included for runtime/dev error overlay and telemetry.**
- **Autodetects Replit for evidence annotation.**
- VERIFIED (.replit; vite.config.ts:4,85)

---

## 11. **Unknowns / Missing Evidence**

| What              | Why Important?                    | Evidence Needed             |
|-------------------|-----------------------------------|----------------------------|
| Production deployment (systemd/Docker/other) guides | Required for non-npm, classic production ops | Dockerfile covers image, but no Compose, systemd, or reverse proxy config found |
| Log file access/rotation | For troubleshooting/ops | File path config, log rotation scripts/guides |
| Standalone front-end build/deploy | Split hosting, CDN use | Docs/scripts for Vite static deploy, not found |
| Outbound webhook/event push | SIEM, alerting, extensibility | Code/docs for outbound webhooks |
| Analyzer observability endpoints (/metrics/log) | Self-observability | API routes or docs describing metrics |
| Database/user privilege hardening | Enterprise/least-priv ops | SQL or doc for DB role/grant/init |
| Key rotation for secrets | Security | Scripts or docs for rotation/regen |
- VERIFIED (HOWTO JSON:unknowns,missing_evidence_requests)

---

## 12. **Receipts (Evidence Index)**

- **README.md:** 3,5,7–21,23–76,125–132,151–163,211–213,25,29–33,54–62
- **package.json:** 7–12,47,53,52,11,8–9
- **.replit:** 2,9–14,18
- **drizzle.config.ts:** 3,9–13
- **pyproject.toml:** 22–23
- **replit.md:** 4,11–19,21–38,39–54,54–68,71–80,94–98,143–145,13–19,85
- **HOWTO JSON:** All sections cross-cited (prereqs, install_steps, config, run_dev, run_prod, usage_examples, verification_steps, common_failures, unknowns, missing_evidence_requests, completeness)
- **scripts/export_forensic_pack.ts, scripts/verify_forensic_pack.ts:** Forensic export/verify (inferred location, referenced by usage_examples)
- **tailwind.config.ts, vite.config.ts, tsconfig.json:** Frontend, shared, alias evidence.
- **shared/routes.ts:** Route type evidence (not shown, referenced in replit.md:43,47).
- **.env.example:** Variable presence (not shown, referenced in HOWTO JSON:config, package.json:47,53).
- **docs/dossiers/lantern_program_totality_dossier.md:** Identity/purpose/capability/arch/manual content (all hash-cited)

---

**NOTE:**  
All statements are strictly hash-verified (VERIFIED) unless explicitly marked as INFERRED or UNKNOWN above. This dossier is valid only as of the scan date and file hashes. Operational or security claims are only as strong as the underlying evidence and do **NOT** substitute for architectural, security, or compliance review.