/**
 * Test script för bilduppladdning
 * Skapar ett testobjekt och laddar upp bilder
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase konfiguration
const supabaseUrl = 'https://exreuewsrgavzsbdnghv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cmV1ZXdzcmdhdnpzYmRuZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MzMzNjUsImV4cCI6MjA0NjIwOTM2NX0.qJFRCTGcrs-x91CmPPFKaA6xw3lJpDa0UscVDiKaSxw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testImageUpload() {
  try {
    console.log('1. Loggar in...');
    
    // Logga in med testanvändare
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'test123456'
    });

    if (authError) {
      console.error('Fel vid inloggning:', authError);
      return;
    }

    const userId = authData.user.id;
    console.log('✅ Inloggad som:', authData.user.email, 'ID:', userId);

    // 2. Skapa testobjekt
    console.log('\n2. Skapar testobjekt...');
    
    const { data: objekt, error: objektError } = await supabase
      .from('objekt')
      .insert({
        maklare_id: userId,
        objekt_typ: 'villa',
        adress: 'Testgatan 123',
        postnummer: '12345',
        ort: 'Stockholm',
        status: 'till_salu',
        utgangspris: 5000000,
        rum: 5,
        boarea: 150,
        tomtarea: 800,
        byggar: 1975,
        driftskostnad: 3500,
        energiklass: 'C',
        beskrivning: 'Testobjekt för bilduppladdning'
      })
      .select()
      .single();

    if (objektError) {
      console.error('Fel vid skapande av objekt:', objektError);
      return;
    }

    console.log('✅ Objekt skapat med ID:', objekt.id);

    // 3. Ladda upp bild via API
    console.log('\n3. Laddar upp bild via API...');
    
    // Skapa en testbild som FormData
    const testImagePath = '/Users/ranishakir/Maklarsystem/maklarsystem/test.png';
    
    // Kontrollera om testbild finns, annars skapa en
    if (!fs.existsSync(testImagePath)) {
      console.log('Skapar testbild...');
      // Skapa en enkel 1x1 pixel PNG
      const buffer = Buffer.from([
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
      fs.writeFileSync(testImagePath, buffer);
    }

    // Läs bildfilen
    const imageBuffer = fs.readFileSync(testImagePath);
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    
    // Skapa FormData
    const formData = new FormData();
    formData.append('file', blob, 'test.png');

    // Hämta auth token
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    // Anropa API endpoint
    const response = await fetch(`http://localhost:3000/api/properties/${objekt.id}/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Bild uppladdad:', result);
    } else {
      console.error('❌ Fel vid uppladdning:', result);
    }

    // 4. Verifiera att bilden finns i databasen
    console.log('\n4. Verifierar bild i databasen...');
    
    const { data: images, error: imagesError } = await supabase
      .from('property_images')
      .select('*')
      .eq('objekt_id', objekt.id);

    if (imagesError) {
      console.error('Fel vid hämtning av bilder:', imagesError);
    } else {
      console.log('✅ Antal bilder i databasen:', images.length);
      if (images.length > 0) {
        console.log('Bild info:', images[0]);
      }
    }

    // 5. Rensa upp (ta bort testobjekt)
    console.log('\n5. Rensar upp...');
    
    // Ta bort bilder först (pga foreign key)
    if (images && images.length > 0) {
      const { error: deleteImagesError } = await supabase
        .from('property_images')
        .delete()
        .eq('objekt_id', objekt.id);
      
      if (deleteImagesError) {
        console.error('Fel vid borttagning av bilder:', deleteImagesError);
      }
    }

    // Ta bort objekt
    const { error: deleteError } = await supabase
      .from('objekt')
      .delete()
      .eq('id', objekt.id);

    if (deleteError) {
      console.error('Fel vid borttagning av objekt:', deleteError);
    } else {
      console.log('✅ Testobjekt borttaget');
    }

  } catch (error) {
    console.error('Oväntat fel:', error);
  } finally {
    // Logga ut
    await supabase.auth.signOut();
    console.log('\n✅ Utloggad');
  }
}

// Kör test
testImageUpload();