PRAGMA foreign_keys = ON;

-- A migration historica foi importada com caracteres de substituicao (U+FFFD)
-- em titulos e descricoes. Corrige somente o texto exibido; slugs, precos e
-- regras de acesso permanecem inalterados.
UPDATE courses
SET title = REPLACE(REPLACE(title, char(65533), ''), char(19), ' - '),
    description = REPLACE(REPLACE(description, char(65533), ''), char(19), ' - ')
WHERE instr(title, char(65533)) > 0
   OR instr(title, char(19)) > 0
   OR instr(description, char(65533)) > 0
   OR instr(description, char(19)) > 0;

UPDATE course_modules
SET title = REPLACE(REPLACE(title, char(65533), ''), char(19), ' - '),
    description = REPLACE(REPLACE(description, char(65533), ''), char(19), ' - ')
WHERE instr(title, char(65533)) > 0
   OR instr(title, char(19)) > 0
   OR instr(description, char(65533)) > 0
   OR instr(description, char(19)) > 0;

UPDATE lessons
SET title = REPLACE(REPLACE(title, char(65533), ''), char(19), ' - '),
    summary = REPLACE(REPLACE(summary, char(65533), ''), char(19), ' - ')
WHERE instr(title, char(65533)) > 0
   OR instr(title, char(19)) > 0
   OR instr(summary, char(65533)) > 0
   OR instr(summary, char(19)) > 0;
