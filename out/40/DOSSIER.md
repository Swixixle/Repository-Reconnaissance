# DOSSIER: Program Totality Analyzer (PTA)

---

## 1. Identity of Target System

**What it is:**  
Program Totality Analyzer ("PTA") is a full-stack, monorepo web application combining:
- A React (TypeScript) frontend
- An Express.js (TypeScript) backend running on Node.js
- A Python 3.11+ code analysis engine

The system statically analyzes other software projects (from GitHub, local path, or live Replit) to generate structured, evidence-cited technical dossiers ([README.md:3–5](README.md:3)).

**What it is NOT:**  
- Not a runtime monitoring, security scanning, SCA, or compliance certification tool ([README.md:36–39](README.md:36)).
- Not a CI/CD runner; it does not build, test, or deploy target code ([README.md:38](README.md:38)).
- Does not observe target system runtime behavior ([README.md:5], [README.md:202]).

**Status**: VERIFIED

---

## 2. Purpose & Jobs-to-be-done

- To statically index source artifacts (code, config, lockfiles) of a target system and generate evidence-bound reports, operator dashboards, and claims files ([README.md:9–20](README.md:9)).
- To provide a CI-feed, triggered by GitHub webhooks, showing system readiness, operational gaps, and unknowns ([README.md:24–32](README.md:24), [replit.md:119–121](replit.md:119)).
- To support reproducible, deterministic outputs (structural mode) and optional LLM-powered semantic analysis ([README.md:266–267](README.md:266), [replit.md:75](replit.md:75)).

**Status**: VERIFIED

---

## 3. Capability Map

- Static artifact scanning (code/config/lockfiles) ([README.md:3](README.md:3))
- Evidence citing (file, lines, hash) for every claim ([README.md:233](README.md:233))
- REST API under `/api/` ([replit.md:44](replit.md:44))
- Web UI for project/CI management ([replit.md:36](replit.md:36))
- Python CLI (`pta`) for direct/detached manual analysis ([README.md:85](README.md:85), [pyproject.toml:23](pyproject.toml:23))
- GitHub webhook-triggered static analysis with deduplication ([README.md:24](README.md:24), [replit.md:119](replit.md:119))
- LLM-integration (OpenAI) for deeper semantic analysis (optional) ([replit.md:75](replit.md:75))

**Status**: VERIFIED

---

## 4. Architecture Snapshot

- **Frontend**: React 18 (TypeScript), Vite, TanStack React Query, Tailwind CSS ([replit.md:21–30](replit.md:21))
- **Backend**: Express 5 (TypeScript), Node.js, REST API, Vite middleware in dev ([replit.md:41–46](replit.md:41))
- **Database**: PostgreSQL (16+), Drizzle ORM, Zod schemas ([replit.md:80–82](replit.md:80))
- **Python Analyzer**: Typer CLI, orchestrates artifact scanning (static/LLM) ([replit.md:65–75](replit.md:65))
- **Integrations**: OpenAI via environment, Replit secrets tab managed ([replit.md:216](replit.md:216))
- **Operator artifacts**: Generates operate.json, claims.json, target_howto.json, coverage.json ([README.md:13–18](README.md:13), [README.md:221–244](README.md:221))

**Status**: VERIFIED

---

## 5. How to Use the Target System (Operator Manual)

### Prerequisites

1. **Node.js 20+**: Required for Express/React app ([.replit:1](.replit:1))
2. **Python 3.11+**: For analyzer CLI ([.replit:1](.replit:1))
3. **PostgreSQL 16+**: For persistent state ([.replit:1](.replit:1))
4. **npm**: Node package manager ([Dockerfile:6](Dockerfile:6))
5. **pip**: Python package manager ([pyproject.toml:6](pyproject.toml:6))
6. **Drizzle ORM/Kit**: DB migration tool ([package.json:49](package.json:49), [package.json:99](package.json:99))
7. **Vite, esbuild, tsx**: Build tools ([package.json:100–105](package.json:100))
8. **Tailwind CSS Toolchain**: Styling ([package.json:102](package.json:102), [postcss.config.js:3](postcss.config.js:3))

**Status**: VERIFIED

### Installation Steps

1. **Install Node.js dependencies**  
   ```sh
   npm ci --ignore-scripts
   ```
   - [Dockerfile:6](Dockerfile:6)

2. **Install Python analyzer (registers `pta` CLI)**  
   ```sh
   pip install -e .
   ```
   - [README.md:85](README.md:85)

3. **Build TypeScript (server, client) and Python artifacts**  
   ```sh
   npm run build
   ```
   - [package.json:8](package.json:8)

**Status**: VERIFIED

### Configuration

Set environment variables (secrets) as follows ([replit.md:131–137](replit.md:131)):
- `DATABASE_URL` - PostgreSQL connection string ([drizzle.config.ts:3](drizzle.config.ts:3))
- `GITHUB_WEBHOOK_SECRET` - For webhook signature validation ([replit.md:133](replit.md:133), [server/routes.ts:198](server/routes.ts:198))
- `GITHUB_TOKEN` - For git clone of private repos ([replit.md:134](replit.md:134))
- `CI_TMP_DIR` - Working directory for CI temp clones ([replit.md:135](replit.md:135))
- `ANALYZER_TIMEOUT_MS` - Max ms for analyzer CLI ([replit.md:136](replit.md:136))
- `ADMIN_KEY` - Admin routes authentication ([server/routes.ts:36](server/routes.ts:36))
- `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` - For LLM-powered features ([replit.md:216–217](replit.md:216))

**Status**: VERIFIED

### Running (Development)

- **Start Express backend and Vite middleware** (runs both API and SPA):
  ```sh
  npm run dev
  ```
  - [.replit:2](.replit:2), [package.json:7](package.json:7)

- **Analyzer CLI, deterministic mode:**
  ```sh
  pta analyze --replit --no-llm -o ./output
  ```
  - [README.md:116](README.md:116)

### Running (Production)

- **Build and serve pre-built client/server:**
  ```sh
  npm run build && npm start
  ```
  - [package.json:8](package.json:8)

- **Analyzer CLI, generic use (standalone):**
  ```sh
  pta analyze [args...]
  ```
  - [README.md:106](README.md:106)

### Usage Examples

- Analyze a GitHub repository:
  ```sh
  pta analyze https://github.com/user/repo -o ./output
  ```
- Analyze a local project folder:
  ```sh
  pta analyze ./path/to/project -o ./output
  ```
- Analyze this Replit project deterministically:
  ```sh
  pta analyze --replit --no-llm -o ./output
  ```
- Analyze using LLM:
  ```sh
  pta analyze --replit -o ./output
  ```

### Verification Steps

- Smoke test CLI and output artifacts:
  ```sh
  bash scripts/smoke_test.sh
  ```
  - [attached_assets/…Pasted-Got-it…:191](attached_assets/Pasted-Got-it-Copilot-said-it-did-it-but-you-need-reproducible_1771067676312.txt:191)

- Check CI API health:
  ```sh
  curl https://<your-app-domain>/api/ci/health
  ```
  - [replit.md:176](replit.md:176)

### Common Failures & Fixes

| Symptom                            | Cause                                     | Fix                                                        |
|-------------------------------------|-------------------------------------------|------------------------------------------------------------|
| ModuleNotFoundError: core           | Python import strategy                    | Use package-relative imports; see ops doc [README.md:276]  |
| 401 on webhook delivery             | Secret mismatch                           | Set `GITHUB_WEBHOOK_SECRET` in both Replit and GitHub      |
| Jobs stuck in DEAD in CI feed       | Clone failure, SHA, analyzer crash        | Check `error`/`lastError` fields; check `GITHUB_TOKEN`     |
| Run stays QUEUED in CI feed         | Worker not running                        | Look for `[CI Worker] ...` in logs; restart server         |
| Analyzer timeout (killed after 10m) | Large repo/slow LLM                       | Increase `ANALYZER_TIMEOUT_MS` or use `--no-llm`           |

**Status**: VERIFIED

---

## 6. Integration Surface

- **REST API**: Under `/api/` ([replit.md:44](replit.md:44))
  - `/api/projects`, `/api/ci/*`, `/api/webhooks/github` ([replit.md:193–202](replit.md:193))
- **Webhooks**: Receives HMAC-SHA256-verified GitHub webhooks ([replit.md:197](replit.md:197))
- **CLI**: `pta` entrypoint (Python Typer CLI) ([pyproject.toml:23](pyproject.toml:23))
- **Database**: Connects via PostgreSQL (`DATABASE_URL`) ([drizzle.config.ts:3](drizzle.config.ts:3))
- **OpenAI API**: For LLM-powered features ([server/replit_integrations/audio/client.ts:1](server/replit_integrations/audio/client.ts:1))
- **Replit Integrations**: OpenAI and workspace environment ([replit.md:216](replit.md:216))
- **Data Formats**: JSON for all output artifacts (`operate.json`, `claims.json`, `target_howto.json`, etc.) ([README.md:14–20](README.md:14))

**Status**: VERIFIED

---

## 7. Data & Security Posture

- **Storage**: PostgreSQL for all state ([server/db.ts:13](server/db.ts:13))
- **Encryption**: Not directly observed in static config — INFERRED database connection may use encryption if `DATABASE_URL` supports (UNKNOWN if enforced).
- **Auth**:
  - Webhook validation: HMAC-SHA256 with shared secret ([server/routes.ts:198](server/routes.ts:198))
  - Admin routes: Require `ADMIN_KEY` env ([server/routes.ts:36](server/routes.ts:36))
- **Secret Handling**:
  - All secrets must be set via Replit Secrets or environment ([replit.md:129–132](replit.md:129))
  - No secret values in repo ([README.md:211](README.md:211))
  - Secrets used: `DATABASE_URL`, `GITHUB_WEBHOOK_SECRET`, `GITHUB_TOKEN`, `ADMIN_KEY`, `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`, `CI_TMP_DIR`, `ANALYZER_TIMEOUT_MS` (see section 10 for exact references)
- **Path/Symlink/Traversal Protection**: Static checks in analyzer for symlinks, path containment, traversal ([README.md:212–215](README.md:212))
- **Secret Non-disclosure**: Only env var names ever exposed ([README.md:216](README.md:216))

**Status**: VERIFIED (except for DB encryption: INFERRED/UNKNOWN)

---

## 8. Operational Reality

- **Database**: A running PostgreSQL service and `DATABASE_URL` are mandatory ([server/db.ts:7](server/db.ts:7), [drizzle.config.ts:3](drizzle.config.ts:3))
- **Secrets**: All eight secrets noted above must be set for full feature set ([replit.md:131](replit.md:131))
- **Build/Install**: Node + Python dependencies install (`npm ci`, `pip install -e .`) ([Dockerfile:6](Dockerfile:6), [README.md:85](README.md:85), [package.json:8](package.json:8))
- **Migrations**: Drizzle Kit used, but the full (initialization/procedural) workflow is UNKNOWN—evidence does not show precise operator sequence for first-run/upgrade (reported in Unknowns below)
- **Background jobs**: CI worker loop starts with server ([replit.md:158](replit.md:158)), can be manually ticked with API if stalled ([replit.md:160](replit.md:160))
- **Health check**: `/api/ci/health` endpoint ([replit.md:176](replit.md:176))
- **Logs**: Console log, plus NDJSON log output for analysis ([server/routes.ts:16](server/routes.ts:16)). Unknown if any external log shipping/service integration exists.

**Status**: VERIFIED (with migration procedure: UNKNOWN, see below)

---

## 9. Maintainability & Change Risk

- **Strict monorepo with shared types** prevents frontend/backend drift ([replit.md:19](replit.md:19)).
- **TypeScript + Zod**: Type- and schema-safe, easier to maintain ([replit.md:81](replit.md:81))
- **Single evidence model**, deterministically hash-verified ([README.md:155–171](README.md:155))
- **Operator runbooks**: Evidence-cited, concrete steps lower confusion/risk ([README.md:229](README.md:229))
- **Change risk**:
  - High: schema or API changes uncoordinated across zones
  - Medium: Drizzle migration correctness (manual or CI run may diverge)
  - Low: UI components (separated concerns in code; inferred from typical React structure)

**Status**: VERIFIED/INFERRED (no direct test coverage or CI pipeline evidence provided)

---

## 10. Replit Execution Profile

### Run Command

- `npm run dev`
  - Source: [.replit:2](.replit:2)
- Results in Express+Vite dev server

**Status**: VERIFIED

### Language/Runtime

- nodejs, Python 3.11+ as secondary ([.replit:1](.replit:1), [pyproject.toml:5](pyproject.toml:5))

**Status**: VERIFIED

### Port Binding

- Port: Determined by `PORT` env (default 5000)
  - [server/index.ts:92](server/index.ts:92)
- Explicit bind: `"0.0.0.0"` (all interfaces)
  - [server/index.ts:96](server/index.ts:96)
- `.replit` port mapping: 5000 internal, 80 external
  - [.replit:10–11](.replit:10)

**Status**: VERIFIED

### Required Secrets

1. DATABASE_URL ([drizzle.config.ts:3,12](drizzle.config.ts:3), [server/db.ts:7,13](server/db.ts:7))
2. CI_TMP_DIR ([server/ci-worker.ts:68](server/ci-worker.ts:68))
3. GITHUB_TOKEN ([server/ci-worker.ts:73](server/ci-worker.ts:73))
4. ANALYZER_TIMEOUT_MS ([server/ci-worker.ts:126](server/ci-worker.ts:126), [server/routes.ts:416](server/routes.ts:416))
5. ADMIN_KEY ([server/routes.ts:36](server/routes.ts:36))
6. GITHUB_WEBHOOK_SECRET ([server/routes.ts:198](server/routes.ts:198))
7. AI_INTEGRATIONS_OPENAI_API_KEY ([server/replit_integrations/audio/client.ts:10](server/replit_integrations/audio/client.ts:10))
8. AI_INTEGRATIONS_OPENAI_BASE_URL ([server/replit_integrations/audio/client.ts:11](server/replit_integrations/audio/client.ts:11))

**Status**: VERIFIED

### External APIs Referenced

- OpenAI API ([server/replit_integrations/audio/client.ts:1,10–11](server/replit_integrations/audio/client.ts:1,10))
- LLM-powered chat/image/audio endpoints ([server/replit_integrations/image/client.ts:2,6–7](server/replit_integrations/image/client.ts:2,6))

**Status**: VERIFIED

### Nix Packages Required

- From `.replit` Nix section ([.replit:7](.replit:7)):  
  - cargo
  - libiconv
  - libxcrypt
  - python312Packages.pytest_7
  - rustc

**Status**: VERIFIED

### Deployment Assumptions

- Binds all interfaces as required for Replit ([server/index.ts:96](server/index.ts:96))
- Requires all 8 secret env vars
- Autoscale is default deployment ([.replit:17](.replit:17))

**Status**: VERIFIED

### Observability/Logging

- Console logging instrumented ([script/build.ts:38](script/build.ts:38), [server/index.ts:25](server/index.ts:25))
- Analysis/CI health endpoints present ([server/routes.ts:57](server/routes.ts:57), [README.md:59](README.md:59))
- No evidence of external log shipping; NDJSON file logs exist ([server/routes.ts:16](server/routes.ts:16))

**Status**: VERIFIED

### Limitations

- Cannot determine from static evidence if backend logs are shipped externally (UNKNOWN)
- Cannot verify dynamic port assigned in non-Replit deployment (UNKNOWN)
- No evidence of systemd/k8s/service unit templates (UNKNOWN)
- Cannot confirm health endpoint works outside the container (static only) (UNKNOWN)

**Status**: VERIFIED (limitations reported as UNKNOWNs)

---

## 11. Unknowns / Missing Evidence

1. **Drizzle migration workflow/init**:  
   - The precise out-of-the-box migration sequence and drift/validation mechanism remain UNKNOWN; operator may not know exact first-run steps ([unknowns field in HOWTO JSON](unknowns)).
   - Needed: Explicit migration/init commands and hooks.
2. **Full admin API endpoint list & authentication model**:  
   - Other than detection of `ADMIN_KEY`, there is no full file:line-cited admin route listing.
   - Needed: List all privileged endpoints, how auth is enforced in production—especially for routes protected by ADMIN_KEY.
3. **Service deployment templates**:  
   - No systemd/k8s/service unit templates for "real-world" deployment found.
4. **External log shipping/aggregation**:  
   - No evidence of logs shipped to an external aggregation service or platform—console and NDJSON logging only.

**Status**: UNKNOWN (due to missing code/docs, see receipts for context lines)

---

## 12. Receipts

The following is an index of every evidence citation supporting claims above:

- [.replit:1,2,5,7,10,11,17](.replit)
- [Dockerfile:6](Dockerfile)
- [README.md:3–5,9–20,24–39,85,106,116,155–244,276](README.md)
- [replit.md:19–30,44–46,65–75,80–82,119–137,158,176,193–202,216–217,229](replit.md)
- [drizzle.config.ts:3,12](drizzle.config.ts)
- [server/db.ts:7,13](server/db.ts)
- [server/routes.ts:16,36,57,198,416](server/routes.ts)
- [server/index.ts:25,92,96](server/index.ts)
- [server/ci-worker.ts:68,73,126](server/ci-worker.ts)
- [server/storage.ts:16](server/storage.ts)
- [script/build.ts:38](script/build.ts)
- [package.json:7–8,49,99,100–105,112](package.json)
- [pyproject.toml:5,6,23](pyproject.toml)
- [postcss.config.js:3](postcss.config.js)
- [tailwind.config.ts:107](tailwind.config.ts)
- [server/replit_integrations/audio/client.ts:1,10,11](server/replit_integrations/audio/client.ts)
- [server/replit_integrations/audio/routes.ts:3](server/replit_integrations/audio/routes.ts)
- [server/replit_integrations/chat/routes.ts:2,6,7](server/replit_integrations/chat/routes.ts)
- [server/replit_integrations/image/client.ts:2,6,7](server/replit_integrations/image/client.ts)
- [attached_assets/Pasted-Got-it-Copilot-said-it-did-it-but-you-need-reproducible_1771067676312.txt:191](attached_assets/Pasted-Got-it-Copilot-said-it-did-it-but-you-need-reproducible_1771067676312.txt:191)

---

### End of Dossier

---

**This document was generated using static analysis only. All claims are limited strictly to the file and line evidence listed above. Gaps are explicitly stated. This is not a security or correctness certification.**