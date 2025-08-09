const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables manually from .env.local
const envPath = path.join(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')

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
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAuthUser() {
  try {
    console.log('🔍 Testing Supabase connection and Anna Andersson user...')
    console.log('')
    
    // Test basic Supabase connection
    console.log('1. Testing Supabase connection...')
    const { data: connectionTest, error: connError } = await supabase
      .from('objekt')
      .select('id')
      .limit(1)
    
    if (connError) {
      console.error('❌ Supabase connection failed:', connError.message)
      return
    }
    
    console.log('✅ Supabase connection successful')
    
    // Check for Anna Andersson in auth.users (original Supabase auth)
    console.log('2. Looking for Anna Andersson in auth.users...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.log('⚠️ Could not access auth.users:', authError.message)
    } else {
      const anna = authUsers?.users?.find(user => 
        user.email?.includes('anna') || user.user_metadata?.full_name?.includes('Anna')
      )
      
      if (anna) {
        console.log('✅ Found Anna Andersson in auth.users:')
        console.log('   ID:', anna.id)
        console.log('   Email:', anna.email)
        console.log('   Name:', anna.user_metadata?.full_name)
        console.log('   Created:', anna.created_at)
      } else {
        console.log('⚠️ Anna Andersson not found in auth.users')
        console.log('   Available users:', authUsers?.users?.length || 0)
      }
    }
    
    // Test if NextAuth schema exists
    console.log('3. Checking NextAuth schema...')
    const { data: schemas, error: schemaError } = await supabase
      .rpc('exec_sql', { sql: "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'next_auth'" })
      .catch(() => null)
    
    if (schemaError || !schemas) {
      console.log('⚠️ NextAuth schema not found - need to run SQL in Supabase Dashboard')
      console.log('   Use: node scripts/setup-nextauth-schema.js for instructions')
    } else {
      console.log('✅ NextAuth schema exists')
    }
    
    console.log('')
    console.log('🎯 Summary:')
    console.log('- Supabase connection: ✅')
    console.log('- Anna Andersson user: ' + (anna ? '✅' : '⚠️ Need to verify'))
    console.log('- NextAuth schema: ' + (schemas ? '✅' : '⚠️ Need to create'))
    console.log('')
    console.log('📋 Next steps:')
    console.log('1. Run NextAuth schema SQL in Supabase Dashboard if needed')
    console.log('2. Test login with Anna\'s credentials') 
    console.log('3. Update login page to use NextAuth')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testAuthUser() 