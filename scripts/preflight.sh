#!/bin/bash
# Preflight script: blocks on syntax errors and test failures
set -euo pipefail

# Check for python
if ! command -v python3 >/dev/null 2>&1; then
  echo "[FAIL] python3 not found in PATH. Please install Python 3." >&2
  exit 1
fi

# Syntax check (compileall)
echo "[INFO] Running python -m compileall server/analyzer/src ..."
python3 -m compileall server/analyzer/src

# Run pytest if available
if command -v pytest >/dev/null 2>&1; then
  echo "[INFO] Running pytest ..."
  pytest -q || { echo "[FAIL] pytest failed." >&2; exit 1; }
else
  echo "[WARN] pytest not found. Skipping tests."
fi

# Linter check (none found, update if added)
echo "[INFO] No linter configured (ruff/pyflakes/flake8/mypy not found). Update preflight if added."

echo "[PASS] Preflight checks passed."
