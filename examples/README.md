# Example Outputs

These are sample outputs from the Program Totality Analyzer running in `--no-llm` (deterministic) mode against its own workspace.

## Files

- `out/target_howto.sample.json` — Operator manual: install steps, config, run commands, Replit execution profile. Every item cites file:line evidence with SHA-256 snippet hashes.
- `out/coverage.sample.json` — Scan metadata: mode requested, files scanned/skipped, Replit detection evidence, self-skip configuration.

## Generating Your Own

```bash
python server/analyzer/analyzer_cli.py analyze --replit --no-llm -o ./my_output
```

Or for a GitHub repo:

```bash
python server/analyzer/analyzer_cli.py analyze https://github.com/user/repo -o ./my_output
```

Or for a local folder:

```bash
python server/analyzer/analyzer_cli.py analyze ./path/to/project -o ./my_output
```
