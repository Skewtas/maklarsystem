#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase config
const supabaseUrl = 'https://kwxxpypgtdfimmxnipaz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eHhweXBndGRmaW1teG5pcGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3ODM1NDYsImV4cCI6MjA3MDM1OTU0Nn0.YsYf4uztBvMUYJFbt0ICW1GuWltSNUPoXx3yjp2-_SQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('🚀 Startar bilduppladdningstest...\n');

  // 1. Logga in
  console.log('1️⃣ Loggar in som admin@maklarsystem.se...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@maklarsystem.se',
    password: 'admin123'
  });

  if (authError) {
    // Prova skapa användare om den inte finns
    console.log('⚠️ Kunde inte logga in, försöker skapa användare...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'admin@maklarsystem.se',
      password: 'admin123'
    });
    
    if (signUpError) {
      console.error('❌ Fel:', signUpError.message);
      return;
    }
    console.log('✅ Användare skapad!');
  } else {
    console.log('✅ Inloggad som:', authData.user.email);
  }

  // 2. Hämta användar-ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('❌ Ingen användare inloggad');
    return;
  }

  // 3. Skapa testobjekt
  console.log('\n2️⃣ Skapar testobjekt...');
  const { data: objekt, error: objektError } = await supabase
    .from('objekt')
    .insert({
      maklare_id: user.id,
      typ: 'villa',
      adress: 'Testgatan 999 - CLI TEST',
      postnummer: '12345',
      ort: 'Stockholm',
      status: 'till_salu',
      utgangspris: 3000000,
      rum: 4,
      boarea: 120,
      tomtarea: 500,
      byggaar: 1980,
      beskrivning: 'CLI Testobjekt för bilduppladdning'
    })
    .select()
    .single();

  if (objektError) {
    console.error('❌ Fel vid skapande:', objektError.message);
    return;
  }

  console.log('✅ Objekt skapat! ID:', objekt.id);

  // 4. Skapa en testbild
  console.log('\n3️⃣ Skapar testbild...');
  const testImagePath = join(__dirname, 'test.png');
  
  // Skapa en enkel 1x1 pixel PNG
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9c, 0x62, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
    0x42, 0x60, 0x82
  ]);
  
  fs.writeFileSync(testImagePath, pngBuffer);
  console.log('✅ Testbild skapad');

  // 5. Ladda upp via API
  console.log('\n4️⃣ Laddar upp bild via API...');
  
  // Skapa FormData
  const formData = new FormData();
  const blob = new Blob([pngBuffer], { type: 'image/png' });
  formData.append('file', blob, 'test.png');

  // Hämta token
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  try {
    const response = await fetch(`http://localhost:3000/api/properties/${objekt.id}/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Bild uppladdad!');
      console.log('   ID:', result.data?.id);
      console.log('   Path:', result.data?.path);
    } else {
      console.error('❌ Uppladdningsfel:', result.message || result);
    }
  } catch (error) {
    console.error('❌ Nätverksfel:', error.message);
  }

  // 6. Verifiera i databasen
  console.log('\n5️⃣ Verifierar i databasen...');
  const { data: images, error: imagesError } = await supabase
    .from('property_images')
    .select('*')
    .eq('objekt_id', objekt.id);

  if (imagesError) {
    console.error('❌ Fel vid hämtning:', imagesError.message);
  } else {
    console.log('✅ Antal bilder:', images.length);
    if (images.length > 0) {
      console.log('   Första bilden:', {
        id: images[0].id,
        path: images[0].path,
        created: images[0].created_at
      });
    }
  }

  // 7. Städa upp
  console.log('\n6️⃣ Städar upp...');
  
  // Ta bort bilder
  if (images && images.length > 0) {
    await supabase
      .from('property_images')
      .delete()
      .eq('objekt_id', objekt.id);
  }

  // Ta bort objekt
  await supabase
    .from('objekt')
    .delete()
    .eq('id', objekt.id);

  // Ta bort testfil
  fs.unlinkSync(testImagePath);

  console.log('✅ Städning klar');
  
  // Logga ut
  await supabase.auth.signOut();
  console.log('\n✅ Test slutfört!');
}

test().catch(console.error);