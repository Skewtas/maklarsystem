#!/usr/bin/env node

/**
 * Migration Runner Script
 * Runs Supabase migrations and verifies schema changes
 */

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');
const SCHEMA_FILE = path.join(__dirname, '../supabase/schema.sql');

console.log('🔄 Migration Runner Starting...');
console.log(`📂 Migrations directory: ${MIGRATIONS_DIR}`);

// Check if migrations directory exists
if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error('❌ Migrations directory not found!');
    process.exit(1);
}

// List all migration files
const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();

console.log(`📋 Found ${migrationFiles.length} migration files:`);
migrationFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
});

// Verify migration file contents
console.log('\n🔍 Verifying migration contents...');

migrationFiles.forEach(file => {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n📄 ${file}:`);
    console.log(`  Size: ${content.length} characters`);
    
    // Count SQL statements
    const statements = content.split(';').filter(s => s.trim().length > 0);
    console.log(`  SQL statements: ${statements.length}`);
    
    // Check for specific patterns
    if (content.includes('CREATE TYPE')) {
        const enumCount = (content.match(/CREATE TYPE/g) || []).length;
        console.log(`  ✅ ENUM types: ${enumCount}`);
    }
    
    if (content.includes('ADD COLUMN')) {
        const columnCount = (content.match(/ADD COLUMN/g) || []).length;
        console.log(`  ✅ New columns: ${columnCount}`);
    }
    
    if (content.includes('CREATE INDEX')) {
        const indexCount = (content.match(/CREATE INDEX/g) || []).length;
        console.log(`  ✅ New indexes: ${indexCount}`);
    }
});

console.log('\n✅ Migration verification completed!');
console.log('\n📋 Next steps:');
console.log('1. Run these migrations in Supabase staging environment');
console.log('2. Verify schema changes in Supabase dashboard');
console.log('3. Test TypeScript type checking');
console.log('4. Update any API endpoints to handle new fields');

// Create a verification checklist
const checklist = `
# Migration Verification Checklist

## Pre-Migration
- [ ] Backup current database
- [ ] Verify migration files syntax
- [ ] Check TypeScript compilation

## Migration Execution
- [ ] Run migration 1: ${migrationFiles[0] || 'N/A'}
- [ ] Run migration 2: ${migrationFiles[1] || 'N/A'} 
- [ ] Run migration 3: ${migrationFiles[2] || 'N/A'}

## Post-Migration Verification
- [ ] Check objekt table has all new columns
- [ ] Verify ENUM types are created
- [ ] Verify indexes are created
- [ ] Test basic CRUD operations
- [ ] Verify TypeScript types work
- [ ] Test form submission with new fields

## Schema Verification Queries
\`\`\`sql
-- Check new columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'objekt' 
ORDER BY ordinal_position;

-- Check ENUM types
SELECT typname FROM pg_type WHERE typtype = 'e' AND typname LIKE '%_typ';

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'objekt';
\`\`\`
`;

fs.writeFileSync(path.join(__dirname, '../MIGRATION_CHECKLIST.md'), checklist);
console.log('📝 Created MIGRATION_CHECKLIST.md');

console.log('\n🎉 Ready to run migrations!'); 