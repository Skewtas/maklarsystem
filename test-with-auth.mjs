// Test av user ID mappning MED autentisering
// Kör denna fil med: node test-with-auth.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Ladda miljövariabler manuellt
const envContent = readFileSync('./maklarsystem/.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Saknar Supabase miljövariabler!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testWithAuth() {
  console.log('🔐 Testar med autentisering...\n');

  try {
    // 1. Logga in som Anna
    console.log('🔑 Loggar in som Anna...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'anna.andersson@maklarsystem.se',
      password: 'testpassword123'
    });

    if (authError) {
      console.error('❌ Kunde inte logga in:', authError);
      console.log('\n💡 Tips: Kontrollera att:');
      console.log('   1. Anna har ett konto i auth.users');
      console.log('   2. Lösenordet är korrekt (testpassword123)');
      return;
    }

    console.log('✅ Inloggad som:', authData.user.email);
    console.log('   Auth ID:', authData.user.id, '\n');

    // 2. Hämta Annas public.users info
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'anna.andersson@maklarsystem.se')
      .single();

    if (publicError) {
      console.error('❌ Kunde inte hämta public user:', publicError);
      return;
    }

    console.log('✅ Public user info:');
    console.log('   ID:', publicUser.id);
    console.log('   Namn:', publicUser.full_name);
    console.log('   Roll:', publicUser.role, '\n');

    // 3. Testa att skapa ett objekt
    console.log('🏠 Testar att skapa ett objekt med autentisering...\n');

    const testObjekt = {
      adress: 'Test med Auth ' + new Date().toISOString(),
      postnummer: '12345',
      ort: 'Stockholm',
      kommun: 'Stockholm',
      lan: 'Stockholm',
      typ: 'villa',
      status: 'kundbearbetning',
      maklare_id: publicUser.id  // Använder public.users ID
    };

    const { data: newObjekt, error: objektError } = await supabase
      .from('objekt')
      .insert([testObjekt])
      .select()
      .single();

    if (objektError) {
      console.error('❌ Kunde inte skapa objekt:', objektError);
      console.log('\n💡 Tips: Kör fix-rls-simple.sql i Supabase SQL Editor för att fixa RLS policies.');
      return;
    }

    console.log('✅ Objekt skapat framgångsrikt!');
    console.log('   ID:', newObjekt.id);
    console.log('   Adress:', newObjekt.adress);
    console.log('   Mäklare ID:', newObjekt.maklare_id, '\n');

    // 4. Verifiera att vi kan se objektet
    const { data: verifyObjekt, error: verifyError } = await supabase
      .from('objekt')
      .select('*')
      .eq('id', newObjekt.id)
      .single();

    if (verifyError) {
      console.error('❌ Kunde inte hämta objektet:', verifyError);
    } else {
      console.log('✅ Objektet kan hämtas med SELECT!');
    }

    // 5. Ta bort testobjektet
    const { error: deleteError } = await supabase
      .from('objekt')
      .delete()
      .eq('id', newObjekt.id);

    if (!deleteError) {
      console.log('🧹 Testobjekt borttaget.\n');
    } else {
      console.error('⚠️  Kunde inte ta bort objektet:', deleteError);
    }

    // 6. Logga ut
    await supabase.auth.signOut();
    console.log('🚪 Utloggad.\n');

    console.log('✅ Alla tester klara!');
    console.log('\n📱 Nästa steg:');
    console.log('   1. Kör fix-rls-simple.sql i Supabase om testet misslyckades');
    console.log('   2. Testa sedan i webbläsaren');
    console.log('   3. Logga in som Anna och skapa ett objekt');

  } catch (error) {
    console.error('❌ Fel under test:', error);
  }
}

// Kör testen
testWithAuth();