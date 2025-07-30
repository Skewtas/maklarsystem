require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Använd service role för att skapa användare
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

async function createUser() {
  try {
    console.log('🔄 Skapar användare...')
    
    // Först, skapa auth-användaren
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'anna.andersson@maklarsystem.se',
      password: 'test123',
      email_confirm: true
    })

    if (authError) {
      console.error('❌ Auth-fel:', authError.message)
      return
    }

    console.log('✅ Auth-användare skapad:', authUser.user.id)

    // Sedan, skapa användaren i users-tabellen
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        id: authUser.user.id,
        email: 'anna.andersson@maklarsystem.se',
        full_name: 'Anna Andersson',
        role: 'maklare',
        phone: '070-123 45 67'
      })
      .select()

    if (userError) {
      console.error('❌ User-tabellfel:', userError.message)
      return
    }

    console.log('✅ Användare skapad i users-tabellen!')
    console.log('📧 Email: anna.andersson@maklarsystem.se')
    console.log('🔑 Lösenord: test123')
    console.log('')
    console.log('Du kan nu logga in med dessa uppgifter!')

  } catch (error) {
    console.error('❌ Oväntat fel:', error.message)
  }
}

createUser() 