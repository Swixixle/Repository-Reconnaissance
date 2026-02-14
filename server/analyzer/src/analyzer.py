import os
import json
import asyncio
from pathlib import Path
from typing import Dict, Any, List, Optional
from rich.console import Console
import openai
from dotenv import load_dotenv

from core.acquire import acquire_target, AcquireResult
from core.replit_profile import ReplitProfiler

load_dotenv()


class Analyzer:
    def __init__(self, source: str, output_dir: str, mode: str = "github"):
        self.source = source
        self.mode = mode
        self.output_dir = Path(output_dir)
        self.packs_dir = self.output_dir / "packs"
        self.console = Console()
        self.replit_profile: Optional[Dict[str, Any]] = None
        self.acquire_result: Optional[AcquireResult] = None

        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.packs_dir.mkdir(parents=True, exist_ok=True)

        self.client = openai.OpenAI(
            api_key=os.environ.get("AI_INTEGRATIONS_OPENAI_API_KEY"),
            base_url=os.environ.get("AI_INTEGRATIONS_OPENAI_BASE_URL")
        )

    @staticmethod
    def get_console():
        return Console()

    async def run(self):
        self.console.print("[bold]Step 1: Acquiring target...[/bold]")
        self.acquire_result = acquire_target(
            target=self.source if self.mode != "replit" else None,
            replit_mode=(self.mode == "replit"),
            output_dir=self.output_dir,
        )
        self.repo_dir = self.acquire_result.root_path
        self.mode = self.acquire_result.mode
        self.console.print(f"  Mode: {self.mode}, Root: {self.repo_dir}, RunID: {self.acquire_result.run_id}")

        self.console.print("[bold]Step 2: Indexing files...[/bold]")
        file_index = self.index_files()
        self.console.print(f"  Indexed {len(file_index)} files")

        self.console.print("[bold]Step 3: Creating evidence packs...[/bold]")
        packs = self.create_evidence_packs(file_index)

        if self.mode == "replit":
            self.console.print("[bold]Step 3b: Replit profiling...[/bold]")
            profiler = ReplitProfiler(self.repo_dir)
            self.replit_profile = profiler.detect()
            self.save_json("replit_profile.json", self.replit_profile)
            packs["replit"] = json.dumps(self.replit_profile, indent=2, default=str)
            self.console.print(f"  is_replit={self.replit_profile.get('is_replit')}, "
                               f"secrets={len(self.replit_profile.get('required_secrets', []))}, "
                               f"port={self.replit_profile.get('port_binding', {})}")

        self.console.print("[bold]Step 4: Extracting how-to...[/bold]")
        howto = await self.extract_howto(packs)

        self.console.print("[bold]Step 5: Generating claims & dossier...[/bold]")
        dossier, claims = await self.generate_dossier(packs, howto)

        self.save_json("index.json", file_index)
        self.save_json("target_howto.json", howto)
        self.save_json("claims.json", claims)
        self.save_json("coverage.json", {
            "mode": self.mode,
            "run_id": self.acquire_result.run_id,
            "scanned": len(file_index),
            "skipped": 0,
            "is_replit": self.replit_profile is not None and self.replit_profile.get("is_replit", False),
        })

        with open(self.output_dir / "DOSSIER.md", "w") as f:
            f.write(dossier)

        self.console.print("[bold green]All outputs written.[/bold green]")

    def index_files(self) -> List[str]:
        skip_dirs = {".git", "node_modules", "__pycache__", ".pythonlibs", ".cache",
                     ".local", ".config", "out", ".upm", ".replit_agent"}
        skip_extensions = {".lock", ".png", ".jpg", ".jpeg", ".gif", ".ico",
                           ".woff", ".woff2", ".ttf", ".eot", ".map"}
        file_list = []
        for root, dirs, files in os.walk(self.repo_dir):
            dirs[:] = [d for d in dirs if d not in skip_dirs]
            for file in files:
                ext = os.path.splitext(file)[1]
                if ext in skip_extensions:
                    continue
                rel_path = os.path.relpath(os.path.join(root, file), self.repo_dir)
                file_list.append(rel_path)
        return file_list

    def create_evidence_packs(self, file_index: List[str]) -> Dict[str, str]:
        packs: Dict[str, List[str]] = {
            "docs": [],
            "config": [],
            "code": [],
            "ops": [],
        }

        for f in file_index:
            lower = f.lower()
            if "readme" in lower or ".md" in lower or "doc" in lower or "changelog" in lower:
                packs["docs"].append(f)
            elif any(cfg in lower for cfg in [
                "package.json", "requirements.txt", "pyproject.toml", "cargo.toml",
                "docker", ".env", "config", ".replit", "replit.nix", "makefile",
                "taskfile", ".github/workflows", "tsconfig", "vite.config",
            ]):
                packs["config"].append(f)
            elif any(ops in lower for ops in [
                "dockerfile", "docker-compose", ".github", "ci", "deploy", "k8s", "helm",
            ]):
                packs["ops"].append(f)
            elif any(ext in lower for ext in [
                ".ts", ".js", ".py", ".go", ".rs", ".java", ".rb", ".tsx", ".jsx",
            ]):
                packs["code"].append(f)

        evidence = {}
        for category, files in packs.items():
            content = ""
            limit = 30 if category == "config" else 20
            for f in files[:limit]:
                try:
                    text = (self.repo_dir / f).read_text(errors='ignore')
                    lines = text.splitlines()
                    line_limit = 300 if category == "config" else 500
                    numbered_lines = "\n".join(
                        [f"{i+1}: {line}" for i, line in enumerate(lines[:line_limit])]
                    )
                    content += f"\n--- FILE: {f} ---\n{numbered_lines}\n"
                except Exception:
                    pass

            pack_content = content[:100000]
            evidence[category] = pack_content
            (self.packs_dir / f"{category}_pack.txt").write_text(pack_content)

        return evidence

    async def extract_howto(self, packs: Dict[str, str]) -> Dict[str, Any]:
        replit_context = ""
        if self.mode == "replit" and self.replit_profile:
            replit_context = f"""
IMPORTANT: This is a Replit workspace. You MUST include a "replit_execution_profile" key in your JSON output.

The Replit profiler detected the following (use this as evidence):
{json.dumps(self.replit_profile, indent=2, default=str)}

The "replit_execution_profile" must contain:
- "run_command": string (from .replit file, cite .replit:<line>)
- "language": string
- "port_binding": object with port, binds_all_interfaces, uses_env_port, evidence array
- "required_secrets": array of {{"name": "VAR_NAME", "referenced_in": ["file:line"]}}
- "external_apis": array of {{"api": "name", "evidence_files": ["file"]}}
- "deployment_assumptions": array of strings
- "observability": object with logging, health_endpoint, evidence array
- "limitations": array of strings (things that could not be determined)

Every field must cite evidence. If no evidence exists, set value to null and add to "unknowns".
Do NOT invent information. If a field cannot be determined, mark it unknown.
Cap confidence at 0.20 for any claim without direct file:line evidence.
"""

        prompt = f"""You are an expert system operator. Analyze the provided evidence to extract a JSON 'Operator Manual' for the target system.

Output this exact JSON schema:
{{
    "prereqs": ["list of tools/runtimes needed"],
    "install_steps": [{{"step": "description", "command": "command or null", "evidence": "file:line or null"}}],
    "config": [{{"name": "env var or config file", "purpose": "what it does", "evidence": "file:line reference"}}],
    "run_dev": [{{"step": "description", "command": "command", "evidence": "file:line reference"}}],
    "run_prod": [{{"step": "description", "command": "command or unknown", "evidence": "file:line reference or null"}}],
    "usage_examples": [{{"description": "what it does", "command": "example command or API call"}}],
    "verification_steps": [{{"step": "description", "command": "command", "evidence": "file:line reference"}}],
    "common_failures": [{{"symptom": "what happens", "cause": "why", "fix": "how to fix"}}],
    "unknowns": [{{"item": "what is missing", "evidence_needed": "what would resolve it"}}],
    "missing_evidence_requests": ["list of things that could not be verified"]
}}
{replit_context}

RULES:
- Every claim MUST cite evidence as file:line.
- If you cannot cite evidence, mark as unknown and add to "unknowns" AND "missing_evidence_requests".
- Do NOT invent instructions or steps that are not supported by the provided evidence.
- If a how-to step has no evidence, set confidence to 0.20 or lower.
"""

        user_content = (
            f"DOCS:\n{packs.get('docs', '')[:40000]}\n\n"
            f"CONFIG:\n{packs.get('config', '')[:40000]}\n\n"
            f"OPS:\n{packs.get('ops', '')[:20000]}"
        )

        if "replit" in packs:
            user_content += f"\n\nREPLIT PROFILE:\n{packs['replit'][:20000]}"

        try:
            response = self.client.chat.completions.create(
                model="gpt-4.1",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": user_content}
                ],
                response_format={"type": "json_object"},
                max_completion_tokens=8192,
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            self.console.print(f"[red]Error extracting howto:[/red] {e}")
            return {
                "error": str(e),
                "unknowns": [{"item": "Full how-to extraction failed", "evidence_needed": "Retry or check API key"}],
            }

    async def generate_dossier(self, packs: Dict[str, str], howto: Dict[str, Any]) -> tuple[str, Dict[str, Any]]:
        replit_section = ""
        if self.mode == "replit" and self.replit_profile:
            replit_section = """
10. **Replit Execution Profile**
    Include ALL of the following subsections with evidence citations (file:line):
    - Run command (from .replit)
    - Language/runtime
    - Port binding (port number, 0.0.0.0 binding, env PORT usage)
    - Required secrets (names only, NEVER values, cite file:line where each is referenced)
    - External APIs referenced (with evidence files)
    - Nix packages required (from replit.nix)
    - Deployment assumptions
    - Observability/logging (present or absent, cite evidence)
    - Limitations (what could NOT be determined)
"""

        prompt = f"""You are the 'Program Totality Analyzer'. Write a comprehensive Markdown DOSSIER about this target system.

MANDATORY SECTIONS:
1. **Identity of Target System** (What is it? What is it NOT?)
2. **Purpose & Jobs-to-be-done**
3. **Capability Map**
4. **Architecture Snapshot**
5. **How to Use the Target System** (Operator manual - refine the provided howto JSON into readable, actionable steps with evidence citations)
6. **Integration Surface** (APIs, webhooks, SDKs, data formats)
7. **Data & Security Posture** (Storage, encryption, auth, secret handling)
8. **Operational Reality** (What it takes to keep running)
9. **Maintainability & Change Risk**
{replit_section}
11. **Unknowns / Missing Evidence** (What could NOT be determined - be specific)
12. **Receipts** (Evidence index: list every file:line citation used above)

RULES:
- Every claim MUST cite evidence as (file:line) inline.
- If no evidence exists for a claim, say "Unknown — evidence needed: <describe>" and add to Unknowns section.
- Do NOT hallucinate. Do NOT use vague adjectives. Be specific and operational.
- The "How to Use" section must read like an actual operator manual with concrete commands.
- For Replit projects: the Replit Execution Profile section is MANDATORY.
- All secrets must be referenced by NAME only, never expose values.
"""

        howto_str = json.dumps(howto, indent=2, default=str)
        replit_str = ""
        if self.replit_profile:
            replit_str = f"\n\nREPLIT PROFILE (detected by static analysis):\n{json.dumps(self.replit_profile, indent=2, default=str)}"

        user_content = (
            f"HOWTO JSON:\n{howto_str}\n\n"
            f"DOCS:\n{packs.get('docs', '')[:30000]}\n\n"
            f"CONFIG:\n{packs.get('config', '')[:30000]}\n\n"
            f"CODE SNAPSHOT:\n{packs.get('code', '')[:40000]}"
            f"{replit_str}"
        )

        try:
            response = self.client.chat.completions.create(
                model="gpt-4.1",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": user_content}
                ],
                max_completion_tokens=8192,
            )
            dossier = response.choices[0].message.content

            claims = {
                "type": "dossier_generated",
                "mode": self.mode,
                "run_id": self.acquire_result.run_id if self.acquire_result else None,
                "is_replit": self.replit_profile is not None and self.replit_profile.get("is_replit", False),
                "sections_generated": True,
            }

            return dossier, claims
        except Exception as e:
            self.console.print(f"[red]Error generating dossier:[/red] {e}")
            return f"# Analysis Error\n\nFailed to generate dossier: {e}", {"error": str(e)}

    def save_json(self, filename: str, data: Any):
        with open(self.output_dir / filename, "w") as f:
            json.dump(data, f, indent=2, default=str)
