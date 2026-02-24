import os
import json
import subprocess
import hashlib
import pytest

ARTIFACTS = [
    "DOSSIER.md",
    "operate.json",
    "claims.json",
    "coverage.json",
    "DEMO_DOSSIER.md",
    "DEMO_SUMMARY.json",
]

def hash_file(path):
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()

def run_analyze(tmp_path, demo=False):
    outdir = tmp_path / "out"
    outdir.mkdir()
    cmd = [
        "python3", "-m", "server.analyzer.src.analyzer_cli", "analyze", "./server/analyzer/tests/fixtures", "-o", str(outdir)
    ]
    if demo:
        cmd.append("--demo")
    subprocess.run(cmd, check=True)
    return outdir

def test_demo_outputs(tmp_path):
    outdir = run_analyze(tmp_path, demo=True)
    for art in ["DEMO_DOSSIER.md", "DEMO_SUMMARY.json"]:
        assert (outdir / "runs").exists()
        found = False
        for run in (outdir / "runs").iterdir():
            if (run / art).exists():
                found = True
        assert found, f"{art} not found in any run dir"

def test_normal_outputs_unchanged(tmp_path):
    outdir1 = run_analyze(tmp_path, demo=False)
    outdir2 = run_analyze(tmp_path, demo=True)
    for art in ["DOSSIER.md", "operate.json", "claims.json", "coverage.json"]:
        hash1 = None
        hash2 = None
        for run in (outdir1 / "runs").iterdir():
            f = run / art
            if f.exists():
                hash1 = hash_file(f)
        for run in (outdir2 / "runs").iterdir():
            f = run / art
            if f.exists():
                hash2 = hash_file(f)
        assert hash1 == hash2, f"{art} changed between normal and demo run"

def test_demo_determinism(tmp_path):
    outdir1 = run_analyze(tmp_path, demo=True)
    outdir2 = run_analyze(tmp_path, demo=True)
    for art in ["DEMO_DOSSIER.md", "DEMO_SUMMARY.json"]:
        hash1 = None
        hash2 = None
        for run in (outdir1 / "runs").iterdir():
            f = run / art
            if f.exists():
                hash1 = hash_file(f)
        for run in (outdir2 / "runs").iterdir():
            f = run / art
            if f.exists():
                hash2 = hash_file(f)
        assert hash1 == hash2, f"{art} not deterministic across runs"

def test_demo_summary_bullets(tmp_path):
    outdir = run_analyze(tmp_path, demo=True)
    for run in (outdir / "runs").iterdir():
        f = run / "DEMO_SUMMARY.json"
        if f.exists():
            data = json.load(open(f))
            bullets = data["sections"]["executive_summary"]
            assert len(bullets) <= 6
            for b in bullets:
                assert len(b["text"]) <= 120

def test_demo_evidence_snapshot(tmp_path):
    outdir = run_analyze(tmp_path, demo=True)
    for run in (outdir / "runs").iterdir():
        f = run / "DEMO_SUMMARY.json"
        if f.exists():
            data = json.load(open(f))
            snap = data["sections"]["evidence_snapshot"]
            types = set(x["status"] for x in snap)
            assert "VERIFIED" in types
            assert "INFERRED" in types
            assert "UNKNOWN" in types
