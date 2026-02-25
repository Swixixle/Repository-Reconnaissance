# Monitor Mode

## Usage

```sh
npm run reporecon -- monitor <repo-path> --baseline <baseline_dossier.json> --out <drift_report.json>
```

- `repo-path`: Path to local git repo
- `--baseline`: Path to baseline dossier_v2 JSON
- `--out`: Output drift report JSON

## Output Contract

See docs/output_contract.md for drift_report_v1 format.

## Example

1. Baseline dossier: `tests/fixtures/monitor/baseline_dossier.json`
2. Current dossier: `tests/fixtures/monitor/current_dossier.json`
3. Repo: `tests/fixtures/monitor/repo`

### CLI Help Output

```
npm run reporecon -- monitor --help
```

### Worked Example

```sh
npm run reporecon -- monitor tests/fixtures/monitor/repo --baseline tests/fixtures/monitor/baseline_dossier.json --out tests/fixtures/monitor/drift_report.json
```

Produces drift_report.json with:
- commit_changed: false (no change)
- drifted: []
- invalidated: []
- persisted_unknowns: ["claim2"]
- time_delta_seconds: ~3600

Change src/fileA.js, rerun:
- drifted: ["claim1"]

Delete src/fileA.js, rerun:
- invalidated: ["claim1"]
