# Auditoria e direção de redesign do frontend ObraPro

Data: 2026-09-21 (Brasília)

Auditoria somente leitura. Este documento não autoriza implementação, sincronização ou handoff ao Claude. Nenhum endpoint, migration, slug ou regra comercial foi criado ou alterado.

## Validação

- `npm run worker:typecheck`: aprovado.
- `npm run worker:test`: 70/70 aprovados no início da auditoria.
- `npm run worker:build`: dry-run aprovado.
- `git diff --check`: aprovado.
- `npm audit --audit-level=high`: 0 vulnerabilidades.
- PHP/Composer: indisponíveis no PATH.
- Alterações locais pré-existentes preservadas: `cloudflare/src/index.ts` modificado e `cloudflare/src/data/courseQuizRepository.ts` não rastreado.

## Achados prioritários

### F1 — progresso não consumido na home (alta)

`cloudflare/src/pages/home.ts` não chama `GET /api/cursos/progresso?limit=6`. Não existe “Continue de onde parou” nem estados loading/vazio/erro/sucesso.

Correção: uma chamada somente para sessão autenticada; ocultar para visitante, 401 ou lista vazia. A matrícula deve continuar sendo autorizada no backend.

### F2 — chamados não listados (alta)

O backend oferece `GET /api/painel/suporte/chamados`, mas `dashboard.html`/`dashboard.js` implementam principalmente abertura de chamado.

Correção: consumir o contrato existente com loading, vazio, erro e sucesso; escapar texto; não exibir `userId` ou contexto técnico.

### F3 — dados fictícios no HTML inicial (alta)

`cloudflare/public/dashboard.html` contém “Residencial das Flores”, “Belo Horizonte, MG”, “3 obras ativas”, “Edifício Horizonte”, “Vila Nova” e percentuais 68%, 42% e 19%. O JavaScript substitui parte do conteúdo depois, mas ele pode aparecer antes da hidratação ou em falha.

Correção: markup neutro/skeleton, nunca números ilustrativos como dados da conta.

### F4 — encoding quebrado (alta)

Há ocorrências de `Ã`, `Â` e `ï¿½` em `home.ts`, `courses.ts`, `lesson.ts`, `layout.ts`, `mockCourseRepository.ts`, `dashboard.html`, `dashboard.js` e `0011_seed_isc_training_drafts.sql`.

A migration histórica não deve ser editada diretamente. Corrigir fontes atuais e dados por migration editorial posterior, após revisão.

### F5 — metadados de aula sem escape (alta)

`cloudflare/src/pages/lesson.ts` interpola título de curso, módulo e aula diretamente em HTML. O conteúdo API usa `textContent`, mas os metadados server-rendered precisam de `escapeHtml`.

### F6 — rodapé legal ausente (média)

`publicPage` não renderiza rodapé comum. Faltam destinos reais para privacidade, termos, política de conteúdo, segurança, suporte, contato e certificado. Não adicionar links quebrados.

## Mapa de telas e contratos

| Tela | Estado atual | Contrato | Prioridade |
|---|---|---|---|
| `/` | catálogo e busca local; sem continuidade | progresso agregado | Alta |
| `/cursos` | busca, filtros e mostrar mais | catálogo publicado | Média |
| `/cursos/{slug}` | currículo, acesso, matrícula gratuita e progresso | acesso/matrícula/progresso | Alta |
| `/cursos/{slug}/aulas/{id}` | shell público; conteúdo via API | conteúdo publicado/matrícula | Alta |
| `/entrar`/`/sair` | login real/demo e revogação | sessão | Alta |
| `/painel` | operações e evidências | organizações/obras/procedimentos | Alta |
| suporte | cria, mas não lista | GET/POST chamados | Alta |
| `/admin` | catálogo, conteúdo e auditoria | super admin | Alta |
| service worker | assets/shell públicos | sem API privada | Alta |
| certificados/quiz | não devem ser simulados | PR/Spec futuro | Bloqueado |

## Segurança frontend

Mitigações presentes: `escapeHtml` em várias listas, `textContent` em conteúdo e dashboard, `encodeURIComponent` em IDs/slugs e service worker limitado a assets públicos.

Pendências: escapar metadados em `lesson.ts`; não confiar em permissões do navegador; não guardar premium em storage/cache público; corrigir CSRF no backend antes de mutações via cookie; não expor CPF, tokens, respostas corretas, QR falso ou download simulado.

## Cursos e editorial

A migration ISC contém 45 cursos importados com títulos longos, códigos dominantes, encoding quebrado e descrições genéricas. Muitos usam `beginner`/`free`, enquanto a direção comercial prevê assinatura premium; isso requer revisão de acesso, não ajuste visual. Módulos e aulas repetem estrutura provisória e precisam de conteúdo publicado antes de promessas comerciais.

Sugestões editoriais, sem alterar slug:

| Atual | Recomendado | Motivo |
|---|---|---|
| Planejamento da obra do zero | Planejamento de obra: orçamento, etapas e materiais | resultado concreto |
| Fundações: o começo certo | Fundações residenciais: preparação, escavação e concretagem | escopo claro |
| Estrutura de concreto sem mistério | Estrutura de concreto: formas, armaduras, concretagem e cura | precisão |
| Alvenaria na prática | Alvenaria de vedação: alinhamento, nível e amarração | tipo de alvenaria |
| Telhado e cobertura | Coberturas residenciais: materiais, montagem e segurança | contexto e segurança |
| Instalações hidráulicas | Instalações hidráulicas residenciais: água, esgoto e testes | melhora a busca |
| Instalações elétricas residenciais | Instalações elétricas residenciais: circuitos, quadro e testes | promessa explícita |
| Revestimentos, pisos e pintura | Separar por tema quando houver conteúdo real | evita escopo amplo |
| Esquadrias e impermeabilização | Separar quando houver conteúdo real | riscos diferentes |
| Segurança e qualidade no canteiro | Segurança e controle de qualidade no canteiro | mais objetivo |

Cada revisão deve registrar nome, subtítulo, descrição, público, nível, categoria, duração real, aulas, materiais, alertas, acesso, slug e necessidade de redirecionamento. Não alterar migration histórica nem slug sem mapa de compatibilidade.

## Direção visual

Usar escola prática/caderno de obra: papel/marfim, navy, laranja de ação, linhas técnicas, marcadores de etapa e progresso verificável. Reduzir cards equivalentes e ornamento. Evitar SaaS genérico, gradientes, blobs, avaliações falsas, dashboards fictícios e promessa de certificado sem contrato.

## Home, catálogo e aula

- Hero deve explicar o que é, para quem serve e o primeiro passo.
- Buscar apenas o que o backend realmente indexa; não prometer busca de aulas sem contrato.
- Separar gratuito e premium claramente.
- Recomendações, trilhas, conquistas e destaque somente com dados reais.
- Página de curso pode mostrar currículo público, mas não conteúdo liberado.
- CTA deve diferenciar visitante, gratuito não matriculado, matriculado e premium sem acesso.
- Aula deve mostrar objetivo, duração, conteúdo, materiais, ferramentas, passos, alertas e próxima aula somente conforme contrato.
- Certificado futuro deve aparecer apenas como estado bloqueado/explicativo; nunca nota, QR, botão de download ou emissão fictícia.

## Painel, suporte e estados

O painel deve iniciar com skeleton/estado neutro e tratar: carregando, sem organização, carregado, erro, sessão expirada, troca de organização, sem obras, sem procedimentos/checklists, suporte sem chamados, upload pendente/enviando/sucesso/erro.

## Acessibilidade, mobile e PWA

Há labels, `aria-live`, alguns alerts e foco visível. Ainda é necessário testar headings, landmarks, foco após troca de view, contraste, teclado, zoom 200%, 320/375/768px, alvos de toque e não dependência de cor.

O service worker não intercepta APIs privadas, o que é adequado. Validar limpeza no logout/troca de usuário, atualização segura, offline sem dados obsoletos e mensagens de reconexão.

## Fases

1. Remover dados fictícios, corrigir encoding, escapar aula e alinhar progresso/suporte.
2. Revisar os 45 cursos ISC e criar mapa de nomes/slugs.
3. Redesenhar home, catálogo, curso e aula com hierarquia consistente.
4. Finalizar painel, suporte e estados de evidência.
5. Aguardar contratos de quiz, certificado, downloads, gamificação, cupons e indicação.

## Handoff reservado — não enviar sem ordem

Quando autorizado, Claude deverá preservar `claude/cloudflare-ui` e PR #82, aguardar PR #83, consumir apenas os GET existentes, esconder progresso para visitante/401/lista vazia, manter estados completos, remover dados fictícios, corrigir encoding sem reescrever migrations, escapar API, manter slugs, não criar endpoint/migration/preço/certificado/quiz/QR/download simulado e executar typecheck, testes, build, `git diff --check` e `node --check cloudflare/public/dashboard.js`.

Este handoff está apenas documentado. Nenhuma mensagem foi enviada ao Claude.

## Estado apos a implementacao

As correcoes desta rodada foram aplicadas no workspace Codex: a home so injeta a consulta de progresso quando a sessao foi confirmada, o rodape publico foi adicionado com links existentes e a primeira dobra deixou de usar gradiente. A listagem de chamados, os estados do painel, o escaping e a area de certificados ja estavam presentes nas alteracoes anteriores preservadas. Privacidade, termos, politica de conteudo, seguranca e contato continuam pendentes de rotas/documentos reais; nenhum link quebrado foi criado.
