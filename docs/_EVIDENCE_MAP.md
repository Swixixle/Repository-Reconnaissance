# Evidence Map

## Runtime Entry Points

## Routing Topology
  - app.use(express.json(...)) in server/index.ts
  - app.use(express.urlencoded(...)) in server/index.ts
  - registerRoutes(app) in server/index.ts (routes registered via server/routes.ts)

## Endpoint Inventory (Canonical)
  - Handler: healthRateLimiter, returns server health status
  - File: server/routes.ts
  - Inputs: none
  - Validation: none
  - Response: { status: "ok", timestamp, uptime, db, ci_worker }
  - Status: 200

  - Handler: ciApiRateLimiter, returns CI worker status
  - File: server/routes.ts
  - Inputs: none
  - Validation: none
  - Response: { status: "ok", ciTmpDir, ciTmpDirFreeBytes, ciTmpDirLowDisk, jobCounts }
  - Status: 200

  - Handler: webhook receiver, validates X-Hub-Signature-256, deduplication logic
  - File: server/routes.ts
  - Inputs: JSON body, headers
  - Validation: HMAC-SHA256, delivery ID deduplication
  - Response: { ok: true, deduped: true } or error
  - Status: 202, 400, 401

  - Handler: enqueue CI job
  - File: server/routes.ts
  - Inputs: JSON body (repo info)
  - Validation: zod schema
  - Response: { runId, status }
  - Status: 200, 400

  - Handler: fetch CI runs
  - File: server/routes.ts
  - Inputs: query params (filtering)
  - Validation: zod schema
  - Response: array of CI run objects
  - Status: 200

  - Handler: manual/fallback trigger for CI worker
  - File: server/routes.ts
  - Inputs: none
  - Validation: none
  - Response: { status }
  - Status: 200

  - Handler: fetch projects
  - File: server/routes.ts
  - Inputs: query params
  - Validation: zod schema
  - Response: array of project objects
  - Status: 200

  - Handler: create project
  - File: server/routes.ts
  - Inputs: JSON body (project info)
  - Validation: zod schema
  - Response: project object
  - Status: 201, 400

  - Handler: fetch project by ID
  - File: server/routes.ts
  - Inputs: URL param (id)
  - Validation: zod schema
  - Response: project object
  - Status: 200, 404

  - Handler: update project
  - File: server/routes.ts
  - Inputs: URL param (id), JSON body
  - Validation: zod schema
  - Response: updated project object
  - Status: 200, 400, 404

  - Handler: delete project
  - File: server/routes.ts
  - Inputs: URL param (id)
  - Validation: zod schema
  - Response: { deleted: true }
  - Status: 200, 404

  - Handler: fetch analysis by ID
  - File: server/routes.ts
  - Inputs: URL param (id)
  - Validation: zod schema
  - Response: analysis object
  - Status: 200, 404

  - Handler: create analysis
  - File: server/routes.ts
  - Inputs: JSON body (analysis info)
  - Validation: zod schema
  - Response: analysis object
  - Status: 201, 400

  - Handler: fetch operate.json for CI run
  - File: server/routes.ts
  - Inputs: URL param (runId)
  - Validation: zod schema
  - Response: operate.json object
  - Status: 200, 404

  - Handler: fetch DOSSIER.md for CI run
  - File: server/routes.ts
  - Inputs: URL param (runId)
  - Validation: zod schema
  - Response: DOSSIER.md content
  - Status: 200, 404

  - Handler: fetch coverage.json for CI run
  - File: server/routes.ts
  - Inputs: URL param (runId)
  - Validation: zod schema
  - Response: coverage.json object
  - Status: 200, 404

  - Handler: fetch known_unknowns.json for CI run
  - File: server/routes.ts
  - Inputs: URL param (runId)
  - Validation: zod schema
  - Response: known_unknowns.json object
  - Status: 200, 404

  - Handler: fetch claims.json for CI run
  - File: server/routes.ts
  - Inputs: URL param (runId)
  - Validation: zod schema
  - Response: claims.json object
  - Status: 200, 404

  - Handler: fetch target_howto.json for CI run
  - File: server/routes.ts
  - Inputs: URL param (runId)
  - Validation: zod schema
  - Response: target_howto.json object
  - Status: 200, 404

## Authentication & Authorization

## Database Layer

## Client Surfaces (React present)
