/**
 * useProperties Hook - Property List Management with React Query
 * 
 * Provides search, filtering, pagination, and caching for property lists
 * with Swedish real estate specific functionality.
 */

'use client';

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  keepPreviousData
} from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  PropertyListApiResponse,
  PropertySearchParams, 
  PropertyListItem,
  UsePropertiesReturn,
  PropertyStatistics,
  CreatePropertyData,
  PropertyApiResponse
} from '@/types/property.types';
import { propertyKeys } from './useProperty';

// ============================================================
// API FUNCTIONS
// ============================================================

/**
 * Fetch properties with search and pagination
 */
async function fetchProperties(params: PropertySearchParams & {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<PropertyListApiResponse> {
  const searchParams = new URLSearchParams();

  // Add all parameters to search params
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(','));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const response = await fetch(`/api/properties?${searchParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Kunde inte hämta fastigheter');
  }

  const data: PropertyListApiResponse = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Ogiltigt svar från servern');
  }

  return data;
}

/**
 * Create new property
 */
async function createProperty(data: CreatePropertyData): Promise<PropertyListItem> {
  const response = await fetch('/api/properties', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Kunde inte skapa fastighet');
  }

  const result: PropertyApiResponse = await response.json();
  
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Skapande misslyckades');
  }

  // Transform Property to PropertyListItem (simplified)
  const property = result.data;
  return {
    id: property.id,
    slug: property.slug,
    fastighetsbeteckning: property.fastighetsbeteckning,
    propertyType: property.propertyType,
    status: property.status,
    title: property.content?.title || '',
    shortDescription: property.content?.shortDescription,
    street: property.address?.street || '',
    city: property.address?.city || '',
    postalCode: property.address?.postalCode || '',
    livingArea: property.specifications?.livingArea || 0,
    rooms: property.specifications?.rooms || 0,
    buildYear: property.specifications?.buildYear || 0,
    plotArea: property.specifications?.plotArea,
    askingPrice: property.pricing?.askingPrice || 0,
    acceptedPrice: property.pricing?.acceptedPrice,
    pricePerSqm: property.specifications?.livingArea ? 
      Math.round(property.pricing?.askingPrice || 0 / property.specifications.livingArea) : 0,
    primaryImage: property.images?.find(img => img.isPrimary) || property.images?.[0],
    imageCount: property.images?.length || 0,
    publishedAt: property.metadata?.publishedAt,
    viewCount: property.metadata?.viewCount || 0,
    isNew: property.metadata?.publishedAt ? 
      (Date.now() - property.metadata.publishedAt.getTime()) < 7 * 24 * 60 * 60 * 1000 : false,
    daysSincePublished: property.metadata?.publishedAt ? 
      Math.floor((Date.now() - property.metadata.publishedAt.getTime()) / (24 * 60 * 60 * 1000)) : 0,
    formattedPrice: new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0
    }).format(property.pricing?.askingPrice || 0),
    formattedArea: `${property.specifications?.livingArea || 0} m²`,
    formattedRooms: `${property.specifications?.rooms || 0} rum`
  };
}

// ============================================================
// HOOK IMPLEMENTATION
// ============================================================

/**
 * useProperties - Hook for property list management
 */
export function useProperties(
  initialParams: Partial<PropertySearchParams> = {},
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
    gcTime?: number;
    placeholderData?: boolean;
  }
): UsePropertiesReturn {
  const queryClient = useQueryClient();
  
  // Local state for search parameters
  const [searchParams, setSearchParams] = useState<PropertySearchParams>({
    page: 1,
    limit: 20,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
    ...initialParams
  });

  // Generate query key based on search params
  const queryKey = useMemo(() => {
    const paramsString = JSON.stringify(searchParams);
    return propertyKeys.list(paramsString);
  }, [searchParams]);

  // Query for fetching property list
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isPreviousData
  } = useQuery({
    queryKey,
    queryFn: () => fetchProperties(searchParams),
    enabled: options?.enabled !== false,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    staleTime: options?.staleTime ?? 2 * 60 * 1000, // 2 minutes
    gcTime: options?.gcTime ?? 5 * 60 * 1000, // 5 minutes
    placeholderData: options?.placeholderData ? keepPreviousData : undefined
  });

  // Mutation for creating new property
  const createMutation = useMutation({
    mutationFn: createProperty,
    onSuccess: (newProperty) => {
      // Add to cache optimistically
      queryClient.setQueryData(queryKey, (old: PropertyListApiResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: [newProperty, ...old.data],
          pagination: {
            ...old.pagination,
            totalCount: old.pagination.totalCount + 1
          }
        };
      });

      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      
      toast.success('Fastighet skapad');
    },
    onError: (error) => {
      toast.error(error.message || 'Kunde inte skapa fastighet');
    }
  });

  // Helper functions
  const search = (newParams: Partial<PropertySearchParams>) => {
    setSearchParams(prev => ({
      ...prev,
      ...newParams,
      page: newParams.page ?? 1 // Reset to first page unless explicitly set
    }));
  };

  const resetFilters = () => {
    setSearchParams({
      page: 1,
      limit: searchParams.limit,
      sortBy: 'publishedAt',
      sortOrder: 'desc'
    });
  };

  const goToPage = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  };

  const changePageSize = (limit: number) => {
    setSearchParams(prev => ({ 
      ...prev, 
      limit, 
      page: 1 // Reset to first page when changing page size
    }));
  };

  const changeSorting = (sortBy: string, sortOrder: 'asc' | 'desc' = 'desc') => {
    setSearchParams(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
  };

  const createProperty = async (data: CreatePropertyData): Promise<PropertyListItem> => {
    return createMutation.mutateAsync(data);
  };

  return {
    // Data
    properties: response?.data || [],
    pagination: response?.pagination || {
      currentPage: 1,
      totalPages: 0,
      totalCount: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      pageSize: 20
    },
    filters: searchParams,
    statistics: response?.statistics,
    
    // State
    isLoading: isLoading || createMutation.isPending,
    isError: isError || createMutation.isError,
    error: (error || createMutation.error) as Error | null,
    isPreviousData,
    
    // Actions
    refetch,
    search,
    resetFilters,
    createProperty,
    
    // Pagination helpers
    goToPage,
    changePageSize,
    changeSorting,
    
    // Mutation states
    isCreating: createMutation.isPending,
    createError: createMutation.error as Error | null
  };
}

/**
 * usePropertySearch - Simplified hook for search functionality
 */
export function usePropertySearch(
  query?: string,
  filters?: Partial<PropertySearchParams>
) {
  return useProperties(
    {
      query,
      ...filters,
      limit: 10 // Smaller limit for search
    },
    {
      enabled: Boolean(query && query.length >= 2),
      staleTime: 1 * 60 * 1000, // 1 minute
      placeholderData: false
    }
  );
}

/**
 * useInfiniteProperties - Infinite scroll properties
 */
export function useInfiniteProperties(
  params: Partial<PropertySearchParams> = {}
) {
  // This would use useInfiniteQuery for infinite scroll
  // Implementation would be similar but with cursor-based pagination
  // For now, return the regular useProperties hook
  return useProperties(params);
}

/**
 * usePropertyStatistics - Property statistics only
 */
export function usePropertyStatistics(
  filters?: Partial<PropertySearchParams>
): {
  statistics: PropertyStatistics | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const queryClient = useQueryClient();
  
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...propertyKeys.lists(), 'stats', JSON.stringify(filters || {})],
    queryFn: () => fetchProperties({ 
      ...filters, 
      limit: 1 // Just get statistics, minimal data
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => data.statistics
  });

  return {
    statistics: data,
    isLoading,
    isError,
    error: error as Error | null,
    refetch
  };
}