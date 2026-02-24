# Repo Recon Verification Workflow

This document describes the exact steps to verify a claim and audit a dossier using Repo Recon, ensuring deterministic reproducibility.

---

## 1. Prerequisites
- Local clone of target repository
- Dossier JSON file (e.g., `dossier.json`)
- Node.js environment

---

## 2. Claim Verification

### Command
```
reporecon verify-claim <claim_id> --repo-path <path> [--dossier dossier.json]
```

### Example
```
reporecon verify-claim C-1021 --repo-path ./myrepo --dossier ./dossier.json
```

### Output
- Expected hash
- Computed hash
- Verdict (MATCH/MISMATCH)
- Canonical excerpt (head/tail if >200 lines)

### Acceptance
- Exit code 0: MATCH
- Exit code 2: MISMATCH
- Exit code 3: ERROR (missing file, encoding, etc.)

---

## 3. Dossier Audit

### Command
```
reporecon audit dossier.json --repo-path <path>
```

### Example
```
reporecon audit ./dossier.json --repo-path ./myrepo
```

### Output
- Audit report written to `audit_report.json`
- Contains counts: total_verified, valid, drifted, invalidated, commit_mismatch, canonicalization_mismatch, file_missing, encoding_error
- Drifted claims include claim_id, expected_hash, computed_hash, minimal diff

---

## 4. Reproducibility
- Canonicalization rules are defined in `docs/canonicalization_v1.md`
- Hashing is deterministic across platforms
- No network access required

---

## 5. Example Session
1. Clone repo:
   ```
   git clone https://github.com/example/repo.git
   cd repo
   ```
2. Place `dossier.json` in repo directory
3. Run verification:
   ```
   reporecon verify-claim C-1021 --repo-path .
   ```
4. Run audit:
   ```
   reporecon audit dossier.json --repo-path .
   ```

---

## 6. Troubleshooting
- If claim fails with `ENCODING_ERROR`, check file encoding (must be valid UTF-8)
- If file missing, ensure correct path and commit
- If canonicalization mismatch, check dossier version

---

## End of Workflow
