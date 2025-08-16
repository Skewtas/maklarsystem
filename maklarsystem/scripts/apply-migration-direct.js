/**
 * Script to apply property_images RLS fix migration directly to Supabase
 * This fixes the RLS policies to reference objekt instead of properties table
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kwxxpypgtdfimmxnipaz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is not set in .env.local');
  console.error('Please add your service role key to the .env.local file');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('Applying property_images RLS fix migration...');
    console.log('Supabase URL:', supabaseUrl);
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250816000000_fix_property_images_policies.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
      console.log(statement.substring(0, 100) + '...');
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: statement
      });
      
      if (error) {
        // Try direct SQL execution if RPC doesn't exist
        console.error(`Error executing statement ${i + 1}:`, error.message);
        console.log('Attempting alternative method...');
        
        // Note: Direct SQL execution requires using the Supabase Management API
        // or connecting via postgres client library
        throw new Error(`Failed to execute statement: ${error.message}`);
      } else {
        console.log(`✓ Statement ${i + 1} executed successfully`);
      }
    }
    
    console.log('\n✅ Migration applied successfully!');
    
    // Verify the policies were created
    console.log('\nVerifying policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'property_images');
    
    if (policiesError) {
      console.log('Could not verify policies:', policiesError.message);
    } else {
      console.log(`Found ${policies?.length || 0} policies on property_images table`);
    }
    
  } catch (error) {
    console.error('Failed to apply migration:', error);
    process.exit(1);
  }
}

// Run the migration
applyMigration();