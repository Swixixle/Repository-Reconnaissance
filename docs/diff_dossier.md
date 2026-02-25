# Diff Dossier Command

## Purpose
Compare two dossier files to track longitudinal UNKNOWNs, commit changes, and trust signals across runs.

## Usage

```sh
npm run reporecon -- diff-dossier --old <old_dossier.json> --new <new_dossier.json> [--out <output.json>]
```

- `--old`: Path to previous dossier file
- `--new`: Path to current dossier file
- `--out`: Output file for diff results (default: diff_dossier.json)

## Output Contract

```json
{
  "time_delta_seconds": 3600,
  "commit_changed": true,
  "commit_from": "abc123",
  "commit_to": "def456",
  "unknowns": {
    "persisted_unknowns": ["..."],
    "resolved_unknowns": ["..."],
    "new_unknowns": ["..."]
  },
  "verified": {
    "degraded_verified": ["..."],
    "new_verified": ["..."]
  },
  "scores_delta": {
    "confidence_overall_delta": 0.12,
    "critical_unknowns_delta": -1
  }
}
```

## Acceptance Criteria
- Correct classification of UNKNOWNs (persisted, resolved, new)
- Accurate commit delta and time_delta_seconds
- Trust signals surfaced in output
- CLI command produces valid JSON and prints summary

## Example
See `tests/fixtures/old_dossier.json`, `tests/fixtures/new_dossier.json`, and `tests/fixtures/diff_dossier.json` for sample inputs/outputs.
