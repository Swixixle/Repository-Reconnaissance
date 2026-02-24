# Canonicalization v1 Test Fixtures

This directory contains files for testing canonicalization determinism and claim hashing.

## Files
- crlf.txt: Windows CRLF line endings
- lf.txt: Unix LF line endings
- cr.txt: Classic Mac CR line endings
- trailing.txt: Lines with trailing spaces/tabs
- bom.txt: UTF-8 BOM at start
- invalid_utf8.txt: Invalid UTF-8 bytes (should fail)

## Golden Outputs
- Each file has a corresponding .golden file with expected canonical excerpt and hash.

## Usage
- Used by test suite to validate canonicalization and hashing.
