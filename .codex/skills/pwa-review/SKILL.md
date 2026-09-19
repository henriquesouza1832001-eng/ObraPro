---
name: pwa-review
description: Review ObraPro manifest, service worker, caching, offline queues, local data, updates, and logout behavior when PWA functionality changes.
---

# ObraPro PWA Review

Read `/AGENTS.md` and `docs/PWA.md`. Test representative mobile and desktop viewports, online, offline, reconnect and service-worker update paths.

## Checklist

- Cache only public versioned assets by default; authenticated HTML/API responses are not cached accidentally.
- Cache keys contain no credentials or personal data and service-worker scope is minimal.
- Offline actions expose pending/sending/success/conflict/failure states and use idempotent server operations.
- Authorization is rechecked by the server after reconnect; stale procedures show version and revocation state.
- Logout and account/tenant switching clear sensitive local caches and queues.
- Evidence and video storage has explicit opt-in, quota, expiry and private handling.
- Installability, accessibility and degraded behavior work without hiding failures.

Relevant files: manifest, service worker, frontend entrypoints, auth/logout flow, offline storage and feature tests. Use browser devtools or automated browser tests without production accounts.

Block merge for cached authenticated responses, offline authorization assumptions, cross-account local data leakage, silent conflict loss, embedded secrets, or a service worker that cannot update safely.
