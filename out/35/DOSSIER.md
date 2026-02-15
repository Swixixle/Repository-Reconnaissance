# LANTERN DOSSIER

## 1. Identity of Target System

**Lantern** is an evidentiary record system for investigative analysis, focused on extracting structured data ("packs", "dossiers") from unstructured text, facilitating human-curated investigative workflows, and generating reports with cryptographic auditability.  
[VERIFIED: LANTERN_SYSTEM_SNAPSHOT.md:10, LANTERN_SYSTEM_SNAPSHOT.md:24-47]

**It is NOT:**
- An autonomous verdict-issuing, truth-predicting, or fact-generating system.
- A recommendation, inference, or forecasting tool.
- A system that runs fully without human data curation.
[VERIFIED: LANTERN_SYSTEM_SNAPSHOT.md:15-20]

---

## 2. Purpose & Jobs-to-be-done

- **Extraction:** Parse unstructured text into structured entities, quotes, metrics, and events ("Extract Pack"), preserving provenance via offset mapping.
- **Curation:** Permit analysts to promote "Extract Packs" to "Dossier Packs", curate factual relationships, claims, and evidence.
- **Heuristic Analysis:** Compute report findings (e.g., influence hubs, funding flows) from curated data, with explicit minimum data thresholds.
- **Audit Trail:** Allow all analytical artifacts to be exported, versioned (Markdown/YAML), and integrity-checked (SHA-256).
- **Comparison:** Compare two dossiers for structural overlap, binding results cryptographically.
[VERIFIED: LANTERN_SYSTEM_SNAPSHOT.md:50-60, LANTERN_SYSTEM_SNAPSHOT.md:61-82, LANTERN_SYSTEM_SNAPSHOT.md:110-128, LANTERN_SYSTEM_SNAPSHOT.md:133-137]

---

## 3. Capability Map

**Capabilities (as evidenced):**
- Rule-based text extraction (entities, quotes, metrics, events) [VERIFIED: LANTERN_CORE_BOUNDARY.md:8-48]
- Deterministic extraction with provenance validation (no guessing/randomness) [VERIFIED: M2_SUMMARY.md:34-43]
- Client UI for pack/dossier management [VERIFIED: LANTERN_SYSTEM_SNAPSHOT.md:140-150, AUDIT_REPORT.md:144-148]
- Curation UI for editing entities, edges (relationships), claims, evidence [VERIFIED: LANTERN_SYSTEM_SNAPSHOT.md:33,146]
- Heuristic findings (influence hubs, funding gravity, enforcement, sensitivity analysis) [VERIFIED: LANTERN_SYSTEM_SNAPSHOT.md:60-82]
- Export of reports as Markdown with YAML, print-optimized output [VERIFIED: LANTERN_SYSTEM_SNAPSHOT.md:36, LANTERN_SYSTEM_SNAPSHOT.md:38, LANTERN_SYSTEM_SNAPSHOT.md:54, LANTERN_SYSTEM_SNAPSHOT.md:119]
- SHA-256 fingerprinting for audit [VERIFIED: LANTERN_SYSTEM_SNAPSHOT.md:110-117]
- Regression testing of extraction outputs [VERIFIED: BOOK_OF_FIXES.md:91-103, M2_SUMMARY.md:37]
- Library/Compare/Report user experiences [VERIFIED: LANTERN_SYSTEM_SNAPSHOT.md:144-148]

**Notable non-capabilities (by design):**
- No predictive/ML/suggestion logic in extraction [VERIFIED: LANTERN_SYSTEM_SNAPSHOT.md:16, LANTERN_CORE_BOUNDARY.md:37,103]
- No auto-updating analytical artifacts after report generation [VERIFIED: LANTERN_SYSTEM_SNAPSHOT.md:119-122]
- No network calls for extraction/analysis (local only by default) [VERIFIED: AUDIT_REPORT.md:47]

---

## 4. Architecture Snapshot

- **Frontend:** React UI (Vite, Tailwind, shadcn/ui), with TypeScript and client-side routing ("wouter").
- **Backend:** Express server mainly for static asset hosting and API placeholders, not connected to data curation or extraction as of evidence date.
- **Core Logic:** Extraction engine and heuristics implemented in dependency-minimized modules, designed for deterministic "core boundary" isolation.
- **Persistence:** Browser `localStorage` (key: "lantern_packs") is the system of record for packs/dossiers. Optional PostgreSQL via Drizzle ORM is scaffolded but not active.
- **Exports:** Artifacts can be exported as Markdown (with SHA-256 fingerprints).
[VERIFIED: AUDIT_REPORT.md:8-23,36-44, AUDIT_REPORT.md:53-57, LANTERN_CORE_BOUNDARY.md:6-70, LANTERN_SYSTEM_SNAPSHOT.md:36, LANTERN_SYSTEM_SNAPSHOT.md:38, CHANGELOG.md:11,36,39,67]

---

## 5. How to Use the Target System

### Prerequisites

1. **Node.js v16+** (v20 recommended for CI and Replit scripts)  
   [VERIFIED: README.md:26, .github/workflows/ci.yml:20, .replit:1]
2. **npm** (or yarn) for dependency management  
   [VERIFIED: README.md:27, .github/workflows/ci.yml:21]
3. (Optional) **PostgreSQL 16+** only if running database migrations (not required for standard app use)  
   [VERIFIED: drizzle.config.ts:10, .replit:1]
4. **Modern web browser** (for the UI)
5. **git** for repository cloning  
   [VERIFIED: README.md:31]

### Installation

1. **Clone the repository:**  
   `git clone https://github.com/Swixixle/Lantern.git`  
   [VERIFIED: README.md:31]
2. **Move into the project directory:**  
   `cd Lantern`  
   [VERIFIED: README.md:32]
3. **Install dependencies:**  
   `npm install`  
   [VERIFIED: README.md:33]

### Configuration

- **PORT** (env variable): Dev server port (default: 5000)  
  [VERIFIED: .replit:18]
- **DATABASE_URL** (env variable): Connection string for Drizzle ORM, used only for migration commands  
  [VERIFIED: drizzle.config.ts:3]

### Running in Development

1. **Start dev stack (client + server, hot-reload):**  
   `npm run dev`  
   [VERIFIED: README.md:40]
2. **Run only client (Vite dev server, port 5000):**  
   `npm run dev:client`  
   [VERIFIED: AUDIT_REPORT.md:30]

### Building & Running in Production

1. **Build the application:**  
   `npm run build`  
   [VERIFIED: README.md:57]
2. **Start production server (after build):**  
   `npm start`  
   [VERIFIED: README.md:58]

### Verification / Testing

- **TypeScript type check:**  
  `npm run check`  
  [VERIFIED: package.json:11, .github/workflows/ci.yml:27]
- **Build test:**  
  `npm run build`  
  [VERIFIED: BOOK_OF_FIXES.md:32]
- **Unit tests:**  
  `npx vitest run client/src/lib/tests/unit/`  
  [VERIFIED: M2_SUMMARY.md:62]
- **Manual app boot check:**  
  Open http://localhost:5000 in browser; Library page should load.  
  [VERIFIED: AUDIT_REPORT.md:30]

### Common Failure Scenarios & Remedies

| Symptom | Probable Cause | Fix Steps |
|---|---|---|
| White screen/app does not load | React parse/build error | Check console, fix code, run `npm run build` until passing; use /__boot dev route [VERIFIED: README.md:82-87] |
| Port conflict (EADDRINUSE) | Port 5000 occupied | Stop all workflows, wait, restart [VERIFIED: README.md:88-97] |
| Data loss (empty library after refresh) | Browser localStorage cleared | Export packs as JSON regularly (data unrecoverable post-cache clear) [VERIFIED: AUDIT_REPORT.md:56-57] |
| Test suite fails on migration/validation | Type guard/schema logic drift | Reconcile type guards/migrations, re-run `npm run build` [VERIFIED: BOOK_OF_FIXES.md:47-97] |

---

## 6. Integration Surface

### APIs

- `/api/config` – Returns public config, field: `public_readonly`; used for gating UI [VERIFIED: client/src/lib/config.tsx:19,26]
- `/api/auth/demo-key` – Demo/test login provisioning (when not in readonly) [VERIFIED: client/src/App.tsx:56,72]
- `/api/auth/status` – API key verification [VERIFIED: client/src/App.tsx:109]
- Other endpoints such as `/api/report`, `/api/reports`, `/api/report/generate` are **not evidenced as implemented**. [INFERRED: see Unknowns]

### Data Formats

- Extract/Dossier Pack schemas (see `LANTERN_SYSTEM_SNAPSHOT.md:26-35`, `LANTERN_CORE_BOUNDARY.md:54-84`)
- Export: Markdown with YAML frontmatter, plus SHA-256 hash in the output [VERIFIED: LANTERN_SYSTEM_SNAPSHOT.md:36,38,111]

### SDKs

- No external SDK usage evidenced; all core logic is internal. [VERIFIED: LANTERN_CORE_BOUNDARY.md:8-23]

---

## 7. Data & Security Posture

### Storage

- **Primary:** Browser `localStorage` under key `lantern_packs` [VERIFIED: AUDIT_REPORT.md:56]
- **Server:** MemStorage class implemented in backend (RAM only, _not active_) [VERIFIED: AUDIT_REPORT.md:42]
- **Database:** PostgreSQL schema (Drizzle ORM) is defined but **unused** as of last audit [VERIFIED: AUDIT_REPORT.md:53]

### Encryption & Hashing

- No evidence of data-at-rest encryption (uses browser APIs)
- SHA-256 for report/dossier fingerprinting [VERIFIED: LANTERN_SYSTEM_SNAPSHOT.md:110]
- No usage or requirement for user-supplied secrets for standard browser operation

### Authentication/Authorization

- **Read/Write gating:** `/api/config` public_readonly flag gates full-edit UI [VERIFIED: client/src/lib/config.tsx:26, client/src/App.tsx:45,95]
- **API Key login:** UI requests API key on startup (unless in read-only mode) [VERIFIED: client/src/App.tsx:100-119]
- **Session management/integrations:** Passport, express-session, connect-pg-simple listed as dependencies, but no server instance/handler is evidenced active [INFERRED from package.json:55,61,72]
- **Secret handling:** No secret values exposed. Database URL for Drizzle can be injected via environment.  
- **No telemetry/analytics evidenced** (no 3rd party tracking) [VERIFIED: AUDIT_REPORT.md:49]
- **No crypto adapter/wallet integration evidenced** (see Unknowns)

---

## 8. Operational Reality

**Running/Upgrades:**
- Runs fully client-side for main workflows; server is currently static asset host.
- For standard use, only Node (and npm), browser, and optionally git required.
- No Dockerfile or complex containerization setup; Replit profile present.
- Dev/prod switches via npm scripts; unit tests via Vitest; type checks enforced.
- **No active database migration/backup job needed** (unless manual PostgreSQL use enabled).
- **Persistence risk:** Browser `localStorage` is volatile. Regular export recommended to avoid data loss.  
  [VERIFIED: AUDIT_REPORT.md:70]

---

## 9. Maintainability & Change Risk

- **Code Structure:** Rigorously modular; extraction core is isolated, pure, and dependency-minimized [VERIFIED: LANTERN_CORE_BOUNDARY.md:4-105]
- **Schema upgrades:** Migrations for v1→v2 packs (with acceptance tests and migration logs) [VERIFIED: BOOK_OF_FIXES.md:111-134]
- **Type safety:** Strict TypeScript (compilerOptions.strict: true) [VERIFIED: tsconfig.json:10]
- **Testing/Verification:** Stability and type invariants are tested; build/test required for all PRs [VERIFIED: M2_SUMMARY.md:37, .github/workflows/ci.yml:27,31]
- **Change risk:** Main risks lie in client API/feature drift or insufficient migration logic for packs; backend/server is not coupled as of this evidence.
- **Upgrade notes:** Any introduction of backend persistence, authentication, or crypto adapters will require new configuration, new secrets, and updates to the operator runbook.
- **Known UX risk:** User data loss possible if user misses export steps (browser-local only).
- **No evidence of automated E2E/smoke tests** — risk of user flow regressions if only unit tests are used.

---

## 10. Replit Execution Profile

- **Nix Profile:** Uses stable-24_05, with Node 20, web, and PostgreSQL 16 modules for compatibility (dev only).
  [VERIFIED: .replit:1-7]
- **PORT mapping:** Dev server runs on local port 5000, exported to port 80, dev client also on 5001/3001 for possible secondary use.
  [VERIFIED: .replit:9-15]
- **Entry command:** `npm run dev` (fullstack development), or `npm run build && npm start` for deployment.
  [VERIFIED: .replit:2,22-23]
- **Secrets:** To use PostgreSQL/Drizzle, must provide `DATABASE_URL` as an env var.
  [VERIFIED: drizzle.config.ts:3, .replit:18]

---

## 11. Unknowns / Missing Evidence

**API Backend:**
- No evidence for live API endpoint implementations (`/api/report`, `/api/reports`, `/api/report/generate`, `/api/config`) on the server.
  - Needed: Content of `server/routes.ts`, actual endpoint handlers and their environment/secret usage.
- No evidence of database CRUD or user auth backend.
  - Needed: Server implementation for any authenticated route, `.env.example` with secrets.

**End-to-End (E2E) Testing:**
- No automated E2E/smoke test scripts for UI/pack workflow.
  - Needed: Playwright/Cypress or similar files, corresponding test scripts.
- No automated user/session spoofing or coverage reports.

**Crypto/Receipts Integration:**
- No evidence for HALO-RECEIPTS or crypto adapter production secrets/config.
  - Needed: Example `.env`, config docs, reference to receipts endpoints.

**Authentication/Sessions:**
- No evidence of session/auth enforcement on `/api` routes (passport usage is declared but not wired).
  - Needed: Server-middleware/strategy wiring.

**Other:**
- No Dockerfile found.
- No clarity on handling of production HTTPS, secret rotation, or error logging/reporting infra.

---

## 12. Receipts (Evidence Index)

- **LANTERN_SYSTEM_SNAPSHOT.md:** 10-47, 24-47, 50-60, 61-82, 110-128, 133-137, 140-150, 36, 38, 36, 38, 111, 36, 38, 133-137
- **LANTERN_CORE_BOUNDARY.md:** 4-105, 8-48, 8-23, 54-84, 8-23, 37,103
- **M2_SUMMARY.md:** 34-43, 37
- **AUDIT_REPORT.md:** 8-23, 36-44, 53-57, 56, 42, 47, 70, 144-148, 53, 56, 47, 56-57, 42, 47, 70,144-148
- **CHANGELOG.md:** 11, 36, 39, 67
- **README.md:** 26, 27, 31, 32, 33, 40, 57, 58, 82-87, 88-97
- **.replit:** 1-7, 2, 9-15, 18, 22-23
- **package.json:** 11, 55, 61, 72
- **drizzle.config.ts:** 10, 3
- **tsconfig.json:** 10
- **client/src/lib/config.tsx:** 19, 26, 45, 95
- **client/src/App.tsx:** 56, 72, 100-119, 45, 95, 109
- **BOOK_OF_FIXES.md:** 32, 91-103, 111-134, 47-97
- **Unknowns:** Absence of cited files/content for API endpoints, E2E tests, crypto configs, and session/auth wiring.

---

**This dossier is strictly derived from static code and configuration artifacts as of snapshot date.**  
**No claims are made about runtime security, correctness, or deployment behavior outside this evidence boundary.**