
# Migration Verification Checklist

## Pre-Migration
- [ ] Backup current database
- [ ] Verify migration files syntax
- [ ] Check TypeScript compilation

## Migration Execution
- [ ] Run migration 1: 20250129104300_add_objekt_extended_fields_enums.sql
- [ ] Run migration 2: 20250129104301_add_objekt_extended_fields_columns.sql 
- [ ] Run migration 3: 20250129104302_add_objekt_extended_fields_indexes.sql

## Post-Migration Verification
- [ ] Check objekt table has all new columns
- [ ] Verify ENUM types are created
- [ ] Verify indexes are created
- [ ] Test basic CRUD operations
- [ ] Verify TypeScript types work
- [ ] Test form submission with new fields

## Schema Verification Queries
```sql
-- Check new columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'objekt' 
ORDER BY ordinal_position;

-- Check ENUM types
SELECT typname FROM pg_type WHERE typtype = 'e' AND typname LIKE '%_typ';

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'objekt';
```
