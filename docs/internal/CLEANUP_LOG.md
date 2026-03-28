# Cleanup log — Debrief professionalization pass

**Date:** 2026-03-28

This log records renames, moves, deletions, and naming decisions for the repository cleanup / professionalization pass. Canonical naming: **Debrief** (product, user-facing), **PTA / Proof Trust Anchor** (internal evidence, receipts, chain).

## Package and CLI metadata

| Item | Before | After |
|------|--------|-------|
| npm `package.json` `name` | `rest-express` (historical; still appears inside `package-lock.json` — not modified per policy) | `debrief` |
| npm `description` | (various) | `Read any codebase. Get a verified plain-language brief.` |
| npm fields added | — | `homepage`, `repository`, `bugs` → `https://github.com/Swixixle/debrief` |
| Python `pyproject.toml` `name` | `program-totality-analyzer` | `debrief-analyzer` |
| Python CLI | `pta` only | `debrief` preferred; `pta` kept with deprecation comment |
| Smoke script | `scripts/smoke_pta.sh` (removed earlier in pass) | `scripts/smoke_debrief.sh` |
| Shell banner | `scripts/smoke_test.sh` “Program Totality Analyzer” | “Debrief” |

## Files deleted

| File | Reason |
|------|--------|
| `docs/output_contract.md` | Merged into `docs/OUTPUT_CONTRACTS.md` (earlier in pass) |
| `server/analyzer/src/demo_summary.schema.json` | **Orphan:** no code loaded this path; canonical JSON schemas live in `shared/schemas/` per `schema_validator.py`. Not a duplicate of an existing `shared/schemas` file — safe removal. |
| Root `TYPECHECK_TODO.md` | Moved to `docs/internal/TYPECHECK_TODO.md` (earlier in pass) |

## Files moved to `docs/internal/` (earlier in pass; summarized here)

Includes: `CONTACT.md`, `PUBLIC.md`, `PROFILE.md`, `GITHUB_PROFILE_SETUP.md`, `SECURITY_FIXES.md`, `process/UNKNOWN_TABLE.md`, `process/GIT_CLEANUP_VERIFICATION.md`, `process/TEST_RESULTS.md`, `process/HARDENING_SUMMARY.md`, `process/REBASE_VERIFICATION_REPORT.md`, `process/SECURITY_CONFIG.md`, `replit.md`, `TYPECHECK_TODO.md`. Root copies removed where applicable.

## Schema locations (Part 2.4)

- **Canonical:** `shared/schemas/*.schema.json` (enforced by Python `server/analyzer/src/schema_validator.py`).
- **`server/analyzer/src/demo_summary.schema.json`:** Removed as unused; no import references.
- **No duplicate pairs** were found between `shared/schemas/` and the analyzer tree after removal.

## String and copy substitutions (representative)

| Legacy / inconsistent | Replacement |
|----------------------|-------------|
| “Program Totality Analyzer”, “Program Totality …” (user-facing docs, Python dossier headings, prompts) | **Debrief** (or “Debrief Dossier” / “Debrief Report”) |
| Internal evidence layer references | **PTA (Proof Trust Anchor)** where describing receipts/chain/crypto |
| `rest-express`, `program-totality-analyzer` | `debrief`, `debrief-analyzer` in editable metadata (not `package-lock.json`) |
| Replit badge / clone URL in `docs/internal/replit.md` | Updated to `Swixixle/debrief` (verify against your actual Replit import) |
| `docs/dossiers/lantern_program_totality_dossier.md` | Archival note added; historical headings retained |
| `docs/internal/PUBLIC.md` | Rewritten as Debrief + PTA framing |
| `docs/internal/CONTACT.md` | Merged duplicate “Inquiries” sections; Debrief wording |

## Stub and integration banners

Added or confirmed top-of-file comments per spec for:

- `server/replit_integrations/**` (including `chat/routes.ts`, `chat/storage.ts`, `image/*`, `batch/utils.ts`)
- `extensions/vscode/src/extension.ts`
- `.github/debrief-action/src/index.ts` (labeled **PARTIAL**, not a no-op stub)
- `integrations/discord/README.md` (HTML comment block; no TS sources in tree)

## `.env.example`

Reorganized into labeled sections matching the cleanup spec (LLM, Server, Database, Queue, Auth, Billing, Chain, Scheduler, Alerts, Desktop, CORS / access). Variables consolidated from the previous file; no removal without mapping — set names aligned to current usage.

## Client metadata

- `client/index.html`: `<title>`, `meta description`, OpenGraph `og:title` / `og:description`.
- `client/src/components/layout.tsx`: `document.title` includes full tagline; subtitle uses official tagline; footer year **2026**.

## Decisions and ambiguity

1. **`package-lock.json`:** Not edited; `name` may still read `rest-express` until a future lockfile regeneration (`npm install` / `npm shrinkwrap`). Documented in `docs/HANDOFF.md`.
2. **Replit GitHub URLs:** Pointed at `github.com/Swixixle/debrief`; confirm whether production Replit still imports a different fork.
3. **Historical dossier** (`lantern_program_totality_dossier.md`): Not fully rewritten — added archival note to avoid rewriting evidence citations inside the document.
4. **`npm run reporecon`:** Kept as legacy alias per prior work; documented in README and some docs as legacy.
5. **Python module paths:** Unchanged (`server.analyzer...`) per constraints.

## Verification commands (post-pull)

```bash
npm run build
npm run test:unit
```

## Follow-ups for humans

- Regenerate `package-lock.json` when convenient so the top-level `name` matches `debrief`.
- Confirm Replit and any external badges use the final public repo URL and app hostname.
- Decide whether `docs/internal/*` should link from public README (currently omitted by design).
