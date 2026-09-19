# Banco de Dados

## Estrategia

SQLite atende desenvolvimento local; producao deve usar PostgreSQL ou MySQL. Consultas, migrations e testes nao podem depender de comportamento exclusivo do SQLite.

ULIDs sao preferidos para entidades expostas em URLs, integracoes ou criadas offline, pois reduzem enumeracao trivial e permitem geracao distribuida. Isso nao e controle de autorizacao. Tabelas puramente internas podem usar IDs incrementais quando houver vantagem clara.

## Modelo conceitual

- `organizations`: tenant identificado por ULID, slug unico e estado ativo.
- `users`: identidade global minima.
- `organization_memberships`: associacao unica entre usuario e organizacao, com papel e estado.
- `works`, `teams`: estrutura operacional da organizacao. Obras sao tenant-scoped e acessiveis apenas por memberships ativas.
- `procedures`, `procedure_steps`, `procedure_media`: conteudo versionado e aprovado.
- `checklists`, `checklist_items`: verificacoes reutilizaveis.
- `executions`, `execution_steps`: aplicacao transacional de uma versao do procedimento; as etapas sao copiadas no inicio para preservar o historico mesmo quando o catalogo evoluir.
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

Uma membership possui estado `invited`, `active` ou `suspended` e papel `owner`, `admin`, `engineer`, `supervisor`, `worker` ou `student`. Somente memberships ativas concedem acesso. `users.is_super_admin` representa privilegio global da plataforma e nao cria membership nem acesso implicito a dados de clientes.

Procedimentos publicados sao versionados e imutaveis; nova edicao cria versao. Execucoes referenciam a versao usada. Evidencias guardam storage key, owner, tipo, MIME verificado, tamanho, checksum, status e visibilidade, nunca o binario.

Valores monetarios usam inteiros na menor unidade da moeda e codigo ISO de moeda. Regras de acesso sao historicas: alterar um plano nao remove silenciosamente direitos ja adquiridos. Saidas de IA preservam versao do schema, modelo e estado de revisao sem armazenar prompts livres desnecessarios.

O catalogo inicial usa `courses.access_type` (`free` ou `premium`) e `price_cents`, sem cobrança embutida na apresentação pública. Módulos e aulas têm posição única dentro do pai, e o seeder editorial usa `updateOrCreate` por slug/posição para ser repetível sem apagar dados.

## Repositorio D1 do catalogo

O `D1CourseRepository` consulta somente cursos publicados, usa parametros vinculados
para o slug e calcula a quantidade de modulos por agregacao. O Worker usa esse
repositorio apenas quando o binding `COURSES_DB` existe; sem binding, o mock editorial
continua disponivel para preview. Nenhuma credencial ou endpoint de banco fica no
repositorio.

A migration `0002_seed_editorial_catalog.sql` fornece o catalogo inicial de dez
cursos, tres modulos e tres aulas por modulo. Os IDs sao determinísticos e os
inserts usam `INSERT OR IGNORE`; executar novamente nao apaga nem sobrescreve
alteracoes editoriais existentes.

## Migrations

### D1 em migracao

O schema inicial do Worker fica em cloudflare/migrations/0001_identity_and_catalog.sql. Ele cobre identidade, organizacoes, memberships e catalogo. A migration usa SQLite portavel, constraints explicitas e IF NOT EXISTS para permitir execucao repetivel em ambiente local. A aplicacao real em D1 deve ser feita por Wrangler no ambiente correto, nunca por reset.

Nao modificar migration compartilhada ja executada. Usar novas migrations, constraints portaveis e rollback avaliado. Mudancas destrutivas exigem plano de migracao, backup e verificacao. Seeds de desenvolvimento nao incluem PII real.

Evidencias sao vinculadas a uma etapa de execucao, armazenadas por chave privada e registram nome original, MIME validado, tamanho e checksum SHA-256. O binario nao fica em URL publica.
