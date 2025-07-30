const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables manually from .env.local
// Read .env.local file
const envPath = path.join(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')

// Parse environment variables
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    envVars[key.trim()] = value.trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupNextAuthSchema() {
  try {
    console.log('🔄 Setting up NextAuth schema in Supabase...')
    console.log('')
    console.log('⚠️  NOTE: This script will create the NextAuth schema.')
    console.log('    You can also run this manually in Supabase SQL Editor:')
    console.log('')
    
    // Read the migration file and show instructions
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250729210000_create_nextauth_schema.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 SQL to run in Supabase Dashboard SQL Editor:')
    console.log('=' * 60)
    console.log(migrationSQL)
    console.log('=' * 60)
    console.log('')
    
    console.log('🔍 Instructions:')
    console.log('1. Go to your Supabase Dashboard (https://app.supabase.com)')
    console.log('2. Select your project')
    console.log('3. Go to SQL Editor')
    console.log('4. Copy and paste the SQL above')
    console.log('5. Click "Run"')
    console.log('')
    
    console.log('✅ Once you\'ve run the SQL, NextAuth will be ready!')
    console.log('')
    console.log('🎉 Next steps after running the SQL:')
    console.log('1. Test NextAuth authentication flow')
    console.log('2. Verify user registration works')
    console.log('3. Check session management')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

setupNextAuthSchema() 