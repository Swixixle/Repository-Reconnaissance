# Security Model — prompt-box (pb)

## Execution Safety
`pb` is designed to safely inspect and optionally execute shell commands provided via stdin or clipboard.

### Key Guarantees
- **No shell interpolation**
  - All commands are executed with `shell=False`
  - Arguments are parsed using `shlex.split()`
- **Explicit user consent**
  - `pb run` requires typing `YES` in an interactive terminal
- **Allowlist-first model**
  - Commands are classified as ALLOW / REVIEW / BLOCK before execution
  - Only ALLOW commands may run
- **No implicit pipes, redirects, or globbing**
  - Characters like `|`, `>`, `*`, `&&` are not interpreted by a shell

### Why this matters
This design prevents:
- Shell injection
- Accidental execution of pasted malicious commands
- Hidden side effects from pipes or redirects

### Audit Trail
- Every execution produces a JSON receipt in `receipts/`
- Receipts are intentionally excluded from version control

## Threat Model Notes
If future versions add:
- pipes (`|`)
- redirects (`>`, `<`)
- glob expansion (`*`)
these **must be parsed explicitly**, not passed to a shell.

Shell execution (`shell=True`) is intentionally forbidden.
