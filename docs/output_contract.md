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
