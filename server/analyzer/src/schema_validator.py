"""
Schema validation module for PTA outputs.

Validates JSON outputs against their schemas before writing to ensure
contract compliance.
"""
import json
from pathlib import Path
from typing import Any, Dict, List
import jsonschema
from jsonschema import validate, ValidationError, Draft7Validator

SCHEMAS_DIR = Path(__file__).resolve().parents[3] / "shared" / "schemas"


def load_schema(schema_name: str) -> Dict[str, Any]:
    """Load a JSON schema from the schemas directory."""
    schema_path = SCHEMAS_DIR / schema_name
    if not schema_path.exists():
        raise FileNotFoundError(f"Schema not found: {schema_path}")
    
    with open(schema_path, "r") as f:
        return json.load(f)


def validate_against_schema(data: Dict[str, Any], schema_name: str) -> List[str]:
    """
    Validate data against a schema.
    
    Returns:
        List of validation errors (empty if valid)
    """
    try:
        schema = load_schema(schema_name)
        validator = Draft7Validator(schema)
        errors = []
        
        for error in validator.iter_errors(data):
            path = ".".join(str(p) for p in error.path) if error.path else "root"
            errors.append(f"{path}: {error.message}")
        
        return errors
    except FileNotFoundError as e:
        return [f"Schema error: {e}"]
    except Exception as e:
        return [f"Validation error: {e}"]


def validate_operate_json(data: Dict[str, Any]) -> List[str]:
    """Validate operate.json against its schema."""
    return validate_against_schema(data, "operate.schema.json")


def validate_target_howto_json(data: Dict[str, Any]) -> List[str]:
    """Validate target_howto.json against its schema."""
    return validate_against_schema(data, "target_howto.schema.json")
