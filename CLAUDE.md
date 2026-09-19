# Claude Code no ObraPro

Leia e cumpra `AGENTS.md` antes de qualquer analise ou alteracao. Depois leia `README.md`, `docs/AI-COLLABORATION.md` e os documentos relacionados ao escopo.

Este arquivo nao define convencoes paralelas. Em caso de divergencia, `AGENTS.md` e o codigo aprovado em `develop` sao as fontes de verdade. Trabalhe em branch curta, preserve mudancas de outros agentes, atualize `CHANGELOG.md`, execute as validacoes relevantes e entregue por pull request.

## Contrato operacional obrigatorio

- Nunca executar `migrate:fresh`, `db:wipe`, `schema:drop`, `DROP DATABASE`, `TRUNCATE` ou apagar banco/seed de desenvolvimento sem autorizacao explicita do usuario para o alvo exato.
- Em desenvolvimento, preferir migrations incrementais, seeds idempotentes e testes isolados com `RefreshDatabase`. Nunca usar dados reais, credenciais reais ou fixtures com PII.
- Antes de qualquer escrita, ler `AGENTS.md`, este arquivo, `README.md`, `docs/AI-COLLABORATION.md` e os documentos afetados. Depois conferir o codigo existente e suas rotas/testes.
- Nao inventar APIs, regras comerciais, conteudo tecnico ou componentes que contrariem o mockup e os documentos. Quando algo ainda for ficticio, identificar como demonstracao ou conteudo editorial inicial.
- O mockup e a referencia visual inicial: manter linguagem simples, progresso visivel, uma acao principal por tela, responsividade, acessibilidade e fluxos compreensiveis para iniciantes e profissionais.
- Catalogo, planos, precos, permissao e conteudo devem ser modelados para administracao futura; nao fixar regras comerciais irreversiveis em JavaScript ou texto de interface.
- Toda alteracao relevante exige testes proporcionais, formatacao, build quando afetar frontend, atualizacao do `CHANGELOG.md` e dos documentos realmente afetados.
- Toda entrega deve acontecer em branch curta por pull request para `develop`; nunca fazer push direto em `main`, `develop` ou `hotfix`.
- `cherry-pick` e permitido somente para transportar correcao pequena, testada e auditavel para uma branch `hotfix/*`; ainda exige PR, CI e sincronizacao posterior com `main` e `develop`.
