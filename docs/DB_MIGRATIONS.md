# DB_MIGRATIONS

### Migration Tooling

Drizzle ORM is used for database migrations.

### Local Workflow

- Create new migration: Use drizzle-kit CLI.
- Apply migration: `drizzle-kit push`
- Reset DB: Manual (no script found)
- Roll back: Manual (no script found)

### Production Workflow

- Migrations are applied via CI/CD or manually using drizzle-kit.

### Rollback Strategy

Rollback procedure is not currently automated.
