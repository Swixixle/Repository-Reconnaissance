#!/usr/bin/env bash
set -e

echo "[1] Syntax check"
python3 -m py_compile pb

echo "[2] shell=True must NOT exist"
if grep -q "shell=True" pb; then
  echo "FAIL: shell=True found"
  exit 1
fi

echo "[3] shell=False + shlex.split must exist"
grep -q "shlex.split" pb
grep -q "shell=False" pb

echo "[4] pb check must classify safely"
printf "pwd\nls -la\n" | ./pb check

echo "✅ ALL TESTS PASSED"
