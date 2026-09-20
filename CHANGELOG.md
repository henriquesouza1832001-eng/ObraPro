# Changelog

Todas as mudancas relevantes do ObraPro sao registradas aqui. O formato segue Keep a Changelog e o projeto usa versionamento semantico quando houver releases publicas.

## [Unreleased]

### Added

- Progresso real de curso na pagina de detalhe (`cloudflare/src/pages/courses.ts`): script client-side consulta `GET /api/cursos/{slug}/progresso` (contrato do PR #62, ja integrado em `develop`) e exibe "X de Y aulas concluidas" com barra de progresso quando o visitante tem sessao autenticada; para visitante anonimo (401) mostra um link "Entre para acompanhar seu progresso" em vez de erro; qualquer outra falha (503, rede) mantem o bloco oculto, sem mensagem quebrada. Nao foi implementado o botao de marcar aula como concluida (`POST /api/cursos/{slug}/aulas/{lessonId}/progresso`): o contrato `CourseModule.lessons` (`cloudflare/src/data/course.ts`) nao expoe um identificador de aula, apenas `title`/`durationMinutes`, entao nao ha como chamar essa rota do frontend sem inventar um ID — pendencia registrada no diario para o Codex avaliar expor `lessonId` no contrato de leitura de modulos. Nenhum endpoint novo, nenhuma migration alterada.

- Auditoria Spec 2 do detalhe de curso (`cloudflare/src/pages/courses.ts`): links `.back` ("Todos os cursos") e `.button` ("Começar agora"/"Voltar ao catálogo") ganham `:focus-visible` explicito; texto residual "checklists para acompanhar sua obra" na barra lateral do detalhe do curso trocado por "aulas curtas e passo a passo para você aprender fazendo", removendo a ultima mencao a checklist/obra como proposta de valor principal da pagina de curso (checklist continua recurso opcional, nao produto). Somente texto e CSS; nenhum dado, contrato ou comportamento alterado.
- Ajuste de linguagem em `/como-funciona` (`cloudflare/src/pages/comoFunciona.ts`): passo 3 e 4 deixam de enfatizar gestores, times e execucao de obra e passam a descrever a pratica guiada da aula (passo a passo, alertas de seguranca, checklist opcional), coerente com a home de ensino do PR #59; acompanhamento completo de obra passa a ser citado como modulo profissional futuro, nao como destaque. Somente texto e hierarquia; nenhuma funcionalidade nova criada.
- Catalogo: contrato aditivo de modulos de instrucao (`instruction_modules`) e vinculo opcional em cursos, preservando cursos existentes sem modulo.
- Auditoria de acessibilidade da home publica e do catalogo (PR #59): `.category-card` (cards de categoria em `cloudflare/src/pages/home.ts`), `.section-title a`, `#home-search` e `.filter` (chips de categoria em `cloudflare/src/pages/courses.ts`) ganham estado de `:focus-visible` explicito, alinhando-os aos seletores ja cobertos (`.card`/`.login`/`.cta` em `pages/layout.ts`). Mudanca puramente visual (CSS), nenhum dado, contrato ou comportamento alterado.
- Reorganizacao da home publica (`GET /`) como plataforma de ensino, conforme decisao de produto do responsavel: `cloudflare/src/pages/home.ts` (novo) renderiza saudacao, busca por curso/aula (filtro client-side sem endpoint novo) e seis cards de categoria coloridos com contagem real de cursos publicados, usando o `CourseRepository` ja existente (mesmo contrato de `/cursos`). Linguagem de ERP/gestao de obra ("Obra ativa", "Residencial das Flores", "Servicos mais executados", "Disponivel no canteiro") removida da home publica. `GET /cursos` ganha filtro por categoria (`?categoria=fundacoes|alvenaria|hidraulica|eletrica|acabamentos|outros`), reaproveitando o mesmo agrupamento. Nenhum endpoint novo, nenhuma migration alterada.
- Removida a demo estatica de clique `cloudflare/public/index.html` (5 telas fixas com dados ficticios de procedimento/checklist), que ficou orfa quando `/` passou a ser renderizado pelo Worker com dados reais. Conteudo preservado no historico do git.
- Corrigido o icone Unicode `⌂` do cabecalho compartilhado (`pages/layout.ts`, usado por `/`, `/cursos`, `/cursos/:slug` e `/como-funciona`) e as setas `←`/`→` do catalogo de cursos, trocados por SVG inline.

- Registro de evidencia por etapa da execucao (item pendente desde CF5-C1): cada etapa do checklist real (`cloudflare/public/dashboard.js`, view "execution") ganha um campo de arquivo (foto ou PDF, ate 10MB) e botao "Enviar evidencia", chamando `POST /api/painel/evidencias` (Codex, ja existente) com o `execution_step_id` real da etapa. Estados cobertos: nenhum arquivo, arquivo pronto para envio, enviando, enviado com sucesso, falha (com mensagem clara e possibilidade de tentar de novo), seguindo o vocabulario de `docs/PWA.md`. Validacao de tamanho no cliente antes do envio. Nenhum endpoint novo, nenhuma logica de autorizacao no frontend.
- `cloudflare/public/index.html` (demo publica estatica de clique com 5 telas, pre-existente): todos os icones que usavam simbolo Unicode (⛑ ⌂ ▤ ▦ ♙ ⌕ ◉ ♢ ◇ ▱ ⌁ ϟ ▰ ▶ ✓ ▣ ← → › ●) foram trocados por SVG inline, reaproveitando o mesmo desenho dos icones de categoria ja criado para o painel real (`dashboard.html`), para manter consistencia visual entre a demo publica e o painel autenticado. Nenhuma mudanca de texto, estrutura ou comportamento da demo.
- Sincronizado `cloudflare/public/build/` com o output atual de `npm run build` (as novas classes Tailwind da home mudaram o CSS compilado), seguindo o processo documentado em `docs/CLOUDFLARE-MIGRATION.md`. Achado durante a sincronizacao: `npm run build` gerou hashes de arquivo diferentes (`app-DoDPFI6p.css` e depois `app-CIGWeSL0.css`) em duas execucoes seguidas sem nenhuma mudanca de codigo entre elas — o build do Tailwind v4 nao e deterministico entre execucoes neste projeto. Isso nao afeta o funcionamento (o conteudo final e equivalente), mas reforca que o processo de sincronizacao precisa ser manual e feito por ultimo, apos a ultima chamada a `npm run build` do PR, nunca no meio do trabalho.
- Home do painel (`cloudflare/public/dashboard.html`/`dashboard.js`, view "overview") ganha o bloco pedido pelo mockup: saudacao, "etapa atual" com o nome real da organizacao/obra ativa, busca por servico e seis cards de categoria coloridos e clicaveis (Fundacoes, Alvenaria, Hidraulica, Eletrica, Acabamentos, Outros) com contagem real de procedimentos publicados por categoria (derivada de `GET /api/painel/procedimentos`, nao inventada). Clicar num card ou digitar na busca filtra a lista de procedimentos pela categoria/termo, com botao para limpar o filtro. Icones da home, do filtro e das telas de detalhe (antes um `&larr;` Unicode) trocados por SVG inline, conforme a regra de nao usar simbolo Unicode como icone principal.
- Novo endpoint `GET /api/painel/execucoes/{id}?organization_id=...` no Worker (`cloudflare/src/index.ts`, `cloudflare/src/data/d1OperationalRepository.ts`, `cloudflare/src/domain/operational.ts`): devolve a execucao e seus `execution_steps` (com o `id` real de cada etapa, unindo com `procedure_steps` para titulo/instrucao/materiais/seguranca), exigindo sessao real, validando organizacao e acesso a execucao (`D1MembershipRepository`/`D1OperationalAuthorization`, ja existentes), com 401/403 sem distinguir execucao inexistente de acesso negado (evita vazar existencia de ID) e `Cache-Control: no-store`. Nenhuma migration nova: reaproveita as tabelas `executions`/`execution_steps` de `0004_operational_core.sql`. 3 testes novos (sucesso com etapas ordenadas, tenant cruzado, visitante anonimo via `it.each`), suite total 56/56.
- CF7 (checklist/execucao real): com o endpoint acima, o painel troca o contorno em memoria (commit anterior) por persistencia real: apos iniciar uma execucao, busca a execucao real via `GET`, exibe o checklist com os `execution_step_id` reais, e cada "Concluir etapa"/"Pular etapa" chama `PATCH /api/painel/execucoes/{id}/etapas/{step_id}` de verdade. Uma etapa so aparece marcada na tela depois da resposta de sucesso do servidor; falha de rede mostra erro e mantem o estado anterior (nada e marcado como salvo sem confirmacao). Tela de conclusao mostra resumo real (contagem concluida/pulada) apos todas as etapas serem resolvidas; deixa explicito que a execucao continua "em andamento" no servidor, pois ainda nao existe um contrato para marca-la como concluida por inteiro (nao inventado).
- CF6-C1/CF7-C1 (parcial): painel Cloudflare (`cloudflare/public/dashboard.js`, `dashboard.html`) passa a listar procedimentos e checklists publicados por organizacao via `GET /api/painel/procedimentos` e `GET /api/painel/checklists`, agrupando procedimentos por etapa (fundacoes, alvenaria, hidraulica, eletrica, acabamentos, outros) e cobrindo os cinco estados pedidos: carregando, vazio, erro, dados reais e demonstracao (quando a sessao nao e real). Abrir um procedimento (`GET /api/painel/procedimentos/{id}`) mostra passos ordenados, materiais, aviso de seguranca e orientacao para chamar profissional, com opcao de iniciar execucao (`POST /api/painel/execucoes`) escolhendo a obra. Abrir um checklist (`GET /api/painel/checklists/{id}`) mostra os itens como referencia de qualidade (resultado esperado, erro comum). Nenhum endpoint foi inventado; todos os contratos usados ja existiam no dominio do Worker.
- (Resolvido pelo item acima) Gap de contrato identificado nesta mesma entrega de trabalho: nao existia rota `GET` para consultar uma execucao e seus `execution_steps`, entao um contorno temporario mantinha a marcacao de etapas somente na memoria do navegador. O `GET /api/painel/execucoes/{id}` foi implementado e o contorno foi substituido por persistencia real via `PATCH` no mesmo pacote de trabalho.
- `docs/CLOUDFLARE-MIGRATION.md` ganha a secao "Regras de frontend rapido e simples de manter", cobrindo orcamento de payload, proibicao de framework de UI no Worker, tratamento obrigatorio dos estados carregando/sucesso/erro em chamadas privadas e o processo manual (ate hoje nao documentado) de sincronizar `cloudflare/public/build/` com o output de `npm run build`.
- CF6-C2 (Spec 2): formulario de suporte do painel (`cloudflare/public/dashboard.js`) passa a diferenciar erro de validacao, erro de acesso a organizacao, indisponibilidade do servico e falha generica de rede ao consumir `POST /api/painel/suporte/chamados`, mostrando mensagem em portugues especifica para cada codigo de erro ja retornado pelo contrato existente (`support_ticket_invalid`, `organization_access_denied`, `operational_data_unavailable`, `authentication_required`), alem de validar campos obrigatorios no cliente antes do envio. Nenhum endpoint, tabela ou binding novo foi criado.
- CF6-C1/C2: painel Cloudflare passa a navegar entre secoes e consumir organizacoes, obras e chamados pelas APIs privadas do Worker. Dados operacionais so aparecem com sessao D1 real; o preview de demonstracao fica identificado e nao guarda chamados ou descricoes em armazenamento local.
- Fechamento CF1-CF5: API privada do Worker para organizacoes ativas, obras, chamados e evidencias. As rotas exigem sessao D1, membership ativa quando ha tenant e `Cache-Control: no-store`; upload detecta JPEG, PNG, WebP ou PDF pelo conteudo, calcula SHA-256 e compensa o objeto R2 se a persistencia D1 falhar.
- CI passa a validar typecheck e build do Worker Cloudflare quando a fundacao TypeScript estiver presente, sem interromper a transicao gradual do runtime Laravel.
- CF3-C1/C2: tela de login em `cloudflare/src/pages/login.ts` reescrita para consumir o login/logout real (`loginWithD1`/`logoutFromD1`) quando `AUTH_DB` existe, preservando o fallback de demonstração; mensagens de erro genéricas e acessíveis (`role="alert"`, `aria-describedby`), foco automático no campo de e-mail e link informativo para o catálogo público em vez de um formulário de cadastro inexistente (não há endpoint de criação de conta ainda — sinalizado como pendência). Cobertura automatizada: 27 testes no Worker, incluindo login com senha correta/incorreta, sessão válida/expirada em `/painel` e revogação de sessão em `/sair`.
- CF4-D1: migration D1 incremental do nucleo operacional (obras, procedimentos, etapas, checklists e execucoes) e contratos de dominio tenant-scoped.
- CF4-D2: autorizacao de recursos operacionais por membership ativa e `organization_id`, com testes de isolamento entre tenants.
- CF5-D1: contrato de evidencias privadas com metadata D1, validacao de MIME/tamanho/checksum, chave R2 por tenant e autorizacao de download.
- CF5-D2: migration e contrato de chamados de suporte com contexto de sessao sanitizado e consulta restrita ao proprio solicitante.
- CF3-D2: repositório de memberships ativas com autorização server-side por usuário e organização, sem confiar em IDs ou controles do frontend.
- CF3-D1: repositório D1 de usuários e fluxo de login/logout real condicionado ao binding `AUTH_DB`; o preview sem binding continua usando o demo.
- CF3-D1: hash de senha versionado com PBKDF2-SHA256 e comparacao em tempo constante; senhas curtas ou formatos invalidos sao rejeitados sem revelar detalhes ao cliente.
- Suite automatizada (`npm run worker:test`, Vitest) para o Worker Cloudflare: cobre todas as rotas publicas (`/`, `/como-funciona`, `/cursos`, `/cursos/:slug` valido e inexistente, `/health`), os headers de seguranca minimos e o comportamento sanitizado quando o `D1CourseRepository` falha (500 amigavel, sem stack trace, rotas independentes continuam funcionando). Substitui a validacao manual via `wrangler dev`/curl usada ate aqui.
- Sprint CF-2 (cards CF2-C1/CF2-C3): confirmada a integracao do catalogo publico com o `D1CourseRepository` do Codex (PR #35) — o contrato `Course`/`CourseRepository` ja existente nao precisou de nenhuma alteracao; `cloudflare/src/index.ts` seleciona `D1CourseRepository` quando o binding `COURSES_DB` existe e mantem `MockCourseRepository` como conteudo editorial de demonstracao quando o binding nao esta configurado (preview local).
- CF3-D1: `D1SessionStore` gera tokens aleatorios, persiste somente hash SHA-256, valida expiracao/revogacao e atualiza `last_seen_at` sem expor o token ao banco.
- Fundacao CF3-D1: migration incremental para sessoes autenticadas com token hash, expiracao, revogacao e binding `AUTH_DB` reservado para o fluxo de autenticacao real.
- Sprint CF-2 (card CF2-D2): seed editorial D1 idempotente com dez cursos, módulos e aulas iniciais, sem apagar ou sobrescrever registros existentes.
- Sprint CF-2 (card CF2-D1): repositorio `D1CourseRepository` para listar e consultar cursos publicados via binding D1, com parametros vinculados, ordenacao editorial e fallback de preview sem binding.
- Sprint CF-2 (card CF2-C2): pagina de erro sanitizada no Worker Cloudflare para quando o repositorio de cursos (mock hoje, D1 depois) falhar em `/cursos` ou `/cursos/:slug`; nenhuma mensagem interna ou stack trace e exposta ao visitante, e as rotas independentes (`/`, `/como-funciona`, `/health`) continuam funcionando normalmente.
- Novo `docs/CLOUDFLARE-SPRINTS.md` com o cronograma de sprints da migracao Cloudflare (CF-1 a CF-8), dividindo cards entre Claude Code (camada visual/PWA/rotas publicas) e Codex (D1, dominio, autenticacao, seguranca), e reforcando que merge em `main` e exclusivo do Codex com autorizacao explicita do responsavel pelo projeto.
- Sprint 5 (S5-07): pagina publica "Como funciona" no Worker Cloudflare, com passos do produto e chamada para catalogo e login, sem exigir cadastro.
- Fundacao TypeScript do Worker Cloudflare (`cloudflare/src`) substituindo o script JS avulso: roteamento tipado, headers de seguranca e sessao de demonstracao reorganizados em modulos.
- Rota publica `GET /health` no Worker, retornando status JSON para monitoramento, sem depender do Laravel.
- Catalogo e detalhe de curso (`/cursos`, `/cursos/:slug`) passam a ser renderizados a partir de um repositorio tipado (`CourseRepository`) com dados mockados, preparado para ser substituido por um repositorio D1 sem mudar as rotas; curso inexistente retorna 404 real.
- Dependencias de desenvolvimento `wrangler`, `typescript` e `@cloudflare/workers-types` adicionadas para typecheck e build local do Worker (nenhuma dependencia de runtime/producao foi adicionada).
- Regra de entrega em lotes de cinco sprints, com checkpoint manual obrigatorio e autorizacao do responsavel antes do lote seguinte.
- Regra operacional de integracao: merge em main somente com pedido explicito do responsavel e leitura obrigatoria do diario compartilhado entre tarefas.
- Decisao arquitetural: migracao gradual do runtime Laravel para Cloudflare Workers + TypeScript + D1, documentada em docs/CLOUDFLARE-MIGRATION.md.
- Seeder de demonstração idempotente e compatível com deploys sem dependências de desenvolvimento, incluindo Laravel Cloud.

### Removed

- Tentativa local de fluxo de suporte por paginas (`cloudflare/src/auth/currentUser.ts`, `cloudflare/src/pages/support.ts`, `cloudflare/src/pages/support.test.ts`): duplicava a leitura de sessao e gravava chamados via `AUTH_DB` em vez do contrato ja publicado (`OPERATIONS_DB`, `POST /api/painel/suporte/chamados`, consumido pelo `dashboard.js`). Conteudo original preservado no historico do commit local `eecc1d5` para auditoria.
- Paginas estaticas avulsas `cloudflare/public/courses.html` e `cloudflare/public/course-detail.html`, substituidas pela renderizacao tipada a partir do `CourseRepository`.
- Script `cloudflare/preview-worker.js`, substituido pela fundacao TypeScript em `cloudflare/src`.
- Sprint 2: fluxo de status de procedimentos com publicacao autorizada, requisito de etapas e auditoria.
- Sprint 3: reabertura controlada de execucoes concluidas por gestor da organizacao.
- Sprint 4: dashboard passa a calcular obras, procedimentos e execucoes a partir do tenant ativo.
- Sprint 5: cadastro cria usuario, organizacao e Owner; painel permanece protegido por login.
- Gestao inicial de membros por organizacao, com alteracao de papel/status, auditoria e protecao do ultimo Owner ativo.
- Central inicial de chamados com contexto sanitizado para diagnostico de manutencao.
- Inventario inicial de codigo e regra de contagem/validacao antes de PR.
- Fluxo documentado de cherry-pick controlado para hotfixes sem bypass de PR ou CI.
- Checkpoint formal definido para pausar apos a Sprint 5 e validar produto com testes automatizados e manuais.
- Backlog operacional com sprints, cards, testes e criterios de aceite para o MVP e fases posteriores.
- Decisao de produto: IA fica fora do MVP e sera adicionada somente como modulo posterior e opcional.
- Preview Cloudflare passa a distinguir catálogo, detalhe de curso válido e curso inexistente.
- Catalogo publico funcional com 10 cursos, modulos e aulas cobrindo planejamento, estrutura, instalacoes, acabamentos, seguranca e gestao.
- Paginas publicas de cursos com acesso gratuito ou avulso, duracao, nivel, modulos e aulas.
- Seed idempotente do catalogo editorial para desenvolvimento e demonstracao.
- Fundacao multi-tenant com organizacoes identificadas por ULID e memberships por usuario.
- RBAC por organizacao com os papeis owner, admin, engineer, supervisor, worker e student.
- Area inicial de seguranca da plataforma protegida por permissao exclusiva de Super Admin.
- Preview PWA responsivo com login de demonstracao e painel administrativo navegavel.
- Deploy automatico de `develop` para Cloudflare Workers via GitHub Actions.
- Catalogo planejado de cursos gratuitos, premium e vendidos separadamente.
- Diretrizes para planos e precos configuraveis pelo painel administrativo.
- Arquitetura proposta para estudos preliminares assistidos por IA com provedor substituivel.
- Protocolo de colaboracao para Codex, Claude Code, Cursor e outros agentes.
- Backend inicial de obras, procedimentos, etapas, checklists e execucoes com historico por versao.

### Security

- Acesso a tenants exige membership ativa; Super Admin nao recebe acesso implicito aos dados das organizacoes.
- Autorizacao de seguranca da plataforma e aplicada no servidor por Gate e coberta por testes negativos.
- Cache da PWA limitado ao shell publico e assets versionados.
- Credenciais de deploy e demonstracao armazenadas somente em secret managers.
- Execucao de procedimento protegida por membership ativa, transacao de inicializacao e validacao de etapas.
- Evidencias privadas por etapa, com validacao de upload, checksum SHA-256 e registro de observacao.
- Download autenticado de evidencias com bloqueio de acesso entre organizacoes.

## [0.1.0] - 2026-09-19

### Added

- Fundacao Laravel, autenticacao, PWA, auditoria e eventos de seguranca locais.
- Estrategia de branches `main`, `develop` e `hotfix` com CI e pull requests.
- Documentacao inicial de arquitetura, seguranca, banco, UX, MGL e observabilidade.

[Unreleased]: https://github.com/henriquesouza1832001-eng/ObraPro/compare/main...develop
[0.1.0]: https://github.com/henriquesouza1832001-eng/ObraPro/releases/tag/v0.1.0
