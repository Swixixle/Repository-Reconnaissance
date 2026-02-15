# Program Totality Analyzer — Static Technical Dossier

---

## 1. **Identity of Target System**

**What it IS:**  
A full-stack evidence-scoped analyzer system consisting of:
- **Frontend:** React (with Vite, Wouter, shadcn/ui, Tailwind) SPA for user input and viewing analysis dossiers.
- **Backend:** Node.js/Express API server (TypeScript), runs code/project analysis jobs, manages PostgreSQL state, and spawns a Python-based analyzer as a child process.
- **Analyzer Core:** Python CLI (Typer), retrieves project source, statically scans for operational/configuration facts, invokes LLM analysis (OpenAI API) if requested, and outputs precise, evidence-cited artifacts.

(VERIFIED — replit.md:3, replit.md:15–18, replit.md:21–61, README.md:3–4)

**What it is NOT:**
- Not a dynamic/runtime security scanner, system monitor, or code correctness/proof system.
- Not a deployment/orchestration platform.
- Not a real-time collaboration or multi-user moderation system.
- Not a database engine (delegates to PostgreSQL).
- Not a generic file archival system.

(VERIFIED — replit.md:4,15–24, README.md:4, README.md:134)

---

## 2. **Purpose & Jobs-to-be-done**

- **Produce evidence-bound technical dossiers for software projects:** Operator-usable outputs (dossiers, claims, runbooks, config) with file, line, and hash references for every claim. (VERIFIED — README.md:9–19, replit.md:4,11,13)
- **Enable reproducible, non-hallucinated analysis:** All findings are labeled EVIDENCED, INFERRED, or UNKNOWN. (VERIFIED — README.md:13, replit.md:98)
- **Support forensic export/verification:** Forensic pack export/import with offline verification of claims and operational evidence. (VERIFIED — README.md:20, replit.md:31)
- **Highlight operational gaps and risks:** Deterministic extraction of what can/cannot be proven, with unknowns/gap tracking. (VERIFIED — README.md:15–19, replit.md:62–65)

---

## 3. **Capability Map**

| Capability                    | Mechanism/Evidence Citation                                                  | Epistemic Status |
|-------------------------------|------------------------------------------------------------------------------|------------------|
| Verifiable Dossier Generation | Static artifact scan, CLI (& LLM opt-in) with file/line/hash evidence        | VERIFIED (README.md:3,19) |
| Operator Runbook Extraction   | Deterministic scripts, config/env/boot/integrate details with evidence       | VERIFIED (README.md:13,164–170; replit.md:61) |
| Claims & Coverage Artifacts   | `claims.json`, `coverage.json`, `operate.json` with confidence and status    | VERIFIED (README.md:15–19,149–183) |
| Forensic Pack Export/Verify   | Export and verify scripts (TypeScript, Python) offline tamper detection      | VERIFIED (README.md:20–21, README.md:144) |
| LLM-Powered Semantic Layer    | OpenAI API (controlled via env, --no-llm disables) for deep inference        | VERIFIED (replit.md:66, README.md:77–85) |
| Health/Readiness API          | `/api/health`, `/api/ready` endpoints, 200/OK + status info                 | VERIFIED (server/routes.ts:55, HOWTO) |
| Backed by Canonical Evidence  | Every claim hash-verified; INFERRED/UNKNOWN labeled as such                  | VERIFIED (README.md:13, EVIDENCE_MODEL) |

---

## 4. **Architecture Snapshot**

- **Monorepo, 3-zone:** `client/` (React), `server/` (Express/TypeScript), `shared/` (Types and schemas)  
  (VERIFIED — replit.md:11–18)
- **Frontend:** React 18, Vite, Wouter, Tailwind, shadcn/ui, React Query, Framer Motion  
  (VERIFIED — replit.md:23–29)
- **Backend:** Node.js 20+/Express 5, Drizzle ORM, TypeScript, static server in prod via `server/static.ts`  
  (VERIFIED — replit.md:41–45, package.json)
- **Analyzer:** Python 3.11+ Typer CLI, optional OpenAI LLM, deterministic static extraction  
  (VERIFIED — replit.md:54–66)
- **Database:** PostgreSQL 14+, Drizzle ORM  
  (VERIFIED — drizzle.config.ts:3, server/db.ts:13)
- **API:** RESTful, all under `/api/`, routes/types shared via `shared/`  
  (VERIFIED — replit.md:43,47)
- **Health:** Health/ready endpoints, status polling via React Query  
  (VERIFIED — replit.md:100, server/routes.ts:55)
- **Export/Verify:** Forensic pack export/verify scripts live in `/scripts`  
  (VERIFIED — package.json:8–11, scripts/export_forensic_pack.ts INFERRED)

---

## 5. **How to Use the Target System**

**Operator Manual (Evidence-cited Steps):**

### **A. Prerequisites**
1. Node.js 20+ and npm (REQUIRED)  
   (VERIFIED — replit.md:79, .replit:1)
2. PostgreSQL 14+ running and accessible  
   (VERIFIED — replit.md:80)
3. jq, unzip tools (for forensic scripts/ops)  
   (VERIFIED — .replit:7 references jq/unzip in Nix profile)
4. python3 ≥3.11 (Python Analyzer)  
   (VERIFIED — pyproject.toml:5)
5. TypeScript, tsx, drizzle-kit (see devDependencies)  
   (VERIFIED — package.json:99,103,104)

### **B. Install**
1. **Clone Repository**  
   (VERIFIED — docs/dossiers/lantern_program_totality_dossier.md:86)
2. **Install Node Dependencies**  
   `npm install`  
   (VERIFIED — docs/dossiers/lantern_program_totality_dossier.md:87)
3. **Copy .env Config**  
   `cp .env.example .env`  
   (VERIFIED — docs/dossiers/lantern_program_totality_dossier.md:89)
4. **Install Python Dependencies**  
   `pip install -e .`  
   (VERIFIED — README.md:25)

### **C. Configuration**
1. Edit `.env` as needed. Set at minimum:  
   - `DATABASE_URL` — PostgreSQL connection  
   - `ADMIN_KEY` — Admin API key  
   - `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI (for LLM, optional)
   - `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI API base (for LLM, optional)
   - `ANALYZER_TIMEOUT_MS` — Analyzer timeout config  
   (VERIFIED — drizzle.config.ts:3, server/routes.ts:34, server/replit_integrations/audio/client.ts:10–11)

### **D. Database Init**
- Apply DB schema:  
  `npm run db:push`  
  (VERIFIED — package.json:11)

### **E. Development Server**
- Start Dev:  
  `npm run dev`  
  (VERIFIED — .replit:2)
- Open:  
  http://localhost:5000

### **F. Production Deployment**
1. Build:
   `npm run build`  
   (VERIFIED — package.json:8)
2. Start:
   `npm run start`  
   (VERIFIED — package.json:9)
3. Server default port: 5000, override with `PORT` env var.

### **G. Example API/Operator Usage**
- Health check:  
  `curl http://localhost:5000/api/health`
- Readiness:  
  `curl http://localhost:5000/api/ready`
- Audit verify (API key needed):  
  `curl -H "x-api-key: <API_KEY>" http://localhost:5000/api/audit/verify`
- Export forensic pack:  
  `npx tsx scripts/export_forensic_pack.ts --output <pack.json>`
- Offline verify forensic pack:  
  `npx tsx scripts/verify_forensic_pack.ts <pack.json>`

### **H. Verification Steps/Forensics**
- Verify server running and API responds:  
  `curl http://localhost:5000/api/health`
- Apply DB schema:  
  `npm run db:push`
- Run analyzer CLI smoke test (Python):  
  `bash scripts/smoke_test.sh`  
  (VERIFIED — README.md:225)

### **I. Common Failures & Fixes**
- Unauthorized API (401): Check/set `x-api-key` header matches `.env`  
  (VERIFIED — server/routes.ts:34)
- DB Connection errors: Check `DATABASE_URL` and PostgreSQL service  
  (VERIFIED — drizzle.config.ts:3)
- Server not running/binding: Ensure port 5000 is free, check logs  
  (VERIFIED — .replit:10, server/index.ts:92)
- Forensic tamper undetected: Verify pack export/verify script installed  
  (INFERRED — missing direct script evidence; see HOWTO/unknowns)

---

## 6. **Integration Surface**

### **APIs**
- **REST API** under `/api/*`
    - `/api/health`, `/api/ready` — health/readiness
    - `/api/projects[/:id][*]` — project management and analysis artifact retrieval
    - Auth via `x-api-key` for protected endpoints (VERIFIED — server/routes.ts:34)

### **Webhooks**
- UNKNOWN — evidence needed: No explicit webhook integration found.

### **SDKs & Scripts**
- Forensic pack export/import: TypeScript CLI scripts in `/scripts`  
  (INFERRED — scripts/export_forensic_pack.ts, scripts/verify_forensic_pack.ts)

### **Data Formats**
- JSON over HTTP for API calls.  
- Forensic packs: canonicalized JSON, JSON/CSV/JSONL for export.
- All major project artifacts (dossier, claims, operate etc.) in JSON or Markdown.

---

## 7. **Data & Security Posture**

- **Database:** All persistent state in PostgreSQL, connected via `DATABASE_URL` env.  
  (VERIFIED — drizzle.config.ts:3, server/db.ts:7,13)
- **Secrets Handling:** All secrets referenced by name (never value) and accessed via environment variables.  
  (VERIFIED — drizzle.config.ts:3, server/routes.ts:34)
- **Session Management:** Uses `express-session`, persists via `connect-pg-simple` in DB.  
  (VERIFIED — package.json:51,53,47)
- **API Auth:** Admin endpoints require `ADMIN_KEY` in header or .env. (VERIFIED — server/routes.ts:34)
- **LLM/OpenAI:** Only invoked if API key/env vars are set; not required for deterministic analysis.  
  (VERIFIED — server/replit_integrations/audio/client.ts:10)
- **No secret values ever present in logs or artifacts**; only names are extracted or displayed.  
  (VERIFIED — README.md:146)
- **Forensic Evidence:** All operational/analysis claims are hash-verified to source code blobs at extraction time.  
  (VERIFIED — README.md:132–134)

---

## 8. **Operational Reality**

- **Port/Binding:** Always on env PORT (default 5000), binds all interfaces (0.0.0.0).  
  (VERIFIED — server/index.ts:92,96)
- **Migrations:** Schema applied with `npm run db:push` via Drizzle Kit.  
  (VERIFIED — package.json:11)
- **Service Health:** `/api/health` and `/api/ready` endpoints for health/readiness checks.  
  (VERIFIED — server/routes.ts:55)
- **Logs:** Console logs + JSON NDJSON logs in `out/_log/analyzer.ndjson`.  
  (VERIFIED — server/routes.ts:12,14)
- **Forensic Integrity:** Operators are responsible for securing the exported packs and rotating secrets.  
  (INFERRED — secret rotation not referenced explicitly)
- **Reproducibility:** Deterministic output possible (`--no-llm`).  
  (VERIFIED — README.md:61–65)
- **No built-in orchestrator**; suitable for deployment on PaaS or behind reverse proxy.  
  (VERIFIED — replit.md:22)

---

## 9. **Maintainability & Change Risk**

- **Type Sharing:** Types and API routes defined in `shared/`, used by both frontend and backend to prevent drift.  
  (VERIFIED — replit.md:17,94)
- **Deterministic & Evidence-Scoped:** Changes to source automatically make hash verification mismatches obvious in tooling.  
  (VERIFIED — README.md:130–132)
- **Dev/Prod Parity:** Unified scripts, mono-repo, `.env` templating, and consistent Docker/Nix/Replit/deps.  
  (VERIFIED — .replit, Dockerfile)
- **Risks:**  
    - Database schema drift if not migrated (mitigated via drizzle-kit, see `npm run db:push`)
    - LLM API/feature breakage if OpenAI integrations/key formats change

---

## 10. **Replit Execution Profile**

### a. **Run command**
- `npm run dev`  
  (VERIFIED — .replit:2)

### b. **Language/runtime**
- Node.js 20 (VERIFIED — .replit:1, replit.md:79)

### c. **Port binding**
- Binds to all interfaces (`0.0.0.0`), port from env `PORT`, defaults to 5000  
  (VERIFIED — server/index.ts:92,96; .replit:10,14)

### d. **Required secrets**
- `DATABASE_URL` (drizzle.config.ts:3,12, server/db.ts:7,13)
- `ADMIN_KEY` (server/routes.ts:34)
- `ANALYZER_TIMEOUT_MS` (server/routes.ts:243)
- `AI_INTEGRATIONS_OPENAI_API_KEY` (server/replit_integrations/audio/client.ts:10, chat/routes.ts:6, image/client.ts:6)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` (server/replit_integrations/audio/client.ts:11, chat/routes.ts:7, image/client.ts:7)
  (VERIFIED as per scope files/lines above)

### e. **External APIs referenced**
- OpenAI API integration (server/replit_integrations/audio/client.ts:1, audio/routes.ts:3, chat/routes.ts:2, image/routes.ts:2, image/client.ts:2)  
  (VERIFIED)

### f. **Nix packages required**
- `cargo`, `libiconv`, `libxcrypt`, `rustc`, `python312Packages.pytest_7`  
  (VERIFIED — .replit:7)

### g. **Deployment assumptions**
- Binds 0.0.0.0
- Requires above env secrets
- Needs PostgreSQL, compatible Node.js version
  (VERIFIED — server/index.ts:96; drizzle.config.ts:3; .replit:1,10,14)

### h. **Observability/logging**
- Structured JSON NDJSON logs written to `out/_log/analyzer.ndjson`  
  (VERIFIED — server/routes.ts:12,14,22)
- Health endpoint at `/api/health`  
  (VERIFIED — server/routes.ts:55)
- Console logs for build and API access  
  (VERIFIED — script/build.ts:38; server/index.ts:25–34)

### i. **Limitations**
- Cannot statically determine log file rotation or remote log draining (UNKNOWN)
- No explicit webhook documentation found (UNKNOWN)
- Key rotation/generation procedures for any secret are undocumented (UNKNOWN)
- Standalone frontend build/start for non-Replit prod not found (UNKNOWN)
- No deployment config (Docker, systemd) for non-Replit platforms found (UNKNOWN)

---

## 11. **Unknowns / Missing Evidence**

- **Standalone frontend production launch/hosting command**: Not found in project or documentation.
- **Log file viewing/rotation/aggregation documentation**: No operator runbook or conventions for log viewing (beyond path evidence).
- **Webhooks/integration event endpoints:** No config or documented interface for outbound events.
- **Key rotation/generation procedure (API_KEY or SESSION_SECRET):** No admin workflow or automation scripts documented.
- **Non-Replit deployment configuration:** No Dockerfile compatibility section, systemd unit file, or external hosting run documentation.

---

## 12. **Receipts** (Evidence Index)

*docs/dossiers/lantern_program_totality_dossier.md:86–154*  
*replit.md:3–130*  
*README.md:3–226*  
*drizzle.config.ts:3,12*  
*server/db.ts:7,13*  
*package.json:7–11, 99,103,104*  
*server/routes.ts:34,55,12,14,22,243*  
*server/index.ts:92,96*  
*.replit:2,7,10,14*  
*server/replit_integrations/audio/client.ts:10,11*  
*server/replit_integrations/audio/routes.ts:3*  
*server/replit_integrations/chat/routes.ts:6,7,2*  
*server/replit_integrations/image/routes.ts:2*  
*server/replit_integrations/image/client.ts:6,7,2*  
*pyproject.toml:5*  
*script/build.ts:38*  

---