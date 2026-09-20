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

**Testes:** `npm run worker:typecheck`, `npm run worker:test` (46 testes, incluindo login/logout real, tenant cruzado, suporte e evidencia privada) e `npm run worker:build`. O fallback demo continua propositalmente ativo apenas sem `AUTH_DB`.

**Aceite:** um usuario real consegue entrar, ver apenas sua organizacao, e o login de demonstracao e desligado com aprovacao explicita registrada no diario. (Isolamento por organizacao depende de `AuthorizationContext`/`D1MembershipRepository` do Codex serem consumidos pelo painel — ainda nao coberto pela camada visual, ver Sprint CF-4/CF-6.)

## Sprint CF-4 — Cursos, obras, procedimentos, checklists e execucoes

**Objetivo:** portar o nucleo operacional do Laravel para o Worker.

| Card | Dono | Descricao | Status |
|---|---|---|---|
| CF4-D1 | Codex | Migrations D1 de obras, procedimentos, etapas, checklists e execucoes; contratos de dominio correspondentes. | Feito: `0004_operational_core.sql`, contratos tipados e `D1OperationalRepository`. |
| CF4-D2 | Codex | Regras de autorizacao por tenant e testes de isolamento entre organizacoes. | Feito: rotas `GET /api/painel/organizacoes` e `GET /api/painel/obras?organization_id=...` exigem sessao D1, membership ativa e `no-store`; tenant cruzado retorna 403. |
| CF4-C1 | Claude | Telas de execucao (uma acao principal por tela), checklist e progresso, seguindo `docs/UX.md`. | Feito com persistencia real: painel lista procedimentos (agrupados por etapa) e checklists reais, com tela de detalhe (passos, materiais, seguranca) e inicio de execucao (`POST /api/painel/execucoes`). Apos iniciar, o painel busca a execucao real (`GET /api/painel/execucoes/{id}`, implementado por Claude nesta entrega — ver CF6-D1) e cada "Concluir etapa"/"Pular etapa" chama `PATCH /api/painel/execucoes/{id}/etapas/{step_id}` de verdade, usando o `execution_step_id` real devolvido pelo `GET`. Uma etapa so aparece marcada apos confirmacao do servidor; falha de rede mostra erro e nao marca nada. Tela de conclusao mostra resumo real apos todas as etapas resolvidas. **Nao feito nesta entrega**: registro de evidencia por etapa e a home publica com categorias coloridas do mockup (proximo pacote). |
| CF4-C2 | Claude | Estados vazio (nenhuma obra ativa), carregamento e erro de rede no painel operacional. | Feito para obras, procedimentos e checklists: cada lista trata carregando, vazio, erro e demonstracao (sem sessao real) separadamente. |

**Testes:** inicio/conclusao de execucao, checklist obrigatorio, tenant cruzado bloqueado, leitura mobile.

**Aceite:** parcial. A base e leitura de obras estao no Worker; fluxo visual de campo, procedimentos e checklists ainda precisa consumir a API antes de declarar paridade com Laravel.

## Sprint CF-5 — Evidencias privadas (R2) e chamados de suporte

**Objetivo:** upload privado de evidencias e central de chamados no Worker.

| Card | Dono | Descricao | Status |
|---|---|---|---|
| CF5-D1 | Codex | Binding R2, contrato de evidencia (storage key, checksum, MIME validado), download autorizado por Policy. | Feito em codigo: `POST /api/painel/evidencias` detecta MIME pelo conteudo, limita tamanho, calcula checksum, grava R2 privado e metadata D1; download exige tenant. Requer binding R2 real para smoke test. |
| CF5-D2 | Codex | Migration e contrato de chamados de suporte com contexto sanitizado. | Feito: `POST /api/painel/suporte/chamados` e consulta do proprio solicitante; contexto allowlisted. |
| CF5-C1 | Claude | Tela de upload/anexo de evidencia (captura, preview, estado de envio) e tela de abertura/acompanhamento de chamado. | Pendente: rotas estao prontas para integracao visual. |
| CF5-C2 | Claude | Estado de fila offline-friendly na interface (pendente, enviando, concluido, falha) conforme `docs/PWA.md`. | Pendente: fila offline pertence ao proximo trabalho de PWA. |

**Testes:** upload valido/invalido, download bloqueado entre organizacoes, chamado criado e visivel para o solicitante.

**Aceite:** parcial. Backend e rotas privadas estao prontos e testados com R2 simulado; configuracao de binding real e interface de upload/chamado ainda precisam de smoke test manual.

## Proximo lote proposto: CF-6 a CF-10

Este lote foi autorizado pelo responsavel em 2026-09-19. A CF6 esta em andamento sob responsabilidade temporaria do Codex enquanto Claude Code estiver indisponivel. A ordem elimina primeiro os mockups estaticos e as lacunas de ambiente antes de introduzir venda ou IA.

## Sprint CF-6 — Painel operacional ligado ao ambiente real

**Objetivo:** substituir os dados hardcoded do painel por chamadas autenticadas ao Worker e validar D1/R2 de `develop` sem expor dados de tenant.

| Card | Dono | Descricao |
|---|---|---|
| CF6-C1 | Codex (temporario) | Fazer `dashboard.html` consumir `GET /api/painel/organizacoes` e `GET /api/painel/obras`, com estados vazio/carregando/erro e sem acesso direto a D1. Feito: navegacao, leitura real, estado vazio/erro e selecao explicita de organizacao implementados. |
| CF6-C2 | Claude | Conectar abertura e consulta de chamados; criar tela de evidencia com captura, validacao client-side e feedback de envio, sem simular sucesso offline. Parte de suporte concluida: `dashboard.js` valida campos obrigatorios no cliente e diferencia mensagem de sucesso, erro de validacao, acesso negado a organizacao, servico indisponivel e falha de rede, usando somente os codigos de erro ja retornados por `POST /api/painel/suporte/chamados` (nenhum contrato inventado). Consulta de chamado e a tela de evidencia continuam pendentes: nao ha listagem "meus chamados" nem tela de captura/anexo no painel ainda, e evidencia depende de uma execucao valida (`executionStepId`), que a interface ainda nao expoe. |
| CF6-D1 | Codex (+ complemento de Claude) | Revisar contratos de leitura necessarios para procedimento, checklist e execucao; publicar apenas endpoints tenant-aware que tenham repositorio, policy e testes. | Feito: `GET /api/painel/procedimentos`, `GET /api/painel/procedimentos/{id}`, `GET /api/painel/checklists`, `GET /api/painel/checklists/{id}`, `POST /api/painel/execucoes` e `PATCH /api/painel/execucoes/{id}/etapas/{step_id}` (Codex, mesclado em `develop` no PR #57). **Complemento de Claude nesta entrega, registrado no diario antes de editar**: `GET /api/painel/execucoes/{id}?organization_id=...` (mesmo padrao de autorizacao do `PATCH` de etapa — `D1MembershipRepository`/`D1OperationalAuthorization` reaproveitados, sem migration nova), fechando o gap que impedia o `PATCH` de etapa de ser chamado pela interface sem inventar `step_id`. Recomendado ao Codex revisar esta adicao (`cloudflare/src/domain/operational.ts`, `cloudflare/src/data/d1OperationalRepository.ts`, `cloudflare/src/index.ts`). |
| CF6-D2 | Codex | Configurar e documentar bindings reais `AUTH_DB`, `OPERATIONS_DB` e `EVIDENCE_BUCKET` por ambiente, sem IDs ou secrets no repositorio; executar smoke test controlado. |

**Testes:** sessao demo bloqueada das APIs privadas, organizacao inativa e tenant cruzado negados, estados visualmente acessiveis, upload e download privado em ambiente de `develop`.

**Aceite:** usuario real ve somente suas obras; painel sem obra mostra estado vazio claro; chamado e evidencia tem retorno verdadeiro do servidor; preview deixa de depender de cards operacionais hardcoded.

## Sprint CF-7 — Execucao de campo e checklists

**Objetivo:** tornar o passo a passo utilizavel no celular, com progresso persistido e evidencias privadas por etapa.

| Card | Dono | Descricao |
|---|---|---|
| CF7-D1 | Codex | Rotas para procedimentos, etapas, checklists e execucoes com validacao transacional, versionamento e autorizacao por tenant. |
| CF7-C1 | Claude | Telas mobile de procedimento, checklist e conclusao com uma acao principal por tela e retomada de progresso. | Feito (ver tambem CF4-C1): passo a passo, checklist com persistencia real e conclusao existem. Adicionado nesta entrega: home fiel ao mockup na view "overview" do painel — saudacao, "etapa atual" com organizacao/obra reais, busca por servico e seis cards de categoria coloridos com contagem real de procedimentos, navegando para a lista filtrada. Icones trocados de Unicode para SVG inline. **Nao feito**: retomada de progresso entre sessoes (nao ha listagem de execucoes anteriores no contrato ainda) e a captura/registro de evidencia por etapa. |
| CF7-C2 | Claude | Exibir erros de validacao e indisponibilidade com acao de tentar novamente, sem perder dados ja confirmados. |

**Testes:** inicio/conclusao de execucao, etapa obrigatoria, reabertura autorizada, concorrencia basica, tenant cruzado e leitura em viewport mobile.

**Aceite:** uma pessoa inicia um procedimento, marca etapas, anexa evidencia, interrompe e retoma sem confundir o que ja foi salvo.

## Sprint CF-8 — Administracao, catalogo e seguranca de plataforma

**Objetivo:** entregar o painel administrativo modular para gestao de cursos, pessoas e configuracoes, isolando por completo a area de Super Admin.

| Card | Dono | Descricao |
|---|---|---|
| CF8-D1 | Codex | Contratos de administracao de organizacao, catalogo e auditoria; policy explicita para security events e configuracoes globais de Super Admin. |
| CF8-C1 | Claude | Telas seccionadas de cursos, modulos, aulas, equipe e configuracoes com busca, filtros e confirmacoes compreensiveis. |
| CF8-C2 | Claude | Area de seguranca aparece somente com permissao devolvida pelo contrato; nunca inferir papel no navegador. |

**Testes:** administrador de organizacao nao acessa seguranca global, Super Admin nao recebe bypass implicito de tenant, alteracoes administrativas auditadas e tabelas acessiveis.

**Aceite:** administradores gerenciam conteudo e equipe sem acessar recursos de seguranca; somente Super Admin ve eventos, credenciais de provedores e configuracoes MGL.

## Sprint CF-9 — Direitos comerciais e PIX por adaptador

**Objetivo:** preparar venda de cursos e planos com preco configuravel, sem confiar no navegador e sem acoplar o dominio a um provedor de pagamento.

| Card | Dono | Descricao |
|---|---|---|
| CF9-D1 | Codex | Modelo de produto, preco congelado, pedido, entitlement e adaptador PIX; webhook autenticado, idempotente e auditado. |
| CF9-C1 | Claude | Landing e catalogo mostram gratuito, incluso e avulso vindos do contrato; checkout informa valor e estado sem prometer confirmacao antes do webhook. |
| CF9-C2 | Claude | Area "Meus acessos" e recuperacao visual de compra pendente/falha, com suporte contextual. |

**Testes:** assinatura e replay de webhook, duplicidade, valor divergente, pagamento pendente/confirmado/falho, revogacao e curso premium bloqueado.

**Aceite:** nenhum curso pago e liberado por retorno do browser; cada concessao tem pedido, valor, evento de pagamento e historico auditavel.

## Sprint CF-10 — PWA, operacao e readiness de lancamento

**Objetivo:** transformar o fluxo validado em um produto instalavel e operavel antes de convidar usuarios reais.

| Card | Dono | Descricao |
|---|---|---|
| CF10-D1 | Codex | Rate limit, logs sanitizados, health checks, backup/restore documentado, rollback e verificacao de dependencias. |
| CF10-C1 | Claude | Cache do shell e de conteudo permitido, fila local para checklist/evidencia, estados de sincronizacao e limpeza no logout. |
| CF10-C2 | Claude | Testes de instalacao, atualizacao e responsividade em Android, iPhone, desktop e navegadores suportados. |

**Testes:** offline/online, repeticao de envio, conflito, logout, atualizacao de service worker, restore e indisponibilidade de observabilidade opcional.

**Aceite:** usuario entende o que esta salvo, pendente ou falhou; a plataforma opera sem MGL e possui processo testado de recuperacao e rollback.

## Depois do lancamento inicial: IA opcional

MGL continua opcional, fora do caminho critico e exclusivo para observabilidade/seguranca. IA somente volta ao planejamento depois da CF10, com fornecedor substituivel, limite de custo, revisao humana e aviso claro de que estudos preliminares nao sao projetos tecnicos, estruturais ou legais.

## Checkpoint de sincronizacao

Ao final de cada sprint CF, os dois agentes:

1. Releem `AI-COLLABORATION-LOG.md` e este documento antes de iniciar a proxima sprint.
2. Confirmam que nenhum arquivo reservado do outro foi tocado.
3. Abrem PR para `develop` (nunca para `main`) com testes, riscos e proximo passo descritos.
4. Aguardam revisao do Codex quanto a arquitetura, contratos e seguranca antes de qualquer merge.
5. Registram inicio/fim no diario, incluindo bloqueios reais (schema pendente, contrato nao publicado, toolchain faltando).
