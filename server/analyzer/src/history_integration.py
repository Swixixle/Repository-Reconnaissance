from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
from typing import Optional, List, Dict, Any
import json
import subprocess
import shutil
import tempfile
import os

@dataclass(frozen=True)
class HistoryOptions:
    repo_path: Path
    since: str
    top: int
    include_globs: Optional[List[str]] = None
    exclude_globs: Optional[List[str]] = None

def compute_hotspots_via_node(opts: HistoryOptions, *, node_bin: str = "node") -> Dict[str, Any]:
    """
    Runs the Node recon CLI `history` command and returns the parsed hotspots.json as a dict.
    Raises RuntimeError with a clear message on failure.
    """
    if shutil.which(node_bin) is None:
        raise RuntimeError("Node.js (node) not found in PATH. Please install Node.js 22+.")

    # Find CLI entrypoint
    here = Path(__file__).resolve()
    root = here.parent.parent.parent.parent  # up to repo root
    client_dir = root / "client"
    cli_candidates = [
        client_dir / "dist" / "cli.js",
        client_dir / "dist" / "cli.mjs",
        client_dir / "build" / "cli.js",
        root / "server" / "cli.ts",  # fallback to ts if running via tsx
    ]
    cli_path = None
    for c in cli_candidates:
        if c.exists():
            cli_path = c
            break
    if cli_path is None:
        raise RuntimeError("Node CLI build artifact not found; run pnpm build in client or ensure cli.js exists.")

    with tempfile.TemporaryDirectory() as tmpdir:
        cmd = [
            node_bin,
            str(cli_path),
            "history",
            "--repo", str(opts.repo_path),
            "--since", opts.since,
            "--top", str(opts.top),
            "--format", "json",
            "--output", tmpdir,
        ]
        if opts.include_globs:
            cmd += ["--include", ",".join(opts.include_globs)]
        if opts.exclude_globs:
            cmd += ["--exclude", ",".join(opts.exclude_globs)]
        try:
            proc = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=60)
        except subprocess.TimeoutExpired:
            raise RuntimeError(f"Node CLI timed out after 60s: {' '.join(cmd)}")
        if proc.returncode != 0:
            stderr_tail = '\n'.join(proc.stderr.splitlines()[-50:])
            raise RuntimeError(f"Node CLI failed (exit {proc.returncode}):\n{stderr_tail}\nCommand: {' '.join(cmd)}")
        out_path = Path(tmpdir) / "hotspots.json"
        if not out_path.exists():
            raise RuntimeError(f"hotspots.json not produced by Node CLI. Command: {' '.join(cmd)}")
        with open(out_path, "r") as f:
            return json.load(f)
