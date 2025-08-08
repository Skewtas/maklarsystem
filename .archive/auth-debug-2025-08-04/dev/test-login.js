require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Använd client (inte service role) för att testa login
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testLogin() {
  try {
    console.log('🔄 Testar inloggning...')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'anna.andersson@maklarsystem.se',
      password: 'test123'
    })

    if (error) {
      console.error('❌ Inloggningsfel:', error.message)
      return
    }

    console.log('✅ Inloggning lyckades!')
    console.log('👤 Användare:', {
      id: data.user.id,
      email: data.user.email,
      confirmed_at: data.user.email_confirmed_at
    })

    // Testa att hämta användardata från users-tabellen
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'anna.andersson@maklarsystem.se')
      .single()

    if (userError) {
      console.error('⚠️ Kunde inte hämta användardata från users-tabellen:', userError.message)
    } else {
      console.log('📋 Användardata från users-tabellen:', userData)
    }

    // Logga ut
    await supabase.auth.signOut()
    console.log('🚪 Utloggad')

  } catch (error) {
    console.error('❌ Oväntat fel:', error.message)
  }
}

testLogin() 