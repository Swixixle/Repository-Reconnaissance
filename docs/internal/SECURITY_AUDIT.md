# Security audit triage — 2026-03-28

Automated dependency scans and manual follow-ups for the Debrief repo.

## npm (`npm audit`)

### Before remediation

Six issues reported (1 moderate, 5 high): transitive `brace-expansion`, `flatted`, `minimatch`, `path-to-regexp`, `picomatch`, and direct `nodemailer` (≤8.0.3).

### Actions taken

1. Ran `npm audit fix` — resolved all issues that did not require breaking changes.
2. Bumped **`nodemailer`** from `^6.10.0` to **`^8.0.4`** in `package.json` (addresses high-severity advisories; small breaking-change risk — verify email flows after upgrade).
3. Ran `npm install` to refresh `package-lock.json`.

### After remediation

`npm audit` reports **0 vulnerabilities** (verified 2026-03-28).

### Manual / `--force` not applied

None remaining after the steps above. Re-run `npm audit` after future dependency changes.

---

## Python (`pip-audit`)

Run: `.venv/bin/pip-audit` (or install `pip-audit` in the active environment).

### Finding

| Severity | Package  | Version | ID          | Notes |
|----------|----------|---------|-------------|--------|
| (see DB) | pygments | 2.19.2  | CVE-2026-4539 | **No fixed release on PyPI** at audit time (latest listed was 2.19.2). Transitive via `rich`. |

### Recommended action

- Track [Pygments PyPI](https://pypi.org/project/Pygments/) and **`pip install -U pygments`** when a fix version ships.
- Optionally re-run `pip-audit` in CI on lockfiles or editable installs.

### Noise

`pip-audit` may report *Dependency not found on PyPI: program-totality-analyzer* when the local package name in `.egg-info` is stale. Editable install should use **`debrief-analyzer`** per `pyproject.toml`; reinstall with `pip install -e .` if needed.

---

## Review cadence

- **npm:** weekly or on any dependency PR.
- **Python:** monthly or when bumping `pyproject.toml` dependencies.
