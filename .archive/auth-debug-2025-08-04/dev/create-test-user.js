const { createClient } = require('@supabase/supabase-js');

async function createTestUser() {
  console.log('=== SKAPAR TESTANVÄNDARE ===');
  
  // Supabase admin client
  const supabase = createClient(
    'https://exreuewsrgavzsbdnghv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cmV1ZXdzcmdhdnpzYmRuZ2h2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQwMzgwNiwiZXhwIjoyMDY4OTc5ODA2fQ.VJpbRNAtkJIsp4heAt4gZu2KZqItxYi7RCJ1XgvETIs',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    // Steg 1: Skapa användare i auth.users
    console.log('1. Skapar användare i Supabase Auth...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'anna.andersson@maklarsystem.se',
      password: 'testpassword123',
      email_confirm: true
    });

    if (authError && !authError.message.includes('already registered')) {
      console.error('Auth fel:', authError);
      return;
    }

    const userId = authUser?.user?.id || '6a0af328-9be6-4dd9-ae83-ce2cf512da6d';
    console.log(`   ✅ Auth användare: ${userId}`);

    // Steg 2: Skapa användare i users-tabellen
    console.log('2. Skapar användare i users-tabellen...');
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: 'anna.andersson@maklarsystem.se',
        full_name: 'Anna Andersson',
        role: 'maklare',
        phone: '070-123 45 67'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Databas fel:', dbError);
      return;
    }

    console.log('   ✅ Databasanvändare skapad:', dbUser);

    // Steg 3: Ta bort fel användare om den finns
    console.log('3. Rensar fel användardata...');
    try {
      // Hitta användare med matchahem email
      const { data: wrongUsers } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'rani.shakir@matchahem.se');

      if (wrongUsers && wrongUsers.length > 0) {
        console.log(`   Hittade ${wrongUsers.length} fel användare, tar bort...`);
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('email', 'rani.shakir@matchahem.se');

        if (deleteError) {
          console.log('   ⚠️ Kunde inte ta bort fel användare:', deleteError.message);
        } else {
          console.log('   ✅ Fel användare borttagen');
        }
      }
    } catch (error) {
      console.log('   ⚠️ Fel vid rensning av fel användare:', error.message);
    }

    console.log('=== TESTANVÄNDARE REDO ===');
    console.log('Email: anna.andersson@maklarsystem.se');
    console.log('Lösenord: testpassword123');

  } catch (error) {
    console.error('Oväntat fel:', error);
  }
}

createTestUser(); 