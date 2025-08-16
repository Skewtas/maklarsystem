'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function TestUploadDirect() {
  const [log, setLog] = useState<string[]>([]);
  const [objektId, setObjektId] = useState<string>('');
  const supabase = createClient();

  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Kör test automatiskt
  const runFullTest = async () => {
    setLog([]);
    addLog('🚀 Startar komplett test...');

    try {
      // 1. Kolla inloggning
      addLog('Kontrollerar inloggning...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        addLog('❌ Inte inloggad! Logga in först.');
        return;
      }
      
      addLog(`✅ Inloggad som: ${user.email} (${user.id})`);

      // 2. Skapa testobjekt
      addLog('Skapar testobjekt...');
      const { data: objekt, error: objektError } = await supabase
        .from('objekt')
        .insert({
          maklare_id: user.id,
          typ: 'villa',
          adress: `Testgatan ${Date.now()}`,
          postnummer: '12345',
          ort: 'Stockholm',
          kommun: 'Stockholm',
          lan: 'Stockholms län',
          status: 'till_salu',
          utgangspris: 1000000,
          rum: 3,
          boarea: 100,
          byggaar: 2020,
          beskrivning: 'AUTO-TEST OBJEKT'
        })
        .select()
        .single();

      if (objektError) {
        addLog(`❌ Fel vid skapande: ${objektError.message}`);
        return;
      }

      setObjektId(objekt.id);
      addLog(`✅ Objekt skapat: ${objekt.id}`);

      // 3. Skapa testbild (1x1 pixel PNG)
      addLog('Skapar testbild...');
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Rita en färgglad testbild
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('TEST', 20, 55);
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });

      addLog(`✅ Testbild skapad (${Math.round(blob.size / 1024)} KB)`);

      // 4. Ladda upp via API
      addLog('Laddar upp bild...');
      const formData = new FormData();
      formData.append('file', blob, 'test.png');

      const response = await fetch(`/api/properties/${objekt.id}/images`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        addLog(`✅ Bild uppladdad! ID: ${result.data?.id}`);
        addLog(`   Path: ${result.data?.path}`);
      } else {
        addLog(`❌ Uppladdningsfel: ${result.message}`);
        addLog(`   Detaljer: ${JSON.stringify(result)}`);
      }

      // 5. Verifiera i databasen
      addLog('Verifierar i databasen...');
      const { data: images, error: imagesError } = await supabase
        .from('property_images')
        .select('*')
        .eq('objekt_id', objekt.id);

      if (imagesError) {
        addLog(`❌ Fel vid verifiering: ${imagesError.message}`);
      } else {
        addLog(`✅ Bilder i DB: ${images.length}`);
        if (images.length > 0) {
          addLog(`   Första bilden: ${images[0].id}`);
        }
      }

      // 6. Hämta via API
      addLog('Hämtar bilder via API...');
      const getResponse = await fetch(`/api/properties/${objekt.id}/images`);
      const getResult = await getResponse.json();
      
      if (getResponse.ok) {
        addLog(`✅ API returnerade ${getResult.data?.length || 0} bilder`);
      } else {
        addLog(`❌ API fel: ${getResult.message}`);
      }

      addLog('🎉 Test slutfört!');

    } catch (error) {
      addLog(`❌ Oväntat fel: ${error}`);
    }
  };

  // Rensa testobjekt
  const cleanup = async () => {
    if (!objektId) {
      addLog('❌ Inget objekt att rensa');
      return;
    }

    addLog('Rensar testobjekt...');
    
    // Ta bort bilder
    await supabase
      .from('property_images')
      .delete()
      .eq('objekt_id', objektId);

    // Ta bort objekt
    const { error } = await supabase
      .from('objekt')
      .delete()
      .eq('id', objektId);

    if (error) {
      addLog(`❌ Fel: ${error.message}`);
    } else {
      addLog('✅ Testobjekt borttaget');
      setObjektId('');
    }
  };

  // Ladda upp din skärmbild
  const uploadScreenshot = async () => {
    addLog('Välj din skärmbild från datorn...');
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      addLog(`Vald fil: ${file.name} (${Math.round(file.size / 1024)} KB)`);

      if (!objektId) {
        // Skapa objekt först
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          addLog('❌ Du måste vara inloggad!');
          return;
        }

        const { data: objekt, error } = await supabase
          .from('objekt')
          .insert({
            maklare_id: user.id,
            typ: 'villa',
            adress: `Skärmbild Test ${Date.now()}`,
            postnummer: '12345',
            ort: 'Stockholm',
            kommun: 'Stockholm',
            lan: 'Stockholms län',
            status: 'till_salu',
            utgangspris: 1000000,
            rum: 3,
            boarea: 100,
            byggaar: 2020,
            beskrivning: 'Test med skärmbild'
          })
          .select()
          .single();

        if (error) {
          addLog(`❌ Fel: ${error.message}`);
          return;
        }

        setObjektId(objekt.id);
        addLog(`✅ Objekt skapat: ${objekt.id}`);
      }

      // Ladda upp
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/properties/${objektId}/images`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        addLog(`✅ Skärmbild uppladdad!`);
        addLog(`   ID: ${result.data?.id}`);
        addLog(`   Path: ${result.data?.path}`);
      } else {
        addLog(`❌ Fel: ${result.message}`);
      }
    };

    input.click();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Bilduppladdning - Direkt Test</h1>
      
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Snabbtest</h2>
        <div className="flex gap-4">
          <button 
            onClick={runFullTest}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            🚀 Kör Komplett Test
          </button>
          
          <button 
            onClick={uploadScreenshot}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            📸 Ladda upp Skärmbild
          </button>

          {objektId && (
            <button 
              onClick={cleanup}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              🗑️ Rensa Test
            </button>
          )}
        </div>
      </div>

      {objektId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm">
            <strong>Aktivt testobjekt:</strong> 
            <code className="ml-2 bg-white px-2 py-1 rounded">{objektId}</code>
          </p>
        </div>
      )}

      <div className="bg-gray-900 text-green-400 rounded-lg p-6 font-mono text-sm">
        <h3 className="text-white font-bold mb-3">📋 Logg:</h3>
        {log.length === 0 ? (
          <p className="text-gray-500">Väntar på test...</p>
        ) : (
          <div className="space-y-1">
            {log.map((line, i) => (
              <div key={i} className={
                line.includes('❌') ? 'text-red-400' :
                line.includes('✅') ? 'text-green-400' :
                line.includes('🎉') ? 'text-yellow-400' :
                'text-gray-300'
              }>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}