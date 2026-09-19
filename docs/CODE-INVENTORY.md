# Inventario de Codigo

Contagem feita em 19/09/2026 no checkout de `develop`, excluindo `vendor`, `node_modules`, caches e artefatos gerados.

## Linhas por extensao

- PHP: 9.400 linhas, incluindo backend Laravel, migrations, factories, seeders e testes.
- JavaScript: 263 linhas.
- HTML: 178 linhas.
- CSS: 90 linhas.
- Total funcional contado: **9.931 linhas**.

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

## Contagem antes de PR

Toda PR deve informar o escopo alterado, testes executados e, quando houver mudanca estrutural, o impacto em migrations, storage, autorizacao e observabilidade. A contagem nao substitui revisao de codigo.
