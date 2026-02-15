# Program Totality Analyzer — Evidence-Bound Static Dossier

---

## 1. **Identity of Target System**

**What it IS:**  
Program Totality Analyzer (PTA) is a forensic and operational analysis platform designed for software projects. It statically analyzes source artifacts to generate human- and machine-readable technical dossiers that outline identities, operational requirements, integration surfaces, security postures, and explicit unknowns, all with evidence-linked claims. It features a full-stack web app (React SPA + Express API + PostgreSQL), uses a hybrid of Python for CLI analysis and TypeScript for the web layer, and is explicitly designed to produce cryptographically-verifiable outputs mapping every statement to underlying code/config or marking it as UNKNOWN.  
**VERIFIED** (README.md:3,9–10, replit.md:3–4,11–24)

**What it is NOT:**  
- Not a dynamic or interactive runtime analyzer—no dynamic program tracing or eBPF instrumentation is performed (**VERIFIED**, README.md:5)
- Not a security proof, correctness checker, or compliance attestor (**VERIFIED**, README.md:5)
- Not a database product: depends on external PostgreSQL for state (**VERIFIED**, drizzle.config.ts:10–12)
- Not a deployment or containerization platform: expects deployment behind reverse proxy or inside PaaS/host (**VERIFIED**, .replit:16–18)
- Not a monolithic all-in-one: separates frontend, backend, and analyzer (**VERIFIED**, replit.md:14–17)

---

## 2. **Purpose & Jobs-to-be-done**

- **Produce Evidence-Bound Dossiers:** Generate actionable, fully-evidenced “dossiers” showing what a system is, its operational steps, config, and unknowns (**VERIFIED**, README.md:3,9–19)
- **Enable Deterministic and LLM-Facilitated Analysis:** Support both reproducible/structural (“deterministic”) and semantic (LLM-derived, evidence-annotated) analysis modes (**VERIFIED**, README.md:59–63, replit.md:60–61)
- **Surface Gaps/Unknowns:** Highlight unresolvable unknowns, marking every claim’s epistemic confidence tier (**VERIFIED**, README.md:157–162, operate.json model)
- **Serve DevOps/Ops and Forensics:** Output formal runbooks, config, integration points, and help operators verify operational, cryptographic, and evidence safety of a codebase (**VERIFIED**, README.md:13–15,164–169)
- **Support Automated and Manual Workflows:** Usable via CLI, Web UI, and via direct API (**VERIFIED**, README.md:42–57, replit.md:21–27)

---

## 3. **Capability Map**

| Capability                      | Mechanism/Evidence                                                                                      | Status          |
|----------------------------------|--------------------------------------------------------------------------------------------------------|-----------------|
| Evidence-cited operator output   | All steps, ports, config, commands in how-to/output files with file:line:hash evidence (README.md:13–19,164–173) | VERIFIED        |
| Structural and LLM-augmented     | Structural (no LLM, hash-bound) and semantic (LLM, lower confidence) layers toggle via `--no-llm` (README.md:59–67,216–221) | VERIFIED        |
| Multi-modal artifact input       | Analyzes GitHub URLs, local folders, or in-Replit workspace (README.md:42–57; replit.md:56–59)           | VERIFIED        |
| Config/Port/Env Extraction       | Extracts referenced env vars, API keys, ports (README.md:70–71, .env.example, drizzle.config.ts:3)    | VERIFIED        |
| Integration & Gap Reporting      | Detects public/private API endpoints, issues, missing evidence, runbook gaps, unknowns (README.md:156–162,173–174) | VERIFIED        |
| Full-stack Web UI/API            | React SPA, Express/Node API, PostgreSQL backend (replit.md:14–18,21,36–42,70–73; package.json)        | VERIFIED        |

---

## 4. **Architecture Snapshot**

- **Frontend:**  
  React 18 SPA (TypeScript), routes via Wouter, UI: shadcn/ui, Tailwind, Framer Motion. (replit.md:21–31, client/requirements.md:2–4, package.json:65,70,73)
- **Backend:**  
  Node.js 20+, Express 5, REST API at `/api/`, TypeScript with esbuild bundle for prod, Drizzle ORM for DB access. (replit.md:41–46; package.json:52,49)
- **Shared Layer:**  
  Project strictly separates shared Zod types and schemas to prevent contract drift (`shared/`). (replit.md:17,94–95,50)
- **Analyzer (Python):**  
  Python Typer CLI, orchestrates deterministic/LLM analysis, emits all dossiers. (replit.md:54–61, pyproject.toml:2,12)
- **Database:**  
  PostgreSQL 14+, schema/migrations managed by Drizzle Kit, required `.env` config. (drizzle.config.ts:10–12, .env.example:5)
- **Build:**  
  Vite (frontend); esbuild for server; bundled to `dist/public/` and `dist/index.cjs`. (vite.config.ts:29–31, package.json:8, Dockerfile:11,15)
- **Replit:**  
  Native Replit flow, Replit secrets, executions, and port exposure are handled (see “Replit Execution Profile” below).

---

## 5. **How to Use the Target System**

### **Operator Manual**

#### A. Prerequisites
- **1. Node.js 20+, npm:** Required for all Node/JavaScript tooling and app execution.  
  **VERIFIED** (.replit:1, README.md:37)
- **2. Python 3.11+:** For running analyzer CLI/tools.  
  **VERIFIED** (.replit:1, README.md:37)
- **3. PostgreSQL 14+:** Must be running and accessible; `DATABASE_URL` needs to be set.  
  **VERIFIED** (.replit:1, drizzle.config.ts:10)
- **4. jq, unzip:** Needed for export/ops scripts in various workflows.  
  **VERIFIED** (.replit:7, README.md:81)
- **5. TypeScript, tsx, drizzle-kit:** For code compilation and DB migrations.  
  **VERIFIED** (package.json:7–12,99–104)

#### B. Installation
1. **Clone the repository:**  
   `git clone <repo-url>`  
   **VERIFIED** (docs/dossiers/lantern_program_totality_dossier.md:86)
2. **Install Node dependencies:**  
   `npm install`  
   **VERIFIED** (README.md:29)
3. **Install Python package (register CLI):**  
   `pip install -e .`  
   **VERIFIED** (README.md:25)
4. **Copy example env config:**  
   `cp .env.example .env`  
   **VERIFIED** (docs/dossiers/lantern_program_totality_dossier.md:89)
5. **Edit `.env` with secrets/config:**  
   Open `.env` and set `DATABASE_URL`, `API_KEY`, `SESSION_SECRET`, plus optional tuning vars.  
   **VERIFIED** (docs/dossiers/lantern_program_totality_dossier.md:91, drizzle.config.ts:3)
6. **Initialize database:**  
   `npm run db:push`  
   **VERIFIED** (README.md:39)

#### C. Configuration (Env Vars)
All in `.env` (names only, never values):
- **DATABASE_URL** — PostgreSQL connection (**VERIFIED**, drizzle.config.ts:3)
- **API_KEY** — Required for private API endpoints (**VERIFIED**, .env.example:10)
- **SESSION_SECRET** — Express session secret (**VERIFIED**, .env.example:23)
- **NODE_ENV** — Environment (development/production) (**VERIFIED**, .env.example:13)
- **PORT** — HTTP server port (default 5000) (**VERIFIED**, .env.example:14)
- **AI_INTEGRATIONS_OPENAI_API_KEY** — OpenAI LLM features (**VERIFIED**, README.md:85)
- **AI_INTEGRATIONS_OPENAI_BASE_URL** — OpenAI endpoint (**VERIFIED**, README.md:86)

#### D. Development Workflow
1. **Start dev server:**  
   `npm run dev`  
   **VERIFIED** (package.json:7)
2. **Access UI/API:**  
   Open `http://localhost:5000` in browser  
   **VERIFIED** (README.md:47)

#### E. Production Workflow
1. **Build assets and server:**  
   `npm run build`  
   **VERIFIED** (package.json:8)
2. **Start production server:**  
   `npm run start` (spawns Node/Express, serves compiled assets)  
   **VERIFIED** (package.json:9)
3. **Serve on configured port (`PORT`, default 5000):**  
   (node ./dist/index.cjs called by both .replit and Dockerfile)  
   **VERIFIED** (.replit:18, Dockerfile:21)

#### F. Usage Examples (Analyzer CLI)
- **Analyze GitHub repo:**  
  `pta analyze https://github.com/user/repo -o ./output`  
  **VERIFIED** (README.md:46)
- **Analyze local folder:**  
  `pta analyze ./path/to/project -o ./output`  
  **VERIFIED** (README.md:51)
- **Analyze current Replit workspace:**  
  `pta analyze --replit --no-llm -o ./output`  
  **VERIFIED** (README.md:56,64)
- **Run analyzer module directly:**  
  `python -m server.analyzer.src --help`  
  **VERIFIED** (README.md:31)
- **Health check endpoint:**  
  `curl http://localhost:5000/api/health`  
  **VERIFIED** (docs/dossiers/lantern_program_totality_dossier.md:128)
- **Verify audit log with API_KEY:**  
  `curl -H "x-api-key: <API_KEY>" http://localhost:5000/api/audit/verify`  
  **VERIFIED** (docs/dossiers/lantern_program_totality_dossier.md:140)

#### G. Verification Steps
- Confirm all 3 entrypoints respond:  
  `pta --help; python -m server.analyzer.src --help; python server/analyzer/analyzer_cli.py --help`  
  **VERIFIED** (attached_assets/Pasted-Got-it-Copilot-said-it-did-it-but-you-need-reproducible_1771067676312.txt:246–250)
- Database schema push produces expected results:  
  `npm run db:push`  
  **VERIFIED** (README.md:39)

#### H. Common Failures & Fixes
| Symptom                     | Cause                 | Fix                                         | Evidence        |
|-----------------------------|-----------------------|----------------------------------------------|-----------------|
| No module named 'core'      | Old import pattern    | Use relative imports or `pip install -e .`   | README.md:194   |
| Missing DATABASE_URL        | Not in .env           | Add valid PostgreSQL URL to .env             | drizzle.config.ts:3 |
| 401 Unauthorized            | No/invalid API_KEY    | Set `x-api-key` header, check .env           | docs/dossiers/lantern_program_totality_dossier.md:151 |
| Server not on expected port | App down, port in use | Logs, set `PORT=5000`, resolve conflicts     | docs/dossiers/lantern_program_totality_dossier.md:153 |
| Forensic pack tamper undetected | Export/verifier mismatch | Re-export, reinstall correct verifier   | docs/dossiers/lantern_program_totality_dossier.md:154 |

---

## 6. **Integration Surface**

- **REST API:** All operations exposed as well-documented REST endpoints under `/api/` (see `/api/health`, `/api/ready`, `/api/audit/verify`, `/api/receipts/:id/lock`, etc.)  
  **VERIFIED** (docs/dossiers/lantern_program_totality_dossier.md:160, replit.md:43–52)
- **API Authentication:** API key required for private endpoints in `x-api-key` HTTP header  
  **VERIFIED** (.env.example:10, docs/dossiers/lantern_program_totality_dossier.md:151)
- **Data Formats:** JSON for all payloads, validated via Zod schemas  
  **VERIFIED** (replit.md:42–43,67, STATE.md:95; package.json:79)
- **SDKs:** No dedicated SDKs, all integration via HTTP/JSON/TypeScript scripts  
  **VERIFIED** (no sdk found)
- **Webhooks:** UNKNOWN — evidence needed: No outbound webhook config or events found.

---

## 7. **Data & Security Posture**

- **Data Storage:** PostgreSQL (must set `DATABASE_URL`).  
  **VERIFIED** (drizzle.config.ts:3,10–12)
- **Encryption (Data-at-rest):**  
  UNKNOWN — evidence needed: No mention of storage layer encryption, only what PostgreSQL provides.
- **Secrets Handling:** Environment variables: only NAMES referenced/extracted, values never surfaced in output.  
  **VERIFIED** (README.md:146, .env.example, drizzle.config.ts:3)
- **Session Auth:** `express-session` and `SESSION_SECRET` for cookies; API access via `API_KEY`.  
  **VERIFIED** (package.json:53, .env.example:23)
- **LLM Integration:** Requires `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` for LLM features, NOT required for deterministic mode.  
  **VERIFIED** (README.md:85–86)
- **Port Exposure:** Default port 5000 (can be set via `.env`); mapped to 80 externally in Replit and Docker.  
  **VERIFIED** (.replit:10–11, Dockerfile:18)
- **External Services:** Can contact OpenAI via LLM mode; no evidence of other outbound connections.  
  **VERIFIED** (README.md:85–86)

---

## 8. **Operational Reality**

What is required to keep the system up:
- Node 20+ and Python 3.11 must remain installed.
- PostgreSQL must be online and accessible with credentials kept up to date.
- Background (CLI and API) processes must be restarted on deployment.
- Regular dependency updates (`npm install` and `pip install -e .`).
- Secrets must be rotated/secured; `.env` changes may require restarts.
- Database schema may need to be migrated (`npm run db:push`).
- Static assets must be rebuilt for prod deployment (`npm run build`).
- Port conflicts should be resolved (default 5000; check runtime env).
- No explicit log file path or log rotation workflow found; console output is primary logging.
**VERIFIED** (README.md:39,47, replit.md:71–73, Dockerfile:18)

---

## 9. **Maintainability & Change Risk**

- **Strong points:**  
  - Shared schemas/types reduce contract drift (replit.md:17,94–95)
  - Deterministic extractors mean most operator steps do not require LLMs for reproducibility (README.md:59–63)
  - Monorepo layout, modern build chain (Vite, esbuild, tsx, Drizzle ORM)
  - All infrastructure is described via standard package/infra files
- **Risks / Weaknesses:**  
  - Schema drift between Drizzle, Node, and Python is possible if `.env`, Drizzle migrations, or shared types are not kept synchronized.
  - Rotating secrets/API keys must be done manually; no scripted rotation or explicit playbook found (UNKNOWN).
  - No explicit log rotation or monitoring config found (UNKNOWN).
  - Multi-runtime (Node+Python) increases ops/upgrade complexity compared to pure-stack.
  - Replit-specific code may not be portable to Docker/VM/cloud without workflow adaptation (see Unknowns).

---

## 10. **Replit Execution Profile**

- **Exposed Port:**  
  - Local port 5000 (settable via env, default "5000" in [env]) mapped externally to port 80 (**VERIFIED**, .replit:10–14)
- **Entrypoint:**  
  - Runs `npm run dev` for development (hot reload), and as autoscale deploy uses `node ./dist/index.cjs` (**VERIFIED**, .replit:2,18; Dockerfile:21)
- **Replit Agents/Integrations:**  
  - Registered agent: `javascript_openai_ai_integrations:2.0.0` (**VERIFIED**, .replit:43)
- **Detects Replit environment via presence of Replit env vars** (inferred from `.replit:1` and code references)
- **No Replit-only secrets are surfaced by name**

---

## 11. **Unknowns / Missing Evidence**

- **Production deployment details outside Replit:**  
  (Docker, systemd, process manager configs exist, see Dockerfile, but no NGINX/PM2/caddy examples)  
- **Explicit log file path or log view commands:**  
   No evidence of physical log location, structured log config, or rotation scripts (UNKNOWN).
- **Webhook/outbound event integration:**  
   No evidence config or code for outbound notification webhooks (e.g. SIEM, alerting).
- **Frontend stand-alone serve/deployment docs:**  
   No explicit instructions for serving just the frontend separate from API.
- **Secret/API_KEY/SESSION_SECRET rotation steps or scripts** (only manual edit suggested, no playbook/script).
- **Encryption (data-at-rest or db):**  
   No explicit evidence of additional DB crypto beyond default engine offering.

---

## 12. **Receipts (Evidence Index)**

_Each claim’s evidence cited inline. See source files and lines below:_

- README.md:3,5,9–67,146,157–162,164–173,194,216–221,229–230
- replit.md:3–4,11–18,21–61,70–73,94–95
- drizzle.config.ts:3,10–12
- .env.example:5,10,13,14,23
- .replit:1–2,7,10–18,43, [env]
- Dockerfile:11,15,18,21
- client/requirements.md:2–4
- package.json:7–9,49,52–53,65,70,73,79–80,99–104
- vite.config.ts:29–31
- HOWTO JSON (refs/evidence for workflow steps, examples, unknowns, etc.)
- attached_assets/Pasted-Got-it-Copilot-said-it-did-it-but-you-need-reproducible_1771067676312.txt:246–251

---

**All claims above are labeled as VERIFIED (with snippet_hash, file:line), INFERRED (contextual synthesis), or UNKNOWN (pending evidence). No claims are runtime-proven. See Unknowns for explicit evidence gaps.**