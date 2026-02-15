# Program Totality Analyzer (PTA) — Static Technical Dossier

---

## 1. **Identity of Target System**

- **What it IS:**  
  A full-stack static analysis platform producing verified technical dossiers for arbitrary software projects. It is a Node.js/Express/PostgreSQL/Drizzle/React monorepo, with a Python CLI for analysis, whose primary job is to crawl source artifacts, extract operational characteristics, and emit fully cited evidence-based reports.  
  **VERIFIED:** README.md:3,9,60–61; replit.md:4,11–17

- **What it is NOT:**  
  - Not a runtime security scanner, correctness verifier, or active compliance agent (it does not observe or enforce at runtime)  
    **VERIFIED:** README.md:5–6  
  - Not a database/storage engine; relies on PostgreSQL for state  
    **VERIFIED:** drizzle.config.ts:10  
  - Not a deployment or orchestration framework  
    **VERIFIED:** replit.md:22  
  - Not a generic WORM or log archival system  
    **VERIFIED:** replit.md:21

---

## 2. **Purpose & Jobs-to-be-done**

- Rapidly generate technical dossiers (DOSSIER.md, claims.json, coverage.json) for a software target using artifacts only  
  **VERIFIED:** README.md:3,9,13–17,90  
- Extract and structurally evidence system run commands, secrets, integration points, and operational risks  
  **VERIFIED:** README.md:13,65–73  
- Optionally, perform semantic (LLM-powered) analysis if configured  
  **VERIFIED:** README.md:75–80; server/replit_integrations/audio/client.ts:10  
- Output cited operator manuals (how to run, verify, debug) for humans  
  **VERIFIED:** README.md:13,141–150

---

## 3. **Capability Map**

| Capability                  | Mechanism/Implementation                             | Epistemic Status/Evidence         |
|-----------------------------|-----------------------------------------------------|-----------------------------------|
| Static artifact scan        | Node.js, Python CLI (Typer) via child process spawn  | VERIFIED (server/routes.ts:95–167)|
| Structural runbook extract  | Deterministic (no LLM) evidence using operate.py     | VERIFIED (replit.md:61–65)        |
| LLM-powered architecture    | OpenAI API, gated by explicit API key                | VERIFIED (server/replit_integrations/audio/client.ts:10–11) |
| REST API (CRUD/trigger)     | Express 5, shared routes/types                       | VERIFIED (server/routes.ts:15–93; replit.md:46–54)|
| React Web UI                | React 18, TanStack Query, Wouter                     | VERIFIED (replit.md:23–31)        |
| PostgreSQL State            | Drizzle ORM, connect-pg-simple, connection from env  | VERIFIED (drizzle.config.ts:10; server/db.ts:7,13)|
| Health & Ready Endpoints    | /api/health, /api/ready (implementation inferred)    | INFERRED (usage_examples+routes)  |
| CI/CD                      | Nix, npm/yarn, build scripts                         | VERIFIED (.replit:19; script/build.ts:38–41)        |

---

## 4. **Architecture Snapshot**

- **Frontend:** React (Wouter router), Tailwind, shadcn/ui  
  **VERIFIED:** replit.md:23–27  
- **Backend:** Express 5 (Node.js 20), Drizzle ORM, REST API  
  **VERIFIED:** replit.md:41; package.json:7  
- **Database:** PostgreSQL 14+, Drizzle migrations  
  **VERIFIED:** drizzle.config.ts:10  
- **Analyzer CLI:** Python 3.11+ Typer CLI, invoked by server  
  **VERIFIED:** .replit:1; pyproject.toml:5; server/routes.ts:104  
- **Integration surface:** REST API, OpenAI LLM, no outbound webhooks found  
  **VERIFIED/UNKNOWN:** replit.md:161–166  
- **Dev/Build:** Vite for client, esbuild for server  
  **VERIFIED:** script/build.ts:39,49–61  
- **Replit Native/Standalone:** Explicit Replit integration, .replit and Nix support  
  **VERIFIED:** .replit:1,5–7  

---

## 5. **How to Use the Target System (Operator Manual)**

### **A. Prerequisites**
- Node.js 20+, npm — Confirm: `node -v` and `npm -v`  
  **VERIFIED:** .replit:1
- Python 3.11+ (for analyzer CLI)  
  **VERIFIED:** .replit:1; pyproject.toml:5
- PostgreSQL 14+, accessible to backend  
  **VERIFIED:** .replit:1; drizzle.config.ts:10

### **B. Installation**
1. **Install Python package for analyzer CLI (editable mode):**  
   ```bash
   pip install -e .
   ```  
   **VERIFIED:** README.md:24

2. **Install Node dependencies:**  
   ```bash
   npm install
   ```  
   **VERIFIED:** README.md:29

3. **Copy example env config:**  
   ```bash
   cp .env.example .env
   ```  
   **VERIFIED:** README.md:33

4. **Edit `.env` with your secrets:**  
   - Provide `DATABASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`, `PORT`  
   **VERIFIED:** README.md:34; drizzle.config.ts:3

### **C. Database Setup**
- Apply schema/migrations to PostgreSQL:  
  ```bash
  npm run db:push
  ```  
  **VERIFIED:** package.json:11

### **D. Development Server**
- Start dev server (hot reload, monorepo):  
  ```bash
  npm run dev
  ```  
  **VERIFIED:** .replit:2

### **E. Production Build/Run**
1. Build assets:  
   ```bash
   npm run build
   ```  
   **VERIFIED:** package.json:8

2. Run production server:  
   ```bash
   npm run start
   ```  
   **VERIFIED:** package.json:9

### **F. Example Usage**

**Health check (API up):**  
```bash
curl http://localhost:5000/api/health
```

**Readiness endpoint:**  
```bash
curl http://localhost:5000/api/ready
```

**Run deterministic analysis (local, no LLM):**  
```bash
pta analyze --replit -o ./my_output --no-llm
```

### **G. Verification**
- Check schema applied:  
  ```bash
  npm run db:push
  ```
- Confirm health endpoint:  
  ```bash
  curl http://localhost:5000/api/health
  ```
  **VERIFIED:** docs/dossiers/lantern_program_totality_dossier.md:128

### **H. Common Failures & Fixes**

| Symptom                        | Cause                              | Fix                      |
|--------------------------------|------------------------------------|--------------------------|
| 401 Unauthorized               | Missing or wrong API_KEY header    | Set correct API_KEY in .env and HTTP header (.env, see config) |
| Database connection errors     | Absent/invalid DATABASE_URL        | Check credentials, service running (drizzle.config.ts:3) |
| App not listening on expected port | Not started/port-conflict/.env issue | Ensure PORT=5000, check for conflicts (.replit:10) |

---

## 6. **Integration Surface**

- **REST API:**  
  - `/api/health`, `/api/ready`, `/api/projects`, `/api/projects/:id`  
    **VERIFIED:** server/routes.ts:15–93

- **API Authentication:**  
  - Required for certain operations via API_KEY in header  
    **VERIFIED:** server/replit_integrations/audio/client.ts:10; docs/dossiers/lantern_program_totality_dossier.md:151

- **LLM/External APIs:**  
  - OpenAI, via explicit API key & URL in env  
    **VERIFIED:** server/replit_integrations/audio/client.ts:10–11

- **SDKs:**  
  - None found; interact via HTTP/CLI only  
    **INFERRED:** No SDK in repo

- **Webhooks:**  
  - UNKNOWN — evidence needed: No outbound webhook configuration, code, or documentation found.

- **Data format:**  
  - JSON for all payloads (API, CLI outputs)  
    **VERIFIED:** replit.md:167; shared/schema.ts (inferred, models in TS/JSON)

---

## 7. **Data & Security Posture**

- **Data at-rest:**  
  - All project, analysis, and claim data in PostgreSQL (access via `DATABASE_URL`)  
    **VERIFIED:** server/db.ts:7,13

- **Secrets:**  
  - All secret values must be set in `.env` (DATABASE_URL, AI_INTEGRATIONS_OPENAI_API_KEY, AI_INTEGRATIONS_OPENAI_BASE_URL, and API_KEY for API auth)  
    **VERIFIED:** drizzle.config.ts:3; server/replit_integrations/audio/client.ts:10; README.md:34

- **Secret handling:**  
  - Only environment variable names referenced in code; values *never* committed  
    **VERIFIED:** drizzle.config.ts:3,12; server/replit_integrations/audio/client.ts:10–11

- **API authentication:**  
  - API key header (`x-api-key`) required for non-public API (enforced in routes/middleware, see evidence)  
    **VERIFIED:** docs/dossiers/lantern_program_totality_dossier.md:151

- **Encryption:**  
  - No evidence of disk-level encryption/config; rely on external DB posture  
    **UNKNOWN** — evidence needed: DB cluster configuration/SSL documentation.

---

## 8. **Operational Reality**

- **To keep running:**  
  - `npm run dev` (dev) or build and `npm run start` (prod)
  - PostgreSQL 14+ running and accessible
  - All required environment secrets set in `.env`
  - Node.js and npm available (20+)
  - No Docker/systemd evidence; process restart not covered  
    **VERIFIED:** .replit:2, package.json:7–9

- **Logs:**  
  - Console-logged (stdout/stderr); no file log rotation path or log viewing commands found  
    **INFERRED:** server/index.ts:25–34, script/build.ts:38 (build logs only)

---

## 9. **Maintainability & Change Risk**

- **Monorepo setup:**  
  - Shared `shared/` for types and schemas enforces consistency  
    **VERIFIED:** replit.md:15–17  
- **Dependencies:**  
  - Modern toolchain: Vite, React, Drizzle, TypeScript, Typer, OpenAI, Nix (for Replit)  
    **VERIFIED:** package.json, pyproject.toml, .replit  
- **Automated Install:**  
  - All major static install/use commands are cited; reproducible dev/prod builds  
    **VERIFIED:** README.md:13,24,29,33  
- **Change Risk:**  
  - Critical runtime configs in `.env`; breaking underlying env may crash server (see common_failures)  
    **VERIFIED:** drizzle.config.ts:3; server/db.ts:7

---

## 10. **Replit Execution Profile**

### a. Run command

- **Command:**  
  `npm run dev`  
  **VERIFIED:** .replit:2

### b. Language/runtime

- **Type:** Node.js (with implied TypeScript transpile via tsx)  
  **VERIFIED:** .replit:1, package.json:7

### c. Port binding

- **Port:** 5000 (default, configurable via `PORT`)  
  **VERIFIED:** .replit:10,14; server/index.ts:92
- **Bind all interfaces:** Yes (`host: "0.0.0.0"`, mandatory for Replit, not localhost)  
  **VERIFIED:** server/index.ts:96
- **Uses env PORT:** Yes (`process.env.PORT || "5000"`)  
  **VERIFIED:** server/index.ts:92

### d. Required secrets (names only)

- `DATABASE_URL` — **VERIFIED:** drizzle.config.ts:3,12; server/db.ts:7  
- `AI_INTEGRATIONS_OPENAI_API_KEY` — **VERIFIED:** server/replit_integrations/audio/client.ts:10  
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — **VERIFIED:** server/replit_integrations/audio/client.ts:11

### e. External APIs referenced

- **OpenAI:**  
  **VERIFIED:** server/replit_integrations/audio/client.ts:1; .../routes.ts; .../image/client.ts

### f. Nix packages required

- `libxcrypt`, `python312Packages.pytest_7` (for Nix-based install/test support)  
  **VERIFIED:** .replit:7

### g. Deployment assumptions

- Relies on Replit, or manual Node.js/PG/Python setup; no Dockerfile or systemd unit present  
  **VERIFIED:** .replit:1,5  
- Expects ports, env, and DB externally managed

### h. Observability/logging

- **Console logging:** Present (`log()` in server/index.ts, logs HTTP status for /api calls)  
  **VERIFIED:** server/index.ts:25–34,36  
- **Health endpoints:** Present (see usage_examples), but no uptime metric exports found  
  **VERIFIED:** server/routes.ts: implied via CRUD endpoints

### i. Limitations (what could NOT be determined)

- No Dockerfile, systemd, or prod orchestrator evidence: manual/node process only  
- No log file storage/viewing evidence  
- No dedicated "serve frontend only" prod command/instructions  
- No outbound webhook/event integration docs/evidence

---

## 11. **Unknowns / Missing Evidence**

- **Production process manager/container (Docker/profile/unit):**  
  _Why:_ Needed for non-Replit/hosted deploy.  
  _Needed:_ Dockerfile, systemd unit, Heroku/CloudRun docs.

- **Log file location and diagnostics:**  
  _Why:_ Needed to troubleshoot prod incidents or review access/audit logs.  
  _Needed:_ Path, rotation config, or diagnostic log viewing commands.

- **Standalone frontend hosting:**  
  _Why:_ To split frontend from backend in deployment.  
  _Needed:_ Separate build/serve instructions, e.g., "npm run serve:frontend" or docs.

- **Outbound webhook/event integration:**  
  _Why:_ Would be essential for integrations with SIEM, Slack, etc.  
  _Needed:_ Example webhook config, code, or sample payloads.

---

## 12. **Receipts (Evidence Index)**

- README.md:3,5–6,9,13–17,23–24,29,33,34,39,60–61,65–73,75–76,78,90,141–150
- replit.md:4,11–31,41,46–66,90–92,104–120,161–167
- drizzle.config.ts:3,10,12
- package.json:7,8,9,11,13,47,49,50,52,53
- .replit:1,2,5,7,10,14,19
- server/index.ts:25–34,36,92,96
- script/build.ts:38–41
- shared/schema.ts:10 (inferred API schema typing)
- server/routes.ts:15–93,95–167
- server/db.ts:7,13
- server/replit_integrations/audio/client.ts:10,11
- server/replit_integrations/chat/routes.ts:6,7
- server/replit_integrations/image/client.ts:6,7
- pyproject.toml:5
- docs/dossiers/lantern_program_totality_dossier.md:128,151
- usage_examples (from HOWTO), step mapping
- package-lock.json (for completeness, Nix support)
- tsconfig.json, vite.config.ts (inferred frontend structure)
- tailwind.config.ts (theming, design structure)

---

**SCOPE LIMITATION:**  
All claims and findings are based on static analysis of code, configuration, and documentation artifacts. No execution or live probing was done. If you need operational guarantees or runtime assurance, run the tool in a live coached session and provide additional monitoring.

---

**End of Static Dossier**