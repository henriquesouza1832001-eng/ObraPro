PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO courses
    (id, slug, title, description, category, level, access_type, price_cents, duration_minutes, is_published, is_featured, created_at, updated_at)
VALUES
    ('course-planejamento', 'planejamento-da-obra', 'Planejamento da obra do zero', 'Planeje orcamento, etapas, materiais e decisoes antes de comecar.', 'Planejamento', 'beginner', 'free', NULL, 54, 1, 1, '2026-09-19T00:00:00Z', '2026-09-19T00:00:00Z'),
    ('course-fundacoes', 'fundacoes-seguras', 'Fundacoes: o comeco certo', 'Entenda sondagem, locacao, escavacao e cuidados antes da concretagem.', 'Fundacoes', 'beginner', 'premium', 2990, 54, 1, 1, '2026-09-19T00:00:00Z', '2026-09-19T00:00:00Z'),
    ('course-estrutura', 'estrutura-de-concreto', 'Estrutura de concreto sem misterio', 'Aprenda a acompanhar formas, armacao, concretagem e cura.', 'Estrutura', 'intermediate', 'premium', 4990, 54, 1, 1, '2026-09-19T00:00:00Z', '2026-09-19T00:00:00Z'),
    ('course-alvenaria', 'alvenaria-na-pratica', 'Alvenaria na pratica', 'Levante paredes alinhadas, niveladas e bem amarradas.', 'Alvenaria', 'beginner', 'premium', 2990, 54, 1, 1, '2026-09-19T00:00:00Z', '2026-09-19T00:00:00Z'),
    ('course-telhado', 'telhado-e-cobertura', 'Telhado e cobertura', 'Escolha materiais e acompanhe a montagem com seguranca.', 'Cobertura', 'intermediate', 'premium', 2990, 54, 1, 0, '2026-09-19T00:00:00Z', '2026-09-19T00:00:00Z'),
    ('course-hidraulica', 'instalacoes-hidraulicas', 'Instalacoes hidraulicas', 'Organize agua, esgoto, testes e pontos da obra.', 'Hidraulica', 'intermediate', 'premium', 3990, 54, 1, 0, '2026-09-19T00:00:00Z', '2026-09-19T00:00:00Z'),
    ('course-eletrica', 'instalacoes-eletricas', 'Instalacoes eletricas residenciais', 'Conheca circuitos, quadro, conduites e testes.', 'Eletrica', 'intermediate', 'premium', 3990, 54, 1, 0, '2026-09-19T00:00:00Z', '2026-09-19T00:00:00Z'),
    ('course-acabamentos', 'revestimentos-e-pisos', 'Revestimentos, pisos e pintura', 'Prepare superficies e acompanhe acabamentos.', 'Acabamentos', 'beginner', 'premium', 2990, 54, 1, 0, '2026-09-19T00:00:00Z', '2026-09-19T00:00:00Z'),
    ('course-protecao', 'portas-janelas-e-impermeabilizacao', 'Esquadrias e impermeabilizacao', 'Evite infiltracoes em portas, janelas e areas molhadas.', 'Protecao', 'intermediate', 'premium', 2990, 54, 1, 0, '2026-09-19T00:00:00Z', '2026-09-19T00:00:00Z'),
    ('course-seguranca', 'seguranca-e-qualidade-no-canteiro', 'Seguranca e qualidade no canteiro', 'Crie rotinas simples de EPI, conferencia e evidencias.', 'Gestao', 'beginner', 'free', NULL, 54, 1, 0, '2026-09-19T00:00:00Z', '2026-09-19T00:00:00Z');

INSERT OR IGNORE INTO course_modules
    (id, course_id, position, title, description, created_at, updated_at)
SELECT c.id || '-m' || m.position, c.id, m.position, m.title, m.description,
    '2026-09-19T00:00:00Z', '2026-09-19T00:00:00Z'
FROM courses AS c
CROSS JOIN (VALUES
    (1, 'Entenda antes de executar', 'Conheca os cuidados e materiais da etapa.'),
    (2, 'Faca por etapas', 'Acompanhe a execucao em uma sequencia simples.'),
    (3, 'Confira e registre', 'Valide o resultado e registre evidencias.')
) AS m(position, title, description)
WHERE c.id LIKE 'course-%';

INSERT OR IGNORE INTO lessons
    (id, course_module_id, position, title, summary, duration_minutes, is_free, created_at, updated_at)
SELECT cm.id || '-l' || l.position, cm.id, l.position, l.title, l.summary,
    l.duration_minutes, CASE WHEN l.position = 1 THEN 1 ELSE 0 END,
    '2026-09-19T00:00:00Z', '2026-09-19T00:00:00Z'
FROM course_modules AS cm
CROSS JOIN (VALUES
    (1, 'O que voce precisa saber', 'Contexto, riscos e preparacao.', 6),
    (2, 'Passo a passo da execucao', 'Orientacoes praticas para acompanhar a etapa.', 8),
    (3, 'Checklist de conferencia', 'Pontos de verificacao antes de seguir.', 10)
) AS l(position, title, summary, duration_minutes)
WHERE cm.course_id LIKE 'course-%';
