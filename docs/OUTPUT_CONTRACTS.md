# Output Contracts

This document describes the stable output contracts for **Debrief** analysis artifacts produced by the **PTA** (Proof Trust Anchor) evidence layer: JSON schemas, versioning, and related CLI output shapes.

## Overview

PTA produces structured JSON outputs with **formal schema validation** to ensure predictable, parseable results for downstream tools and workflows.

## Core Outputs

### 1. `operate.json`

**Purpose**: Operational dashboard - everything needed to deploy and run the analyzed system.

**Schema**: [`shared/schemas/operate.schema.json`](../shared/schemas/operate.schema.json)

**Required Top-Level Fields**:
- `schema_version` (string): Schema version (e.g., "1.0")
- `tool_version` (string): PTA version (e.g., "pta-0.1.0")
- `generated_at` (string): ISO 8601 timestamp
- `mode` (string): Analysis mode (github, local, replit)
- `boot`: Boot and startup information
- `integrate`: Integration points (API, env vars, auth)
- `deploy`: Deployment configuration
- `snapshot`: Runtime snapshot
- `readiness`: Readiness scores (0-100) across categories
- `gaps`: Identified operational gaps
- `runbooks`: Step-by-step operational procedures

**Example** (minimal):
```json
{
  "schema_version": "1.0",
  "tool_version": "pta-0.1.0",
  "generated_at": "2026-02-17T00:00:00Z",
  "mode": "local",
  "boot": {
    "install": [...],
    "dev": [...],
    "prod": [...],
    "ports": [...]
  },
  "integrate": {
    "endpoints": [...],
    "env_vars": [...],
    "auth": [...]
  },
  "deploy": {...},
  "snapshot": {...},
  "readiness": {
    "boot": {"score": 100, "reasons": [...]},
    "integration": {"score": 80, "reasons": [...]},
    "deployment": {"score": 50, "reasons": [...]},
    "observability": {"score": 0, "reasons": [...]}
  },
  "gaps": [...],
  "runbooks": {
    "local_dev": [...],
    "production": [...],
    "integration": [...],
    "troubleshooting": [...]
  }
}
```

**Evidence Tiers**:
- `EVIDENCED`: Backed by file path + line number + snippet hash
- `INFERRED`: Derived from evidence (e.g., lockfile → package manager)
- `UNKNOWN`: Not determinable from static analysis

**See**: [`server/analyzer/fixtures/operate.sample.json`](../server/analyzer/fixtures/operate.sample.json) for complete example.

---

### 2. `target_howto.json`

**Purpose**: How-to guide - instructions for developers to set up, configure, and run the system.

**Schema**: [`shared/schemas/target_howto.schema.json`](../shared/schemas/target_howto.schema.json)

**Required Top-Level Fields**:
- `schema_version` (string): Schema version (e.g., "1.0")
- `tool_version` (string): PTA version
- `generated_at` (string): ISO 8601 timestamp
- `target` (object):
  - `mode` (string): Analysis mode
  - `identifier` (string): Repository identifier (URL or path)
  - `run_id` (string): Unique run identifier
- `prereqs` (array): Prerequisites (e.g., "Node.js", "Python")
- `install_steps` (array): Installation steps
- `config` (array): Configuration steps
- `run_dev` (array): Development mode steps
- `run_prod` (array): Production mode steps

**Example**:
```json
{
  "schema_version": "1.0",
  "tool_version": "pta-0.1.0",
  "generated_at": "2026-02-17T00:00:00Z",
  "target": {
    "mode": "github",
    "identifier": "https://github.com/user/repo",
    "run_id": "abc123"
  },
  "prereqs": ["Node.js", "PostgreSQL"],
  "install_steps": [
    {
      "step": "Install dependencies",
      "command": "npm ci",
      "evidence": {...}
    }
  ],
  "config": [...],
  "run_dev": [...],
  "run_prod": [...]
}
```

**See**: [`server/analyzer/fixtures/target_howto.sample.json`](../server/analyzer/fixtures/target_howto.sample.json) for complete example.

---

## Schema Validation

### At Generation Time

PTA validates outputs **before writing** to ensure contract compliance:

```python
# In analyzer
self.save_json_with_validation("operate.json", operate, validate_operate_json)
self.save_json_with_validation("target_howto.json", howto, validate_target_howto_json)
```

If validation fails:
- ❌ **Fatal error** - output is NOT written
- 🔴 Detailed error messages printed
- 💥 Analyzer exits with non-zero status

### In CI/Tests

Schema validation is tested at multiple levels:

1. **Unit tests**: Fixtures validate against schemas
   ```bash
   python -m unittest server.analyzer.tests.test_schema_validation
   ```

2. **Smoke test**: Live analyzer run validates outputs
   ```bash
   npm run smoke
   ```

3. **Integration tests**: Full analyzer runs on self
   ```bash
   python -m server.analyzer.analyzer_cli analyze . --output-dir out/self
   ```

---

## Versioning Strategy

### Schema Versions

Schema versions follow semantic versioning:

- **Major version** (1.x → 2.x): Breaking changes (fields removed, types changed)
- **Minor version** (1.0 → 1.1): Additive changes (new optional fields)
- **Patch version** (1.0.0 → 1.0.1): Clarifications (no structural changes)

Current schema version: **1.0**

### Tool Versions

Tool versions are independent and follow semantic versioning:

- Format: `pta-<semver>` (e.g., `pta-0.1.0`, `pta-1.2.3`)
- Embedded in every output via `tool_version` field
- Used to track which analyzer version produced the output

### Compatibility Matrix

| Schema Version | Min Tool Version | Max Tool Version | Status |
|----------------|------------------|------------------|--------|
| 1.0            | pta-0.1.0        | (current)        | ✅ Stable |

### Breaking Change Policy

When introducing breaking schema changes:

1. **Announce**: Deprecation notice 1 release before change
2. **Dual output**: Emit both old and new versions for 1 release
3. **Migrate**: Provide migration guide and scripts
4. **Drop**: Remove old version after grace period

---

## Evidence Contract

All `EVIDENCED` items must include evidence with:

- `path` (string): File path relative to repo root
- `snippet_hash` (string): Hash of code snippet for verification
- `display` (string): Human-readable display (e.g., "file.js:42")
- Optional: `line_start`, `line_end`, `kind`

**Example**:
```json
{
  "path": "server/index.ts",
  "line_start": 210,
  "snippet_hash": "sha256:abc123...",
  "display": "server/index.ts:210",
  "kind": "line_match"
}
```

All `UNKNOWN` items must include:

- `unknown_reason` (string): Why this couldn't be determined

**Example**:
```json
{
  "status": "UNKNOWN",
  "unknown_reason": "No production deployment config detected"
}
```

---

## Consuming Outputs

### TypeScript

```typescript
import operateJson from './out/operate.json';

// Type-safe access
const bootScore = operateJson.readiness.boot.score;
const installSteps = operateJson.boot.install;

// Check evidence tier
for (const step of installSteps) {
  if (step.status === "EVIDENCED") {
    console.log(`Evidenced: ${step.command}`);
    console.log(`  From: ${step.evidence[0].display}`);
  }
}
```

### Python

```python
import json
from pathlib import Path

# Load and validate
with open("out/operate.json") as f:
    operate = json.load(f)

# Check schema version
assert operate["schema_version"] == "1.0", "Unexpected schema version"

# Access fields
boot_score = operate["readiness"]["boot"]["score"]
install_steps = operate["boot"]["install"]

for step in install_steps:
    if step["status"] == "EVIDENCED":
        print(f"Evidenced: {step['command']}")
        print(f"  From: {step['evidence'][0]['display']}")
```

### jq (shell)

```bash
# Extract readiness scores
jq '.readiness | map_values(.score)' out/operate.json

# List all UNKNOWN gaps
jq '.gaps[] | select(.status == "UNKNOWN")' out/operate.json

# Get dev run commands
jq '.boot.dev[] | .command' out/operate.json
```

---

## Migration Guides

### From Pre-Schema Versions (< 0.1.0)

If you have outputs from analyzer versions before schema validation:

1. **Check for required fields**: Add `schema_version`, `tool_version`, `generated_at` manually
2. **Validate**: Run schema validation
3. **Re-run**: Best practice is to re-run analyzer to get fully compliant outputs

### From Schema 1.0 to 2.0 (Future)

(TBD - this section will be populated when schema 2.0 is defined)

---

## Testing Your Integration

To test that your integration handles PTA outputs correctly:

1. **Use fixtures**: Start with known-good samples in `server/analyzer/fixtures/`
2. **Run smoke test**: Validate against live analyzer output
3. **Test edge cases**: Empty arrays, all-UNKNOWN sections, etc.
4. **Check schema compliance**: Use schema validation in your tests

Example test:
```python
import json
from server.analyzer.src.schema_validator import validate_operate_json

def test_my_integration():
    with open("test_data/operate.json") as f:
        operate = json.load(f)
    
    # Ensure valid
    errors = validate_operate_json(operate)
    assert not errors, f"Invalid operate.json: {errors}"
    
    # Test your logic
    result = my_function(operate)
    assert result is not None
```

---

## Schema Versioning Policy

### Version Format

Schema versions use a simple `MAJOR.MINOR` format (e.g., `1.0`, `2.0`):

- **MAJOR**: Incremented for breaking changes (field removals, type changes, new required fields)
- **MINOR**: Incremented for additive changes (new optional fields, new enum values)

Tool version (`tool_version`) uses semantic versioning `pta-MAJOR.MINOR.PATCH` (e.g., `pta-0.1.0`):

- **MAJOR**: Breaking API or contract changes
- **MINOR**: New features, additive schema changes
- **PATCH**: Bug fixes, no schema changes

### Backward Compatibility Guarantees

✅ **Additive changes are backward compatible**:
- Adding new optional fields to existing schemas
- Adding new evidence tiers or gap types
- Adding new readiness categories

❌ **Breaking changes require MAJOR version bump**:
- Removing fields
- Changing field types (e.g., string → object)
- Making optional fields required
- Changing field semantics

### Schema Validation

All JSON outputs are validated against their schemas before being written:

1. **Pre-write validation**: Schema validation runs before file write
2. **Atomic writes**: Files written to `.tmp` then renamed to prevent partial writes
3. **Single source of truth**: All schemas in `shared/schemas/` directory
4. **Drift prevention**: Runtime checks reject duplicate schema directories

### Change Management

**Adding a new field**:
1. Update schema in `shared/schemas/`
2. Update generator code to populate field
3. Increment MINOR schema version if significant
4. Update this documentation

**Removing a field** (breaking change):
1. Deprecate field for at least one MAJOR release
2. Update documentation with deprecation notice
3. Increment MAJOR schema version
4. Remove field and update generators

---

## Feedback & Evolution

Schema evolution is driven by user needs. To propose changes:

1. **Open issue**: Describe use case and proposed change
2. **Discuss**: Community feedback on impact
3. **RFC**: Formal RFC for breaking changes
4. **Implement**: PR with schema update, migration guide, tests

---

## Appendix: Coverage, verification CLI, and legacy monitor shapes

The following sections document additional contracts and CLI behaviors used by the Node **`debrief`** CLI (`npm run debrief`; legacy npm script: `npm run reporecon`) and Python analyzer. They were consolidated from `output_contract.md` (removed as duplicate entry point).

### coverage (`coverage_report_v1`) and `npm run debrief coverage`

```
debrief coverage <repo-path> --out <coverage.json> [--max-bytes N] [--exclude <glob>...]
```

#### `coverage_report_v1` JSON shape

```
{
  "schema_version": "coverage_report_v1",
  "repo_path": <string>,
  "commit_sha": <string>,
  "generated_at": <ISO datetime>,
  "summary": {
    "total_files": <integer>,
    "analyzed_files": <integer>,
    "skipped_files": <integer>,
    "percent_coverage": <number>,
    "statuses": { <FileCoverageStatus>: <integer> },
    "skipped_reasons": { <CoverageReason>: <integer> },
    "directories": [
      {
        "path": <string>,
        "total_files": <integer>,
        "analyzed_files": <integer>,
        "skipped_files": <integer>,
        "percent_coverage": <number>
      }
    ],
    "files": [
      {
        "path": <string>,
        "status": <FileCoverageStatus>,
        "reason": <CoverageReason>,
        "bytes": <integer>,
        "language": <string>,
        "analyzed_by": [<string>]
      }
    ]
  }
}
```

#### Dossier embedding

```
{
  "coverage": {
    "total_files": <integer>,
    "analyzed_files": <integer>,
    "skipped_files": <integer>,
    "percent_coverage": <number>,
    "statuses": { <FileCoverageStatus>: <integer> },
    "skipped_reasons": { <CoverageReason>: <integer> },
    "directories": [
      {
        "path": <string>,
        "total_files": <integer>,
        "analyzed_files": <integer>,
        "skipped_files": <integer>,
        "percent_coverage": <number>
      }
    ],
    "coverage_report_ref": <string>
  }
}
```

#### UNKNOWN vs UNANALYZED

- **UNKNOWN:** File was analyzed and found insufficient evidence for a claim.
- **UNANALYZED:** File was not examined (skipped, unsupported, excluded, binary, too large, error).

This distinction is explicit in `coverage.json` and the dossier coverage block.

---

### `verify-claim` CLI output

#### Console output

```
Expected Hash: <expected_hash>
Computed Hash: <computed_hash>
Verdict: MATCH|MISMATCH
Canonical Excerpt:
<excerpt>  # up to 200 lines, else head/tail
```

#### Exit codes

- `0` — MATCH
- `2` — MISMATCH
- `3` — ERROR (missing file, encoding, etc.)

---

### `audit_report.json` structure

```
{
  "total_verified": <number>,
  "valid": <number>,
  "drifted": <number>,
  "invalidated": <number>,
  "commit_mismatch": <number>,
  "canonicalization_mismatch": <number>,
  "file_missing": <number>,
  "encoding_error": <number>,
  "drifted_claims": [
    {
      "claim_id": <string>,
      "expected_hash": <string>,
      "computed_hash": <string>,
      "diff": {
        "expected": <string>,
        "actual": <string>
      }
    }
  ]
}
```

---

### Contract change policy

- Any change to these formats must be reviewed and versioned.
- Scripts and downstream tools must be able to parse these outputs reliably.

---

### `drift_report.json` structure (monitor mode)

```
{
  "baseline_commit": <string>,
  "current_commit": <string>,
  "time_delta_seconds": <integer>,
  "verified": {
    "still_valid": [<string>],
    "drifted": [<string>],
    "invalidated": [<string>],
    "newly_verified": [<string>]
  },
  "unknown": {
    "persisted_unknowns": [<string>],
    "resolved_unknowns": [<string>],
    "new_unknowns": [<string>]
  },
  "inferred_changes": [<string>],
  "confidence_delta": <number>,
  "risk_delta_score": <number>
}
```

### Coverage section in dossier (legacy shape reference)

```
{
  "coverage": {
    "total_files": <integer>,
    "analyzed_files": <integer>,
    "skipped_files": [<string>],
    "skipped_reasons": [<string>],
    "percent_coverage": <number>,
    "directories": [
      {
        "path": <string>,
        "coverage_percent": <number>,
        "analyzed_count": <integer>,
        "skipped_count": <integer>
      }
    ]
  }
}
```

### `trust_score` section in dossier

```
{
  "trust_score": {
    "numeric_score": <integer>,
    "grade": <string>,
    "confidence_band": <string>
  }
}
```

### `checklist_findings` section in dossier

```
{
  "checklist_findings": [
    {
      "category": <string>,
      "status": "FOUND"|"ABSENT"|"UNKNOWN",
      "evidence": <string>
    }
  ]
}
```

### `portfolio_report.json` structure

```
{
  "repos": [
    {
      "name": <string>,
      "trust_score": <integer>,
      "coverage_percent": <number>,
      "critical_unknowns": <integer>
    }
  ],
  "weakest_repo": <string>,
  "strongest_repo": <string>,
  "average_trust_score": <number>,
  "risk_ranked_list": [<string>]
}
```

### Workflow integration payloads

- GitHub/Jira/Slack issue payloads:
  - UNKNOWN → issue
  - ABSENT security item → issue
  - DRIFTED verified → alert
- No external calls unless flag provided.
- Mock tests verify payload structure.

---

## See Also

- [Schema Validation Tests](../server/analyzer/tests/test_schema_validation.py)
- [Fixtures](../server/analyzer/fixtures/)
- [Configuration Guide](./CONFIGURATION.md)
- [API Documentation](./API.md)
