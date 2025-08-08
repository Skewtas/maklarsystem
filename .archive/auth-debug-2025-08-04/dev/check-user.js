require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Använd service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function checkAndCreateUser() {
  try {
    console.log('🔄 Kontrollerar användare i users-tabellen...')
    
    // Hämta auth-användaren
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Fel vid hämtning av auth-användare:', listError.message)
      return
    }

    const authUser = users.users.find(u => u.email === 'anna.andersson@maklarsystem.se')
    
    if (!authUser) {
      console.log('❌ Auth-användaren hittades inte')
      return
    }

    console.log('✅ Auth-användare hittad:', authUser.id)

    // Kontrollera om användaren finns i users-tabellen
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      console.error('❌ Fel vid hämtning från users-tabellen:', userError.message)
      return
    }

    if (userRecord) {
      console.log('✅ Användare finns redan i users-tabellen')
      console.log('📋 Data:', userRecord)
    } else {
      console.log('⚠️ Användare saknas i users-tabellen, skapar...')
      
      // Skapa användaren i users-tabellen
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: 'anna.andersson@maklarsystem.se',
          full_name: 'Anna Andersson',
          role: 'maklare',
          phone: '070-123 45 67'
        })
        .select()
        .single()

      if (createError) {
        console.error('❌ Fel vid skapande i users-tabellen:', createError.message)
        return
      }

      console.log('✅ Användare skapad i users-tabellen!')
      console.log('📋 Data:', newUser)
    }

    console.log('')
    console.log('🎉 Allt klart! Du kan nu logga in med:')
    console.log('📧 Email: anna.andersson@maklarsystem.se')
    console.log('🔑 Lösenord: test123')

  } catch (error) {
    console.error('❌ Oväntat fel:', error.message)
  }
}

checkAndCreateUser() 