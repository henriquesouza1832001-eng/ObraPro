# Integracao MGL

## Objetivo e limite

MGL e um sistema externo existente para observabilidade e seguranca. ObraPro nao o reimplementa e nao conhece seu transporte no dominio.

```text
ObraPro -> SecurityTelemetry -> persistencia/outbox -> Queue -> MGL Adapter -> MGL
```

`SecurityTelemetry` aceita um evento interno sanitizado. A persistencia local ocorre junto da operacao relevante quando necessario. Depois do commit, um job entrega uma representacao versionada pelo adapter configurado. Um provider nulo/local permite operacao com MGL desativado.

## Resiliencia

Timeout curto, retry exponencial com jitter, limite de tentativas, idempotency key e circuit breaking apenas se a operacao justificar. Falha permanente e registrada sem incluir payload sensivel. Nunca fazer chamada MGL dentro da transacao principal.

## Eventos candidatos

`AUTH_LOGIN_SUCCESS`, `AUTH_LOGIN_FAILURE`, `AUTH_LOGOUT`, `AUTH_RATE_LIMIT`, `AUTH_PASSWORD_RESET`, `ACCESS_DENIED`, `ROLE_CHANGED`, `USER_CREATED`, `USER_DISABLED`, `SUSPICIOUS_REQUEST`, `HONEYPOT_TRIGGERED`, `UPLOAD_REJECTED`, `CROSS_TENANT_ATTEMPT`, `ADMIN_ACTION`, `SECURITY_CONFIG_CHANGED`.

Metadados aceitaveis: event ID, versao, tipo, severidade, instante UTC, correlation ID, organization ID opaco, actor ID opaco, resultado, recurso opaco e atributos tecnicos allowlisted. Senha, token, cookie, secret, conteudo de evidencia e PII livre sao proibidos.

## Bloqueios atuais

Endpoint, autenticacao, schema, assinatura, limites, SLAs e confirmacao de entrega dependem da documentacao oficial do MGL. O adapter remoto nao deve ser implementado antes disso.
