# Workspace Mode: Multi-Repo Ingest + Cross-Repo Dependency Map

## Overview
Workspace mode allows you to analyze multiple repositories at once, extracting inter-repo dependency edges and generating a dependency graph with risk ratings.

## Usage

### CLI Command

```
recon workspace <path-or-glob> [--output outDir]
```

- Accepts a folder containing multiple repos or a glob list of repo paths.
- Optionally supports a `recon.workspace.json` config file for explicit repo and contract edges.

### Output Artifacts
- `/out/workspace/graph.json` — structured dependency graph
- `/out/workspace/graph.md` — human-readable report

## Dependency Edge Detection
- Node/TS repos: parses `package.json` for dependencies
- Monorepo relations: detects `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `lerna.json`
- Contract surfaces: infers from OpenAPI, contracts folder, proto files, TypeScript exports

## Risk Assignment
- High: file dependency w/o lock, git dependency w/o hash, contract edge w/o tests
- Medium: workspace dependency w/o version gate
- Low: otherwise

## Example Config

```
{
  "repos": [
    {"name": "halo-orchestrator", "path": "../halo-orchestrator"},
    {"name": "halo-receipts", "path": "../halo-receipts"},
    {"name": "eli-core", "path": "../eli-core"}
  ],
  "contracts": [
    {"from": "halo-orchestrator", "to": "halo-receipts", "type": "npm", "name": "halo-receipts"},
    {"from": "eli-core", "to": "halo-orchestrator", "type": "http", "route": "/api/verify"}
  ]
}
```

## Tests
- Fixture workspace with dummy repos
- Assert edges, evidence, and risk ratings
