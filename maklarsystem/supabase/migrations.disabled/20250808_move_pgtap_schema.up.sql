BEGIN;
CREATE SCHEMA IF NOT EXISTS test;
-- Move pgTAP out of public schema to satisfy security advisor
ALTER EXTENSION IF EXISTS pgtap SET SCHEMA test;
COMMIT;


