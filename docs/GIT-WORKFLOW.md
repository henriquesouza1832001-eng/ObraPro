# Fluxo Git e Pull Requests

## Branches permanentes

- `main`: producao e referencia estavel. So recebe codigo validado por CI e revisado em pull request vindo de `develop` ou `hotfix`.
- `develop`: integracao e testes de todo desenvolvimento corrente. Branches temporarias de trabalho abrem pull request para `develop`.
- `hotfix`: espelho da `main` reservado para correcoes urgentes. Deve ser sincronizada imediatamente sempre que `main` mudar.

Commits diretos nas tres branches permanentes sao proibidos. Toda alteracao passa por pull request, revisao e checks obrigatorios.

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
