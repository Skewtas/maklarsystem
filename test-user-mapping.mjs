// Test av user ID mappning
// Kör denna fil med: node test-user-mapping.mjs

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
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

async function testUserMapping() {
  console.log('🔍 Testar user ID mappning...\n');

  try {
    // Test direkt mot public.users eftersom vi inte kan komma åt auth.users direkt
    console.log('📊 Hämtar alla användare från public.users...\n');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('❌ Kunde inte hämta användare:', usersError);
      return;
    }

    console.log(`✅ Hittade ${users.length} användare i public.users:`);
    users.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user.id})`);
    });
    console.log('');

    // Hitta Anna
    const anna = users.find(u => u.email === 'anna.andersson@maklarsystem.se');
    
    if (!anna) {
      console.error('❌ Anna finns inte i public.users!');
      console.log('   Kör SQL-scriptet fix-users-table.sql i Supabase först.');
      return;
    }

    console.log('✅ Anna hittad i public.users:');
    console.log(`   ID: ${anna.id}`);
    console.log(`   Email: ${anna.email}`);
    console.log(`   Namn: ${anna.full_name}`);
    console.log(`   Roll: ${anna.role}\n`);

    // Testa att skapa ett objekt
    console.log('🏠 Testar att skapa ett objekt...\n');

    const testObjekt = {
      adress: 'Test från Node.js ' + new Date().toISOString(),
      postnummer: '12345',
      ort: 'Stockholm',
      kommun: 'Stockholm',
      lan: 'Stockholm',
      typ: 'villa',
      status: 'kundbearbetning',
      maklare_id: anna.id
    };

    const { data: newObjekt, error: objektError } = await supabase
      .from('objekt')
      .insert([testObjekt])
      .select()
      .single();

    if (objektError) {
      console.error('❌ Kunde inte skapa objekt:', objektError);
      console.log('\n💡 Tips: Kontrollera att:');
      console.log('   1. Anna finns i public.users (kör fix-users-table.sql)');
      console.log('   2. Du har kört correct-insert.sql för att sätta rätt ID');
      console.log('   3. RLS policies tillåter INSERT');
      return;
    }

    console.log('✅ Objekt skapat framgångsrikt!');
    console.log(`   ID: ${newObjekt.id}`);
    console.log(`   Adress: ${newObjekt.adress}`);
    console.log(`   Mäklare ID: ${newObjekt.maklare_id}\n`);

    // Ta bort testobjektet
    const { error: deleteError } = await supabase
      .from('objekt')
      .delete()
      .eq('id', newObjekt.id);

    if (!deleteError) {
      console.log('🧹 Testobjekt borttaget.\n');
    }

    console.log('✅ Alla tester klara! User ID mappning fungerar korrekt.');
    console.log('\n📱 Nu kan du testa i applikationen:');
    console.log('   1. Logga in som anna.andersson@maklarsystem.se');
    console.log('   2. Gå till "Nytt objekt"');
    console.log('   3. Fyll i formuläret och skapa objektet');

  } catch (error) {
    console.error('❌ Fel under test:', error);
  }
}

// Kör testen
testUserMapping();