PRAGMA foreign_keys = ON;

-- Publica os treinamentos ISC importados em 0011 sem apagar nem reescrever dados.
-- O conteudo continua identificado como material de estudo e deve passar por revisao
-- tecnica antes de ser tratado como instrucao executiva.
UPDATE instruction_modules
SET title = CASE id
        WHEN 'module-20' THEN 'Modulo 20 - Fundamentos e planejamento'
        WHEN 'module-30' THEN 'Modulo 30 - Execucao dos servicos'
        WHEN 'module-40' THEN 'Modulo 40 - Instalacoes e acabamentos'
        WHEN 'module-50' THEN 'Modulo 50 - Controle e entrega'
        ELSE title
    END,
    description = CASE id
        WHEN 'module-20' THEN 'Base para compreender o servico, o projeto, o terreno e os cuidados iniciais.'
        WHEN 'module-30' THEN 'Sequencias de execucao para acompanhar cada servico com clareza.'
        WHEN 'module-40' THEN 'Instalacoes, vedacoes e acabamentos organizados por etapa.'
        WHEN 'module-50' THEN 'Conferencia, testes, registro e entrega do servico concluido.'
        ELSE description
    END,
    is_published = 1,
    updated_at = '2026-09-20T00:00:00Z'
WHERE id IN ('module-20', 'module-30', 'module-40', 'module-50');

UPDATE courses
SET category = CASE
        WHEN id LIKE 'isc-01-%' OR id LIKE 'isc-02-%' THEN 'Planejamento'
        WHEN id LIKE 'isc-03-%' THEN 'Fundacoes'
        WHEN id LIKE 'isc-04-%' THEN 'Estrutura'
        WHEN id LIKE 'isc-05-%' THEN 'Vedacoes'
        WHEN id LIKE 'isc-06-%' THEN 'Esquadrias'
        WHEN id LIKE 'isc-07-%' THEN 'Pintura'
        WHEN id LIKE 'isc-08-%' THEN 'Instalacoes'
        WHEN id LIKE 'isc-09-%' OR id LIKE 'isc-10-%' THEN 'Infraestrutura'
        WHEN id LIKE 'isc-11-%' THEN 'Pavimentacao'
        WHEN id LIKE 'isc-12-%' THEN 'Comissionamento'
        WHEN id = 'isc-mod-01' THEN 'Alvenaria'
        ELSE category
    END,
    description = 'Guia de estudo baseado no documento ISC Direcional, com preparo, execucao e verificacao da etapa.',
    is_published = 1,
    is_featured = 0,
    updated_at = '2026-09-20T00:00:00Z'
WHERE id LIKE 'isc-%';

UPDATE course_modules
SET title = 'Guia de estudo',
    description = 'Organize o aprendizado em objetivo, preparo, execucao e conferencia.',
    updated_at = '2026-09-20T00:00:00Z'
WHERE course_id LIKE 'isc-%';

UPDATE lessons
SET title = CASE position
        WHEN 1 THEN 'Entenda o servico'
        WHEN 2 THEN 'Prepare materiais e seguranca'
        WHEN 3 THEN 'Siga a sequencia de execucao'
        WHEN 4 THEN 'Confira o resultado'
        ELSE title
    END,
    summary = CASE position
        WHEN 1 THEN 'Objetivo, escopo e pre-requisitos do servico.'
        WHEN 2 THEN 'Materiais, ferramentas, equipe e cuidados de seguranca.'
        WHEN 3 THEN 'Ordem de trabalho e pontos de controle da execucao.'
        WHEN 4 THEN 'Conferencia final, registros e momento de pedir apoio tecnico.'
        ELSE summary
    END,
    updated_at = '2026-09-20T00:00:00Z'
WHERE course_module_id IN (SELECT id FROM course_modules WHERE course_id LIKE 'isc-%');
