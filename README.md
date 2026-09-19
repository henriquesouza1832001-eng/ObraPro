# ObraPro

Plataforma web/PWA para procedimentos e execucao de obras: complexo por dentro, simples por fora.

Leia [AGENTS.md](AGENTS.md) antes de contribuir. A arquitetura e um monolito modular Laravel; auditoria, eventos de seguranca e observabilidade sao responsabilidades separadas. MGL e uma integracao opcional e assincrona.

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

Neste workspace, ferramentas portateis verificadas ficam em `.tools/` e nao sao versionadas. Use `./.tools/php/php.exe artisan test` para executar a suite sem alterar o sistema.

## Qualidade

```powershell
php artisan test
php vendor/bin/pint --test
composer audit
npm audit
```

Nunca use credenciais reais no ambiente local e nunca conecte ao MGL real sem contrato e autorizacao explicitos.
