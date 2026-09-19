# Colaboracao entre IAs

## Fonte de verdade

Todos os agentes, independentemente da ferramenta, devem ler nesta ordem:

1. `AGENTS.md` para regras obrigatorias.
2. `README.md` para estado atual e comandos.
3. `docs/PRODUCT.md` e `docs/ROADMAP.md` para escopo.
4. `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, `docs/SECURITY.md`, `docs/PWA.md` e `docs/UX.md` conforme a area alterada.
5. `CHANGELOG.md` para mudancas ainda nao publicadas.

Arquivos especificos de ferramenta, como `CLAUDE.md` e `.cursor/rules/obrapro.mdc`, apenas apontam para essas fontes. Eles nao podem criar regras concorrentes.

## Arquitetura alvo Cloudflare

O runtime alvo esta migrando para Cloudflare Workers + TypeScript + D1. O Laravel existente e referencia funcional durante a transicao. As regras completas estao em docs/CLOUDFLARE-MIGRATION.md e devem ser lidas antes de editar o Worker.

- Codex conduz contratos, schema D1, autenticacao, autorizacao, testes e revisao de seguranca.
- Claude Code implementa handlers e telas somente nos cards atribuidos.
- Outro agente trabalha somente nos arquivos declarados no card.
- Dois agentes nao editam simultaneamente schema, binding, lockfile ou modulo.
- D1 e acessado por binding; nunca guardar host, usuario, senha ou token no repositorio.
- Nenhum agente inventa endpoint, tabela, preco, papel ou regra comercial.
- Nunca apagar banco, migration, bucket, binding ou dado para fazer teste passar.

## Trabalho paralelo

O diario local compartilhado fica em C:\projetos\Obra Pro\AI-COLLABORATION-LOG.md. Antes de iniciar qualquer tarefa, cada agente deve reler o diario. Depois de qualquer commit, merge, bloqueio ou atualizacao relevante do outro agente, deve reler o diario antes de continuar.

- Um agente por branch curta e por objetivo coerente.
- Antes de editar, registrar no PR o escopo, arquivos provaveis e dependencias de outras branches.
- Evitar dois agentes editando simultaneamente migrations, rotas centrais, lockfiles ou o mesmo template.
- Nao desfazer mudancas desconhecidas. Rebase ou merge deve preservar o trabalho aprovado de outras branches.
- Integracoes entre branches acontecem por PR para `develop`; nenhum agente faz push direto nas branches permanentes.
- Mudancas de banco usam novas migrations. Nunca reescrever migration compartilhada.
- Secrets, dados pessoais e credenciais nunca entram em prompts, commits, fixtures ou logs.
- Merge em develop ocorre somente por PR com checks aprovados.
- Merge em main exige pedido explicito do responsavel pelo projeto nesta conversa.
- Nenhum agente deve fazer merge em main por iniciativa propria.
- Hotfix em main tambem exige pedido explicito, PR, checks verdes e sincronizacao posterior com develop.

## Contrato de entrega

Cada PR deve conter codigo e documentacao suficientes para outro agente continuar sem contexto privado. Atualize somente os documentos afetados:

| Mudanca | Documentacao minima |
|---|---|
| Comportamento visivel ou modulo | `CHANGELOG.md`, `README.md` quando altera uso, e documento do modulo |
| Arquitetura ou dependencia | `CHANGELOG.md`, `docs/ARCHITECTURE.md` e ADR quando a decisao for duradoura |
| Banco de dados | `CHANGELOG.md` e `docs/DATABASE.md` |
| Autenticacao, autorizacao ou dados | `CHANGELOG.md`, `docs/SECURITY.md` e `docs/THREAT-MODEL.md` |
| PWA ou offline | `CHANGELOG.md` e `docs/PWA.md` |
| Deploy ou operacao | `CHANGELOG.md`, `README.md` e documento operacional aplicavel |

Nao atualize documentos sem relacao com a mudanca apenas para gerar atividade. O PR deve listar testes executados, riscos, rollback e pendencias reais.

## Uso de IA no produto

O ObraPro integra provedores por contrato interno. Prompts e respostas sao tratados como dados nao confiaveis. A IA pode produzir estudo preliminar, resumo e sugestao, mas nao substitui responsavel tecnico nem emite projeto executivo. Toda saida estrutural deve ter schema validado, limites de custo, timeout, auditoria sanitizada e revisao humana.
