# Configuration Guide

This document describes all configuration options for the PTA (Program Totality Analyzer) system.

## Environment Variable Precedence

**Production:** Only `process.env` (platform environment variables) are used. `.env` files are **completely ignored**.

**Development:** Variables are loaded in this order (later sources override earlier):
1. System environment variables
2. `.env` file (if present)
3. Explicit overrides (e.g., command line)

## Core Configuration

### Server Binding

| Variable | Default | Description | Required |
|----------|---------|-------------|----------|
| `NODE_ENV` | `development` | Environment mode: `development`, `production`, or `test` | No |
| `HOST` | `0.0.0.0` | Host address to bind server | No |
| `PORT` | `5000` | Port number for HTTP server (1-65535) | No |

**Behavior:**
- **Production**: Invalid `PORT` causes fail-fast with error
- **Development**: Invalid `PORT` warns and falls back to 5000

### Database

| Variable | Default | Description | Required |
|----------|---------|-------------|----------|
| `DATABASE_URL` | None | PostgreSQL connection string | **Yes (production)** |

Format: `postgresql://user:pass@host:port/dbname`

### Security & Authentication

| Variable | Default | Description | Required |
|----------|---------|-------------|----------|
| `API_KEY` | None | Legacy API authentication key (min 32 chars) | **Yes (production)** |
| `ADMIN_KEY` | Falls back to `API_KEY` | Admin-level authentication key (min 32 chars) | **Yes (production)** |
| `FORCE_HTTP` | `false` | Disable HTTPS enforcement (NOT recommended) | No |

**Security Notes:**
- Keys must be cryptographically random and at least 32 characters
- In production, HTTPS is enforced by default unless `FORCE_HTTP=true`
- When behind a reverse proxy, ensure TLS termination at proxy level

### CI/CD Worker

| Variable | Default | Description | Required |
|----------|---------|-------------|----------|
| `CI_WORKER_ENABLED` | `false` | Enable background CI worker loop | No |
| `CI_TMP_DIR` | `/tmp/ci` | Working directory for CI jobs | No |
| `CI_PRESERVE_WORKDIR` | `false` | Keep workdir after job completion (debug) | No |
| `ANALYZER_TIMEOUT_MS` | `600000` | Analyzer timeout in milliseconds (10min) | No |
| `GITHUB_TOKEN` | None | GitHub PAT for private repo access | No (yes for private repos) |
| `GITHUB_WEBHOOK_SECRET` | None | Secret for GitHub webhook validation | **Yes (if webhooks enabled)** |

### Repository Limits (DoS Controls)

| Variable | Default | Description | Required |
|----------|---------|-------------|----------|
| `MAX_REPO_BYTES` | `262144000` | Max repo size in bytes (250 MB) | No |
| `MAX_FILE_COUNT` | `50000` | Max number of files in repo | No |
| `MAX_SINGLE_FILE_BYTES` | `5242880` | Max single file size (5 MB) | No |

### AI/Semantic Analysis

| Variable | Default | Description | Required |
|----------|---------|-------------|----------|
| `AI_INTEGRATIONS_OPENAI_API_KEY` | None | OpenAI API key for semantic analysis | No (yes for AI features) |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | None | OpenAI API base URL | No (yes for AI features) |

**Note:** Both key and base URL must be set to enable AI-powered semantic analysis.

## Startup Boot Report

On successful startup, the server emits a **single JSON log line** with boot information:

```json
{
  "timestamp": "2026-02-17T00:00:00.000Z",
  "app_version": "1.0.0",
  "node_env": "production",
  "host": "0.0.0.0",
  "port": 5000,
  "db_configured": true,
  "ci_enabled": true,
  "semantic_enabled": false,
  "force_http": false
}
```

This can be parsed and ingested by logging infrastructure for monitoring.

## Production Checklist

Before deploying to production, ensure:

- [ ] `NODE_ENV=production` is set
- [ ] `DATABASE_URL` points to production database
- [ ] `ADMIN_KEY` is set with a strong, random key (32+ characters)
- [ ] `GITHUB_WEBHOOK_SECRET` is set if using webhooks
- [ ] `FORCE_HTTP` is **not** set (or set to `false`)
- [ ] Reverse proxy handles TLS termination
- [ ] No `.env` files are deployed (use platform secrets management)

## Development Quick Start

1. Copy `.env.example` to `.env` (if provided)
2. Set minimum required vars:
   ```bash
   DATABASE_URL=postgresql://user:pass@localhost:5432/pta_dev
   API_KEY=dev_key_min_32_characters_long_abcdefgh
   ```
3. Start server: `npm run dev`

## Configuration Validation

The server validates configuration at startup:

- **Production**: Missing required variables → immediate exit(1) with error list
- **Development**: Missing variables → warnings, but server starts

Check logs for:
- `✓ Production configuration validated` (success)
- `❌ Production configuration validation failed` (failure with error list)

## Environment-Specific Defaults

| Setting | Production | Development |
|---------|------------|-------------|
| `.env` loading | Disabled | Enabled |
| Invalid PORT behavior | Fail-fast | Warn + fallback |
| Missing required vars | Exit(1) | Warn |
| HTTPS enforcement | Enabled | Disabled |
| Verbose logging | Minimal | Full |

## Troubleshooting

### Server won't start

**Problem:** `Invalid PORT environment variable`  
**Solution:** Ensure `PORT` is a valid integer 1-65535, or unset to use default 5000

**Problem:** `DATABASE_URL is required in production`  
**Solution:** Set `DATABASE_URL` in platform environment (not `.env`)

**Problem:** `ADMIN_KEY must be at least 32 characters`  
**Solution:** Generate a strong key: `openssl rand -hex 32`

### CI jobs failing

**Problem:** Jobs fail with "low disk space"  
**Solution:** 
- Check `CI_TMP_DIR` has sufficient space
- Clear old workdirs if `CI_PRESERVE_WORKDIR=true` was used for debugging

**Problem:** Private repo clones fail  
**Solution:** Set `GITHUB_TOKEN` with `repo` scope

## See Also

- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions
- [Security Guide](./SECURITY.md) - Security model and threat analysis
- [API Documentation](./API.md) - API endpoint reference
