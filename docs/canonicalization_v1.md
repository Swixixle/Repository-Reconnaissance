# Repo Recon Canonicalization Rules Spec v1

## Overview
This document defines the normative, deterministic canonicalization process for excerpt hashing and claim verification in Repo Recon. All rules are specified with MUST/SHOULD language for implementation compliance.

---

## 1. Input Domain
- Canonicalization operates on a byte sequence extracted from a specific file path and inclusive line range at a specific commit.
- Extraction MUST:
  - Read file as bytes.
  - Decode as UTF-8 with strict decoding.
    - If invalid UTF-8: fail claim hashing with `ENCODING_ERROR` and mark claim `UNKNOWN` (never VERIFIED).
  - Split into lines using universal newline handling:
    - Treat `\r\n`, `\n`, `\r` all as line breaks.
  - Line numbers are 1-indexed and refer to the post-splitting line list.

---

## 2. Canonicalization Transform
Given extracted lines `[start..end]` inclusive:

1. **Normalize line endings**: Output uses `\n` only.
2. **Trim trailing whitespace per line**:
   - Remove spaces and tabs at end of each line.
   - Do NOT trim leading whitespace.
3. **Remove BOM**:
   - If first line begins with UTF-8 BOM, remove it.
4. **Preserve internal whitespace**:
   - Do NOT collapse spaces.
   - Do NOT reindent.
5. **Preserve blank lines**, but apply trailing whitespace trimming rules.
6. **Final newline rule**:
   - Output MUST end with exactly one `\n` (even if excerpt ends on last file line).
7. **Maximum excerpt size**:
   - If canonical excerpt exceeds 128 KB, fail hashing with `EXCERPT_TOO_LARGE` and mark claim `INFERRED` or `UNKNOWN` (never VERIFIED).

---

## 3. Hash Format
- Hash is computed over canonicalized excerpt bytes (UTF-8) using:
  - `SHA-256`
  - Output as lowercase hex
  - Store as `excerpt_hash`
- Also store:
  - `hash_algorithm: "sha256"`
  - `hash_encoding: "hex"`
  - `canonicalization_version: "v1"`

---

## 4. Claim Fingerprint (Diff Stability)
- Stable fingerprint for claim identity:

```
fingerprint = sha256hex(
  canonicalize_string(
    repo_commit + "\n" +
    file_path + "\n" +
    line_start + ":" + line_end + "\n" +
    claim_type + "\n" +
    claim_subject
  )
)
```
- `claim_subject` MUST be the tool’s normalized subject string for the claim (deterministic).
- This fingerprint is used for diff matching across runs.

---

## 5. Determinism Constraints
- MUST be deterministic across OS (Linux/Mac/Windows).
- MUST NOT depend on locale, filesystem ordering, or editor settings.
- MUST use explicit encodings and newline behavior.
- MUST version canonicalization rules (e.g., `"canonicalization_version": "v1"`).
- Dossier MUST store canonicalization_version per claim.

---

## 6. Error Handling
- If any step fails (encoding, file missing, size, etc.), claim MUST NOT be marked VERIFIED.
- Error codes: `ENCODING_ERROR`, `EXCERPT_TOO_LARGE`, `FILE_MISSING`, `COMMIT_NOT_FOUND`, `CANONICALIZATION_MISMATCH`.

---

## 7. Acceptance Criteria
- Canonicalization MUST produce identical output for same input across all platforms.
- Hashing MUST match golden values in test fixtures.
- Claims MUST be reproducible via CLI verification.

---

## 8. Versioning
- This document is versioned as Canonicalization v1.
- Future versions MUST be backward compatible or explicitly flagged in claims.

---

## End of Spec
