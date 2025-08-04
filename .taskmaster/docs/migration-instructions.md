# Database Migration Instructions

## Overview
This document contains instructions for applying the missing fields migrations to the objekt table in Supabase.

## Migration Files Created

### 1. Priority 1 Essential Fields (`20250801030000_add_priority_missing_fields.sql`)
- **fastighetsbeteckning**: Official property designation
- **undertyp**: Specific property sub-types  
- **andel_i_forening**: Share percentage in housing cooperative
- **andelstal**: Share ratio for cost distribution
- **virtuell_visning_url**: Virtual tour URL

### 2. Priority 2 Valuable Fields (`20250801031000_add_priority2_fields.sql`)
- **boendekalkyl_url**: Living cost calculation link
- **standard_niva**: Property standard level
- **tillganglighetsanpassad**: Accessibility adapted
- **laddbox**: EV charging box
- **solceller**: Solar panels
- Additional related fields

### 3. Consolidated Migration (`20250801032000_add_all_missing_fields_consolidated.sql`)
- Includes all Priority 1, 2, and 3 fields
- Complete set of fields for a comprehensive Swedish real estate system
- Includes proper constraints, indexes, and comments

### 4. Rollback Script (`20250801032000_rollback_missing_fields.sql`)
- Safety script to remove all added fields if needed
- Drops indexes, constraints, and columns in the correct order

## How to Apply Migrations

### Option 1: Using Supabase CLI (Recommended)

1. Copy the migration files to the supabase migrations directory:
```bash
cp .taskmaster/docs/20250801032000_add_all_missing_fields_consolidated.sql maklarsystem/supabase/migrations/
```

2. Run the migration:
```bash
cd maklarsystem
supabase db push
```

### Option 2: Using Supabase Dashboard

1. Go to Supabase Dashboard > SQL Editor
2. Copy the content of the migration file
3. Paste and execute the SQL
4. Verify the changes in Table Editor

### Option 3: Incremental Application

If you prefer to add fields incrementally:
1. First apply Priority 1 fields
2. Test and verify
3. Apply Priority 2 fields
4. Test and verify
5. Optionally apply Priority 3 fields

## Post-Migration Steps

1. **Update TypeScript Types**: After applying the migration, update the `database.ts` file to include the new fields
2. **Test in Staging**: Verify all fields are created correctly
3. **Update API Endpoints**: Ensure any API endpoints that interact with the objekt table are updated
4. **Update UI Forms**: Add form fields for the new database columns where appropriate

## Verification Queries

After migration, run these queries to verify:

```sql
-- Check if new columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'objekt' 
AND column_name IN (
  'fastighetsbeteckning', 
  'undertyp', 
  'andel_i_forening',
  'virtuell_visning_url'
);

-- Check constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'objekt'
AND constraint_name LIKE 'chk_%';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'objekt'
AND indexname LIKE 'idx_objekt_%';
```

## Notes

- All fields are nullable by default unless business logic requires otherwise
- The migration includes proper Swedish terminology and common property types
- Indexes are added for commonly searched fields
- JSONB fields are used for flexible data structures (historical data, statistics)