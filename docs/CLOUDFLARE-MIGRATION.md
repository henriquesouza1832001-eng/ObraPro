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

## Criterio de pronto da migracao

A fatia so pode substituir a equivalente do Laravel quando possuir contrato documentado, migration aplicada em develop, testes de rota e autorizacao, logs sanitizados, rollback descrito e validacao manual do fluxo principal.
