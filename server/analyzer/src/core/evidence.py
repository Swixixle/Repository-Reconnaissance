import hashlib
from dataclasses import dataclass, asdict
from typing import Optional, List


@dataclass
class Evidence:
    path: str
    line_start: int
    line_end: int
    snippet_hash: str
    display: str

    def to_dict(self):
        return asdict(self)


def make_evidence(path: str, line_start: int, line_end: int, snippet: str) -> dict:
    if line_start < 1 or line_end < 1:
        return None
    snippet_hash = hashlib.sha256(snippet.encode("utf-8", errors="ignore")).hexdigest()[:12]
    display = f"{path}:{line_start}" if line_start == line_end else f"{path}:{line_start}-{line_end}"
    return Evidence(
        path=path,
        line_start=line_start,
        line_end=line_end,
        snippet_hash=snippet_hash,
        display=display,
    ).to_dict()


def make_file_exists_evidence(path: str) -> dict:
    snippet_hash = hashlib.sha256(path.encode("utf-8")).hexdigest()[:12]
    return {
        "kind": "file_exists",
        "path": path,
        "snippet_hash": snippet_hash,
        "display": f"{path} (file exists)",
    }


def make_evidence_from_line(path: str, line_num: int, line_text: str) -> Optional[dict]:
    if line_num < 1:
        return None
    return make_evidence(path, line_num, line_num, line_text.strip())


def validate_evidence_list(evidence_list: list) -> list:
    valid = []
    for ev in evidence_list:
        if not isinstance(ev, dict):
            continue
        if ev.get("kind") == "file_exists":
            valid.append(ev)
            continue
        ls = ev.get("line_start", 0)
        le = ev.get("line_end", 0)
        if ls < 1 or le < 1:
            continue
        valid.append(ev)
    return valid
