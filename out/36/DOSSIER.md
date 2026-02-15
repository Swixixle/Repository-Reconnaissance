# DOSSIER: ELI — Epistemic Load Index

---

## 1. Identity of Target System
**What is it?**
- **VERIFIED:** ELI is a framework for producing justified, auditable claims from signed artifacts. It defines JSON schema contracts and validation logic for outputs termed "ELI outputs." (README.md:1-4)
- **VERIFIED:** Focus is on validating schema and the separation of cryptographic proof from inference; ELI itself does not perform signing or evidence management. (README.md:5-10, references/halo-integration.md:8-9)
- **VERIFIED:** The repository is an early-stage scaffold with no production implementation intended. (README.md:36, SECURITY.md:24)
- **VERIFIED:** Implements a schema validation tool (`validate-schema.js`) that checks if sample outputs conform to ELI’s schema. (README.md:20, validate-schema.js:106-149)

**What is it NOT?**
- **VERIFIED:** ELI does NOT execute cryptographic signing, store raw evidence, or manage keys. (EVIDENCE.md:3, references/halo-integration.md:8-9)
- **VERIFIED:** Not a universal truth system, not a cryptographic substitute, and does not self-verify claims. (CLAIM.md:15-16, EVIDENCE.md:32-33)
- **VERIFIED:** Not a production-ready pipeline or artifact deployer. (SECURITY.md:24)

---

## 2. Purpose & Jobs-to-be-done

- **VERIFIED:** To define and validate auditable claims about digital artifacts using a formal schema. (README.md:1-4)
- **VERIFIED:** To separate signed evidence from inference/claims, enhancing auditability and clarity over what is proven versus inferred. (README.md:6-7, EVIDENCE.md:3-4)
- **VERIFIED:** To interoperate with external systems for signing and receipts (e.g., HALO-RECEIPTS). (README.md:9-10, references/halo-integration.md:10-11)
- **INFERRED:** Enables downstream automation or manual review by emitting schema-valid signed claim artifacts as a compliance layer. (contracts/eli-output.schema.json, examples/eli-output.sample.json)
- **VERIFIED:** Provides a schema validator for checking ELI output files’ conformance to the defined contract. (README.md:20, validate-schema.js:101-149)

---

## 3. Capability Map

- **VERIFIED:** Validates an ELI output artifact (JSON) against a schema. (validate-schema.js:6-99, contracts/eli-output.schema.json)
- **VERIFIED:** Prints validation results, including errors and sample field previews. (validate-schema.js:123-144)
- **VERIFIED:** Supports local validation and Replit-based ("click Run") schema validation. (README.md:14-19, .replit:1)
- **VERIFIED:** Can be run with Node.js 20+ directly (`node validate-schema.js`). (README.md:27, replit.nix:3)
- **VERIFIED:** Documents required schema fields for claims and evidence. (CLAIM.md:7-11, EVIDENCE.md:8-22)
- **VERIFIED:** Enforces no additional properties (contracts/eli-output.schema.json:6) for strict schema conformance.
- **INFERRED:** Designed for extension and integration with external receipt/signature systems. (references/halo-integration.md:10-11)

---

## 4. Architecture Snapshot

- **Top Level Components:**
    - **Schema Definitions:** `contracts/eli-output.schema.json` (full output contract)
    - **Sample Artifacts:** `examples/eli-output.sample.json`
    - **Schema Validation Script:** `validate-schema.js`
    - **Configuration:** `.replit`, `replit.nix` (for Replit/Nix setup)
    - **Reference Docs:** CLAIM.md, EVIDENCE.md, references/halo-integration.md

- **VERIFIED:** The schema validator dynamically loads both schema and example file and performs in-process validation without external dependencies. (validate-schema.js:106-115)
- **VERIFIED:** Strict property checks, required fields, and pattern-based validation are implemented in the validator. (validate-schema.js:10-94, contracts/eli-output.schema.json)
- **VERIFIED:** Network, cryptographic operations, artifact signing, and key management are explicitly out of scope. (EVIDENCE.md:3, references/halo-integration.md:8-11)

---

## 5. How to Use the Target System

#### Prerequisites
- Install Node.js 20+ and jq (if running outside Replit; jq is listed but not required by validate-schema.js).
    - **VERIFIED:** On Replit/Nix, provided via `replit.nix`. (replit.nix:3-4)

#### Installation
- On Replit:
    - All dependencies are present; no additional install needed. (replit.nix:3-4)
- On other platforms:
    - Node.js 20+ must be installed. (README.md:27)
    - jq is not required unless scripts needing it are added; currently, validation logic does not use jq. (validate-schema.js:3-149)

#### Configuration
- Replit `.replit` defines:  
    `run = "node validate-schema.js"` (i.e., running validator script by default). (.replit:1)
- Nix channel locked to `stable-23_11`. (.replit:4)

#### Running Validation

**On Replit**
1. Open repository in Replit.
2. Click "Run" (runs `node validate-schema.js`). (README.md:16-19, .replit:1)

**Locally**
1. In the project directory, ensure `node` CLI is available.
2. Run:  
   ```sh
   node validate-schema.js
   ```
   (README.md:27, validate-schema.js:1)

#### Output
- If the example output conforms to schema:
    - Console: `"✓ Validation PASSED"`, sample field previews printed. (validate-schema.js:124-131)
- If not:
    - Console: `"✗ Validation FAILED"`, errors listed, exits non-zero. (validate-schema.js:132-135)

#### Verification
- Evidence of proper schema validation is the PASS output and field previews from the validator script. (validate-schema.js:124-131)
- To check a new ELI output, replace or add another file in `examples/` and modify validator script to load it (path is hardcoded). (validate-schema.js:107)

#### Common Failures & Fixes (INFERRED & VERIFIED)
- **Schema validation fails:** Inputs do not conform to JSON schema (field missing, wrong types, etc.) — review errors and adjust. (validate-schema.js:133-134)
- **Cannot execute node:** Node.js not present or not version 20+ — install correct Node.js. (README.md:27, replit.nix:3)

---

## 6. Integration Surface

- **APIs:** NONE (no REST, GraphQL, or RPC interface).
- **Artifacts:** Deterministic, schema-valid JSON output files (`eli-output.sample.json` or user-generated equivalents). (contracts/eli-output.schema.json, examples/eli-output.sample.json)
- **External Integration:** References points for evidence and signature objects are fields within the ELI output for consumption by systems like HALO-RECEIPTS. (references/halo-integration.md:3-12)
- **SDKs:** NONE.
- **Webhooks:** NONE.

---

## 7. Data & Security Posture

- **Data at Rest:** Only JSON schema, sample output, and optionally user input files — no sensitive data nor secret material handled. (examples/eli-output.sample.json)
- **Encryption:** NONE — no support or code for cryptographic operations in validation or storage. (EVIDENCE.md:3, references/halo-integration.md:8, validate-schema.js:3-149)
- **Authentication/Secrets:** NONE — no secrets referenced or required for operation. (validate-schema.js)
- **Secret Handling:** If a secret is ever required (e.g., for external signing, email for security reporting), it is only referenced out-of-band in SECURITY.md. (SECURITY.md:13)
- **Security Policy:** Security issues may be reported by email. No security guarantees for any code in repo. (SECURITY.md:24)

---

## 8. Operational Reality

- **VERIFIED:** No continuous service to operate — main operation is CLI invocation of schema validator. (validate-schema.js, README.md:27)
- **VERIFIED:** Uptime, port management, and background process support are not applicable. (Codebase—no server code)
- **VERIFIED:** Only dependency is Node.js 20+ (and jq for certain environments). (replit.nix:3-4)
- **INFERRED:** Keeping the schema, validator, and sample files in sync is key for maintenance.
- **VERIFIED:** No observed log rotation, state persistence, or external dependencies. (validate-schema.js:3-149)

---

## 9. Maintainability & Change Risk

- **VERIFIED:** Schema evolution is the largest risk, as downstream consumers or validators must be updated in lockstep. (contracts/eli-output.schema.json, examples/eli-output.sample.json)
- **VERIFIED:** Validator logic is local and simple but will require updates for new JSON schema drafts or complex rules. (validate-schema.js:6-99)
- **VERIFIED:** No dependency on external libraries means upgrades to validation logic or schema must be hand-rolled.
- **INFERRED:** Security and integration risk is extremely low given the lack of cryptography or secret handling.

---

## 10. Unknowns / Missing Evidence

- **Install instructions for non-Nix/non-Replit:** No install scripts or docs for Mac/Win/Linux outside Nix/Replit. (UNKNOWN — evidence needed: Instructions or scripts for Node.js/jq setup)
- **Automated deployment/integration steps:** No Makefile, CI, or Dockerfile found for integrating with downstream or CI/CD systems. (UNKNOWN — evidence needed: Such files/process docs)
- **End-to-end examples of claims and HALO integration:** No concrete workflow or scripts showing full workflow from input through HALO receipt. (UNKNOWN — evidence needed: Examples showing `eli-output.sample.json` with a signed HALO receipt and validation)
- **Schema update coordination:** No documented process for upgrading schema and updating validator/sample files cohesively. (UNKNOWN — evidence needed: Process doc or versioning procedure)
- **Network-bound workloads or open ports:** No evidence of any port, network, or server operation. (INFERRED/UNKNOWN)
- **Data privacy workflows:** Some fields support PHI flagging, but no detail on de-identification or PII handling. (examples/eli-output.sample.json:28-29)
- **Formal test suite:** No tests or harnesses found. (UNKNOWN — evidence needed: test/ or similar)
- **Schema draft/versioning:** While the draft is specified in contracts/eli-output.schema.json:2 ("2020-12"), future migration path is not discussed.

---

## 11. Receipts (Evidence Index)

- README.md:1-36 (framework description, usage, goals)
- CLAIM.md:7-18 (claim/counter model, non-goals)
- EVIDENCE.md:3-34 (storage, contract, verification, non-goals)
- references/halo-integration.md:1-23 (integration boundaries, eligible artifacts)
- .replit:1-7 (run command, Nix channel, deployment config)
- replit.nix:1-6 (Node.js/jq deps)
- validate-schema.js:1-149 (schema validator logic)
- contracts/eli-output.schema.json:1-157 (output artifact schema)
- examples/eli-output.sample.json:1-56 (schema-conformant output)
- SECURITY.md:1-24 (disclosures, scope)
  
---

## 12. Replit Execution Profile

**VERIFIED:**  
- Main entry point: `node validate-schema.js` (as set in `.replit:1` and `[deployment]` block:6-7).
- Nix environment provides `nodejs_20` and `jq`. (replit.nix:3-4)
- The "Run" button in Replit triggers the validator on the provided sample. (README.md:16-19)
- No server or background process; execution is ephemeral and stateless.
  
---

**This dossier is derived from static artifacts only — it does NOT observe runtime behavior or guarantee security/completeness.**