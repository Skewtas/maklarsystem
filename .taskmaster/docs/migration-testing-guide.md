# Migration Testing Guide

## Pre-requisites
- Supabase CLI installed (v1.130+)
- Access to Supabase project dashboard
- Database connection credentials

## Testing Steps

### 1. Create a Test Migration File

First, copy the consolidated migration to the migrations folder:
```bash
cp .taskmaster/docs/20250801032000_add_all_missing_fields_consolidated.sql \
   maklarsystem/supabase/migrations/
```

### 2. Test in Local Environment (Recommended First)

Start local Supabase instance:
```bash
cd maklarsystem
supabase start
```

Apply migration locally:
```bash
supabase db push
```

### 3. Verify Schema Changes

Connect to local database:
```bash
supabase db shell
```

Run verification queries:
```sql
-- Check new columns exist
\d objekt

-- Or use this query to check specific columns:
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'objekt' 
AND column_name IN (
  'fastighetsbeteckning',
  'undertyp',
  'andel_i_forening',
  'andelstal',
  'virtuell_visning_url',
  'boendekalkyl_url',
  'standard_niva',
  'tillganglighetsanpassad',
  'laddbox',
  'solceller'
)
ORDER BY ordinal_position;

-- Check constraints
SELECT conname, contype, consrc
FROM pg_constraint
WHERE conrelid = 'objekt'::regclass
AND conname LIKE 'chk_%';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'objekt'
AND indexname LIKE 'idx_objekt_%'
ORDER BY indexname;
```

### 4. Test Data Insertion

Test inserting data with new fields:
```sql
-- Test Priority 1 fields
UPDATE objekt 
SET 
  fastighetsbeteckning = 'STOCKHOLM GAMLA STAN 1:1',
  undertyp = 'enplansvilla',
  andel_i_forening = 25.5,
  andelstal = 0.0255,
  virtuell_visning_url = 'https://example.com/virtual-tour/123'
WHERE id = (SELECT id FROM objekt LIMIT 1);

-- Test Priority 2 fields
UPDATE objekt 
SET 
  boendekalkyl_url = 'https://example.com/boendekalkyl/123',
  standard_niva = 'hög',
  tillganglighetsanpassad = true,
  laddbox = true,
  solceller = true,
  solceller_kapacitet_kwp = 10.5,
  laddbox_typ = '3-fas_11kW',
  laddbox_antal = 2
WHERE id = (SELECT id FROM objekt LIMIT 1);

-- Verify the update
SELECT 
  fastighetsbeteckning,
  undertyp,
  andel_i_forening,
  standard_niva,
  laddbox,
  solceller
FROM objekt 
WHERE fastighetsbeteckning IS NOT NULL;
```

### 5. Test Constraint Validation

Test that constraints work properly:
```sql
-- This should fail (invalid undertyp)
UPDATE objekt 
SET undertyp = 'invalid_type'
WHERE id = (SELECT id FROM objekt LIMIT 1);

-- This should fail (andel_i_forening > 100)
UPDATE objekt 
SET andel_i_forening = 150
WHERE id = (SELECT id FROM objekt LIMIT 1);

-- This should fail (invalid standard_niva)
UPDATE objekt 
SET standard_niva = 'invalid_level'
WHERE id = (SELECT id FROM objekt LIMIT 1);
```

### 6. Performance Testing

Test index performance:
```sql
-- Test index usage
EXPLAIN ANALYZE 
SELECT * FROM objekt 
WHERE fastighetsbeteckning = 'STOCKHOLM GAMLA STAN 1:1';

EXPLAIN ANALYZE 
SELECT * FROM objekt 
WHERE standard_niva = 'hög';

EXPLAIN ANALYZE 
SELECT * FROM objekt 
WHERE laddbox = true AND solceller = true;
```

### 7. Rollback Testing (Important!)

Test the rollback script:
```bash
# Copy rollback script
cp .taskmaster/docs/20250801032000_rollback_missing_fields.sql \
   maklarsystem/supabase/migrations/20250801033000_rollback_test.sql

# Apply rollback
supabase db push

# Verify columns are removed
supabase db shell
\d objekt
```

### 8. Testing in Staging Environment

After successful local testing:

1. Push to staging branch:
```bash
git checkout -b feature/add-missing-fields
git add maklarsystem/supabase/migrations/
git commit -m "Add missing fields migration for objekt table"
git push origin feature/add-missing-fields
```

2. Apply to staging environment:
```bash
supabase db push --linked
```

3. Run the same verification queries in staging

### 9. Application Testing

Test that the application works with new schema:
```bash
npm run dev
```

Check for:
- No TypeScript errors
- Forms still work
- API endpoints handle null values properly
- No console errors

### 10. Documentation of Results

Create a test results document:
```markdown
# Migration Test Results

Date: [DATE]
Environment: [LOCAL/STAGING/PRODUCTION]
Migration File: 20250801032000_add_all_missing_fields_consolidated.sql

## Test Results

- [ ] Migration applied successfully
- [ ] All columns created with correct types
- [ ] Constraints working properly
- [ ] Indexes created successfully
- [ ] Data insertion working
- [ ] Constraint validation working
- [ ] Performance acceptable
- [ ] Rollback tested successfully
- [ ] Application compatibility verified

## Issues Found
[List any issues]

## Next Steps
[List next steps]
```

## Common Issues and Solutions

### Issue: Migration fails with "column already exists"
**Solution**: Some columns might already exist from previous migrations. Modify the migration to only add truly missing fields.

### Issue: Type errors in application
**Solution**: Ensure database.ts is updated to match the new schema exactly.

### Issue: Performance degradation
**Solution**: Review indexes and consider adding more specific composite indexes.

### Issue: Constraint violations with existing data
**Solution**: Make constraints more permissive or clean existing data first.