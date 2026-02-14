import os
import json
import shutil
import asyncio
from pathlib import Path
from typing import Dict, Any, List
from rich.console import Console
from git import Repo
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Analyzer:
    def __init__(self, repo_url: str, output_dir: str):
        self.repo_url = repo_url
        self.output_dir = Path(output_dir)
        self.repo_dir = self.output_dir / "repo"
        self.packs_dir = self.output_dir / "packs"
        self.console = Console()
        
        # Ensure directories exist
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.packs_dir.mkdir(parents=True, exist_ok=True)
        
        # OpenAI setup
        self.client = openai.OpenAI(
            api_key=os.environ.get("AI_INTEGRATIONS_OPENAI_API_KEY"),
            base_url=os.environ.get("AI_INTEGRATIONS_OPENAI_BASE_URL")
        )

    @staticmethod
    def get_console():
        return Console()

    async def run(self):
        self.console.print("Step 1: Acquiring target...")
        self.acquire_repo()

        self.console.print("Step 2: Indexing and Coverage...")
        file_index = self.index_files()
        
        self.console.print("Step 3: Creating Evidence Packs...")
        packs = self.create_evidence_packs(file_index)
        
        self.console.print("Step 4: Extracting 'How-to'...")
        howto = await self.extract_howto(packs)
        
        self.console.print("Step 5: Generating Claims & Dossier...")
        dossier, claims = await self.generate_dossier(packs, howto)
        
        # Save artifacts
        self.save_json("index.json", file_index)
        self.save_json("target_howto.json", howto)
        self.save_json("claims.json", claims)
        self.save_json("coverage.json", {"scanned": len(file_index), "skipped": 0}) # Simplified
        
        with open(self.output_dir / "DOSSIER.md", "w") as f:
            f.write(dossier)

    def acquire_repo(self):
        if self.repo_dir.exists():
            shutil.rmtree(self.repo_dir)
        
        # Clone repo
        Repo.clone_from(self.repo_url, self.repo_dir)

    def index_files(self) -> List[str]:
        file_list = []
        for root, _, files in os.walk(self.repo_dir):
            if ".git" in root:
                continue
            for file in files:
                rel_path = os.path.relpath(os.path.join(root, file), self.repo_dir)
                if not any(p in rel_path for p in [".git", "node_modules", "__pycache__", ".lock"]):
                     file_list.append(rel_path)
        return file_list

    def create_evidence_packs(self, file_index: List[str]) -> Dict[str, str]:
        # Simple heuristic for packs
        packs = {
            "docs": [],
            "api": [],
            "config": [],
            "code": []
        }
        
        for f in file_index:
            lower = f.lower()
            if "readme" in lower or ".md" in lower or "doc" in lower:
                packs["docs"].append(f)
            elif "package.json" in lower or "requirements.txt" in lower or "docker" in lower or ".env" in lower or "config" in lower:
                packs["config"].append(f)
            elif any(ext in lower for ext in [".ts", ".js", ".py", ".go", ".rs", ".java"]):
                packs["code"].append(f)
        
        # Read content (limit size)
        evidence = {}
        for category, files in packs.items():
            content = ""
            for f in files[:20]: # Limit to first 20 relevant files per pack to avoid massive context
                try:
                    text = (self.repo_dir / f).read_text(errors='ignore')
                    # Add line numbers
                    lines = text.splitlines()
                    numbered_lines = "\n".join([f"{i+1}: {line}" for i, line in enumerate(lines[:500])]) # Limit 500 lines per file
                    content += f"\n--- FILE: {f} ---\n{numbered_lines}\n"
                except Exception:
                    pass
            
            # Save pack
            pack_content = content[:100000] # Hard cap 100k chars
            evidence[category] = pack_content
            (self.packs_dir / f"{category}_pack.txt").write_text(pack_content)
            
        return evidence

    async def extract_howto(self, packs: Dict[str, str]) -> Dict[str, Any]:
        prompt = """
        You are an expert system operator. Analyze the provided evidence (docs, config, code) to extract a JSON 'Operator Manual'.
        
        Output JSON Schema:
        {
            "prereqs": ["list of tools needed"],
            "install_steps": ["commands to install"],
            "config": ["env vars", "files"],
            "run_dev": ["command to start dev"],
            "run_prod": ["command to start prod"],
            "usage_examples": ["example commands"],
            "verification_steps": ["how to verify it works"],
            "unknowns": ["what is missing or unclear"]
        }
        
        If you are unsure, mark as unknown. Cite files if possible.
        """
        
        user_content = f"DOCS:\n{packs.get('docs', '')}\n\nCONFIG:\n{packs.get('config', '')}"
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-5.1",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": user_content}
                ],
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            self.console.print(f"[red]Error extracting howto:[/red] {e}")
            return {"error": str(e)}

    async def generate_dossier(self, packs: Dict[str, str], howto: Dict[str, Any]) -> tuple[str, Dict[str, Any]]:
        prompt = """
        You are the 'Program Totality Analyzer'. Write a comprehensive Markdown DOSSIER about this system.
        
        Sections:
        1. **Identity of Target System** (What is it?)
        2. **Purpose & Jobs-to-be-done**
        3. **Architecture Snapshot**
        4. **How to Use the Target System** (Refine the provided JSON into readable instructions)
        5. **Integration Surface**
        6. **Data & Security Posture**
        7. **Operational Reality**
        8. **Maintainability & Change Risk**
        9. **Unknowns / Missing Evidence**

        Be skeptic. If evidence is missing, say so. Do not hallucinate.
        """
        
        howto_str = json.dumps(howto, indent=2)
        user_content = f"HOWTO JSON:\n{howto_str}\n\nDOCS:\n{packs.get('docs', '')}\n\nCONFIG:\n{packs.get('config', '')}\n\nCODE SNAPSHOT:\n{packs.get('code', '')[:50000]}"
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-5.1",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": user_content}
                ]
            )
            dossier = response.choices[0].message.content
            
            # Simple claims extraction (mock for now, or secondary call)
            claims = {"type": "dossier_generated", "status": "success"}
            
            return dossier, claims
        except Exception as e:
            self.console.print(f"[red]Error generating dossier:[/red] {e}")
            return f"Error: {e}", {}

    def save_json(self, filename: str, data: Any):
        with open(self.output_dir / filename, "w") as f:
            json.dump(data, f, indent=2)

