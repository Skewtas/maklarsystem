/**
 * useProperty Hook - Individual Property Management with React Query
 * 
 * Provides CRUD operations for individual properties with caching,
 * optimistic updates, and error handling.
 */

'use client';

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  Property,
  PropertyApiResponse,
  UpdatePropertyData,
  UsePropertyReturn
} from '@/types/property.types';

// ============================================================
// QUERY KEYS
// ============================================================

export const propertyKeys = {
  all: ['properties'] as const,
  lists: () => [...propertyKeys.all, 'list'] as const,
  list: (filters: string) => [...propertyKeys.lists(), { filters }] as const,
  details: () => [...propertyKeys.all, 'detail'] as const,
  detail: (id: string) => [...propertyKeys.details(), id] as const,
  images: (propertyId: string) => [...propertyKeys.detail(propertyId), 'images'] as const,
  search: (query: string) => [...propertyKeys.all, 'search', { query }] as const
};

// ============================================================
// API FUNCTIONS
// ============================================================

/**
 * Fetch property by ID or slug
 */
async function fetchProperty(id: string): Promise<Property> {
  const response = await fetch(`/api/properties/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Kunde inte hämta fastighet');
  }

  const data: PropertyApiResponse = await response.json();
  
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Ogiltigt svar från servern');
  }

  return data.data;
}

/**
 * Update property data
 */
async function updateProperty(id: string, data: Partial<UpdatePropertyData>): Promise<Property> {
  const response = await fetch(`/api/properties/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Kunde inte uppdatera fastighet');
  }

  const result: PropertyApiResponse = await response.json();
  
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Uppdatering misslyckades');
  }

  return result.data;
}

/**
 * Delete property
 */
async function deleteProperty(id: string): Promise<void> {
  const response = await fetch(`/api/properties/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Kunde inte ta bort fastighet');
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Borttagning misslyckades');
  }
}

/**
 * Increment property view count
 */
async function incrementViewCount(id: string): Promise<void> {
  // This would typically be handled automatically by the GET endpoint
  // when a non-owner views the property
  await fetch(`/api/properties/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// ============================================================
// HOOK IMPLEMENTATION
// ============================================================

/**
 * useProperty - Hook for individual property management
 */
export function useProperty(
  id?: string,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
    gcTime?: number; // formerly cacheTime
    retry?: boolean | number;
    onSuccess?: (data: Property) => void;
    onError?: (error: Error) => void;
  }
): UsePropertyReturn {
  const queryClient = useQueryClient();

  // Query for fetching property data
  const {
    data: property,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: propertyKeys.detail(id || ''),
    queryFn: () => fetchProperty(id!),
    enabled: Boolean(id) && (options?.enabled !== false),
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options?.gcTime ?? 10 * 60 * 1000, // 10 minutes
    retry: options?.retry ?? 1,
    meta: {
      onSuccess: options?.onSuccess,
      onError: options?.onError
    }
  } as UseQueryOptions<Property, Error>);

  // Mutation for updating property
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdatePropertyData> }) =>
      updateProperty(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: propertyKeys.detail(id) });

      // Snapshot previous value
      const previousProperty = queryClient.getQueryData(propertyKeys.detail(id));

      // Optimistically update
      if (previousProperty) {
        queryClient.setQueryData(propertyKeys.detail(id), (old: Property | undefined) => {
          if (!old) return old;
          return { ...old, ...data };
        });
      }

      return { previousProperty };
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousProperty) {
        queryClient.setQueryData(propertyKeys.detail(id), context.previousProperty);
      }
      
      toast.error(error.message || 'Kunde inte uppdatera fastighet');
      options?.onError?.(error as Error);
    },
    onSuccess: (data, { id }) => {
      // Update cache with new data
      queryClient.setQueryData(propertyKeys.detail(id), data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      
      toast.success('Fastighet uppdaterad');
      options?.onSuccess?.(data);
    }
  } as UseMutationOptions<Property, Error, { id: string; data: Partial<UpdatePropertyData> }, { previousProperty: Property | undefined }>);

  // Mutation for deleting property
  const deleteMutation = useMutation({
    mutationFn: deleteProperty,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: propertyKeys.detail(id) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      
      toast.success('Fastighet borttagen');
    },
    onError: (error) => {
      toast.error(error.message || 'Kunde inte ta bort fastighet');
      options?.onError?.(error as Error);
    }
  });

  // Mutation for view count increment (silent)
  const viewMutation = useMutation({
    mutationFn: incrementViewCount,
    onSuccess: (_, id) => {
      // Update view count in cache
      queryClient.setQueryData(propertyKeys.detail(id), (old: Property | undefined) => {
        if (!old || !old.metadata) return old;
        return {
          ...old,
          metadata: {
            ...old.metadata,
            viewCount: old.metadata.viewCount + 1
          }
        };
      });
    },
    // Silent mutation - no error toasts
    onError: () => {
      // Silently handle view count errors
    }
  });

  // Helper functions
  const update = async (data: Partial<UpdatePropertyData>): Promise<Property> => {
    if (!id) {
      throw new Error('Ingen fastighet ID tillgänglig för uppdatering');
    }

    return updateMutation.mutateAsync({ id, data });
  };

  const remove = async (): Promise<void> => {
    if (!id) {
      throw new Error('Ingen fastighet ID tillgänglig för borttagning');
    }

    return deleteMutation.mutateAsync(id);
  };

  const incrementViews = () => {
    if (id) {
      viewMutation.mutate(id);
    }
  };

  return {
    property: property || null,
    isLoading: isLoading || updateMutation.isPending || deleteMutation.isPending,
    isError: isError || updateMutation.isError || deleteMutation.isError,
    error: (error || updateMutation.error || deleteMutation.error) as Error | null,
    refetch,
    update,
    remove,
    incrementViews,
    
    // Mutation states for more granular control
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    updateError: updateMutation.error as Error | null,
    deleteError: deleteMutation.error as Error | null
  };
}

/**
 * usePropertyPrefetch - Prefetch property data
 */
export function usePropertyPrefetch() {
  const queryClient = useQueryClient();

  return {
    prefetchProperty: (id: string) => {
      return queryClient.prefetchQuery({
        queryKey: propertyKeys.detail(id),
        queryFn: () => fetchProperty(id),
        staleTime: 5 * 60 * 1000 // 5 minutes
      });
    },
    
    ensureProperty: (id: string) => {
      return queryClient.ensureQueryData({
        queryKey: propertyKeys.detail(id),
        queryFn: () => fetchProperty(id),
        staleTime: 5 * 60 * 1000
      });
    }
  };
}

/**
 * usePropertyCache - Cache utilities for properties
 */
export function usePropertyCache() {
  const queryClient = useQueryClient();

  return {
    getProperty: (id: string): Property | undefined => {
      return queryClient.getQueryData(propertyKeys.detail(id));
    },
    
    setProperty: (id: string, data: Property) => {
      queryClient.setQueryData(propertyKeys.detail(id), data);
    },
    
    invalidateProperty: (id: string) => {
      return queryClient.invalidateQueries({ queryKey: propertyKeys.detail(id) });
    },
    
    removeProperty: (id: string) => {
      queryClient.removeQueries({ queryKey: propertyKeys.detail(id) });
    },
    
    invalidateAllProperties: () => {
      return queryClient.invalidateQueries({ queryKey: propertyKeys.all });
    }
  };
}