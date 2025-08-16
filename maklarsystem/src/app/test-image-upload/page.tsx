'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function TestImageUpload() {
  const [status, setStatus] = useState<string>('');
  const [objektId, setObjektId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const supabase = createClient();

  // Skapa testobjekt
  const createTestObject = async () => {
    setStatus('Skapar testobjekt...');
    
    // Hämta inloggad användare
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setStatus('❌ Du måste vara inloggad!');
      return;
    }

    // Skapa objekt
    const { data, error } = await supabase
      .from('objekt')
      .insert({
        maklare_id: user.id,
        typ: 'villa',
        adress: 'Testgatan 123 - BILDTEST',
        postnummer: '12345',
        ort: 'Stockholm',
        kommun: 'Stockholm',     // LÄGG TILL
        lan: 'Stockholms län',   // LÄGG TILL
        status: 'till_salu',
        utgangspris: 5000000,
        rum: 5,
        boarea: 150,
        tomtarea: 800,
        byggaar: 1975,
        beskrivning: 'TESTOBJEKT för bilduppladdning'
      })
      .select()
      .single();

    if (error) {
      setStatus(`❌ Fel: ${error.message}`);
      console.error('Fel vid skapande:', error);
    } else {
      setObjektId(data.id);
      setStatus(`✅ Objekt skapat! ID: ${data.id}`);
    }
  };

  // Ladda upp bild
  const uploadImage = async () => {
    if (!objektId) {
      setStatus('❌ Skapa ett testobjekt först!');
      return;
    }

    if (!file) {
      setStatus('❌ Välj en fil först!');
      return;
    }

    setStatus('Laddar upp bild...');

    // Skapa FormData
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Anropa API
      const response = await fetch(`/api/properties/${objektId}/images`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setStatus(`✅ Bild uppladdad! ${JSON.stringify(result, null, 2)}`);
      } else {
        setStatus(`❌ Fel: ${result.message || 'Okänt fel'}`);
        console.error('API fel:', result);
      }
    } catch (error) {
      setStatus(`❌ Nätverksfel: ${error}`);
      console.error('Uppladdningsfel:', error);
    }
  };

  // Lista bilder
  const listImages = async () => {
    if (!objektId) {
      setStatus('❌ Skapa ett testobjekt först!');
      return;
    }

    setStatus('Hämtar bilder...');

    try {
      const response = await fetch(`/api/properties/${objektId}/images`);
      const result = await response.json();

      if (response.ok) {
        setStatus(`✅ Bilder: ${JSON.stringify(result.data, null, 2)}`);
      } else {
        setStatus(`❌ Fel: ${result.message}`);
      }
    } catch (error) {
      setStatus(`❌ Fel: ${error}`);
    }
  };

  // Ta bort testobjekt
  const deleteTestObject = async () => {
    if (!objektId) {
      setStatus('❌ Inget objekt att ta bort!');
      return;
    }

    setStatus('Tar bort testobjekt...');

    // Ta bort bilder först
    const { error: imgError } = await supabase
      .from('property_images')
      .delete()
      .eq('objekt_id', objektId);

    if (imgError) {
      console.error('Fel vid borttagning av bilder:', imgError);
    }

    // Ta bort objekt
    const { error } = await supabase
      .from('objekt')
      .delete()
      .eq('id', objektId);

    if (error) {
      setStatus(`❌ Fel: ${error.message}`);
    } else {
      setStatus('✅ Testobjekt borttaget!');
      setObjektId('');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Bilduppladdning</h1>
      
      <div className="space-y-4">
        {/* Steg 1: Skapa objekt */}
        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">Steg 1: Skapa testobjekt</h2>
          <button 
            onClick={createTestObject}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Skapa testobjekt
          </button>
          {objektId && (
            <p className="mt-2 text-sm text-gray-600">
              Objekt ID: <code className="bg-gray-100 px-1">{objektId}</code>
            </p>
          )}
        </div>

        {/* Steg 2: Välj fil */}
        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">Steg 2: Välj bild</h2>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Vald fil: {file.name} ({Math.round(file.size / 1024)} KB)
            </p>
          )}
        </div>

        {/* Steg 3: Ladda upp */}
        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">Steg 3: Ladda upp bild</h2>
          <button 
            onClick={uploadImage}
            disabled={!objektId || !file}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            Ladda upp bild
          </button>
        </div>

        {/* Extra funktioner */}
        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">Extra funktioner</h2>
          <div className="space-x-2">
            <button 
              onClick={listImages}
              disabled={!objektId}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-300"
            >
              Lista bilder
            </button>
            <button 
              onClick={deleteTestObject}
              disabled={!objektId}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-300"
            >
              Ta bort testobjekt
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="font-bold mb-2">Status:</h2>
          <pre className="whitespace-pre-wrap text-sm">{status}</pre>
        </div>
      </div>
    </div>
  );
}