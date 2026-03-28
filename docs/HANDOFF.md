# Session handoffs

Use this file (or new dated sections below) for short **session handoff** notes: what changed, what’s next, env vars, and verification commands.

Longer product/engineering context lives in `docs/CONTEXT.md` and `docs/MARKET_CONTEXT.md`.

---

## 2026-03-28 — Hardening and credibility (audit, license, tests)

- **npm:** `npm audit fix` + **nodemailer** bump to **^8.0.4** → **0** reported vulnerabilities. Log: `docs/internal/SECURITY_AUDIT.md`.
- **Python:** `pip-audit`: **pygments** CVE-2026-4539 — no fix on PyPI yet; tracked in same doc.
- **Repo hygiene:** Untracked `__pycache__` from git (`git rm -r --cached`); `.gitignore` extended (`*.py[cod]`, `*$py.class`, `server/cli.js`).
- **Removed:** `main.py` (orphan), `server/cli.js` (legacy ts-node shim), **`script/build.ts`** → **`scripts/build.ts`** (canonical with `package.json` + docs/fixtures updated).
- **License / metadata:** Root **LICENSE** (MIT, Nikodemus Systems), **CONTRIBUTING.md**, **CHANGELOG.md** `[0.1.0]`, `package.json` **version 0.1.0** + **license MIT**, `pyproject.toml` **license MIT**, **README** badge; **GitHub About** template: `docs/internal/GITHUB_ABOUT.md`.
- **Python tests:** `server/analyzer/tests/test_analyzer_core.py` (deps, mock OSV CVE rows, API surface, receipt fields, deterministic dossier).
- **CORS:** Production warns if `ALLOWED_ORIGINS` unset; `.env.example` comment updated.
- **Docs:** Session/process files under `docs/internal/process/` (GIT_CLEANUP, REBASE report, UNKNOWN_TABLE, TEST_RESULTS, HARDENING_SUMMARY, SECURITY_CONFIG); links updated in PRODUCTION_READINESS, REBASE_RESOLUTION_GUIDE, CLEANUP_LOG.

## 2026-03-28 — Naming and docs professionalization

Canonical names: user-facing **Debrief**; evidence layer **PTA / Proof Trust Anchor**. npm package `debrief`; Python package `debrief-analyzer` with CLI `debrief` (`pta` retained, deprecated). See **`docs/internal/CLEANUP_LOG.md`** for every move, deletion, and rename. Re-run `npm run build` and `npm run test:unit` after pulling. **`package-lock.json`** still shows legacy `name: rest-express` until someone regenerates the lockfile with npm (intentionally not edited in this pass).

## 2026-03-27 — Repo cleanup / layout

- **Layout:** Frontend tooling lives under `client/` (`vite.config.ts`, `tailwind.config.ts`, `postcss`, `components.json`, `tsconfig.json`). Tauri → `client/src-tauri/` (update `frontendDist` / `beforeBuildCommand` for repo root). Claim/coverage helpers moved from top-level `src/` → `server/claims`, `server/coverage`, `server/canon`. JSON schemas `dossier_v2` / `coverage_report_v1` → `shared/schemas/`.
- **Scripts:** `npm run desktop:dev` / `desktop:build` run from `client/`; `scripts/build.ts` passes `client/vite.config.ts` to Vite.
- **Ignore:** Expanded `.gitignore` (out, env, Python/Node/OS/IDE, `client/src-tauri/target/`). Run `git rm --cached` for any stray tracked artifacts if they appear.
- **Dev DB:** `docker compose up -d` per root `docker-compose.yml`.

