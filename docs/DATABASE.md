# Banco de Dados

## Estrategia

SQLite atende desenvolvimento local; producao deve usar PostgreSQL ou MySQL. Consultas, migrations e testes nao podem depender de comportamento exclusivo do SQLite.

ULIDs sao preferidos para entidades expostas em URLs, integracoes ou criadas offline, pois reduzem enumeracao trivial e permitem geracao distribuida. Isso nao e controle de autorizacao. Tabelas puramente internas podem usar IDs incrementais quando houver vantagem clara.

## Modelo conceitual

- `organizations`: tenant e configuracoes basicas.
- `users`: identidade global minima.
- `organization_users`: associacao, status e papel por organizacao.
- `works`, `teams`: estrutura operacional da organizacao.
- `procedures`, `procedure_steps`, `procedure_media`: conteudo versionado e aprovado.
- `checklists`, `checklist_items`: verificacoes reutilizaveis.
- `executions`, `execution_steps`: aplicacao de uma versao do procedimento.
- `evidence`: metadados de arquivos privados.
- `training`, `training_progress`: conteudo e progresso.
- `courses`, `course_modules`, `lessons`: catalogo educacional modular e ordenado.
- `course_offers`, `plans`, `plan_entitlements`: precos e regras configuraveis de acesso.
- `enrollments`, `lesson_progress`: acesso adquirido e progresso do aluno.
- `preliminary_designs`, `design_requirements`, `design_versions`: solicitacao, requisitos e resultados versionados.
- `ai_generations`: metadados sanitizados de provedor, modelo, uso, estado e custo; nunca API keys.
- `audit_events`: trilha de negocio/administracao.
- `security_events`: eventos de seguranca sanitizados.
- `security_event_deliveries`: estado de entrega para provedores externos.

## Invariantes

Entidades tenant-owned carregam `organization_id`, foreign key e indice. Unicidade deve incluir tenant quando o valor for local a organizacao. Consultas recebem contexto de tenant confiavel. Exclusao de usuario nao apaga automaticamente auditoria exigida; pseudonimizacao e retencao serao definidas juridicamente.

Procedimentos publicados sao versionados e imutaveis; nova edicao cria versao. Execucoes referenciam a versao usada. Evidencias guardam storage key, owner, tipo, MIME verificado, tamanho, checksum, status e visibilidade, nunca o binario.

Valores monetarios usam inteiros na menor unidade da moeda e codigo ISO de moeda. Regras de acesso sao historicas: alterar um plano nao remove silenciosamente direitos ja adquiridos. Saidas de IA preservam versao do schema, modelo e estado de revisao sem armazenar prompts livres desnecessarios.

## Migrations

Nao modificar migration compartilhada ja executada. Usar novas migrations, constraints portaveis e rollback avaliado. Mudancas destrutivas exigem plano de migracao, backup e verificacao. Seeds de desenvolvimento nao incluem PII real.
