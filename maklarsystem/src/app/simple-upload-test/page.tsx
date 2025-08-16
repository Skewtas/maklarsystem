'use client';

import { useState } from 'react';

export default function SimpleUploadTest() {
  const [status, setStatus] = useState('');
  const [objektId, setObjektId] = useState('');

  // Manuell test med fetch
  const testManual = async () => {
    setStatus('Startar test...\n');
    
    try {
      // 1. Skapa ett testobjekt direkt via Supabase (utan API)
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus(prev => prev + '❌ Du är inte inloggad!\n');
        return;
      }
      
      setStatus(prev => prev + `✅ Inloggad som: ${user.email}\n`);
      
      // Skapa objekt
      const { data: objekt, error: objektError } = await supabase
        .from('objekt')
        .insert({
          maklare_id: user.id,
          typ: 'villa',
          adress: `Test ${Date.now()}`,
          postnummer: '12345',
          ort: 'Stockholm',
          kommun: 'Stockholm',  // LÄGG TILL KOMMUN
          lan: 'Stockholms län', // LÄGG TILL LÄN
          status: 'till_salu',
          utgangspris: 1000000,
          rum: 3,
          boarea: 100,
          byggaar: 2020,  // Lägg till byggår också
          beskrivning: 'Test'
        })
        .select()
        .single();

      if (objektError) {
        setStatus(prev => prev + `❌ Fel: ${objektError.message}\n`);
        return;
      }

      setObjektId(objekt.id);
      setStatus(prev => prev + `✅ Objekt skapat: ${objekt.id}\n`);

      // 2. Skapa en minimal testbild
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const blob = await new Promise<Blob>(resolve => {
        canvas.toBlob(blob => resolve(blob!), 'image/png');
      });

      // 3. Ladda upp
      const formData = new FormData();
      formData.append('file', blob, 'test.png');

      setStatus(prev => prev + 'Laddar upp bild...\n');

      const response = await fetch(`/api/properties/${objekt.id}/images`, {
        method: 'POST',
        body: formData
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        result = { message: text };
      }

      if (response.ok) {
        setStatus(prev => prev + `✅ SUCCÉ! Bild uppladdad!\n`);
        setStatus(prev => prev + `Data: ${JSON.stringify(result, null, 2)}\n`);
      } else {
        setStatus(prev => prev + `❌ FEL ${response.status}: ${result.message || text}\n`);
      }

    } catch (error: any) {
      setStatus(prev => prev + `❌ EXCEPTION: ${error.message}\n`);
    }
  };

  // Rensa
  const cleanup = async () => {
    if (!objektId) return;
    
    const { createClient } = await import('@/utils/supabase/client');
    const supabase = createClient();
    
    // Ta bort bilder
    await supabase.from('property_images').delete().eq('objekt_id', objektId);
    
    // Ta bort objekt
    await supabase.from('objekt').delete().eq('id', objektId);
    
    setStatus(prev => prev + '✅ Rensat!\n');
    setObjektId('');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Enkel Uppladdningstest</h1>
      
      <div className="space-y-4">
        <button 
          onClick={testManual}
          className="bg-blue-500 text-white px-6 py-2 rounded"
        >
          Kör Test
        </button>
        
        {objektId && (
          <button 
            onClick={cleanup}
            className="bg-red-500 text-white px-6 py-2 rounded ml-4"
          >
            Rensa
          </button>
        )}
      </div>
      
      <pre className="mt-4 p-4 bg-gray-100 rounded text-sm">
        {status || 'Klicka "Kör Test" för att starta...'}
      </pre>
    </div>
  );
}