import os
import shutil
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Optional
from git import Repo


@dataclass
class AcquireResult:
    root_path: Path
    mode: str
    source_ref: str
    run_id: str


def acquire_target(
    target: Optional[str],
    replit_mode: bool,
    output_dir: Path,
) -> AcquireResult:
    run_id = uuid.uuid4().hex[:12]

    if replit_mode:
        root = Path(os.getcwd())
        if not root.exists():
            raise FileNotFoundError(f"Workspace directory not found: {root}")
        return AcquireResult(
            root_path=root,
            mode="replit",
            source_ref=str(root),
            run_id=run_id,
        )

    if target and (
        target.startswith("http://")
        or target.startswith("https://")
        or target.startswith("git@")
    ):
        if "github.com" not in target and "gitlab.com" not in target:
            pass
        repo_dir = output_dir / "repo"
        if repo_dir.exists():
            shutil.rmtree(repo_dir)
        Repo.clone_from(target, repo_dir)
        return AcquireResult(
            root_path=repo_dir,
            mode="github",
            source_ref=target,
            run_id=run_id,
        )

    if target and os.path.isdir(target):
        return AcquireResult(
            root_path=Path(os.path.abspath(target)),
            mode="local",
            source_ref=os.path.abspath(target),
            run_id=run_id,
        )

    raise ValueError(
        "Provide a GitHub URL, a local directory path, or use --replit"
    )
