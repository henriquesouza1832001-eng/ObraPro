---
name: security-review
description: Review ObraPro changes that affect authentication, authorization, tenant data, uploads, logs, secrets, administrative endpoints, or other security boundaries before merge.
---

# ObraPro Security Review

Read `/AGENTS.md`, `docs/SECURITY.md`, and `docs/THREAT-MODEL.md`. Inspect the diff and trace each untrusted input through validation, authorization, persistence, logs, and output.

## Checklist

- Confirm authentication state, server-side Policy/Gate enforcement, deny-by-default behavior, and tenant ownership for every resource operation.
- Test anonymous, insufficient-role, changed-ID and cross-tenant cases; inspect mass assignment and privilege changes.
- Verify CSRF, rate limits, session regeneration/cookies, safe redirects, parameterized queries and output escaping.
- For uploads, check size, detected MIME, private storage, random names, authorization and path handling.
- Search tracked files and diffs for secrets; confirm logs/events redact credentials, cookies, tokens, request bodies and unnecessary PII.
- Review headers, exception responses, migrations, new dependencies and all administrative endpoints.

Relevant files include `app/Http`, `app/Policies`, `app/Domain`, `app/Infrastructure`, `config`, `routes`, `database/migrations`, and security tests.

Safe commands: `git diff --check`, `git diff`, `php artisan test`, `composer audit`, and configured static analysis. Do not run external scanners or transmit source without explicit authorization.

Approve only when controls exist server-side and negative tests cover meaningful boundaries. Block merge for broken access control, cross-tenant access, secret exposure, unsafe uploads, privilege escalation, disabled framework protection, sensitive logs, destructive migration risk, or unpatched critical dependency findings.
