---
name: mgl-observability-review
description: Review ObraPro audit, security-event, queue, structured-logging, health-check, and MGL adapter changes for separation, sanitization, and failure isolation.
---

# ObraPro MGL and Observability Review

Read `/AGENTS.md`, `docs/OBSERVABILITY.md`, and `docs/MGL.md`. Treat MGL as optional and external; do not infer undocumented endpoints or payloads.

## Checklist

- Application logs, audit events, security events and metrics remain distinct.
- Events are persisted locally before asynchronous delivery when durability matters.
- Business requests succeed when MGL is disabled, slow or unavailable.
- Jobs use timeouts, bounded retry/backoff, idempotency and observable terminal failure.
- Payloads are versioned and allowlisted; passwords, tokens, cookies, secrets, evidence content and unnecessary PII are absent.
- Correlation IDs propagate through HTTP, events and jobs without trusting unbounded client input.
- Public health output reveals no credentials, versions, topology or exception details.

Inspect contracts, event models, jobs, adapters, logging config and failure-path tests. Use fake queues/transports; never connect to real MGL during review.

Block merge for synchronous hard dependency on MGL, invented protocol, sensitive telemetry, mixed audit/log storage, infinite retry, missing local failure evidence, or health information disclosure.
