# Program Totality Report — Engineer View

**EvidencePack Version:** 1.0
**Tool Version:** 0.1.0
**Generated:** 2026-02-15T10:35:41.174257+00:00
**Mode:** github
**Run ID:** d159c0e56321

---

## PTA Contract Audit — Run d159c0e56321

### 1. System Snapshot

| Measure | Value |
|---------|-------|
| Files Analyzed | 6 |
| Files Seen (incl. skipped) | 6 |
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

**Score:** 59.67%
**Formula:** `average(claims_coverage, unknowns_coverage, howto_completeness)`

| Component | Score |
|-----------|-------|
| claims_coverage | 100.00% |
| unknowns_coverage | 0.00% |
| howto_completeness | 79.00% |

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

### The main interface for prompt-box is a Bash script called 'pb'.
Confidence: 90%
- Evidence: `README.md:13-14` (hash: `11ad9ae773c3`)

### prompt-box is installed globally by symlinking the executable bash script to /usr/local/bin.
Confidence: 100%
- Evidence: `README.md:13-14` (hash: `11ad9ae773c3`)

### prompt-box receives commands via stdin or optionally via clipboard for checking and classification.
Confidence: 90%
- Evidence: `README.md:6` (hash: `d76c7efdab86`)
- Evidence: `README.md:17-18` (hash: `6e935fa72ffa`)

### prompt-box provides an execution audit trail as JSON per run in the receipts directory.
Confidence: 100%
- Evidence: `SECURITY.md:25` (hash: `9f3786cfb498`)
- Evidence: `receipts/receipt_1770455078.json:all` (hash: `021fb596db81`)

## Verified: Capability Map

### prompt-box reads commands from stdin for processing.
Confidence: 100%
- Evidence: `README.md:6` (hash: `d76c7efdab86`)

### prompt-box can read commands from the clipboard using the `pb clip` subcommand (usage inferred from documentation).
Confidence: 90%
- Evidence: `README.md:6` (hash: `d76c7efdab86`)

### prompt-box classifies input commands by safety level.
Confidence: 100%
- Evidence: `README.md:7` (hash: `8f0539146eac`)

### prompt-box supports ALLOW / REVIEW / BLOCK classifications for commands.
Confidence: 100%
- Evidence: `SECURITY.md:13` (hash: `735a6203b156`)

### prompt-box outputs a plan prior to execution for each input command.
Confidence: 100%
- Evidence: `README.md:8` (hash: `787e0332c611`)

### prompt-box requires interactive confirmation with a YES prompt before executing commands via `pb run`.
Confidence: 100%
- Evidence: `README.md:9` (hash: `7d19eaa0ed36`)
- Evidence: `SECURITY.md:11` (hash: `6c0d02167b4a`)

### Only commands classified as ALLOW are executed by prompt-box.
Confidence: 100%
- Evidence: `SECURITY.md:14` (hash: `14c50384955f`)

### prompt-box logs execution audit receipts as JSON files in the receipts directory.
Confidence: 100%
- Evidence: `SECURITY.md:25` (hash: `9f3786cfb498`)
- Evidence: `receipts/receipt_1770455078.json:all` (hash: `021fb596db81`)

## Verified: Data & Security Posture

### prompt-box stores audit logs locally as JSON receipts in the receipts/ directory.
Confidence: 100%
- Evidence: `SECURITY.md:25` (hash: `9f3786cfb498`)
- Evidence: `receipts/receipt_1770455078.json:all` (hash: `021fb596db81`)

### Receipts/output data is not committed to version control by policy.
Confidence: 100%
- Evidence: `SECURITY.md:26` (hash: `8b8e6d16a307`)

### prompt-box never interprets or expands shell metacharacters, does not support pipes, redirects, or globbing, and uses shlex.split() for argument parsing.
Confidence: 100%
- Evidence: `SECURITY.md:7-9` (hash: `3498ed5fa62e`)
- Evidence: `SECURITY.md:16` (hash: `cf8e7da6c49e`)
- Evidence: `README.md:21-23` (hash: `088b1046f41c`)

### Execution of commands requires explicit user confirmation, by typing 'YES' interactively for the run operation.
Confidence: 100%
- Evidence: `README.md:9` (hash: `7d19eaa0ed36`)
- Evidence: `SECURITY.md:11` (hash: `6c0d02167b4a`)

## Verified: How to Use the Target System

### Installation requires a Unix-like shell, ability to run bash scripts, sudo access for global install, and ln utility for creating a symlink.
Confidence: 100%
- Evidence: `README.md:12-14` (hash: `8472e1fe0def`)

### No explicit configuration files or environment variables are required for prompt-box operation.
Confidence: 100%
- Evidence: `README.md:5-23` (hash: `31ab8384b003`)

### After installation, users can classify commands with `pb check` or interactively execute with `pb run`, confirming with 'YES' when prompted.
Confidence: 100%
- Evidence: `README.md:17-18` (hash: `6e935fa72ffa`)

## Verified: Identity of Target System

### `prompt-box` (pb) is a safety-first command gate for terminal use, invoked via the `pb` command, focused on eliminating shell injection risks.
Confidence: 100%
- Evidence: `README.md:3` (hash: `4e0017678fb1`)
- Evidence: `SECURITY.md:4-15` (hash: `81e5748047f4`)

### prompt-box is not a general shell, command-line interpreter, or automation tool and does not provide implicit shell features such as pipes, redirects, globbing, or script execution.
Confidence: 100%
- Evidence: `README.md:23` (hash: `69293e77f40f`)
- Evidence: `SECURITY.md:16` (hash: `cf8e7da6c49e`)
- Evidence: `SECURITY.md:29-35` (hash: `986c9620e9ce`)

## Verified: Integration Surface

### prompt-box writes execution receipts as JSON files inside the receipts directory, detailing tool, timestamp, cwd, and command results.
Confidence: 100%
- Evidence: `receipts/receipt_1770455078.json:all` (hash: `021fb596db81`)

### There is no evidence of prompt-box exposing APIs, webhooks, SDKs, or network/service integration points.
Confidence: 80%
- Evidence: `README.md:5-23` (hash: `31ab8384b003`)

## Verified: Maintainability & Change Risk

### prompt-box is script-based, single-file, and easy to deploy or update by replacing the pb script and resymlinking as needed.
Confidence: 100%
- Evidence: `README.md:13-14` (hash: `11ad9ae773c3`)

### prompt-box has no documented external dependencies and is designed to be environment-agnostic.
Confidence: 100%
- Evidence: `README.md:5-23` (hash: `31ab8384b003`)

### Changing the semantics for ALLOW/REVIEW/BLOCK classification or adding pipes, redirects, or globbing introduces high risk according to threat model notes.
Confidence: 100%
- Evidence: `SECURITY.md:29-33` (hash: `986c9620e9ce`)

## Verified: Operational Reality

### A writable receipts/ directory is required for audit logging and normal operation.
Confidence: 100%
- Evidence: `SECURITY.md:25` (hash: `9f3786cfb498`)

### Installing prompt-box globally requires write/sudo access to /usr/local/bin for proper symlinking.
Confidence: 100%
- Evidence: `README.md:14` (hash: `8f27053f74fb`)

## Verified: Purpose & Jobs-to-be-done

### prompt-box is designed to prevent accidental or malicious execution of pasted shell commands by requiring explicit review and/or confirmation before running.
Confidence: 100%
- Evidence: `README.md:5-10` (hash: `31ab8384b003`)
- Evidence: `SECURITY.md:4-15` (hash: `81e5748047f4`)

### prompt-box inspects and classifies pasted or input shell commands, presents a plan and classification (ALLOW / REVIEW / BLOCK), and supports interactive dry runs and safe execution after explicit 'YES' confirmation.
Confidence: 100%
- Evidence: `README.md:6-9` (hash: `d76c7efdab86`)
- Evidence: `SECURITY.md:13-15` (hash: `735a6203b156`)

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

## Snippet Hashes (24 total)

- `021fb596db81`
- `088b1046f41c`
- `11ad9ae773c3`
- `14c50384955f`
- `31ab8384b003`
- `3498ed5fa62e`
- `4e0017678fb1`
- `69293e77f40f`
- `6c0d02167b4a`
- `6e935fa72ffa`
- `72c9329841eb`
- `735a6203b156`
- `787e0332c611`
- `7d19eaa0ed36`
- `81e5748047f4`
- `8472e1fe0def`
- `8b8e6d16a307`
- `8f0539146eac`
- `8f27053f74fb`
- `986c9620e9ce`
- ... and 4 more
