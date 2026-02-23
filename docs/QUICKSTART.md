# Quickstart

## Scope
This document is the minimum viable “someone else can run it” guide.

## Requirements
- Python: 3.11+
- Package/deps: pip (pyproject.toml)

**Evidence:**
- .replit (python version, run command)
- pyproject.toml (dependencies)
- .github/workflows/ci-tests.yml (python setup)

## Install
### Option A: Replit (recommended)
1. Open in Replit
2. Click Run

### Option B: Local
1. python3 -m pip install -U pip
2. pip install -e .

**Evidence:**
- pyproject.toml
- .replit

## Configure
Set required environment variables:

| Variable | Required | Purpose | Default |
|---|---:|---|---|
| AI_INTEGRATIONS_OPENAI_API_KEY | yes | OpenAI API key for LLM enrichment | none |
| AI_INTEGRATIONS_OPENAI_BASE_URL | no | Custom OpenAI endpoint | none |
| MAX_REPO_BYTES | no | Max repo size for analysis | 100MB |
| MAX_FILE_COUNT | no | Max file count for analysis | 10000 |
| MAX_SINGLE_FILE_BYTES | no | Max single file size | 10MB |

**Evidence:**
- server/analyzer/src/analyzer.py (env validation)
- pyproject.toml

## Run
### Local
- python -m server.analyzer.analyzer_cli analyze <repo>

### Replit
- Click Run (see .replit)

**Evidence:**
- .replit (run command)
- server/analyzer/analyzer_cli.py (entrypoint)

## Port / Network
- Default port: 5000
- Configured in .replit and server code

**Evidence:**
- .replit
- server/analyzer/src/core/operate.py

## Verify
- Unit tests: pytest -q
- Smoke check: scripts/smoke_test.sh

**Evidence:**
- .github/workflows/ci-tests.yml (test step)
- scripts/preflight.sh

## Examples
### Example 1: Run analyzer
- python -m server.analyzer.analyzer_cli analyze <repo>
- Output: output/runs/<run_id>/DOSSIER.md

### Example 2: no_llm mode
- python -m server.analyzer.analyzer_cli analyze <repo> --no-llm
- Output: dossier with LLM enrichment skipped

**Evidence:**
- server/analyzer/src/analyzer.py (no_llm fallback)

## Troubleshooting
### python3 not found
- Install Python 3.11+ or use Replit.

### Missing OpenAI key
- Set AI_INTEGRATIONS_OPENAI_API_KEY or use --no-llm.

**Evidence:**
- server/analyzer/src/analyzer.py (env validation)
# Quick Start Guide

Get Asset-Analyzer (PTA) running in 5 minutes.

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **PostgreSQL** database (local or cloud)

## Installation

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/Swixixle/Asset-Analyzer.git
cd Asset-Analyzer

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -e .
```

### 2. Configure Environment

Create a `.env` file or set environment variables:

```bash
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/asset_analyzer
API_KEY=your-secure-api-key-minimum-32-characters-long

# Optional
PORT=5000
NODE_ENV=development
GITHUB_WEBHOOK_SECRET=your-webhook-secret
GITHUB_TOKEN=your-github-token
```

**Security Note:** Generate a secure API_KEY:
```bash
openssl rand -hex 32
```

### 3. Initialize Database

```bash
npm run db:push
```

This creates the required tables and schema in your PostgreSQL database.

### 4. Run Development Server

```bash
npm run dev
```

The application starts on `http://localhost:5000` (or the PORT you specified).

## Verify Installation

### Run Smoke Test

The smoke test validates that the analyzer is working correctly:

```bash
npm run smoke
```

Expected output:
```
==> PTA Smoke Test
Running analyzer on fixture repo...
✓ Both outputs exist
✓ operate.json validates against schema
✓ target_howto.json validates against schema
✓ All required metadata fields present
==> Smoke test PASSED ✅
```

If the smoke test passes, your installation is working correctly!

### Test the Health Endpoint

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "checks": {
    "timestamp": "2026-02-17T00:00:00.000Z",
    "version": "1.0.0",
    "database": { "status": "ok" },
    "worker": { "status": "ok" },
    "disk": { "status": "ok" }
  }
}
```

### Run the Analyzer (Python CLI)

```bash
# Test with a sample project
pta analyze https://github.com/octocat/Hello-World -o ./test-output

# Check the output
ls -la test-output/
```

You should see:
- `operate.json` - Operational dashboard
- `DOSSIER.md` - Human-readable summary
- `claims.json` - Verifiable claims with evidence
- `coverage.json` - Scan metadata

## Next Steps

- **Production deployment**: See [docs/DEPLOYMENT.md](DEPLOYMENT.md)
- **API documentation**: See [docs/API.md](API.md)
- **Architecture overview**: See [docs/ARCHITECTURE.md](ARCHITECTURE.md)
- **GitHub webhook setup**: See [README.md](../README.md#live-static-ci-feed)

## Common Issues

### "DATABASE_URL must be set"

Ensure `DATABASE_URL` is set in your environment or `.env` file.

### "Port already in use"

Change the `PORT` environment variable to use a different port.

### Python module errors

Ensure you've installed the Python package:
```bash
pip install -e .
```

### Missing tables in database

Run the database migration:
```bash
npm run db:push
```
