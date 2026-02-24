#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/server/analyzer"

../../.venv/bin/python -m analyzer_cli analyze ../.. --output-dir ../../output --no-llm --render-mode engineer

RUN_DIR="$(ls -1dt ../../output/runs/* | head -n 1)"
echo "RUN_DIR=$RUN_DIR"

echo "=== ONEPAGER (head) ==="
sed -n '1,40p' "$RUN_DIR/ONEPAGER.md"

echo "=== UNKNOWN TABLE (head) ==="
# adjust path if unknowns are embedded elsewhere
if [ -f "$RUN_DIR/known_unknowns.json" ]; then
  head -n 15 "$RUN_DIR/known_unknowns.json"
else
  rg -n "Unknowns|UNKNOWN" "$RUN_DIR/DOSSIER.md" | head -n 15 || true
fi
