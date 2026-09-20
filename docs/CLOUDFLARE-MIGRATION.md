# Migracao para Cloudflare

## Decisao

O runtime alvo do ObraPro sera um Cloudflare Worker em TypeScript, com D1 como banco relacional. O PWA e a API poderao ser publicados pelo mesmo Worker. Laravel permanece como referencia funcional durante a migracao e nao recebera novos modulos sem decisao registrada.

## Componentes

- Worker: HTTP, autenticacao, autorizacao, modulos de dominio e entrega do PWA.
- D1: entidades relacionais, tenant scope, cursos, obras, procedimentos, execucoes e auditoria.
- R2: evidencias e midia privada; D1 guarda somente metadados e chaves.
- KV: somente sessoes, cache curto e rate limit quando o card justificar.
- Queues: tarefas assincronas, notificacoes e entrega MGL futura.
- MGL: destino opcional de observabilidade e seguranca; nunca e dependencia do request.

## Regras de implementacao

1. O dominio nao importa APIs Cloudflare.
2. Handlers nao executam SQL diretamente; use repositorios.
3. Bindings sao a fonte de conexao. Nunca guardar host, usuario, senha ou token em codigo.
4. develop e production usam bindings e recursos separados.
5. Cada rota tem teste de sucesso, autenticacao, autorizacao e falha esperada.
6. Cada migration D1 e incremental, versionada e idempotente quando aplicavel.
7. Nunca executar wrangler d1 delete, DROP, TRUNCATE, reset ou recriacao total em recurso compartilhado.
8. Seeds nao usam PII real e podem ser executados mais de uma vez.
9. O frontend nao acessa D1, R2 ou KV diretamente.
10. Nenhum agente inventa endpoint, tabela, preco, papel ou regra comercial.

### Validacao automatica

O workflow de CI continua executando a qualidade do Laravel e, quando a fundacao
do Worker estiver presente na branch, executa tambem `worker:typecheck` e
`worker:build`. Essa condicao permite integrar a migracao por fatias sem exigir
que branches antigas carreguem o runtime TypeScript antes da hora.

## Estrutura esperada

    src/
      domain/
      application/
      infrastructure/
        d1/
        r2/
        kv/
        queues/
      http/
      worker.ts
    migrations/
    tests/
    wrangler.toml

## Trabalho paralelo

Codex conduz contratos, schema D1, autenticacao, autorizacao, testes e revisao de seguranca. Claude Code implementa os handlers e telas nos cards atribuidos. Outro agente trabalha somente nos arquivos declarados no card. Dois agentes nao editam simultaneamente o mesmo schema, binding, lockfile ou modulo.

Todo PR informa objetivo, arquivos, contratos, migrations, bindings, testes, riscos, rollback e proximo card. Antes de escrever, o agente le AGENTS.md, CLAUDE.md, README.md, este documento e os documentos do modulo.

## Ordem da migracao

1. Worker minimo, health check, bindings e CI.
2. D1 schema base, seeds editoriais e catalogo publico.
3. Autenticacao, sessoes, organizations e memberships.
4. Cursos, obras, procedimentos, checklists e execucoes.
5. Evidencias privadas em R2 e chamados de suporte.
6. Painel administrativo, auditoria e security events.
7. PWA/offline, pagamentos e integracoes externas.
8. MGL e IA somente como modulos posteriores e opcionais.

## Nao fazer

- Nao transformar D1 em banco acessado por senha.
- Nao criar ponte improvisada Worker -> Laravel para esconder modulo incompleto.
- Nao migrar pagamentos, IA ou MGL antes dos testes do nucleo.
- Nao apagar dados para corrigir migration.
- Nao declarar paridade sem testes automatizados e smoke tests publicados.

## Regras de frontend rapido e simples de manter

Estas regras se aplicam a tudo que o Worker renderiza ou serve (`cloudflare/src/pages`, `cloudflare/public`) e existem para manter o painel e o site publico leves e faceis de continuar sem retrabalho.

1. Nenhum framework de UI no Worker. As paginas continuam HTML gerado por template strings TypeScript (`pages/*.ts`), sem React, Vue ou hidratacao. Scripts de cliente (como `dashboard.js`) sao JavaScript vanilla, um arquivo por tela, carregado somente onde a tela precisa dele.
2. Toda tela nova reaproveita `pages/layout.ts` (`publicPage`) em vez de recriar o HTML de base, cabecalho ou navegacao.
3. Orcamento de payload: acompanhar o "Total Upload" impresso por `npm run worker:build`. Um aumento sensivel de tamanho no PR exige justificativa (nova tela, nova imagem) e nao pode vir de dependencia ou biblioteca desnecessaria.
4. Nenhuma chamada de rede bloqueia a renderizacao inicial de uma pagina. HTML/CSS de uma rota sai completo na primeira resposta; dados privados (organizacoes, obras, chamados, evidencias) carregam depois, por `fetch` assincrono, como o `dashboard.js` ja faz.
5. Toda chamada a uma API privada passa por um helper unico (`requestJson` em `dashboard.js`) e trata os tres estados possiveis — carregando, sucesso, erro — antes do PR ser aberto. Nenhuma tela fica muda quando uma chamada falha.
6. Mensagens de erro no cliente usam os codigos que o contrato do Worker ja retorna (ver `supportErrorMessages` em `dashboard.js` como exemplo); nunca inventar um codigo de erro que o backend nao envia.
7. `cloudflare/public/build/` (assets Vite usados pelas paginas estaticas do preview) e uma copia manual do output de `npm run build`, sem sincronizacao automatica. Sempre que `resources/css/app.css` ou `resources/js/app.js` mudar de um jeito que afete `index.html`/`dashboard.html`, rodar `npm run build`, copiar os arquivos novos para `cloudflare/public/build/` e atualizar os nomes de arquivo com hash referenciados no HTML no mesmo PR. Nunca deixar o HTML apontar para um hash que nao existe mais em `cloudflare/public/build/`.
8. Nenhuma dependencia nova no Worker ou no build do preview sem justificar no PR (regra ja existente do projeto); no frontend isso tambem e uma regra de performance, ja que cada dependencia nova pode aumentar o tempo de build e o tamanho do payload.
9. Toda rota nova do Worker ganha teste automatizado (Vitest) no mesmo PR antes de ser considerada pronta; isso e o que permite refatorar HTML/CSS depois sem medo de quebrar uma rota silenciosamente.
10. Codigo morto (arquivo criado e nunca importado) e removido assim que identificado, no mesmo PR da alteracao que o tornou obsoleto sempre que o arquivo pertencer ao agente que esta editando; quando pertence a outro agente, fica registrado no diario para revisao dele em vez de ser apagado sem combinar.

## Criterio de pronto da migracao

A fatia so pode substituir a equivalente do Laravel quando possuir contrato documentado, migration aplicada em develop, testes de rota e autorizacao, logs sanitizados, rollback descrito e validacao manual do fluxo principal.
