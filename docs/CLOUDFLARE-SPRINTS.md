# Sprints da Migracao Cloudflare

Este documento aplica a `docs/ROADMAP.md` e `docs/SPRINTS.md` a migracao descrita em `docs/CLOUDFLARE-MIGRATION.md`. Ele nao substitui nenhum dos tres; existe para dividir o trabalho da migracao entre Claude Code e Codex de forma explicita, sprint a sprint, evitando dois agentes editando o mesmo arquivo ou schema.

## Papeis fixos

- **Claude Code** (`C:\projetos\ObraPro-Claude`, branch `claude/cloudflare-ui`): Worker shell, PWA, landing page, "Como funciona", catalogo publico, detalhe de curso, rotas publicas, componentes visuais, responsividade, acessibilidade, estados vazio/carregamento/erro, testes e build da camada publica.
- **Codex** (`C:\projetos\ObraPro-Codex`, branch `codex-cloudflare-foundation`): contratos de dominio, schema e migrations D1, autenticacao, autorizacao, repositorios D1, bindings de R2/KV/Queues, testes de seguranca e revisao de integracao antes de qualquer merge.

Nenhum agente edita as pastas reservadas do outro. Claude nao edita `cloudflare/migrations`, `cloudflare/src/domain`, contratos nem testes de seguranca. Codex nao edita `cloudflare/public` nem os módulos visuais/rotas publicas em `cloudflare/src` fora de `domain`.

## Regra de integracao (repete o combinado no diario)

- Merge em `develop` ocorre somente por PR com checks aprovados.
- Merge em `main` e feito **somente pelo Codex**, e somente com pedido explicito do responsavel pelo projeto nesta conversa. Claude nunca mescla em `main` nem solicita esse merge por conta propria.
- Hotfix em `main` exige pedido explicito, PR, checks verdes e sincronizacao posterior com `develop`.
- Cada sprint fecha com PR de cada agente para `develop`; a integracao entre as duas metades (visual + dominio) e revisada pelo Codex antes de qualquer merge.

## Regras de pronto (herdadas de docs/SPRINTS.md)

- Nenhum card e aceito sem criterio de aceite demonstravel.
- Curso, obra, procedimento ou recurso inexistente retorna 404 real, nunca a home.
- Conteudo mockado/editorial continua identificado como demonstracao ate existir fonte D1 aprovada.
- O frontend (Claude) nunca acessa D1, R2 ou KV diretamente; sempre via contrato/repositorio exposto pelo Codex.
- Nenhum agente usa `DROP`, `TRUNCATE`, `wrangler d1 delete`, reset ou recriacao destrutiva.
- Nenhuma dependencia nova sem justificar no PR.
- Pagamentos, IA e MGL permanecem fora do escopo ate a Sprint CF-7/CF-8.

## Sprint CF-1 — Fundacao do Worker (em andamento)

**Objetivo:** Worker publicavel com rotas publicas, health check, bindings e schema inicial.

| Card | Dono | Status |
|---|---|---|
| CF1-C1: Worker shell TypeScript, roteamento tipado, `GET /`, `/como-funciona`, `/cursos`, `/cursos/:slug`, `/health` | Claude | Feito (PR #28) |
| CF1-C2: `CourseRepository` mock tipado para desacoplar rotas publicas do D1 | Claude | Feito (PR #28) |
| CF1-D1: `docs/CLOUDFLARE-MIGRATION.md` com decisao de arquitetura e regras de implementacao | Codex | Feito (PR #27) |
| CF1-D2: Migration D1 inicial de identidade e catalogo (`0001_identity_and_catalog.sql`) | Codex | Feito (commit `eb660a6`) |
| CF1-D3: Contratos de dominio `identity.ts` e `catalog.ts` (`CourseSummary`, `CourseDetails`, `AuthenticatedUser`, `OrganizationMembership`) | Codex | Feito (commit `eb660a6`) |
| CF1-D4: CI do Worker (build, typecheck, deploy de preview) e bindings separados develop/production | Codex | Pendente |

**Testes:** `npm run worker:typecheck`, `npm run worker:build`, testes manuais das rotas publicas (200 nos slugs validos, 404 real em slug inexistente).

**Aceite:** um agente novo consegue rodar `wrangler dev`, abrir todas as rotas publicas e ver o catalogo mockado, sem depender do Laravel.

## Sprint CF-2 — Catalogo publico ligado ao D1

**Objetivo:** substituir o `MockCourseRepository` por dados reais do D1, sem mudar rotas nem contratos visuais.

| Card | Dono | Descricao | Status |
|---|---|---|---|
| CF2-D1 | Codex | Repositorio D1 (`D1CourseRepository`) implementando o mesmo formato de dados hoje consumido pelas paginas (`listCourses`, `findCourseBySlug`), reaproveitando `CourseSummary`/`CourseDetails` de `catalog.ts`. | Pendente |
| CF2-D2 | Codex | Seed idempotente do catalogo em D1 (sem apagar dados existentes), espelhando o conteudo editorial ja publicado. | Pendente |
| CF2-C1 | Claude | Ajustar `cloudflare/src/data/course.ts` para consumir o contrato de dominio exposto pelo Codex (alinhar `Course` com `CourseSummary`/`CourseDetails`: `id`, `level`, `isFeatured`) sem acessar D1 diretamente — a leitura continua passando por um repositorio injetado. | Bloqueado por CF2-D1 |
| CF2-C2 | Claude | Estados de carregamento/erro no catalogo e no detalhe (obra ainda nao publicada, curso despublicado) e teste manual de responsividade apos a troca de fonte de dados. | Feito em parte: pagina de erro sanitizada (`renderServerError`) para falha do repositorio em `/cursos` e `/cursos/:slug`, com teste manual de falha simulada. Resta validar responsividade apos a troca real para D1 (depende de CF2-D1). |
| CF2-C3 | Claude | Atualizar CHANGELOG.md e nota de "conteudo editorial" quando o dado passar a vir do D1 real. | Pendente (depende de CF2-D1) |

**Testes:** rota `/cursos` e `/cursos/:slug` com dado real de D1 em ambiente `develop`; curso despublicado ou inexistente continua retornando 404; teste de regressao visual (desktop/mobile).

**Aceite:** o catalogo publico funciona identico ao mock para o visitante, mas os dados vem do D1; nenhuma rota publica muda de contrato.

## Sprint CF-3 — Autenticacao, sessoes e organizacoes

**Objetivo:** substituir a sessao de demonstracao (`cloudflare/src/auth/demoSession.ts`) por autenticacao real, preservando UX do mockup.

| Card | Dono | Descricao |
|---|---|---|
| CF3-D1 | Codex | Login real (hash de senha, sessao assinada ou JWT), memberships e organizacao ativa, seguindo `organization_memberships` ja definido na migration. |
| CF3-D2 | Codex | Testes negativos: usuario anonimo, papel insuficiente, tenant cruzado, sessao expirada. |
| CF3-C1 | Claude | Tela de login/cadastro no visual do mockup consumindo o novo contrato de autenticacao (sem implementar a logica de verificacao). |
| CF3-C2 | Claude | Estados de erro de login (credenciais invalidas, conta suspensa) com mensagens claras em portugues, mantendo acessibilidade (foco, leitura por teclado). |
| CF3-C3 | Claude | Remover `demoSession.ts` somente apos o contrato real estar disponivel e revisado pelo Codex; ate la o login de demonstracao continua ativo. |

**Testes:** fluxo completo de login/logout, sessao expirada, tenant sem acesso, cobertura de autorizacao pelo Codex.

**Aceite:** um usuario real consegue entrar, ver apenas sua organizacao, e o login de demonstracao e desligado com aprovacao explicita registrada no diario.

## Sprint CF-4 — Cursos, obras, procedimentos, checklists e execucoes

**Objetivo:** portar o nucleo operacional do Laravel para o Worker.

| Card | Dono | Descricao |
|---|---|---|
| CF4-D1 | Codex | Migrations D1 de obras, procedimentos, etapas, checklists e execucoes; contratos de dominio correspondentes. |
| CF4-D2 | Codex | Regras de autorizacao por tenant e testes de isolamento entre organizacoes. |
| CF4-C1 | Claude | Telas de execucao (uma acao principal por tela), checklist e progresso, seguindo `docs/UX.md`. |
| CF4-C2 | Claude | Estados vazio (nenhuma obra ativa), carregamento e erro de rede no painel operacional. |

**Testes:** inicio/conclusao de execucao, checklist obrigatorio, tenant cruzado bloqueado, leitura mobile.

**Aceite:** o fluxo de campo (abrir procedimento, marcar checklist, registrar evidencia pendente) funciona no Worker com paridade funcional ao Laravel.

## Sprint CF-5 — Evidencias privadas (R2) e chamados de suporte

**Objetivo:** upload privado de evidencias e central de chamados no Worker.

| Card | Dono | Descricao |
|---|---|---|
| CF5-D1 | Codex | Binding R2, contrato de evidencia (storage key, checksum, MIME validado), download autorizado por Policy. |
| CF5-D2 | Codex | Migration e contrato de chamados de suporte com contexto sanitizado. |
| CF5-C1 | Claude | Tela de upload/anexo de evidencia (captura, preview, estado de envio) e tela de abertura/acompanhamento de chamado. |
| CF5-C2 | Claude | Estado de fila offline-friendly na interface (pendente, enviando, concluido, falha) conforme `docs/PWA.md`. |

**Testes:** upload valido/invalido, download bloqueado entre organizacoes, chamado criado e visivel para o solicitante.

**Aceite:** evidencia e chamado funcionam ponta a ponta no Worker, sem expor o binario publicamente.

## Sprint CF-6 — Painel administrativo, auditoria e security events

**Objetivo:** portar o painel de gestao e a area exclusiva de Super Admin.

| Card | Dono | Descricao |
|---|---|---|
| CF6-D1 | Codex | Contratos de auditoria e security events; Gate equivalente a `viewPlatformSecurity`. |
| CF6-C1 | Claude | Telas de painel (obras, procedimentos, cursos, pessoas, relatorios) com busca, filtros e tabelas acessiveis. |
| CF6-C2 | Claude | Area de seguranca visivel somente quando o contrato do Codex confirmar Super Admin (sem logica de autorizacao no frontend). |

**Testes:** autorizacao por papel, ausencia de vazamento de tenant, area de seguranca oculta para nao-Super Admin.

**Aceite:** gestor opera o painel no Worker com os mesmos limites de autorizacao do Laravel.

## Sprint CF-7 — PWA offline, pagamentos e integracoes externas

**Objetivo:** paridade de PWA/offline e inicio do fluxo comercial, sem lógica de pagamento real ainda em producao.

| Card | Dono | Descricao |
|---|---|---|
| CF7-D1 | Codex | Contrato de pedido/pagamento (estado, idempotencia, webhook) e Queue de eventos. |
| CF7-C1 | Claude | Cache do shell, fila local de checklist/evidencia e telas de plano/checkout (sem processar pagamento real). |
| CF7-C2 | Claude | Testes de instalacao PWA, offline/online, atualizacao de service worker. |

**Testes:** conforme `docs/PWA.md` (offline/online, conflito, logout, atualizacao) e testes de webhook do Codex (assinatura, replay, duplicidade).

**Aceite:** app instalavel funciona offline para o essencial; nenhum acesso comercial e liberado sem confirmacao de pagamento auditavel.

## Sprint CF-8 — MGL e IA (posterior e opcional)

Mantido fora do caminho critico, conforme `docs/ARCHITECTURE.md` e `docs/CLOUDFLARE-MIGRATION.md`. Só entra em planejamento apos a Sprint CF-7 estar validada e com autorizacao explicita do responsavel do projeto.

## Checkpoint de sincronizacao

Ao final de cada sprint CF, os dois agentes:

1. Releem `AI-COLLABORATION-LOG.md` e este documento antes de iniciar a proxima sprint.
2. Confirmam que nenhum arquivo reservado do outro foi tocado.
3. Abrem PR para `develop` (nunca para `main`) com testes, riscos e proximo passo descritos.
4. Aguardam revisao do Codex quanto a arquitetura, contratos e seguranca antes de qualquer merge.
5. Registram inicio/fim no diario, incluindo bloqueios reais (schema pendente, contrato nao publicado, toolchain faltando).
