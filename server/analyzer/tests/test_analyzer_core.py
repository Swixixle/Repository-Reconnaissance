"""Foundational tests for analyzer-adjacent core modules (dependencies, API surface, receipts, deterministic dossier)."""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

import pytest

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT))

from server.analyzer.src.core.dependency_graph import (  # noqa: E402
    Dep,
    collect_dependencies,
    cve_flag_records_from_deps,
    osv_query_batch,
)
from server.analyzer.src.core.api_surface import extract_api_surface  # noqa: E402
from server.analyzer.src.receipt_chain import build_gap_receipt  # noqa: E402
from server.analyzer.src.analyzer import Analyzer  # noqa: E402


def test_dependency_extraction_from_requirements(tmp_path: Path) -> None:
    (tmp_path / "requirements.txt").write_text(
        "requests==2.31.0\n"
        "django>=4.2\n"
        "# comment\n",
        encoding="utf-8",
    )
    deps, lockfiles = collect_dependencies(tmp_path)
    assert "requirements.txt" in lockfiles
    by_name = {d.name: d for d in deps}
    assert by_name["requests"].version == "2.31.0"
    assert "django" in by_name
    assert by_name["django"].ecosystem == "PyPI"


def test_cve_flag_structure_from_mock_osv(monkeypatch: pytest.MonkeyPatch) -> None:
    def fake_urlopen(req: Any, timeout: float = 0) -> Any:
        class R:
            def read(self) -> bytes:
                return json.dumps(
                    {"results": [{"vulns": [{"id": "CVE-2099-0001"}, {"id": "GHSA-abcd-efgh"}]}]}
                ).encode()

            def __enter__(self) -> "R":
                return self

            def __exit__(self, *a: object) -> None:
                return None

        return R()

    monkeypatch.setattr(
        "server.analyzer.src.core.dependency_graph.urllib.request.urlopen",
        fake_urlopen,
    )
    deps = [
        Dep(
            name="lodash",
            version="4.17.0",
            ecosystem="npm",
            kind="production",
            source_file="package-lock.json",
        )
    ]
    osv_query_batch(deps, timeout=1.0)
    rows = cve_flag_records_from_deps(deps)
    assert len(rows) >= 2
    for row in rows:
        assert set(row.keys()) >= {"package", "version", "cve_id", "severity"}
        assert row["package"] == "lodash"
        assert row["version"] == "4.17.0"
        assert row["severity"] == "UNKNOWN"


def test_api_surface_extracts_express_route(tmp_path: Path) -> None:
    (tmp_path / "routes.ts").write_text(
        "import express from 'express';\n"
        "const app = express();\n"
        "app.get('/api/health', (_req, res) => { res.send('ok'); });\n",
        encoding="utf-8",
    )
    data = extract_api_surface(tmp_path, ["routes.ts"])
    endpoints = data.get("endpoints") or []
    assert any(
        e.get("method") == "GET" and e.get("path") == "/api/health" for e in endpoints
    )


def test_receipt_required_fields(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("PTA_CHAIN_STATE_DIR", str(tmp_path / "chain"))
    rec = build_gap_receipt(
        "target-core-test",
        gap_start_iso="2026-01-01T00:00:00Z",
        gap_end_iso="2026-01-01T01:00:00Z",
        scheduled=True,
        run_id="run-test-receipt",
    )
    # Schema uses generated_at as the ISO-8601 event time (maps to "timestamp" in reviews).
    ts = rec.get("generated_at")
    assert isinstance(ts, str) and len(ts) > 10
    assert rec.get("run_id") == "run-test-receipt"
    assert rec.get("receipt_type") == "gap"
    assert rec.get("previous_receipt_hash") is None
    assert isinstance(rec.get("chain_sequence"), int)
    assert rec.get("scheduled") is True


def test_deterministic_dossier_summary_non_empty(tmp_path: Path) -> None:
    (tmp_path / "package.json").write_text(
        json.dumps({"name": "fixture-app", "description": "unit-test fixture"}),
        encoding="utf-8",
    )
    out = tmp_path / "out"
    out.mkdir()
    analyzer = Analyzer(
        source=str(tmp_path),
        output_dir=str(out),
        no_llm=True,
        root=str(tmp_path),
    )
    howto = analyzer._build_deterministic_howto()
    body = analyzer._build_deterministic_dossier(howto)
    dossier: dict[str, str] = {"summary": body}
    assert dossier.get("summary")
    assert len(dossier["summary"].strip()) > 0
    assert "Debrief" in dossier["summary"]
