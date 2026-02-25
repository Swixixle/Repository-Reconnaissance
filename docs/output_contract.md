# Output Contract for Repo Recon

This document specifies the output formats for CLI commands and JSON reports, freezing the contract for downstream verification and scripting.

---

## 1. verify-claim CLI Output

### Console Output
```
Expected Hash: <expected_hash>
Computed Hash: <computed_hash>
Verdict: MATCH|MISMATCH
Canonical Excerpt:
<excerpt>  # up to 200 lines, else head/tail
```

### Exit Codes
- 0: MATCH
- 2: MISMATCH
- 3: ERROR (missing file, encoding, etc.)

---

## 2. audit_report.json Structure

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

## 3. Contract Change Policy
- Any change to these formats must be reviewed and versioned.
- Scripts and downstream tools must be able to parse these outputs reliably.

---

## End of Contract

---

## 4. drift_report.json Structure (monitor mode)
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

## 5. coverage section in dossier
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

## 6. trust_score section in dossier
```
{
  "trust_score": {
    "numeric_score": <integer>,
    "grade": <string>,
    "confidence_band": <string>
  }
}
```

## 7. checklist_findings section in dossier
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

## 8. portfolio_report.json Structure
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

## 9. workflow integration payloads
- GitHub/Jira/Slack issue payloads:
  - UNKNOWN → issue
  - ABSENT security item → issue
  - DRIFTED verified → alert
- No external calls unless flag provided.
- Mock tests verify payload structure.
