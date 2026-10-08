ALTER TABLE uploads ADD COLUMN content bytea;
INSERT INTO schema_migrations(version) VALUES (2);
