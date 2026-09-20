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

Modulos planejados: Identity, Organizations, Works, Procedures, Training, Catalog, Commerce, PreliminaryDesign, AI, Execution, Checklists, Evidence, Media, Audit e Observability. Identity, Organizations, Audit e Observability possuem fundacao executavel; os demais evoluem por fatias verticais.

## Regras de dependencia

- HTTP valida e autoriza, Actions coordenam, dominio decide, infraestrutura integra.
- Modulos publicam eventos ou contratos estreitos; nao acessam tabelas internas de outro modulo por conveniencia.
- Eloquent nao atravessa fronteiras externas nem e serializado diretamente em APIs.
- Jobs devem ser idempotentes quando puderem ser repetidos.
- Transacoes cobrem apenas consistencia local; chamadas externas ocorrem depois do commit.

## Multi-tenancy

Banco compartilhado com `organization_id` nas entidades tenant-owned. O tenant ativo deriva da associacao autenticada e toda Policy confirma acesso ao recurso. Global scopes podem reduzir erros, mas nao substituem Policies e testes. Operacoes de plataforma com acesso excepcional exigem justificativa, escopo temporal e audit event.

O acesso organizacional deriva de `organization_memberships` ativas e do papel registrado no proprio vinculo. Os papeis owner e admin podem administrar a organizacao; os demais recebem capacidades operacionais especificas nas proximas fatias. Super Admin e uma capacidade global separada: ela libera recursos de seguranca da plataforma, mas nao ignora Policies nem concede acesso automatico a tenants.

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

O preview PWA e publicado em Cloudflare Workers por GitHub Actions depois dos checks de `develop`. Sem bindings D1, ele preserva o fallback de demonstracao; com bindings, o Worker usa sessao persistente, repositorios D1 e rotas privadas com `no-store`. O HTML do dashboard ainda e o mockup visual e nao consome essas rotas automaticamente. MGL permanece fora do caminho das requisicoes e consumira eventos assincronos somente quando seu contrato oficial estiver disponivel.

Rotas do preview que representam recursos do Laravel devem preservar o contexto: `/cursos` lista o catalogo, `/cursos/{slug}` exibe o detalhe valido e slugs desconhecidos retornam `404`. O Worker nao pode transformar um detalhe em uma nova listagem silenciosamente.

## IA e motor de estudo preliminar

```text
Questionario validado
   -> PreliminaryDesign Action
   -> AI Provider Contract (interpretacao estruturada)
   -> schema e regras deterministicas
   -> motor de distribuicao espacial
   -> estudo versionado para revisao humana
```

Groq e candidato inicial para prototipacao por possuir camada gratuita e limites explicitos. OpenRouter ou outro provedor pode ser usado como alternativa. Nenhum SDK especifico atravessa o contrato de dominio. Chaves ficam no secret manager, chamadas usam timeout e limite de tokens, e respostas sao validadas antes da persistencia.

Decisao atual: IA nao faz parte do MVP nem do caminho critico. O catalogo, os procedimentos, checklists, registros, pagamentos e operacao devem funcionar sem qualquer provedor de IA. O contrato acima permanece documentado apenas como extensao futura, para evitar acoplamento quando essa etapa for priorizada.

## Decisoes pendentes

Permanecem pendentes: runtime Laravel de producao, provedor/configuracao de object storage, estrategia final de tenancy, gateway de pagamento, provedor de IA inicial, algoritmo geometrico, protocolo e painel MGL, mecanismo de antimalware, politica de retencao por categoria e identidade corporativa. Registrar decisoes duradouras como ADRs quando se tornarem concretas.
