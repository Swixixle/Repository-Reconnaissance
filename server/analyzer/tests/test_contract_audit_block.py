"""
No-drift test for the PTA Contract Audit block in REPORT_ENGINEER.md.

Ensures the audit block contains all required headings, disclaimers,
and structural guardrails. Prevents silent drift into marketing copy.
"""
import json
import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from server.analyzer.src.core.render import render_report
from server.analyzer.src.core.adapter import build_evidence_pack


MINIMAL_PACK = {
    "evidence_pack_version": "1.0",
    "generated_at": "2026-01-01T00:00:00+00:00",
    "mode": "test",
    "run_id": "test_run_001",
    "verified": {
        "What the Target System Is": [
            {
                "id": "claim_001",
                "statement": "Test claim",
                "section": "What the Target System Is",
                "evidence": [{"path": "test.py", "line_start": 1, "line_end": 1, "snippet_hash": "abc123", "display": "test.py:1", "snippet_hash_verified": True}],
                "confidence": 0.6,
            }
        ]
    },
    "verified_structural": {
        "routes": [],
        "dependencies": [],
        "schemas": [],
        "enforcement": [],
        "_notes": {
            "routes": "not_implemented: requires AST/regex route extractor over source files",
            "dependencies": "not_implemented: requires lockfile parser",
            "schemas": "not_implemented: requires migration/model file parser",
            "enforcement": "not_implemented: requires auth/middleware pattern detector",
        },
    },
    "unknowns": [
        {"category": "tls_termination", "status": "UNKNOWN", "description": "TLS config", "evidence": [], "notes": "No artifacts found"},
    ],
    "metrics": {
        "dci_v1_claim_visibility": {
            "score": 0.8824,
            "label": "DCI_v1_claim_visibility",
            "formula": "verified_claims / total_claims",
            "interpretation": "Percent of claims with deterministic hash-verified evidence. This is claim-evidence visibility, NOT system surface visibility.",
        },
        "rci_reporting_completeness": {
            "score": 0.5008,
            "label": "RCI - Reporting Completeness",
            "formula": "average(claims_coverage, unknowns_coverage, howto_completeness)",
            "interpretation": "Composite completeness of PTA reporting. NOT a security or structural visibility score.",
            "components": {"claims_coverage": 0.8824, "unknowns_coverage": 0.0, "howto_completeness": 0.62},
        },
        "dci_v2_structural_visibility": {
            "score": None,
            "label": "DCI_v2_structural_visibility (not implemented)",
            "formula": "verified_structural_items / total_structural_surface",
            "interpretation": "Structural surface visibility. Not yet implemented.",
            "status": "not_implemented",
        },
    },
    "hashes": {"snippets": ["abc123"]},
    "summary": {
        "total_files": 100,
        "total_claims": 17,
        "verified_claims": 15,
        "unknown_categories": 1,
        "verified_categories": 0,
    },
    "replit_profile": {},
}


class TestContractAuditBlock(unittest.TestCase):
    def setUp(self):
        self.md = render_report(MINIMAL_PACK, mode="engineer")

    def test_required_headings_present(self):
        self.assertIn("### 1. System Snapshot", self.md)
        self.assertIn("### 2. Deterministic Coverage Index (DCI v1)", self.md)
        self.assertIn("### 3. Reporting Completeness Index (RCI)", self.md)
        self.assertIn("### 4. Structural Visibility (DCI v2)", self.md)
        self.assertIn("### 5. Epistemic Posture", self.md)

    def test_anti_marketing_disclaimers(self):
        self.assertIn("does not measure code quality, security posture, or structural surface coverage", self.md)
        self.assertIn("not a security score", self.md)
        self.assertIn("reported as null rather than estimated", self.md)
        self.assertIn("no inference-based promotion from UNKNOWN to VERIFIED", self.md)

    def test_metrics_rendered(self):
        self.assertIn("88.24%", self.md)
        self.assertIn("50.08%", self.md)
        self.assertIn("not_implemented", self.md)

    def test_component_breakdown_present(self):
        self.assertIn("claims_coverage", self.md)
        self.assertIn("unknowns_coverage", self.md)
        self.assertIn("howto_completeness", self.md)

    def test_snapshot_table_values(self):
        self.assertIn("| Files Indexed | 100 |", self.md)
        self.assertIn("| Claims Extracted | 17 |", self.md)
        self.assertIn("| Claims with Deterministic Evidence | 15 |", self.md)

    def test_run_id_in_audit_heading(self):
        self.assertIn("## PTA Contract Audit — Run test_run_001", self.md)

    def test_structural_buckets_in_report(self):
        self.assertIn("Verified Structural", self.md)
        self.assertIn("not_implemented", self.md)

    def test_unknowns_table_present(self):
        self.assertIn("Known Unknown Surface", self.md)
        self.assertIn("tls_termination", self.md)


if __name__ == "__main__":
    unittest.main()
