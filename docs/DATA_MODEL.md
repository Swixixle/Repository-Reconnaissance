
# DATA_MODEL.md

## projects
- Table name: projects
- Primary key: id (serial)
- Columns:
  - id: serial, not null, primary key
  - url: text, not null
  - name: text, not null
  - mode: text, not null, default "github"
  - status: text, not null, default "pending"
  - createdAt: timestamp, defaultNow()

## analyses
- Table name: analyses
- Primary key: id (serial)
- Columns:
  - id: serial, not null, primary key
  - projectId: integer, not null
  - dossier: text
  - claims: jsonb
  - howto: jsonb
  - operate: jsonb
  - coverage: jsonb
  - unknowns: jsonb
  - createdAt: timestamp, defaultNow()

## ci_runs
- Table name: ci_runs
- Primary key: id (uuid, default gen_random_uuid())
- Columns:
  - id: uuid, not null, primary key, default gen_random_uuid()
  - repoOwner: text, not null
  - repoName: text, not null
  - ref: text, not null
  - commitSha: text, not null
  - eventType: text, not null
  - status: text, not null, default "QUEUED"
  - createdAt: timestamp, not null, defaultNow()
  - startedAt: timestamp
  - finishedAt: timestamp
  - error: text
  - errorCode: text
  - outDir: text
  - summaryJson: jsonb
  - Indexes: ci_runs_repo_idx (repoOwner, repoName, createdAt), ci_runs_sha_idx (commitSha), ci_runs_status_idx (status, createdAt)

## ci_jobs
- Table name: ci_jobs
- Primary key: id (uuid, default gen_random_uuid())
- Columns:
  - id: uuid, not null, primary key, default gen_random_uuid()
  - runId: uuid, not null
  - status: text, not null, default "READY"
  - attempts: integer, not null, default 0
  - leasedUntil: timestamp
  - lastError: text
  - createdAt: timestamp, not null, defaultNow()
  - Indexes: ci_jobs_status_idx (status, createdAt), ci_jobs_lease_idx (leasedUntil)

## webhook_deliveries
- Table name: webhook_deliveries
- Primary key: deliveryId (text)
- Columns:
  - deliveryId: text, not null, primary key
  - event: text, not null
  - repoOwner: text
  - repoName: text
  - receivedAt: timestamp, not null, defaultNow()
  - Indexes: webhook_deliveries_received_idx (receivedAt)

## certificates
- Table name: certificates
- Primary key: id (uuid, default gen_random_uuid())
- Columns:
  - id: uuid, not null, primary key, default gen_random_uuid()
  - analysisId: integer, not null
  - tenantId: text, not null
  - certificateData: jsonb, not null
  - signature: text, not null
  - publicKey: text, not null
  - noteHash: text, not null
  - hashAlgorithm: text, not null, default "sha256"
  - issuedAt: timestamp, not null, defaultNow()
  - createdAt: timestamp, not null, defaultNow()
  - Indexes: certificates_analysis_idx (analysisId), certificates_tenant_idx (tenantId, issuedAt)

## Schema Sources
- `shared/schema.ts` — All table definitions

## conversations (from shared/models/chat.ts)
- Table name: conversations
- Primary key: id (serial, not null)
- Columns:
  - id: serial, not null, primary key
  - title: text, not null
  - createdAt: timestamp, not null, default CURRENT_TIMESTAMP

## messages (from shared/models/chat.ts)
- Table name: messages
- Primary key: id (serial, not null)
- Columns:
  - id: serial, not null, primary key
  - conversationId: integer, not null, references conversations.id, onDelete cascade
  - role: text, not null
  - content: text, not null
  - createdAt: timestamp, not null, default CURRENT_TIMESTAMP

