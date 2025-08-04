import { useEffect, useState } from 'react';
import { csrfHelpers } from '@/lib/security/csrf';

export interface UseCSRFOptions {
  cookieName?: string;
  metaName?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export interface CSRFHook {
  token: string | null;
  loading: boolean;
  error: Error | null;
  refreshToken: () => Promise<void>;
  getHeaders: () => HeadersInit;
  addToFormData: (formData: FormData) => void;
}

/**
 * React hook for CSRF token management
 */
export function useCSRF(options: UseCSRFOptions = {}): CSRFHook {
  const {
    cookieName = 'csrf-token',
    metaName = 'csrf-token',
    autoRefresh = true,
    refreshInterval = 50 * 60 * 1000, // 50 minutes default
  } = options;

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch CSRF token
  const fetchToken = async () => {
    try {
      // First try to get from cookie (double-submit pattern)
      let newToken = csrfHelpers.getTokenFromCookie(cookieName);
      
      // If not in cookie, try meta tag
      if (!newToken) {
        newToken = csrfHelpers.getTokenFromMeta(metaName);
      }
      
      // If still not found, request from server
      if (!newToken) {
        const response = await fetch('/api/csrf-token', {
          method: 'GET',
          credentials: 'same-origin',
        });
        
        if (response.ok) {
          const data = await response.json();
          newToken = data.token;
        }
      }
      
      setToken(newToken);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch CSRF token:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchToken();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !token) return;

    const intervalId = setInterval(() => {
      fetchToken();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, token]);

  // Refresh token manually
  const refreshToken = async () => {
    setLoading(true);
    await fetchToken();
  };

  // Get headers with CSRF token
  const getHeaders = (): HeadersInit => {
    if (!token) {
      console.warn('CSRF token not available');
      return {};
    }
    return csrfHelpers.createHeaders(token);
  };

  // Add token to FormData
  const addToFormData = (formData: FormData): void => {
    if (!token) {
      console.warn('CSRF token not available');
      return;
    }
    csrfHelpers.addTokenToFormData(formData, token);
  };

  return {
    token,
    loading,
    error,
    refreshToken,
    getHeaders,
    addToFormData,
  };
}

/**
 * React Hook Form integration helper
 */
export function useCSRFField() {
  const { token } = useCSRF();
  
  return {
    name: 'csrfToken',
    value: token || '',
    type: 'hidden' as const,
  };
}

/**
 * Fetch wrapper with CSRF token
 */
export function useSecureFetch() {
  const { token, getHeaders } = useCSRF();

  const secureFetch = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    if (!token) {
      throw new Error('CSRF token not available');
    }

    const secureOptions: RequestInit = {
      ...options,
      credentials: 'same-origin',
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    };

    return fetch(url, secureOptions);
  };

  return {
    fetch: secureFetch,
    ready: !!token,
  };
}