# ObraPro

Plataforma web/PWA para aprender, planejar e acompanhar obras: complexo por dentro, simples por fora.

O ObraPro combina orientacoes passo a passo, cursos gratuitos e premium, gestao de obras e estudos preliminares assistidos por IA. O produto atende desde pessoas sem experiencia tecnica ate profissionais da construcao, sem substituir responsavel tecnico ou projeto legal.

## Estado atual

- Mockup web responsivo e instalavel como PWA.
- Login de demonstracao e painel com obras, procedimentos, checklists e nao conformidades.
- Fundacao de organizacoes, memberships e papeis por tenant, com seguranca global isolada para Super Admin.
- Deploy de `develop` para Cloudflare Workers automatizado pelo GitHub Actions.
- MGL permanece opcional e reservado a observabilidade e seguranca.
- Cursos, planos configuraveis e gerador assistido estao nas proximas entregas.

Preview: `https://obrapro-preview.henriquesouza.workers.dev`.

## Comece por aqui

Leia [AGENTS.md](AGENTS.md) antes de contribuir. Agentes de IA tambem devem seguir [docs/AI-COLLABORATION.md](docs/AI-COLLABORATION.md). A arquitetura e um monolito modular Laravel; auditoria, eventos de seguranca e observabilidade sao responsabilidades separadas.

Documentos principais:

- [Produto](docs/PRODUCT.md)
- [Roadmap](docs/ROADMAP.md)
- [Arquitetura](docs/ARCHITECTURE.md)
- [Banco de dados](docs/DATABASE.md)
- [Seguranca](docs/SECURITY.md)
- [PWA e offline](docs/PWA.md)
- [UX e acessibilidade](docs/UX.md)
- [Fluxo Git](docs/GIT-WORKFLOW.md)
- [Changelog](CHANGELOG.md)

## Desenvolvimento local

Requisitos: PHP 8.3+, Composer 2 e Node.js 20+.

```powershell
Copy-Item .env.example .env
php artisan key:generate
New-Item database/database.sqlite -ItemType File -Force
php artisan migrate
npm install
npm run build
php artisan serve
```

Abra `http://127.0.0.1:8000`. O preview Cloudflare e gerado a partir de `cloudflare/public` e nao substitui o runtime Laravel de producao.

Neste workspace, ferramentas portateis verificadas ficam em `.tools/` e nao sao versionadas. Use `./.tools/php/php.exe artisan test` para executar a suite sem alterar o sistema.

## Qualidade

```powershell
php artisan test
php vendor/bin/pint --test
composer audit
npm audit
```

Nunca use credenciais reais no ambiente local e nunca conecte ao MGL real sem contrato e autorizacao explicitos.
