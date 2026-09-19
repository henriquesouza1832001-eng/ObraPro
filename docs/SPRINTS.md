# Sprints e Cards do ObraPro

Este documento transforma o roadmap em trabalho executavel. Cada card deve ser entregue em branch curta, com teste proporcional, documentacao atualizada e Pull Request para `develop`.

## Regras de pronto

- Nenhum card e aceito sem criterio de aceite demonstravel.
- Mudanca de backend inclui teste PHPUnit, Pint e migration incremental quando houver dado novo.
- Mudanca de frontend inclui teste de rota/interacao aplicavel, build e verificacao responsiva.
- Conteudo tecnico publicado precisa de autor, versao, status e aprovacao competente.
- Uploads sao privados por padrao, com validacao de MIME, tamanho, checksum e autorizacao por tenant.
- Toda acao de tenant consulta membership ativa; Super Admin nao ganha acesso implicito aos dados de clientes.
- Nenhum card usa `migrate:fresh`, `db:wipe`, `schema:drop`, `TRUNCATE` ou exclusao de banco.
- IA, MGL real e pagamento real nao entram como dependencia de cards do MVP.

## Sprint 0 - Fundacao e contrato do produto

**Objetivo:** manter o projeto compreensivel, testavel e colaborativo.

- S0-01: regras de agentes, branches, PRs e changelog.
- S0-02: autenticacao, sessoes, PWA shell e health check.
- S0-03: auditoria, security events, correlation ID e headers.
- S0-04: CI com testes, Pint, verificacoes de seguranca e preview.

**Testes:** suite base, acesso anonimo, headers, health check e fluxo de CI.

**Aceite:** um agente novo consegue ler a documentacao, rodar testes, entender os limites e publicar uma branch sem acessar secrets.

## Sprint 1 - Organizacoes e acesso

**Objetivo:** garantir que cada usuario veja somente o que sua organizacao permite.

- S1-01: memberships, estados e papeis.
- S1-02: Policies para organizacao, obra, conteudo e cursos.
- S1-03: Super Admin separado da operacao dos tenants.
- S1-04: telas de pessoas, convite, suspensao e troca de papel.
- S1-05: auditoria de alteracoes administrativas.
- S1-06: convite seguro por e-mail, token de uso unico, expiracao e aceite.
- S1-07: central de chamados de manutencao com rota, correlation ID e contexto sanitizado da sessao.

**Testes:** anonimo, membership convidada/suspensa, papel insuficiente, tenant cruzado e Super Admin sem bypass.

**Aceite:** um usuario ativo acessa sua organizacao; um usuario de outra organizacao recebe negacao segura; seguranca da plataforma aparece somente para Super Admin.

O convite nao deve criar senha previsivel nem armazenar token em texto aberto.

## Sprint 2 - Catalogo de procedimentos

**Objetivo:** transformar conhecimento tecnico aprovado em passo a passo simples.

- S2-01: obras, procedimentos, versoes e etapas.
- S2-02: materiais, aviso de seguranca e quando chamar profissional.
- S2-03: checklists com ordem, erro comum e resultado esperado.
- S2-04: rascunho, revisao, aprovacao e publicacao.
- S2-05: leitura mobile com progresso e uma acao principal.

**Testes:** versionamento, procedure nao aprovada, ordenacao, tenant e leitura sem dados incompletos.

**Aceite:** uma pessoa consegue abrir uma atividade, entender materiais e passos, identificar alertas e iniciar a execucao sem instrucoes escondidas.

## Sprint 3 - Execucao no canteiro

**Objetivo:** registrar o que foi feito, por quem e em qual etapa.

- S3-01: iniciar execucao com copia imutavel das etapas.
- S3-02: marcar etapa, desfazer marcacao e registrar observacao.
- S3-03: evidencias privadas por etapa, download autorizado e checksum.
- S3-04: conclusao, reabertura controlada e historico.
- S3-05: nao conformidade basica com severidade, responsavel e prazo.
- S3-06: tela responsiva de execucao para celular.

**Testes:** transacao de inicio, conclusao incompleta, tenant cruzado, upload invalido, download privado, reabertura e concorrencia basica.

**Aceite:** no celular, o usuario inicia um procedimento, conclui cada passo, tira/anexa evidencia, recebe confirmacao e consegue retomar sem perder o trabalho.

## Sprint 4 - Painel administrativo operacional

**Objetivo:** permitir que gestores acompanhem a obra sem operar tabelas confusas.

- S4-01: dashboard de obras, progresso e ultimas evidencias.
- S4-02: filtros por obra, etapa, status e periodo.
- S4-03: gestao de procedimentos e publicacao com resumo antes de confirmar.
- S4-04: relatorio de checklists, evidencias pendentes e nao conformidades.
- S4-05: configuracoes de organizacao e equipe.
- S4-06: fila de chamados, triagem, status, prioridade e resposta para o solicitante.

**Testes:** autorizacao por papel, filtros, ausencia de vazamento de tenant, estados vazios, erro de rede e performance das consultas.

**Aceite:** gestor encontra em poucos passos o que esta atrasado, o que foi concluido e quais evidencias precisam de revisao.

## Sprint 5 - Landing page, cursos e progresso

**Objetivo:** tornar o produto compreensivel para quem chega por Instagram e criar valor comercial antes do pagamento.

- S5-01: landing page com proposta, conteudo gratuito e CTA claro.
- S5-02: catalogo por etapa da casa.
- S5-03: detalhe do curso com modulos, aulas, nivel, duracao e acesso.
- S5-04: progresso, retomada e conclusao verificavel.
- S5-05: painel editorial para cursos, modulos e aulas.
- S5-06: planos, beneficios e precos configuraveis, sem hardcode no frontend.
- S5-07: landing page "Como funciona" acessivel por link de Instagram.
- S5-08: cadastro/login como porta de entrada do painel; visitante ve apenas conteudo publico.
- S5-09: tela inicial do painel seguindo o mockup, com progresso, categorias e atalhos reais.

**Testes:** rotas publicas, slug inexistente, acesso gratuito, curso premium bloqueado, progresso e permissao editorial.

**Aceite:** visitante entende o produto sem cadastro, acessa conteudo gratuito e sabe exatamente o que recebe antes de considerar uma compra.

O painel nunca pode aparecer para visitante anonimo; cadastro e login devem retornar erros claros e manter o fluxo acessivel.

## Sprint 6 - Pagamentos e acesso comercial

**Objetivo:** vender acesso com rastreabilidade e sem confiar apenas no retorno do navegador.

- S6-01: pedido, item, preco congelado e estado de pagamento.
- S6-02: PIX por adaptador de provedor, sem segredos no banco.
- S6-03: webhook autenticado, idempotente e auditado.
- S6-04: concessao historica de acesso apos confirmacao.
- S6-05: expiracao, cancelamento, reembolso e suporte manual auditado.

**Testes:** assinatura do webhook, replay, duplicidade, valor divergente, pagamento pendente, confirmado e falho.

**Aceite:** nenhum curso e liberado por mera resposta do browser; cada acesso comercial possui pedido, valor, evento e historico verificavel.

## Sprint 7 - Offline e PWA de campo

**Objetivo:** preservar o fluxo essencial em rede ruim.

- S7-01: cache do shell e conteudo aprovado.
- S7-02: fila local de checklist e evidencias.
- S7-03: sincronizacao idempotente e conflitos visiveis.
- S7-04: atualizacao, logout e limpeza de dados locais.
- S7-05: instalacao e teste em Android, iPhone e desktop.

**Testes:** offline/online, repeticao de envio, conflito, logout, atualizacao de service worker e armazenamento local.

**Aceite:** o usuario consegue consultar o procedimento e registrar o essencial sem rede, sabendo o que esta salvo localmente e o que ainda aguarda sincronizacao.

## Sprint 8 - Operacao, privacidade e observabilidade

**Objetivo:** preparar uma primeira versao comercial operavel.

- S8-01: backup, restore testado e retencao.
- S8-02: rate limit, logs sanitizados e alertas.
- S8-03: exportacao e exclusao conforme politica de dados.
- S8-04: revisao de seguranca, dependencias e threat model.
- S8-05: runtime Laravel, banco, storage, dominio e rollback no Cloudflare.
- S8-06: MGL somente como painel de observabilidade e seguranca, atras de adaptador opcional.

**Testes:** restore, autorizacao, sanitizacao, limites, deploy, rollback e indisponibilidade do MGL.

**Aceite:** a plataforma funciona normalmente sem MGL, nao expõe secrets e possui procedimento documentado para recuperar o servico.

## Sprint 9 - Estudo preliminar assistido por IA (posterior)

**Objetivo:** adicionar um copiloto opcional sem transformar sugestao em projeto tecnico.

- S9-01: questionario versionado e consentimento.
- S9-02: contrato de provedor substituivel e quota.
- S9-03: resposta estruturada com hipoteses, alertas e revisao humana.
- S9-04: motor deterministico de consistencia.
- S9-05: exportacao identificada como estudo preliminar.

**Testes:** schema invalido, timeout, custo, prompt injection, dados sensiveis, ausencia de provedor e revisao humana.

**Aceite:** o ObraPro continua utilizavel com IA desligada; nenhuma saida afirma ser projeto estrutural, eletrico, hidraulico ou legal.

## Ordem de execucao recomendada

1. Finalizar S3 e S4 para tornar o painel operacional.
2. Completar S5 para transformar o catalogo em produto publico vendavel.
3. Implementar S6 somente depois que direitos de acesso estiverem cobertos por testes.
4. Fazer S7 e S8 antes de convidar usuarios reais para o canteiro.
5. Avaliar S9 apenas com dados de uso e custos reais das sprints anteriores.

## Regra de evolucao

Toda melhoria descoberta durante testes ou uso real vira card em uma sprint futura, com origem, impacto, prioridade, teste e criterio de aceite. Correcoes urgentes podem entrar em `hotfix` somente quando reproduziveis, cobertas por teste e sincronizadas com `main`.
