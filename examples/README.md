# Example Outputs

These are sample outputs from Repository Reconnaissance running in `--no-llm` (deterministic) mode against its own workspace.

## Files

- `out/operate.sample.json` — Operator dashboard: boot commands, integration points, deployment config, readiness scores, gaps with severity. Deterministic, evidence-bound.
- `out/target_howto.sample.json` — Legacy operator manual. Prefer `operate.json` for operator workflows.
- `out/coverage.sample.json` — Scan metadata: mode requested, files scanned/skipped, Replit detection evidence, self-skip configuration.

## Generating Your Own

```bash
rr analyze --replit --no-llm -o ./my_output
```

Or for a GitHub repo:

```bash
rr analyze https://github.com/user/repo -o ./my_output
```

Or for a local folder:

```bash
rr analyze ./path/to/project -o ./my_output
```
