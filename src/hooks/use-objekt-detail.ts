'use client';

import { useState, useEffect } from 'react';
import { Objekt, ObjektHistorik } from '@/types/objekt';

interface UseObjektDetailOptions {
  objektId: string;
  includeHistory?: boolean;
}

interface UseObjektDetailReturn {
  objekt: Objekt | null;
  historik: ObjektHistorik[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useObjektDetail({ 
  objektId, 
  includeHistory = false 
}: UseObjektDetailOptions): UseObjektDetailReturn {
  const [objekt, setObjekt] = useState<Objekt | null>(null);
  const [historik, setHistorik] = useState<ObjektHistorik[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchObjekt = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/objekt/${objektId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Objektet kunde inte hittas');
        }
        throw new Error('Ett fel uppstod när objektet skulle hämtas');
      }

      const data = await response.json();
      setObjekt(data.objekt);

      if (includeHistory && data.historik) {
        setHistorik(data.historik);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett oväntat fel uppstod');
      setObjekt(null);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchObjekt();
  };

  useEffect(() => {
    if (objektId) {
      fetchObjekt();
    }
  }, [objektId, includeHistory]);

  return {
    objekt,
    historik,
    loading,
    error,
    refetch,
  };
}