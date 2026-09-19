# Fluxo Git e Pull Requests

## Branches permanentes

- `main`: producao e referencia estavel. So recebe codigo validado por CI e revisado em pull request vindo de `develop` ou `hotfix`.
- `develop`: integracao e testes de todo desenvolvimento corrente. Branches temporarias de trabalho abrem pull request para `develop`.
- `hotfix`: espelho da `main` reservado para correcoes urgentes. Deve ser sincronizada imediatamente sempre que `main` mudar.

Commits diretos nas tres branches permanentes sao proibidos. Toda alteracao passa por pull request, revisao e checks obrigatorios.

## Multiplos agentes

Codex, Claude Code, Cursor e agentes humanos seguem o mesmo fluxo. Cada agente trabalha em branch propria e consulta `docs/AI-COLLABORATION.md`. Antes de iniciar trabalho paralelo, dividir o escopo por modulo ou arquivos para evitar edicao concorrente de migrations, rotas, lockfiles e templates centrais.

Todo PR atualiza `CHANGELOG.md` quando houver mudanca observavel, de seguranca, arquitetura, dados ou operacao. O autor descreve testes, riscos, rollback e dependencias de outras branches. Arquivos especificos de ferramenta nao podem alterar as regras de branch.

## Desenvolvimento normal

1. Atualizar `develop` a partir do remoto.
2. Criar uma branch curta: `feature/<nome>`, `fix/<nome>`, `chore/<nome>`, `docs/<nome>`, `refactor/<nome>` ou `test/<nome>`.
3. Abrir PR para `develop` e aguardar CI/revisao.
4. Quando o conjunto estiver aprovado para producao, abrir PR de `develop` para `main`.
5. Depois do merge em `main`, sincronizar `hotfix` com `main` e levar `main` de volta para `develop` se necessario.

## Correcao urgente

1. Confirmar que `hotfix` aponta para o mesmo commit de `main`.
2. Criar `hotfix/<descricao>` a partir de `hotfix`.
3. Implementar apenas a correcao urgente e abrir PR para `hotfix`.
4. Apos CI e revisao, abrir PR de `hotfix` para `main`.
5. Depois do merge, sincronizar `hotfix` com `main` e abrir PR de `main` para `develop` para evitar regressao futura.

## Cherry-pick controlado

`cherry-pick` e permitido para transportar uma correcao pequena e ja validada entre linhas de desenvolvimento. Ele nao substitui PR, CI, revisao ou auditoria.

### Hotfix a partir de `main`

```powershell
git fetch origin
git switch hotfix
git pull --ff-only origin hotfix
git switch -c hotfix/<descricao-curta>
git cherry-pick <commit-testado>
php artisan test --compact
vendor/bin/pint --dirty --format agent
git diff --check
git push -u origin hotfix/<descricao-curta>
gh pr create --base hotfix --head hotfix/<descricao-curta>
```

O commit escolhido deve ser pequeno, ter origem identificavel e nao depender de migrations, secrets ou arquivos que nao estejam presentes em `main`. Se houver conflito, parar, revisar manualmente e repetir os testes; nunca resolver conflito apagando mudancas desconhecidas.

### Sincronizacao depois do hotfix

Depois da aprovacao e merge do PR para `hotfix`, abrir PR de `hotfix` para `main`. Em seguida, abrir PR de `main` para `develop`. Atualizar `hotfix` a partir de `main` somente por fast-forward quando possivel.

### Comandos que continuam proibidos

- push direto em `main`, `develop` ou `hotfix`;
- force push ou reset destrutivo em branch compartilhada;
- cherry-pick de commit sem testes ou com segredo;
- merge local que contorne os checks obrigatorios;
- usar hotfix para incluir funcionalidade nova.

## Protecoes exigidas no GitHub

Configurar rulesets para `main`, `develop` e `hotfix` com:

- pull request obrigatorio;
- pelo menos uma aprovacao;
- conversas resolvidas;
- checks `policy` e `quality` obrigatorios;
- branch atualizada antes do merge;
- impedir force push e exclusao;
- impedir bypass, inclusive por administradores, salvo conta de emergencia auditada;
- preferir squash merge nas branches temporarias.

`main` aceita apenas PRs de `develop` ou `hotfix`. `hotfix` aceita apenas branches `hotfix/*`. PRs para `develop` aceitam branches temporarias e sincronizacao de `main`.
