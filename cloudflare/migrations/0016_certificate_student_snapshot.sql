PRAGMA foreign_keys = ON;

ALTER TABLE certificates ADD COLUMN student_name_snapshot TEXT;

UPDATE certificates
SET student_name_snapshot = (
    SELECT name FROM users WHERE users.id = certificates.user_id
)
WHERE student_name_snapshot IS NULL;
