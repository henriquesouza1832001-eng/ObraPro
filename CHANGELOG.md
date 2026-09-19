# Changelog

Todas as mudancas relevantes do ObraPro sao registradas aqui. O formato segue Keep a Changelog e o projeto usa versionamento semantico quando houver releases publicas.

## [Unreleased]

### Added

- Fundacao multi-tenant com organizacoes identificadas por ULID e memberships por usuario.
- RBAC por organizacao com os papeis owner, admin, engineer, supervisor, worker e student.
- Area inicial de seguranca da plataforma protegida por permissao exclusiva de Super Admin.
- Preview PWA responsivo com login de demonstracao e painel administrativo navegavel.
- Deploy automatico de `develop` para Cloudflare Workers via GitHub Actions.
- Catalogo planejado de cursos gratuitos, premium e vendidos separadamente.
- Diretrizes para planos e precos configuraveis pelo painel administrativo.
- Arquitetura proposta para estudos preliminares assistidos por IA com provedor substituivel.
- Protocolo de colaboracao para Codex, Claude Code, Cursor e outros agentes.

### Security

- Acesso a tenants exige membership ativa; Super Admin nao recebe acesso implicito aos dados das organizacoes.
- Autorizacao de seguranca da plataforma e aplicada no servidor por Gate e coberta por testes negativos.
- Cache da PWA limitado ao shell publico e assets versionados.
- Credenciais de deploy e demonstracao armazenadas somente em secret managers.

## [0.1.0] - 2026-09-19

### Added

- Fundacao Laravel, autenticacao, PWA, auditoria e eventos de seguranca locais.
- Estrategia de branches `main`, `develop` e `hotfix` com CI e pull requests.
- Documentacao inicial de arquitetura, seguranca, banco, UX, MGL e observabilidade.

[Unreleased]: https://github.com/henriquesouza1832001-eng/ObraPro/compare/main...develop
[0.1.0]: https://github.com/henriquesouza1832001-eng/ObraPro/releases/tag/v0.1.0
