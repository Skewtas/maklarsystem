'use client';

import { useState, useEffect } from 'react';
import { Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';

export default function TestUploadPage() {
  const [propertyId, setPropertyId] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('objekt')
      .select('id, adress, objektnummer')
      .limit(10)
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setProperties(data);
      setPropertyId(data[0].id);
      fetchImages(data[0].id);
    }
  };

  const fetchImages = async (id: string) => {
    if (!id) return;
    
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/properties/${id}/images`);
      const data = await response.json();

      if (response.ok) {
        setImages(data.images || []);
        setMessage({ 
          type: 'info', 
          text: `Hämtade ${data.images?.length || 0} bilder` 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Kunde inte hämta bilder' 
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Nätverksfel vid hämtning av bilder' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!propertyId) {
      setMessage({ type: 'error', text: 'Välj ett objekt först' });
      return;
    }

    setUploading(true);
    setMessage(null);

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('display_order', '0');
    formData.append('is_primary', 'true');
    formData.append('description', 'Test bild');

    try {
      const response = await fetch(`/api/properties/${propertyId}/images`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Bild uppladdad framgångsrikt!' 
        });
        fetchImages(propertyId);
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Uppladdning misslyckades' 
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Nätverksfel vid uppladdning' 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Vill du ta bort denna bild?')) return;

    try {
      const response = await fetch(
        `/api/properties/${propertyId}/images?imageId=${imageId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Bild borttagen' 
        });
        fetchImages(propertyId);
      } else {
        const data = await response.json();
        setMessage({ 
          type: 'error', 
          text: data.error || 'Kunde inte ta bort bilden' 
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Nätverksfel vid borttagning' 
      });
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🧪 Test Bilduppladdning</h1>

      {/* Status message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-start gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message.type === 'success' && <CheckCircle className="h-5 w-5 mt-0.5" />}
          {message.type === 'error' && <AlertCircle className="h-5 w-5 mt-0.5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Property selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Välj objekt
        </label>
        <select
          value={propertyId}
          onChange={(e) => {
            setPropertyId(e.target.value);
            fetchImages(e.target.value);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">-- Välj objekt --</option>
          {properties.map(prop => (
            <option key={prop.id} value={prop.id}>
              {prop.objektnummer} - {prop.adress}
            </option>
          ))}
        </select>
        <div className="mt-2 text-sm text-gray-600">
          Objekt ID: {propertyId || 'Inget valt'}
        </div>
      </div>

      {/* Upload section */}
      <div className="mb-8 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <label className="cursor-pointer">
            <span className="text-blue-500 hover:text-blue-600 font-medium">
              Välj en bild att ladda upp
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading || !propertyId}
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Max 10MB • JPEG, PNG, WebP
          </p>
          {uploading && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Laddar upp...</span>
            </div>
          )}
        </div>
      </div>

      {/* Images display */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Uppladdade bilder ({images.length})
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                  {image.url ? (
                    <Image
                      src={image.url}
                      alt={image.description || 'Bild'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Ingen bild
                    </div>
                  )}
                </div>
                {image.is_primary && (
                  <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Huvudbild
                  </span>
                )}
                <button
                  onClick={() => handleDelete(image.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Inga bilder uppladdade än</p>
        )}
      </div>

      {/* Debug info */}
      <details className="mt-8">
        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
          Debug Information
        </summary>
        <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto">
          {JSON.stringify({ propertyId, images: images.length, message }, null, 2)}
        </pre>
      </details>
    </div>
  );
}