// Test av user ID mappning
// Kör denna fil med: node test-user-mapping.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Ladda miljövariabler
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Saknar Supabase miljövariabler!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUserMapping() {
  console.log('🔍 Testar user ID mappning...\n');

  try {
    // 1. Kolla Anna i auth.users
    const { data: authUser, error: authError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', 'anna.andersson@maklarsystem.se')
      .single();

    if (authError) {
      console.error('❌ Kunde inte hämta från auth.users:', authError);
      return;
    }

    console.log('✅ Anna i auth.users:');
    console.log(`   ID: ${authUser.id}`);
    console.log(`   Email: ${authUser.email}\n`);

    // 2. Kolla Anna i public.users
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .eq('email', 'anna.andersson@maklarsystem.se')
      .single();

    if (publicError) {
      console.error('❌ Kunde inte hämta från public.users:', publicError);
      return;
    }

    console.log('✅ Anna i public.users:');
    console.log(`   ID: ${publicUser.id}`);
    console.log(`   Email: ${publicUser.email}`);
    console.log(`   Namn: ${publicUser.full_name}`);
    console.log(`   Roll: ${publicUser.role}\n`);

    // 3. Jämför ID:n
    if (authUser.id !== publicUser.id) {
      console.log('⚠️  VARNING: Anna har olika ID:n i tabellerna!');
      console.log(`   auth.users ID: ${authUser.id}`);
      console.log(`   public.users ID: ${publicUser.id}`);
      console.log('   Applikationen kommer använda public.users ID.\n');
    } else {
      console.log('✅ Anna har samma ID i båda tabellerna!\n');
    }

    // 4. Testa att skapa ett objekt
    console.log('🏠 Testar att skapa ett objekt...\n');

    const testObjekt = {
      adress: 'Test från Node.js',
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
      return;
    }

    console.log('✅ Objekt skapat framgångsrikt!');
    console.log(`   ID: ${newObjekt.id}`);
    console.log(`   Adress: ${newObjekt.adress}`);
    console.log(`   Mäklare ID: ${newObjekt.maklare_id}\n`);

    // 5. Ta bort testobjektet
    const { error: deleteError } = await supabase
      .from('objekt')
      .delete()
      .eq('id', newObjekt.id);

    if (!deleteError) {
      console.log('🧹 Testobjekt borttaget.\n');
    }

    console.log('✅ Alla tester klara! User ID mappning fungerar korrekt.');

  } catch (error) {
    console.error('❌ Fel under test:', error);
  }
}

// Kör testen
testUserMapping();