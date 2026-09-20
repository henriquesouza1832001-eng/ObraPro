# Inventario de Codigo

Contagem feita em 19/09/2026 no checkout de `develop`, excluindo `vendor`, `node_modules`, caches e artefatos gerados.

## Linhas por extensao

- PHP: 4.589 linhas, incluindo backend Laravel, migrations, factories, seeders e testes.
- TypeScript: 2.066 linhas, incluindo Worker, contratos, repositorios, rotas e testes Vitest.
- SQL: 284 linhas, nas migrations D1 incrementais `0001` a `0006`.
- JavaScript: 151 linhas.
- HTML: 161 linhas.
- CSS: 34 linhas.
- Total funcional contado: **7.285 linhas** em 171 arquivos.

Esta contagem e indicativa: linhas incluem espacos e comentarios e nao significam quantidade de regras de negocio. O backend futuro ja previsto em migrations, modelos, factories, testes e documentacao so deve ser considerado entregue quando possuir fluxo, autorizacao e teste de aceite.

## Capacidades de backend existentes

- autenticacao e sessoes;
- tenants, memberships, papeis e Super Admin;
- obras, procedimentos, etapas e checklists;
- execucoes com copia historica das etapas;
- evidencias privadas com checksum e download autorizado;
- catalogo editorial de cursos;
- auditoria, eventos de seguranca, correlation ID e health check;
- abertura inicial de chamados de manutencao com contexto sanitizado.
- Worker Cloudflare com catalogo publico, login D1, sessao persistente, APIs privadas tenant-aware, upload/download R2 privado e testes de isolamento.

## Contagem antes de PR

Toda PR deve informar o escopo alterado, testes executados e, quando houver mudanca estrutural, o impacto em migrations, storage, autorizacao e observabilidade. A contagem nao substitui revisao de codigo.

O dashboard publicado em `cloudflare/public/dashboard.html` ainda e um mockup com dados fixos. Ele deve consumir as APIs do Worker antes de ser apresentado como painel operacional real.
