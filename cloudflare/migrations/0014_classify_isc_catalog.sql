PRAGMA foreign_keys = ON;

-- A migration 0011 preserva o prefixo "isc-isc-" nos IDs importados.
-- Corrige somente a classificacao editorial dos registros ja publicados.
UPDATE courses
SET category = CASE
        WHEN id LIKE 'isc-isc-01-%' OR id LIKE 'isc-isc-02-%' THEN 'Planejamento'
        WHEN id LIKE 'isc-isc-03-%' THEN 'Fundacoes'
        WHEN id LIKE 'isc-isc-04-%' THEN 'Estrutura'
        WHEN id LIKE 'isc-isc-05-%' THEN 'Vedacoes'
        WHEN id LIKE 'isc-isc-06-%' THEN 'Esquadrias'
        WHEN id LIKE 'isc-isc-07-%' THEN 'Pintura'
        WHEN id LIKE 'isc-isc-08-%' THEN 'Instalacoes'
        WHEN id LIKE 'isc-isc-09-%' OR id LIKE 'isc-isc-10-%' THEN 'Infraestrutura'
        WHEN id LIKE 'isc-isc-11-%' THEN 'Pavimentacao'
        WHEN id LIKE 'isc-isc-12-%' THEN 'Comissionamento'
        WHEN id = 'isc-mod-01' THEN 'Alvenaria'
        ELSE category
    END,
    updated_at = '2026-09-20T00:00:00Z'
WHERE id LIKE 'isc-%';
