# Program Totality Report — Engineer View

**EvidencePack Version:** 1.0
**Tool Version:** 0.1.0
**Generated:** 2026-02-15T10:41:05.131961+00:00
**Mode:** github
**Run ID:** f052d0f706ba

---

## PTA Contract Audit — Run f052d0f706ba

### 1. System Snapshot

| Measure | Value |
|---------|-------|
| Files Analyzed | 12 |
| Files Seen (incl. skipped) | 12 |
| Files Skipped | 0 |
| Claims Extracted | 30 |
| Claims with Deterministic Evidence | 30 |
| Unknown Governance Categories | 9 |
| Verified Structural Categories | 0 |
| Partial Coverage | No |

### 2. Deterministic Coverage Index (DCI v1)

**Score:** 100.00%
**Formula:** `verified_claims / total_claims`

30 of 30 extracted claims contain hash-verified evidence.

This measures claim-to-evidence visibility only.
It does not measure code quality, security posture, or structural surface coverage.

### 3. Reporting Completeness Index (RCI)

**Score:** 52.67%
**Formula:** `average(claims_coverage, unknowns_coverage, howto_completeness)`

| Component | Score |
|-----------|-------|
| claims_coverage | 100.00% |
| unknowns_coverage | 0.00% |
| howto_completeness | 58.00% |

RCI is a documentation completeness metric.
It is not a security score and does not imply structural sufficiency.

### 4. Structural Visibility (DCI v2)

**Status:** not_implemented
**Formula (reserved):** `verified_structural_items / total_structural_surface`

Routes, dependencies, schemas, and enforcement extractors are not active.
Structural surface visibility is intentionally reported as null rather than estimated.
This prevents silent overstatement of governance posture.

### 5. Epistemic Posture

PTA explicitly reports:
- What is deterministically verified.
- What is unknown.
- What is not implemented.
- What requires dedicated extractors.

There is no inference-based promotion from UNKNOWN to VERIFIED.

---

## Verified: Architecture Snapshot

### The schema validator loads both schema and sample output dynamically and performs validation in-process, without external libraries.
Confidence: 100%
- Evidence: `validate-schema.js:106-115` (hash: `2ede294108f0`)

### Network operations, cryptographic operations, artifact signing, and key management are explicitely out of ELI's scope.
Confidence: 100%
- Evidence: `EVIDENCE.md:3` (hash: `d4571bdd157a`)
- Evidence: `references/halo-integration.md:8-11` (hash: `3c582adb5ce3`)

## Verified: Capability Map

### The system validates ELI output artifacts (JSON) against the defined schema.
Confidence: 100%
- Evidence: `validate-schema.js:6-99` (hash: `787b5c101168`)
- Evidence: `contracts/eli-output.schema.json:1-157` (hash: `021fb596db81`)

### Validation results including errors and sample field previews are printed by the validator.
Confidence: 100%
- Evidence: `validate-schema.js:123-144` (hash: `51aa490b21c4`)

### ELI supports both local validation and Replit-based ('click Run') schema validation.
Confidence: 100%
- Evidence: `README.md:14-19` (hash: `3095db2ec112`)
- Evidence: `.replit:1` (hash: `eb5b96f312a1`)

### ELI can be executed with Node.js version 20+ directly using the command 'node validate-schema.js'.
Confidence: 100%
- Evidence: `README.md:27` (hash: `552aa2a53cfa`)
- Evidence: `replit.nix:3` (hash: `b6d70b4bbe78`)

### Strict schema conformance is enforced, including required fields and prohibition of additional properties.
Confidence: 100%
- Evidence: `contracts/eli-output.schema.json:6` (hash: `caf6261bd512`)
- Evidence: `validate-schema.js:10-94` (hash: `58f9846ee46c`)

## Verified: Data & Security Posture

### ELI handles only non-sensitive JSON schema and user-supplied output files, with no secrets or sensitive information processed.
Confidence: 100%
- Evidence: `examples/eli-output.sample.json:1-56` (hash: `021fb596db81`)

### ELI performs no encryption or cryptographic operations in validation or storage.
Confidence: 100%
- Evidence: `EVIDENCE.md:3` (hash: `d4571bdd157a`)
- Evidence: `validate-schema.js:3-149` (hash: `24133e8118fe`)

### No authentication, secret management, or secret material is part of ELI's operation.
Confidence: 100%
- Evidence: `validate-schema.js:3-149` (hash: `24133e8118fe`)

### Security issues may be reported by email, but no security guarantees are provided for the code.
Confidence: 100%
- Evidence: `SECURITY.md:13` (hash: `0d3b5bfae180`)
- Evidence: `SECURITY.md:24` (hash: `f73a1073763a`)

## Verified: How to Use the Target System

### The only software dependency required for validating artifacts is Node.js 20+; jq is listed for possible future scripts but is not required for validation.
Confidence: 100%
- Evidence: `replit.nix:3-4` (hash: `b6d70b4bbe78`)
- Evidence: `validate-schema.js:3-149` (hash: `24133e8118fe`)

### On Replit, all dependencies are pre-installed, and running the validator is triggered via the Run button.
Confidence: 100%
- Evidence: `replit.nix:3-4` (hash: `b6d70b4bbe78`)
- Evidence: `README.md:16-19` (hash: `ca45a45e1fb7`)
- Evidence: `.replit:1` (hash: `eb5b96f312a1`)

### Validator script outputs '✓ Validation PASSED' if the sample output is schema-conformant, or lists errors and exits non-zero if it is not.
Confidence: 100%
- Evidence: `validate-schema.js:124-135` (hash: `fd53cd7ba83c`)

## Verified: Identity of Target System

### ELI is a framework for producing justified, auditable claims from signed artifacts by defining JSON schema contracts and validation logic for its outputs.
Confidence: 100%
- Evidence: `README.md:1-4` (hash: `38bce6d78e2d`)

### ELI separates the concerns of cryptographic proof from inference and does not perform signing or manage evidence directly.
Confidence: 100%
- Evidence: `README.md:5-10` (hash: `23333730b527`)
- Evidence: `references/halo-integration.md:8-9` (hash: `3c582adb5ce3`)

### The repository is an early-stage scaffold and is not intended for production use.
Confidence: 100%
- Evidence: `README.md:36` (hash: `33ec38cb52fd`)
- Evidence: `SECURITY.md:24` (hash: `f73a1073763a`)

### ELI does not execute cryptographic signing, store raw evidence, or manage keys.
Confidence: 100%
- Evidence: `EVIDENCE.md:3` (hash: `d4571bdd157a`)
- Evidence: `references/halo-integration.md:8-9` (hash: `3c582adb5ce3`)

### ELI is not a universal truth system, a cryptographic substitute, or a self-verifying claim engine.
Confidence: 100%
- Evidence: `CLAIM.md:15-16` (hash: `99c2d054cc23`)
- Evidence: `EVIDENCE.md:32-33` (hash: `b265c71bd30d`)

### Not a production-ready pipeline or artifact deployer.
Confidence: 100%
- Evidence: `SECURITY.md:24` (hash: `f73a1073763a`)

## Verified: Integration Surface

### ELI exposes no APIs (REST, GraphQL, RPC), SDKs, or webhooks—its only integration point is output artifacts in JSON.
Confidence: 100%
- Evidence: `contracts/eli-output.schema.json:1-157` (hash: `021fb596db81`)
- Evidence: `examples/eli-output.sample.json:1-56` (hash: `021fb596db81`)

### ELI output JSON artifacts include fields designed for referencing evidence and signature objects, facilitating integration with systems like HALO-RECEIPTS.
Confidence: 100%
- Evidence: `references/halo-integration.md:3-12` (hash: `8f74b44878df`)

## Verified: Maintainability & Change Risk

### Schema evolution is the major risk; consumers and validators must be updated in lockstep with schema changes.
Confidence: 100%
- Evidence: `contracts/eli-output.schema.json:1-157` (hash: `021fb596db81`)
- Evidence: `examples/eli-output.sample.json:1-56` (hash: `021fb596db81`)

### Validator logic is hand-rolled and simple, but will require code updates for new JSON schema drafts or rules, since there is no external validation library.
Confidence: 100%
- Evidence: `validate-schema.js:6-99` (hash: `787b5c101168`)

## Verified: Operational Reality

### ELI has no background processes, servers, or uptime requirement—operations are limited to CLI invocation of schema validation.
Confidence: 100%
- Evidence: `validate-schema.js:1-149` (hash: `4949218de757`)
- Evidence: `README.md:27` (hash: `552aa2a53cfa`)

### ELI has no dependency on external libraries or state persistence—all validation logic and data remain local and ephemeral.
Confidence: 100%
- Evidence: `validate-schema.js:3-149` (hash: `24133e8118fe`)

## Verified: Purpose & Jobs-to-be-done

### ELI aims to define and validate auditable claims about digital artifacts using a formal schema.
Confidence: 100%
- Evidence: `README.md:1-4` (hash: `38bce6d78e2d`)

### ELI enforces the separation of signed evidence from inference/claims, improving auditability and clarity over what is proven versus inferred.
Confidence: 100%
- Evidence: `README.md:6-7` (hash: `1dec6584a3d1`)
- Evidence: `EVIDENCE.md:3-4` (hash: `d4571bdd157a`)

### ELI is designed to interoperate with external systems for signing and receipts, such as HALO-RECEIPTS.
Confidence: 100%
- Evidence: `README.md:9-10` (hash: `0735400dcd7c`)
- Evidence: `references/halo-integration.md:10-11` (hash: `dca23f8f2689`)

### ELI provides a schema validator that enables checking of ELI output files for conformance to the defined contract.
Confidence: 100%
- Evidence: `README.md:20` (hash: `f8e4d31b7491`)
- Evidence: `validate-schema.js:101-149` (hash: `ccdb8daf830c`)

## Verified Structural (deterministic extractors only)

- **dependencies**: not_implemented: requires lockfile parser (package-lock.json, requirements.txt, etc.)
- **enforcement**: not_implemented: requires auth/middleware pattern detector over source files
- **routes**: not_implemented: requires AST/regex route extractor over source files
- **schemas**: not_implemented: requires migration/model file parser

## Known Unknown Surface

| Category | Status | Notes |
|----------|--------|-------|
| tls_termination | UNKNOWN | No matching infrastructure/config artifacts found in file index |
| encryption_at_rest | UNKNOWN | No matching infrastructure/config artifacts found in file index |
| secret_management | UNKNOWN | No matching infrastructure/config artifacts found in file index |
| deployment_topology | UNKNOWN | No matching infrastructure/config artifacts found in file index |
| runtime_iam | UNKNOWN | No matching infrastructure/config artifacts found in file index |
| logging_sink | UNKNOWN | No matching infrastructure/config artifacts found in file index |
| monitoring_alerting | UNKNOWN | No matching infrastructure/config artifacts found in file index |
| backup_retention | UNKNOWN | No matching infrastructure/config artifacts found in file index |
| data_residency | UNKNOWN | No matching infrastructure/config artifacts found in file index |

## Snippet Hashes (31 total)

- `021fb596db81`
- `0735400dcd7c`
- `0d3b5bfae180`
- `1dec6584a3d1`
- `23333730b527`
- `24133e8118fe`
- `2ede294108f0`
- `3095db2ec112`
- `33ec38cb52fd`
- `38bce6d78e2d`
- `3c582adb5ce3`
- `4949218de757`
- `503e4d7a3efe`
- `51aa490b21c4`
- `552aa2a53cfa`
- `58f9846ee46c`
- `787b5c101168`
- `8f74b44878df`
- `99c2d054cc23`
- `b265c71bd30d`
- ... and 11 more
