"""
Tests for EvidencePack v1 schema contract enforcement.

Ensures that:
- All required fields are present
- tool_version and run_id are non-empty
- coverage section includes partial coverage flags
- Validation rejects incomplete packs
"""
import json
import copy
import tempfile
import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from server.analyzer.src.core.adapter import (
    build_evidence_pack,
    validate_evidence_pack,
    save_evidence_pack,
    REQUIRED_PACK_FIELDS,
    EVIDENCE_PACK_VERSION,
)


FIXTURE_PATH = Path(__file__).parent / "fixtures" / "evidence_pack.v1.fixture.json"


def _load_fixture() -> dict:
    return json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))


def _minimal_build_args():
    return dict(
        howto={"completeness": {"score": 62, "max": 100}},
        claims={"claims": [
            {
                "id": "c1",
                "statement": "Test",
                "section": "Test",
                "confidence": 0.9,
                "evidence": [{
                    "path": "test.py",
                    "line_start": 1,
                    "line_end": 1,
                    "snippet_hash": "abc123",
                    "snippet_hash_verified": True,
                    "display": "test.py:1",
                }],
            }
        ]},
        coverage={"mode": "test", "scanned": 10},
        file_index=["test.py"],
        known_unknowns=[],
        mode="test",
        run_id="test_run_schema",
    )


class TestSchemaValidation(unittest.TestCase):
    def test_fixture_passes_validation(self):
        pack = _load_fixture()
        errors = validate_evidence_pack(pack)
        self.assertEqual(errors, [], f"Fixture should pass validation, got: {errors}")

    def test_built_pack_passes_validation(self):
        pack = build_evidence_pack(**_minimal_build_args())
        errors = validate_evidence_pack(pack)
        self.assertEqual(errors, [], f"Built pack should pass validation, got: {errors}")

    def test_missing_field_detected(self):
        for field in REQUIRED_PACK_FIELDS:
            pack = _load_fixture()
            del pack[field]
            errors = validate_evidence_pack(pack)
            self.assertTrue(
                any(field in e for e in errors),
                f"Removing '{field}' should produce a validation error",
            )

    def test_empty_tool_version_detected(self):
        pack = _load_fixture()
        pack["tool_version"] = ""
        errors = validate_evidence_pack(pack)
        self.assertTrue(any("tool_version" in e for e in errors))

    def test_empty_run_id_detected(self):
        pack = _load_fixture()
        pack["run_id"] = ""
        errors = validate_evidence_pack(pack)
        self.assertTrue(any("run_id" in e for e in errors))

    def test_wrong_schema_version_detected(self):
        pack = _load_fixture()
        pack["evidence_pack_version"] = "99.0"
        errors = validate_evidence_pack(pack)
        self.assertTrue(any("unsupported schema version" in e for e in errors))

    def test_missing_coverage_subfields_detected(self):
        pack = _load_fixture()
        pack["coverage"] = {}
        errors = validate_evidence_pack(pack)
        self.assertTrue(any("analyzed_files" in e for e in errors))
        self.assertTrue(any("total_files_seen" in e for e in errors))


class TestSchemaRequiredFields(unittest.TestCase):
    def test_built_pack_has_tool_version(self):
        pack = build_evidence_pack(**_minimal_build_args())
        self.assertIn("tool_version", pack)
        self.assertTrue(pack["tool_version"])

    def test_built_pack_has_coverage(self):
        pack = build_evidence_pack(**_minimal_build_args())
        cov = pack["coverage"]
        self.assertIn("analyzed_files", cov)
        self.assertIn("total_files_seen", cov)
        self.assertIn("skipped_files", cov)
        self.assertIn("skipped_types", cov)
        self.assertIn("timeouts", cov)
        self.assertIn("partial", cov)

    def test_coverage_reflects_skipped(self):
        args = _minimal_build_args()
        args["skipped_files"] = 5
        pack = build_evidence_pack(**args)
        self.assertEqual(pack["coverage"]["analyzed_files"], 1)
        self.assertEqual(pack["coverage"]["total_files_seen"], 6)
        self.assertEqual(pack["coverage"]["skipped_files"], 5)
        self.assertTrue(pack["coverage"]["partial"])

    def test_coverage_no_skip_not_partial(self):
        pack = build_evidence_pack(**_minimal_build_args())
        self.assertFalse(pack["coverage"]["partial"])

    def test_schema_version_matches_constant(self):
        pack = build_evidence_pack(**_minimal_build_args())
        self.assertEqual(pack["evidence_pack_version"], EVIDENCE_PACK_VERSION)


class TestSaveValidation(unittest.TestCase):
    def test_save_rejects_invalid_pack(self):
        with tempfile.TemporaryDirectory() as tmp:
            bad_pack = {"evidence_pack_version": "1.0"}
            with self.assertRaises(RuntimeError) as ctx:
                save_evidence_pack(bad_pack, Path(tmp))
            self.assertIn("schema validation failed", str(ctx.exception).lower())

    def test_save_accepts_valid_pack(self):
        with tempfile.TemporaryDirectory() as tmp:
            pack = build_evidence_pack(**_minimal_build_args())
            path = save_evidence_pack(pack, Path(tmp))
            self.assertTrue(path.exists())
            loaded = json.loads(path.read_text())
            self.assertEqual(loaded["evidence_pack_version"], EVIDENCE_PACK_VERSION)


if __name__ == "__main__":
    unittest.main()
