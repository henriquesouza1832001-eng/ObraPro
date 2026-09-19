# Arquitetura

## Estilo

Monolito modular Laravel. Um unico deploy e banco reduzem complexidade operacional nesta fase, enquanto limites de modulo evitam acoplamento acidental. Extracao para servico independente so sera considerada com evidencia de escala, autonomia operacional ou isolamento regulatorio.

```text
HTTP / Console / Queue
        |
Application Actions
        |
Domain modules
        |
Contracts / Events
        |
Infrastructure (DB, storage, adapters)
```

Modulos planejados: Identity, Organizations, Works, Procedures, Training, Execution, Checklists, Evidence, Media, Audit e Observability. Apenas Identity, Audit e Observability recebem fundacao executavel na Sprint 0.

## Regras de dependencia

- HTTP valida e autoriza, Actions coordenam, dominio decide, infraestrutura integra.
- Modulos publicam eventos ou contratos estreitos; nao acessam tabelas internas de outro modulo por conveniencia.
- Eloquent nao atravessa fronteiras externas nem e serializado diretamente em APIs.
- Jobs devem ser idempotentes quando puderem ser repetidos.
- Transacoes cobrem apenas consistencia local; chamadas externas ocorrem depois do commit.

## Multi-tenancy

Banco compartilhado com `organization_id` nas entidades tenant-owned. O tenant ativo deriva da associacao autenticada e toda Policy confirma acesso ao recurso. Global scopes podem reduzir erros, mas nao substituem Policies e testes. Operacoes de plataforma com acesso excepcional exigem justificativa, escopo temporal e audit event.

## Fluxo de auditoria e seguranca

```text
ObraPro application
   |-- Audit events --------> armazenamento local de auditoria
   `-- Security events -----> armazenamento local / outbox
                                   |
                                   v
                                Queue
                                   |
                                   v
                              MGL Adapter
                                   |
                                   v
                                  MGL
```

O commit da acao de negocio nao depende da disponibilidade do MGL. A entrega externa usa fila, retry com backoff e registro de falha. O adapter sera implementado somente com contrato oficial.

Durante a validacao do mockup inicial, somente a observabilidade local fica ativa. Cloudflare e MGL permanecem fora do caminho das requisicoes. A futura conexao Cloudflare sera avaliada depois da estabilizacao da experiencia; a futura integracao MGL consumira eventos de forma assincrona para compor um painel de observabilidade e seguranca.

## Decisoes pendentes

Validar o mockup inicial antes de escolher a configuracao Cloudflare. Permanecem pendentes: provedor/configuracao de object storage, estrategia final de tenancy, protocolo e painel MGL, mecanismo de antimalware, politica de retencao por categoria e provedor de identidade corporativa. Registrar decisoes relevantes como ADRs quando se tornarem concretas.
