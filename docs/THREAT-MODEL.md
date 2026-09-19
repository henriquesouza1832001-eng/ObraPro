# Threat Model

## Escopo e ativos

Ativos: contas, organizacoes, obras, procedimentos aprovados, permissoes, execucoes, evidencias, fotos, videos, documentos, dados corporativos, audit/security events, logs e configuracoes.

Atores: trabalhador, encarregado, tecnico, engenheiro, gestor, administrador da organizacao, administrador da plataforma, usuario autenticado malicioso, invasor externo e bot.

## Trust boundaries

```text
Dispositivo do usuario
  | HTTPS
Web application / session boundary
  | application authorization
Domain + tenant boundary
  | private credentials
Database / Queue / Object storage
  | adapter contract + egress
MGL externo
```

O dispositivo e a rede sao nao confiaveis. Cada organizacao e uma fronteira logica. Workers de fila e storage possuem credenciais distintas. MGL recebe somente dados allowlisted.

## Ameaças prioritarias (STRIDE)

| Cenario | Categoria | Controle principal |
|---|---|---|
| Credential stuffing e sessao roubada | Spoofing | rate limit, hash forte, regeneracao, MFA futura |
| Alteracao de `organization_id` ou role | Tampering/Elevation | contexto server-side, fillable restrito, Policies |
| Usuario nega mudanca administrativa | Repudiation | audit event imutavel e correlation ID |
| IDOR e vazamento cross-tenant | Information disclosure | Policy por recurso, escopo tenant, testes negativos |
| Upload malicioso/MIME spoofing | Tampering/DoS | limites, MIME real, storage privado, quarentena |
| Fila/MGL indisponivel | Denial of service | outbox, retry limitado, operacao local independente |
| Log contem token ou PII | Information disclosure | allowlist, redacao, testes e acesso restrito |
| QR Code concede acesso indevido | Elevation | identificador opaco, expiracao/revogacao, Policy |
| Procedimento adulterado/desatualizado | Tampering | versao imutavel, aprovacao, checksum e auditoria |
| Service worker mantem dados apos logout | Information disclosure | cache restrito e limpeza no logout |
| SSRF em importacao/midia | Spoofing/Disclosure | allowlist de destinos, bloqueio de redes privadas |

## Riscos e revisao

MFA, antimalware, politica legal de retencao, seguranca de dispositivo offline e contrato MGL ainda estao pendentes. Rever este documento ao adicionar uploads, compartilhamento, APIs, integracoes, sincronizacao offline ou privilegios administrativos.
