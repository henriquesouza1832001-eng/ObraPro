---
name: backend-review
description: Review ObraPro PHP/Laravel backend changes for correctness, modular boundaries, maintainability, error handling, queues, and test quality before merge.
---

# ObraPro Backend Review

Read `/AGENTS.md` and `docs/ARCHITECTURE.md`, then inspect the change in context rather than reviewing the diff alone.

## Checklist

- Controllers only handle HTTP concerns; business rules live in focused Actions/Services and views remain passive.
- Validation uses Form Requests or equivalent server-side rules; authorization uses Policies/Gates.
- Module dependencies use explicit contracts/events and do not reach into another module's internals.
- Transactions contain local consistency work only; external calls happen after commit.
- Jobs are serializable, bounded, observable and idempotent where retries are possible.
- Exceptions return safe responses and preserve correlation IDs; logs are structured and sanitized.
- Tests assert behavior, failures and edge cases without real external services.
- New dependencies and abstractions have demonstrated need.

Relevant files: `app`, `routes`, `config`, `database`, `tests`, `composer.json`, and affected docs. Run `php artisan test`, formatter, static analysis and `git diff --check` when available.

Block merge for correctness regressions, missing authorization, hidden cross-module coupling, unbounded retries, external calls inside critical transactions, swallowed errors, or missing tests for high-risk behavior.
