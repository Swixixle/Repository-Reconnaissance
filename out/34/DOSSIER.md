# DOSSIER: prompt-box (pb)

---

## 1. Identity of Target System

- **What it is:**  
  `prompt-box` (invoked via the `pb` command) is a safety-first command gate for terminal use. It evaluates, classifies, and conditionally executes user-provided shell commands, focusing on eliminating shell injection risks.  
  **VERIFIED** ([README.md:3](README.md:3), [SECURITY.md:4-15](SECURITY.md:4-15))

- **What it is NOT:**  
  It is not a general shell, command-line interpreter, or automation tool. It does **not** provide implicit shell features (pipes, redirects, globbing) or script execution.  
  **VERIFIED** ([README.md:23](README.md:23), [SECURITY.md:16,29-35](SECURITY.md:16,29-35))

---

## 2. Purpose & Jobs-to-be-done

- Designed to **prevent accidental or malicious execution** of pasted shell commands by requiring explicit review and/or confirmation before running.  
  **VERIFIED** ([README.md:5-10](README.md:5-10), [SECURITY.md:4-15](SECURITY.md:4-15))

- Jobs:
  - Inspect and classify pasted or input shell commands.
  - Present a plan and classification (ALLOW / REVIEW / BLOCK) for each.
  - Enable interactive "dry runs" and safe, explicit execution (on YES confirmation).
  - (Optional) Accept input from clipboard.  
  **VERIFIED** ([README.md:6-9](README.md:6-9), [SECURITY.md:13-15](SECURITY.md:13-15))

---

## 3. Capability Map

### Core Capabilities

| Feature                     | Epistemic Status | Evidence                                  |
|-----------------------------|------------------|--------------------------------------------|
| Reads commands from stdin    | VERIFIED         | [README.md:6](README.md:6)                |
| Reads commands from clipboard| INFERRED         | [README.md:6] (mentions `pb clip`)         |
| Classifies input            | VERIFIED         | [README.md:7](README.md:7)                |
| Safety classification (ALLOW/REVIEW/BLOCK) | VERIFIED | [README.md:7][SECURITY.md:13](SECURITY.md:13) |
| Plan output prior to execution| VERIFIED         | [README.md:8](README.md:8)                 |
| Interactive confirmation (YES prompt for run)| VERIFIED | [README.md:9](README.md:9), [SECURITY.md:11](SECURITY.md:11) |
| Only ALLOW commands executed| VERIFIED         | [SECURITY.md:14](SECURITY.md:14)          |
| Execution audit receipts (JSON) | VERIFIED      | [SECURITY.md:25](SECURITY.md:25), [receipts/receipt_1770455078.json:all](receipts/receipt_1770455078.json) |

---

## 4. Architecture Snapshot

- **Main Interface**: `pb` Bash script (exact language implementation inferred)
- **Installation**: Executable Bash script symlinked to `/usr/local/bin` for global access  
  **VERIFIED** ([README.md:13-14](README.md:13-14))
- **Input**: Commands via stdin (`printf ... | pb check`), or (optionally) via clipboard (`pb clip`)  
  **VERIFIED/INFERRED** ([README.md:6,17,18](README.md:6,17,18))
- **Command Classification**: Logic for ALLOW/REVIEW/BLOCK (details not visible in code snapshot—criteria not uncovered)
- **Audit Trail**: Execution results log as JSON per run in `receipts/` directory  
  **VERIFIED** ([SECURITY.md:25](SECURITY.md:25), [receipts/receipt_1770455078.json:all](receipts/receipt_1770455078.json))

---

## 5. How to Use the Target System

### Prerequisites

You must have:
- A Unix-like shell
- Ability to run bash scripts (i.e., `chmod +x`)
- **sudo** access (for global `pb` install)
- `ln` utility (to create symlink)  
**VERIFIED** ([README.md:12-14](README.md:12-14))

### Installation

1. **Change to the prompt-box directory**  
   `cd ~/prompt-box`  
   _([README.md:12](README.md:12))_

2. **Make the pb script executable**  
   `chmod +x pb`  
   _([README.md:13](README.md:13))_

3. **Install pb as a global command via symlink**  
   `sudo ln -sf "$(pwd)/pb" /usr/local/bin/pb`  
   _([README.md:14](README.md:14))_

### Configuration

- No explicit configuration files or environment variables required.  
  _([README.md:5-23](README.md:5-23))_

### Running (Development or "Normal" Use)

1. **Safety check classification:**  
   `printf "pwd\nls -la\n" | pb check`  
   _([README.md:17](README.md:17))_

2. **Interactive execution:**  
   `printf "pwd\nls -la\n" | pb run`  
   _(You will be prompted to type 'YES' to confirm execution)_  
   _([README.md:18](README.md:18))_

- (Optional) To check commands from clipboard:  
  `pb clip check`  
  _([README.md:6](README.md:6), INFERRED: usage detail not shown)_

### Verification Steps

- Test dry-run classification to verify installation:  
  `printf "pwd\nls -la\n" | pb check`  
  _(should show classification for each line)_  
  _([README.md:17](README.md:17))_

### Common Failures & Fixes

| Symptom                        | Cause                  | Fix                                 |
|---------------------------------|------------------------|-------------------------------------|
| `'pb' command not found`        | Symlink/path issue     | Repeat `sudo ln -sf ...`, check $PATH ([README.md:14](README.md:14)) |
| `Permission denied` on pb       | Not executable         | `chmod +x pb` ([README.md:13](README.md:13))         |
| Receipts not generated          | `receipts/` dir missing or not writable | Create dir with write perms ([SECURITY.md:25](SECURITY.md:25)) |

---

## 6. Integration Surface

- **CLI commands:** Main interface (`pb check`, `pb run`, `pb clip`)
- **Data format (output):**  
  - Receipts written as **JSON** files in `receipts/` (with fields: tool, timestamp, cwd, results array, etc.)  
    **VERIFIED** ([receipts/receipt_1770455078.json:all](receipts/receipt_1770455078.json))
- **No evidence of webhooks, APIs, SDKs, or service integration points**  
  **UNKNOWN** — evidence needed: Any files, directories, or lines indicating network API, server ports, or inbound integration.

---

## 7. Data & Security Posture

- **Data Storage:** Execution audit receipts as JSON to `receipts/` directory, likely on local filesystem  
  **VERIFIED** ([SECURITY.md:25](SECURITY.md:25), [receipts/receipt_1770455078.json:all](receipts/receipt_1770455078.json))

- **No receipt/output data is committed to version control by policy**  
  **VERIFIED** ([SECURITY.md:26](SECURITY.md:26))

- **Shell Safety:**  
  - No `shell=True` calls  
  - Uses `shlex.split()` for argument parsing  
  - Never interprets or expands shell metacharacters (no pipes, redirects, globbing, etc.)  
    **VERIFIED** ([SECURITY.md:7-9,16](SECURITY.md:7-9,16), [README.md:21-23](README.md:21-23))

- **Secret Handling:**  
  **UNKNOWN** — no evidence of secrets usage or handling. No config or code revealed requiring secret values.

- **Authentication/Authorization:**  
  - Execution requires explicit user confirmation (typing 'YES' interactively) for `run`  
    **VERIFIED** ([README.md:9](README.md:9), [SECURITY.md:11](SECURITY.md:11))
  - No evidence of user authentication or network auth controls  
    **UNKNOWN** — evidence needed: Any multi-user/auth logic in codebase

- **Encryption:**  
  - No mention of encrypted data-at-rest or encrypted receipts  
    **UNKNOWN** — evidence needed: Any config or code specifying file/disk encryption or similar properties

---

## 8. Operational Reality

**To keep `prompt-box` running:**

- Requires writable `receipts/` directory for logging/audit  
  **VERIFIED** ([SECURITY.md:25](SECURITY.md:25))
- Shell and symlinking (`/usr/local/bin` must be writable by installer, i.e., via `sudo`)  
  **VERIFIED** ([README.md:14](README.md:14))
- No background services, daemons, or network listeners to maintain  
  **INFERRED** (no `service`, `daemon`, or network evidence in visible files)
- Only persistent state is audit logs (manual rotation/purge may be required as storage grows)  
  **INFERRED**
- No automated crash recovery, background process monitoring, or systemd integration observed  
  **UNKNOWN** — evidence needed: No `systemd`, supervisor, or watchdog configs present

---

## 9. Maintainability & Change Risk

- **Script-based, single-file utility:**  
  - Easy to deploy or update (replace `pb` script, re-symlink as needed)  
    **VERIFIED** ([README.md:13-14](README.md:13-14))
- **No documented external dependencies, environment-agnostic**  
  **VERIFIED** ([README.md:5-23](README.md:5-23))
- **Change risk:**  
  - Low if receipt format remains stable and script logic is simple
  - High risk if semantics for ALLOW/REVIEW/BLOCK are changed or if future versions add pipes, redirects, or globbing (see threat model notes)  
    **VERIFIED** ([SECURITY.md:29-33](SECURITY.md:29-33))
- **No automated tests or CI/CD evidence**  
  **UNKNOWN** — evidence needed: any `test/`, `.github/`, or CI config files

---

## 10. Replit Execution Profile

**MANDATORY** — No evidence of Replit-specific configuration (`replit.nix`, `.replit`, `replit.yaml`) was detected.

- **UNKNOWN** — evidence needed: Any file indicating this project is Replit-native, e.g., `.replit`.

---

## 11. Unknowns / Missing Evidence

- **Criteria for ALLOW/REVIEW/BLOCK**:  
  "How does `pb` decide if a command is allowed, needs review, or is blocked?"  
  **UNKNOWN** — code/algorithm not available.

- **Production/development mode distinctions:**  
  Is there any environment difference in mode, configs, logging?  
  **UNKNOWN** (explicitly noted in HOWTO and not present in `README.md` or other static docs)

- **Secret/config handling:**  
  Does `pb` leverage secrets, advanced configuration files, or environment variables for customization?  
  **UNKNOWN** — no evidence found.

- **Integration endpoints (API/webhook/etc.):**  
  No evidence for network-based integration, only CLI.

- **Multi-user/Audit controls:**  
  Receipt/audit logs per user? Shared hosts?  
  **UNKNOWN**

---

## 12. Receipts (Evidence Index)

| Claim/Section                                      | Evidence Citation(s)                            |
|----------------------------------------------------|-------------------------------------------------|
| Identity, Purpose, Capabilities                    | README.md:3,5-10,12-23; SECURITY.md:4-15,25-26  |
| Usage/Install                                      | README.md:12-14,17,18                           |
| Data, Security Model & Logging                     | SECURITY.md:7-9,11,13-17,21,25-26; receipts/receipt_1770455078.json:all |
| Directory/Permission requirements                  | SECURITY.md:25; README.md:13-14                 |
| No config requirement                              | README.md:5-23                                  |
| Clipboard input                                    | README.md:6 (INFERRED)                          |
| No pipes/redirects                                 | README.md:23; SECURITY.md:16,29-33              |
| Interactive conf (YES-prompt)                      | README.md:9; SECURITY.md:11                     |

---

**End of Dossier: Derived strictly from static source evidence as of snapshot. Claims marked UNKNOWN or INFERRED require further artifact or code review.**
