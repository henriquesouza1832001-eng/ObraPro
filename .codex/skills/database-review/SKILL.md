---
name: database-review
description: Review ObraPro schema, migrations, Eloquent queries, indexes, data lifecycle, and tenant isolation when database behavior changes.
---

# ObraPro Database Review

Read `/AGENTS.md` and `docs/DATABASE.md`. Determine whether the migration may already have run; never rewrite shared migration history.

## Checklist

- Tenant-owned records contain indexed `organization_id`, valid foreign keys and tenant-aware uniqueness.
- Queries derive organization context from trusted authentication and resist IDOR/cross-tenant access.
- SQL is parameterized and portable across SQLite, PostgreSQL and MySQL where promised.
- Nullability, defaults, lengths, indexes, cascades and delete behavior match domain invariants.
- Migration rollout considers locks, existing rows, backfill, rollback, backups and destructive operations.
- Models prevent mass assignment of roles, tenant IDs and privileged fields.
- Retention/deletion handles audit needs and LGPD purpose without silent data loss.

Inspect `database/migrations`, models, factories, seeders, queries and tests. Run migrations on a fresh database and the test suite when tooling exists.

Block merge for cross-tenant risk, destructive migration without rollout plan, edited applied migration, missing constraints on critical invariants, unsafe raw SQL, unbounded query patterns, or real personal data in fixtures.
