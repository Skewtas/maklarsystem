#!/usr/bin/env node

/**
 * Script to apply the property_images fix migration to Supabase
 * This fixes RLS policies and adds performance indexes
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🚀 Starting migration to fix property_images RLS policies...\n');

  // Read the migration file
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250816000000_fix_property_images_policies.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found at:', migrationPath);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  try {
    // Execute the migration
    console.log('📝 Applying migration...');
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        // Add semicolon back
        const sql = statement + ';';
        
        // Skip pure comment lines
        if (sql.trim().startsWith('--')) continue;
        
        console.log(`\n  Executing: ${sql.substring(0, 50)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          query: sql 
        }).catch(err => {
          // If RPC doesn't exist, try direct query (won't work but worth trying)
          console.log('  ⚠️  Note: Direct SQL execution requires Supabase Dashboard or psql');
          return { error: err };
        });

        if (error) {
          console.error(`  ❌ Error: ${error.message}`);
          errorCount++;
        } else {
          console.log('  ✅ Success');
          successCount++;
        }
      } catch (err) {
        console.error(`  ❌ Error: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Migration Summary:`);
    console.log(`  ✅ Successful statements: ${successCount}`);
    console.log(`  ❌ Failed statements: ${errorCount}`);
    console.log('='.repeat(60));

    if (errorCount > 0) {
      console.log('\n⚠️  Some statements failed. This is expected if:');
      console.log('  - The Supabase JS client cannot execute raw SQL directly');
      console.log('  - You need to use the Supabase Dashboard SQL Editor instead');
      console.log('\n📋 To apply manually:');
      console.log('  1. Go to: https://supabase.com/dashboard/project/kwxxpypgtdfimmxnipaz/sql/new');
      console.log('  2. Copy the migration file contents');
      console.log('  3. Paste and run in the SQL Editor');
      console.log(`\n📄 Migration file: ${migrationPath}`);
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('\n📋 Manual application required:');
    console.log('  1. Go to: https://supabase.com/dashboard/project/kwxxpypgtdfimmxnipaz/sql/new');
    console.log('  2. Copy the migration file contents');
    console.log('  3. Paste and run in the SQL Editor');
    console.log(`\n📄 Migration file: ${migrationPath}`);
    process.exit(1);
  }

  // Verify the results
  console.log('\n🔍 Verifying migration results...\n');

  try {
    // Check if policies exist
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname')
      .eq('tablename', 'property_images');

    if (!policiesError && policies) {
      console.log(`✅ Found ${policies.length} RLS policies on property_images table`);
      policies.forEach(p => console.log(`   - ${p.policyname}`));
    }

    // Test image query
    const { error: testError } = await supabase
      .from('property_images')
      .select('id')
      .limit(1);

    if (!testError) {
      console.log('✅ property_images table is accessible');
    } else {
      console.log(`⚠️  property_images access test: ${testError.message}`);
    }

  } catch (err) {
    console.log('⚠️  Could not verify migration (this is normal if applied manually)');
  }

  console.log('\n✨ Migration process complete!');
  console.log('\n📝 Next steps:');
  console.log('  1. Test image upload functionality in your app');
  console.log('  2. Verify images display correctly');
  console.log('  3. Check that RLS policies work as expected');
}

// Run the migration
applyMigration().catch(console.error);