# recon history-diff

## Overview

`recon history-diff` is a CI-friendly regression gate for Git hotspots. It compares two reports (hotspots.json or dossier.json) and detects risk regressions or improvements based on selected metrics.

## Usage

```sh
recon history-diff --before <file|dir> --after <file|dir> [options]
```

### Required
- `--before <path>`: Path to before file or directory
- `--after <path>`: Path to after file or directory

### Options
- `--metric score|commits|churn|authors` (default: score)
- `--focus <n>` (default: 15)
- `--threshold <number>` (default: 0)
- `--fail-on none|regression|high|med|any` (default: none)
- `--output <dir>` (default: ./out/history-diff)
- `--format json|md|both` (default: both)
- `--verbose` (optional)

## CI Integration

- Use `--fail-on regression` to fail CI if any regression is detected.
- Use `--fail-on high` or `--fail-on med` for stricter gating.
- Exit code 2 signals gating failure; exit code 1 signals error.

## Recommended Thresholds

- score: 0.25 (regression if score increases by 25%)
- commits: 5
- churn: 200
- authors: 3

## Example

```sh
recon history-diff --before ./out/hotspots.json --after ./out/hotspots.json --metric score --fail-on regression
```

## Supported Inputs

- `hotspots.json` (with `hotspots` array)
- `dossier.json` (with `change_hotspots.top` array)
- Directory containing either file

## Output

- `history-diff.json`: Deterministic, stable ordering
- `history-diff.md`: Markdown summary

## Test Matrix

- hotspots.json input on both sides
- dossier.json input on both sides
- mixed input (before dossier, after hotspots)
- fail-on regression returns exit 2
- deterministic output (ignore generated_at)
