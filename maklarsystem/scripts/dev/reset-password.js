require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Använd service role för att återställa lösenord
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

async function resetPassword() {
  try {
    console.log('🔄 Återställer lösenord för anna.andersson@maklarsystem.se...')
    
    // Hämta användaren först
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Fel vid hämtning av användare:', listError.message)
      return
    }

    const user = users.users.find(u => u.email === 'anna.andersson@maklarsystem.se')
    
    if (!user) {
      console.log('❌ Användaren hittades inte')
      return
    }

    console.log('✅ Användare hittad:', user.id)

    // Återställ lösenordet
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        password: 'test123'
      }
    )

    if (error) {
      console.error('❌ Fel vid lösenordsåterställning:', error.message)
      return
    }

    console.log('✅ Lösenord återställt!')
    console.log('📧 Email: anna.andersson@maklarsystem.se')
    console.log('🔑 Nytt lösenord: test123')
    console.log('')
    console.log('Du kan nu logga in med dessa uppgifter!')

  } catch (error) {
    console.error('❌ Oväntat fel:', error.message)
  }
}

resetPassword() 