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
| CF1-D4: CI do Worker (build, typecheck, deploy de preview) e bindings separados develop/production | Codex | Feito (PR #33, mesclado): CI roda `worker:typecheck`/`worker:build` quando a fundacao existe. Bindings separados de producao seguem como trabalho futuro do Codex. |

**Testes:** `npm run worker:typecheck`, `npm run worker:build`, `npm run worker:test` (suite automatizada com Vitest cobrindo todas as rotas publicas, headers de seguranca e a pagina de erro sanitizada quando o repositorio falha).

**Aceite:** um agente novo consegue rodar `wrangler dev`, abrir todas as rotas publicas e ver o catalogo mockado, sem depender do Laravel.

## Sprint CF-2 — Catalogo publico ligado ao D1

**Objetivo:** substituir o `MockCourseRepository` por dados reais do D1, sem mudar rotas nem contratos visuais.

| Card | Dono | Descricao | Status |
|---|---|---|---|
| CF2-D1 | Codex | Repositorio D1 (`D1CourseRepository`) implementando o mesmo formato de dados hoje consumido pelas paginas (`listCourses`, `findCourseBySlug`). | Feito (PR #35, mesclado em `develop`). O repositorio mapeia as linhas do D1 direto para o tipo `Course` ja existente em `cloudflare/src/data/course.ts`, sem exigir mudanca de contrato. |
| CF2-D2 | Codex | Seed idempotente do catalogo em D1 (sem apagar dados existentes), espelhando o conteudo editorial ja publicado. | Feito (PR #35, `0002_seed_editorial_catalog.sql`, `INSERT OR IGNORE` com IDs deterministicos). |
| CF2-C1 | Claude | Ajustar `cloudflare/src/data/course.ts` para consumir o contrato de dominio exposto pelo Codex, sem acessar D1 diretamente. | Feito sem alteracao: o `D1CourseRepository` do Codex ja implementa a interface `CourseRepository` existente; `npm run worker:typecheck` e `npm run worker:build` passam sem mudanca em `course.ts`. `cloudflare/src/index.ts` agora escolhe `D1CourseRepository` quando o binding `COURSES_DB` existe e mantem `MockCourseRepository` como fallback de preview. |
| CF2-C2 | Claude | Estados de carregamento/erro no catalogo e no detalhe (obra ainda nao publicada, curso despublicado) e teste manual de responsividade apos a troca de fonte de dados. | Feito: pagina de erro sanitizada (`renderServerError`) para falha do repositorio em `/cursos` e `/cursos/:slug`, validada com D1CourseRepository real no codigo (teste manual continua em mock local por falta de binding D1 de preview neste ambiente; ver "Testes" abaixo). |
| CF2-C3 | Claude | Atualizar CHANGELOG.md e nota de "conteudo editorial" quando o dado passar a vir do D1 real. | Feito: CHANGELOG.md atualizado nesta entrada confirmando a integracao D1 na camada publica. |

**Testes:** `npm run worker:typecheck` e `npm run worker:build` com o `D1CourseRepository` integrado (ok, sem alteracao de codigo necessaria); `npm run worker:test` (Vitest) cobre `/`, `/como-funciona`, `/cursos`, `/cursos/:slug` valido e inexistente (404 real), `/health`, os headers de seguranca minimos, e simula o binding `COURSES_DB` falhando para confirmar que `/cursos` e `/cursos/:slug` retornam 500 sanitizado (sem stack trace) enquanto as rotas independentes continuam 200; `wrangler dev` local sem binding `COURSES_DB` confirma o mesmo fallback manualmente. Falta um teste manual com binding `COURSES_DB` real apontando para o D1 de `develop` (ambiente Cloudflare, fora do alcance do `wrangler dev` local sem credenciais) — recomendado para a validacao do responsavel do projeto ou do Codex antes do checkpoint do lote.

**Aceite:** o catalogo publico funciona identico ao mock para o visitante, mas os dados vem do D1; nenhuma rota publica muda de contrato.

## Sprint CF-3 — Autenticacao, sessoes e organizacoes

**Objetivo:** substituir a sessao de demonstracao (`cloudflare/src/auth/demoSession.ts`) por autenticacao real, preservando UX do mockup.

| Card | Dono | Descricao | Status |
|---|---|---|---|
| CF3-D1 | Codex | Login real (hash de senha, sessao assinada ou JWT), memberships e organizacao ativa, seguindo `organization_memberships` ja definido na migration. | Feito (PRs #41, #42, #43): `D1SessionStore`, `password.ts` (PBKDF2-SHA256) e `realSession.ts` (`loginWithD1`/`logoutFromD1`/`authenticateRequest`) ligados a `cloudflare/src/index.ts`; login demo preservado como fallback quando `AUTH_DB` nao existe. |
| CF3-D2 | Codex | Testes negativos: usuario anonimo, papel insuficiente, tenant cruzado, sessao expirada. | Feito (push direto em `develop`): `D1MembershipRepository` com autorizacao server-side por usuario/organizacao (somente `status = active` concede acesso) e testes proprios (`membershipRepository.test.ts`). |
| CF3-C1 | Claude | Tela de login/cadastro no visual do mockup consumindo o novo contrato de autenticacao (sem implementar a logica de verificacao). | Feito: `cloudflare/src/pages/login.ts` (novo) substitui a renderizacao antiga em `demoSession.ts`; `index.ts` passa `realAuthEnabled: Boolean(env.AUTH_DB)` para alternar copy demo/real sem nenhuma logica de autorizacao no frontend. Cadastro (criacao de conta) **nao foi implementado como formulario** porque o Codex ainda nao publicou um endpoint/contrato para criar usuario — a secao de cadastro e um link informativo para `/cursos`, evitando inventar um endpoint inexistente. |
| CF3-C2 | Claude | Estados de erro de login (credenciais invalidas, conta suspensa) com mensagens claras em portugues, mantendo acessibilidade (foco, leitura por teclado). | Feito com ressalva: a mensagem de erro e generica ("Nao foi possivel entrar com esses dados...") por design de seguranca — nem `loginWithD1` nem `D1UserRepository` distinguem "conta suspensa" de "senha incorreta" hoje, e mensagens especificas revelariam se um e-mail existe. `role="alert"` + `aria-describedby` + foco automatico no campo de e-mail implementados. Se o Codex expuser um estado de conta suspensa no futuro, a mensagem pode ser diferenciada sem mudar o restante da tela. |
| CF3-C3 | Claude | Remover `demoSession.ts` somente apos o contrato real estar disponivel e revisado pelo Codex; ate la o login de demonstracao continua ativo. | Parcial: a renderizacao (`loginPage`) ja saiu de `demoSession.ts` para `pages/login.ts`; a logica de sessao de demonstracao (`sessionToken`/`isAuthenticated`) continua em `demoSession.ts` como fallback ativo quando `AUTH_DB` nao existe (ambiente de preview sem binding). Remocao completa so deve acontecer com aprovacao explicita do responsavel, conforme o card pede. |

**Testes:** `npm run worker:typecheck`, `npm run worker:test` (27/27, incluindo 8 novos testes de login/logout real: `/entrar` demo vs real, login com senha correta define cookie `HttpOnly`/`Secure`/`SameSite=Lax` e redireciona a `/painel`, senha incorreta retorna 422 sanitizado sem cookie, `/painel` com/sem sessao valida, `/sair` revoga a sessao), `npm run worker:build`; teste manual via `wrangler dev` confirmando que o fluxo demo (sem `AUTH_DB`) continua identico ao anterior.

**Aceite:** um usuario real consegue entrar, ver apenas sua organizacao, e o login de demonstracao e desligado com aprovacao explicita registrada no diario. (Isolamento por organizacao depende de `AuthorizationContext`/`D1MembershipRepository` do Codex serem consumidos pelo painel — ainda nao coberto pela camada visual, ver Sprint CF-4/CF-6.)

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

| Card | Dono | Descricao | Status |
|---|---|---|---|
| CF5-D1 | Codex | Binding R2, contrato de evidencia (storage key, checksum, MIME validado), download autorizado por Policy. | Feito em parte: `domain/evidence.ts` (`validateEvidenceUpload`, calculo deterministico de `storageKey`) e `auth/evidenceAuthorization.ts` (`canDownload`) existem; **nao ha repositorio de persistencia** (nenhum `create`/insert de metadata de evidencia em D1) nem rota de upload real. |
| CF5-D2 | Codex | Migration e contrato de chamados de suporte com contexto sanitizado. | Feito: migration `0006_support_tickets.sql`, `domain/support.ts` (`validateSupportTicket`, `sanitizeSupportContext`) e `auth/supportTicketRepository.ts` (`D1SupportTicketRepository.create`/`findForUser`) prontos e utilizados pela camada visual. |
| CF5-C1 | Claude | Tela de upload/anexo de evidencia (captura, preview, estado de envio) e tela de abertura/acompanhamento de chamado. | Feito **so a parte de chamados**: `cloudflare/src/pages/support.ts` + rotas `/chamados` (GET formulario, POST criar, GET `/chamados/:id` acompanhar) exigindo sessao real via novo helper `auth/currentUser.ts` (`getAuthenticatedUserId`, construido sobre o `D1SessionStore` ja publicado pelo Codex, sem duplicar logica de autenticacao nem tocar `realSession.ts`). **Upload de evidencia continua bloqueado**: alem de faltar o repositorio de persistencia (ver CF5-D1), a evidencia e ligada a um `executionStepId` que so existiria via o repositorio operacional do CF4 (tambem nao publicado) — nao ha como escolher "para qual execucao" anexar uma evidencia sem inventar esse dado. |
| CF5-C2 | Claude | Estado de fila offline-friendly na interface (pendente, enviando, concluido, falha) conforme `docs/PWA.md`. | Feito para o formulario de chamados: submissao funciona sem JavaScript (POST tradicional); quando `navigator.onLine` e falso, o chamado fica em fila no `localStorage` e e reenviado automaticamente no evento `online`, com os quatro estados (pendente/enviando/concluido/falha) exibidos de forma acessivel (`role="status"`/`role="alert"`). Nao se aplica a evidencias ainda, pelo mesmo motivo do CF5-C1. |

**Testes:** `npm run worker:typecheck`, `npm run worker:test` (50/50, incluindo 14 novos testes de chamados: renderizacao do formulario/fila offline, criacao com sucesso, validacao de titulo/descricao vazios, consulta do proprio chamado, 404 para chamado inexistente/de outro usuario), `npm run worker:build`; teste manual via `wrangler dev` confirmando que `/chamados` sem sessao redireciona para `/entrar` e as demais rotas publicas continuam intactas.

**Aceite:** chamado funciona ponta a ponta no Worker (abrir, confirmar, consultar), restrito ao proprio usuario. Evidencia **nao** funciona ponta a ponta ainda — falta repositorio de persistencia (Codex) e o repositorio operacional do CF4 (Codex) para saber a qual execucao anexar o arquivo; nenhum binario e exposto publicamente porque nada e aceito ainda.

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
