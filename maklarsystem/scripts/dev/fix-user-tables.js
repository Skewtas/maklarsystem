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

async function fixUserTables() {
  try {
    console.log('🔄 Fixar användardata...')
    
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

    // Ta bort befintlig användare från users-tabellen (för att undvika konflikter)
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('email', 'anna.andersson@maklarsystem.se')

    if (deleteError) {
      console.error('⚠️ Kunde inte ta bort befintlig användare:', deleteError.message)
    } else {
      console.log('🗑️ Befintlig användare borttagen från users-tabellen')
    }

    // Skapa användaren i users-tabellen med rätt ID
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

    console.log('')
    console.log('🎉 Allt fixat! Du kan nu logga in med:')
    console.log('📧 Email: anna.andersson@maklarsystem.se')
    console.log('🔑 Lösenord: test123')

  } catch (error) {
    console.error('❌ Oväntat fel:', error.message)
  }
}

fixUserTables() 