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

async function updateUser() {
  try {
    console.log('🔄 Uppdaterar användardata...')
    
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

    // Hitta befintlig användare i users-tabellen
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'anna.andersson@maklarsystem.se')
      .single()

    if (findError) {
      console.error('❌ Fel vid sökning av befintlig användare:', findError.message)
      return
    }

    console.log('👤 Befintlig användare hittad:', existingUser.id)

    // Uppdatera användarens data och se till att ID:t matchar auth-användaren
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        id: authUser.id,
        full_name: 'Anna Andersson',
        role: 'maklare',
        phone: '070-123 45 67'
      })
      .eq('email', 'anna.andersson@maklarsystem.se')
      .select()
      .single()

    if (updateError) {
      console.error('❌ Fel vid uppdatering av användare:', updateError.message)
      
      // Om vi inte kan uppdatera ID:t, kör vi bara en partiell uppdatering
      console.log('⚠️ Försöker partiell uppdatering...')
      const { data: partialUpdate, error: partialError } = await supabase
        .from('users')
        .update({
          full_name: 'Anna Andersson',
          role: 'maklare',
          phone: '070-123 45 67'
        })
        .eq('email', 'anna.andersson@maklarsystem.se')
        .select()
        .single()

      if (partialError) {
        console.error('❌ Partiell uppdatering misslyckades:', partialError.message)
        return
      }

      console.log('✅ Partiell uppdatering lyckades!')
      console.log('📋 Data:', partialUpdate)
    } else {
      console.log('✅ Fullständig uppdatering lyckades!')
      console.log('📋 Data:', updatedUser)
    }

    console.log('')
    console.log('🎉 Användare uppdaterad! Du kan nu logga in med:')
    console.log('📧 Email: anna.andersson@maklarsystem.se')
    console.log('🔑 Lösenord: test123')

  } catch (error) {
    console.error('❌ Oväntat fel:', error.message)
  }
}

updateUser() 