/**
 * useProperty Hook Tests
 * 
 * Tests for the individual property management hook including
 * CRUD operations, caching, optimistic updates, and error handling.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useProperty } from '../useProperty';
import type { Property, UpdatePropertyData } from '@/types/property.types';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock fetch
const mockFetch = jest.fn();
// @ts-expect-error override global for tests
global.fetch = mockFetch;

// Test data
const mockProperty: Property = {
  id: 'test-property-id',
  slug: 'elegant-3a-strandvagen',
  fastighetsbeteckning: 'Stockholm 1:23',
  propertyType: 'lagenhet',
  status: 'till_salu',
  address: {
    street: 'Strandvägen 7A',
    city: 'Stockholm',
    postalCode: '11456',
    municipality: 'Stockholm',
    county: 'Stockholm',
    coordinates: {
      lat: 59.3293,
      lng: 18.0686
    }
  },
  specifications: {
    livingArea: 85,
    totalArea: 95,
    plotArea: null,
    rooms: 3.0,
    bedrooms: 2,
    bathrooms: 1,
    buildYear: 1925,
    floor: 4,
    floors: 6,
    hasElevator: true,
    hasBalcony: true,
    hasGarden: false,
    hasParking: false,
    energyClass: 'C',
    heatingType: 'fjärrvärme'
  },
  pricing: {
    askingPrice: 8500000,
    acceptedPrice: null,
    monthlyFee: 4200,
    operatingCost: 1500,
    propertyTax: 12000
  },
  content: {
    title: 'Elegant 3:a med havsutsikt på Strandvägen',
    shortDescription: 'Exklusiv lägenhet med fantastisk utsikt över vattnet',
    fullDescription: 'Välkommen till denna exklusiva 3-rumslägenhet på den prestigefulla Strandvägen.',
    features: ['balkong', 'hiss', 'renoverad', 'havsutsikt']
  },
  images: [],
  metadata: {
    publishedAt: new Date('2024-01-15'),
    viewCount: 125,
    favoriteCount: 8,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'user-123',
    updatedBy: 'user-123'
  }
};

// Create wrapper component for React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0
      },
      mutations: {
        retry: false
      }
    },
    logger: {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('useProperty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================================
  // BASIC HOOK BEHAVIOR TESTS
  // ============================================================

  it('should return initial state when no id provided', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useProperty(), { wrapper });

    expect(result.current.property).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should return initial state with disabled query when enabled is false', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProperty('test-id', { enabled: false }),
      { wrapper }
    );

    expect(result.current.property).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // ============================================================
  // FETCH PROPERTY TESTS
  // ============================================================

  it('should fetch property successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockProperty
      })
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProperty('test-property-id'),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.property).toEqual(mockProperty);
    expect(result.current.isError).toBe(false);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/properties/test-property-id',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );
  });

  it('should handle fetch errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Fastighet hittades inte'
      })
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProperty('nonexistent-id'),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(
      new Error('Fastighet hittades inte')
    );
    expect(result.current.property).toBeNull();
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProperty('test-property-id'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(new Error('Network error'));
  });

  it('should handle invalid API response format', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        message: 'Ogiltigt svar från servern'
      })
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProperty('test-property-id'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(
      new Error('Ogiltigt svar från servern')
    );
  });

  // ============================================================
  // UPDATE PROPERTY TESTS
  // ============================================================

  it('should update property successfully', async () => {
    // Setup initial property fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockProperty
      })
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProperty('test-property-id'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.property).toEqual(mockProperty);
    });

    // Setup update response
    const updatedProperty = {
      ...mockProperty,
      pricing: {
        ...mockProperty.pricing,
        askingPrice: 9000000
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: updatedProperty
      })
    });

    const updateData: Partial<UpdatePropertyData> = {
      pricing: {
        askingPrice: 9000000
      }
    };

    // Perform update
    await act(async () => {
      await result.current.update(updateData);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/properties/test-property-id',
      expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })
    );

    expect(result.current.property?.pricing?.askingPrice).toBe(9000000);
  });

  it('should handle update errors with rollback', async () => {
    // Setup initial property fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockProperty
      })
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProperty('test-property-id'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.property).toEqual(mockProperty);
    });

    // Setup update error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Uppdatering misslyckades'
      })
    });

    const updateData = {
      pricing: { askingPrice: 9000000 }
    };

    // Perform update that fails
    await act(async () => {
      try {
        await result.current.update(updateData);
      } catch (error) {
        // Expected to throw
      }
    });

    // Property should be rolled back to original state
    expect(result.current.property).toEqual(mockProperty);
    expect(result.current.updateError?.message).toBe('Uppdatering misslyckades');
  });

  it('should show optimistic updates', async () => {
    // Setup initial property fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockProperty
      })
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProperty('test-property-id'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.property).toEqual(mockProperty);
    });

    // Setup delayed update response
    mockFetch.mockImplementationOnce(
      () => new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              ...mockProperty,
              pricing: {
                ...mockProperty.pricing,
                askingPrice: 9000000
              }
            }
          })
        }), 100)
      )
    );

    const updateData = {
      pricing: { askingPrice: 9000000 }
    };

    // Start update
    act(() => {
      result.current.update(updateData);
    });

    // Should show optimistic update immediately
    await waitFor(() => {
      expect(result.current.property?.pricing?.askingPrice).toBe(9000000);
    });
  });

  it('should throw error when updating without property id', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useProperty(), { wrapper });

    await expect(result.current.update({})).rejects.toThrow(
      'Ingen fastighet ID tillgänglig för uppdatering'
    );
  });

  // ============================================================
  // DELETE PROPERTY TESTS
  // ============================================================

  it('should delete property successfully', async () => {
    // Setup initial property fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockProperty
      })
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProperty('test-property-id'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.property).toEqual(mockProperty);
    });

    // Setup delete response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true
      })
    });

    // Perform delete
    await act(async () => {
      await result.current.remove();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/properties/test-property-id',
      expect.objectContaining({
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );
  });

  it('should handle delete errors', async () => {
    // Setup initial property fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockProperty
      })
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProperty('test-property-id'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.property).toEqual(mockProperty);
    });

    // Setup delete error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Borttagning misslyckades'
      })
    });

    // Perform delete that fails
    await act(async () => {
      try {
        await result.current.remove();
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.deleteError?.message).toBe('Borttagning misslyckades');
  });

  it('should throw error when deleting without property id', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useProperty(), { wrapper });

    await expect(result.current.remove()).rejects.toThrow(
      'Ingen fastighet ID tillgänglig för borttagning'
    );
  });

  // ============================================================
  // VIEW COUNT TESTS
  // ============================================================

  it('should increment view count silently', async () => {
    // Setup initial property fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockProperty
      })
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProperty('test-property-id'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.property).toEqual(mockProperty);
    });

    // Setup view count response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockProperty
      })
    });

    // Increment views
    act(() => {
      result.current.incrementViews();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/properties/test-property-id',
      expect.objectContaining({
        method: 'GET'
      })
    );
  });

  it('should handle view count errors silently', async () => {
    // Setup initial property fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockProperty
      })
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProperty('test-property-id'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.property).toEqual(mockProperty);
    });

    // Setup view count error
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    // Increment views - should not throw
    act(() => {
      result.current.incrementViews();
    });

    // Should not affect the property state
    expect(result.current.property).toEqual(mockProperty);
    expect(result.current.isError).toBe(false);
  });

  // ============================================================
  // REFETCH TESTS
  // ============================================================

  it('should refetch property data', async () => {
    // Setup initial property fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockProperty
      })
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProperty('test-property-id'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.property).toEqual(mockProperty);
    });

    // Clear mock and setup refetch response
    mockFetch.mockClear();
    const updatedProperty = {
      ...mockProperty,
      metadata: {
        ...mockProperty.metadata,
        viewCount: 150
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: updatedProperty
      })
    });

    // Refetch
    await act(async () => {
      await result.current.refetch();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result.current.property?.metadata?.viewCount).toBe(150);
  });

  // ============================================================
  // LOADING STATES TESTS
  // ============================================================

  it('should show correct loading states', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProperty('test-property-id'),
      { wrapper }
    );

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.isDeleting).toBe(false);

    // Setup response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockProperty
      })
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.property).toEqual(mockProperty);
  });

  it('should show updating state during update', async () => {
    // Setup initial property fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockProperty
      })
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProperty('test-property-id'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.property).toEqual(mockProperty);
    });

    // Setup delayed update response
    let updateResolve: (value: any) => void;
    const updatePromise = new Promise(resolve => {
      updateResolve = resolve;
    });

    mockFetch.mockImplementationOnce(() => updatePromise);

    // Start update
    act(() => {
      result.current.update({ pricing: { askingPrice: 9000000 } });
    });

    // Should show updating state
    expect(result.current.isUpdating).toBe(true);
    expect(result.current.isLoading).toBe(true); // Combined loading state

    // Complete update
    updateResolve({
      ok: true,
      json: async () => ({
        success: true,
        data: mockProperty
      })
    });

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false);
    });
  });

  // ============================================================
  // OPTIONS AND CALLBACKS TESTS
  // ============================================================

  it('should call success callback on successful fetch', async () => {
    const onSuccess = jest.fn();
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockProperty
      })
    });

    const wrapper = createWrapper();
    renderHook(
      () => useProperty('test-property-id', { onSuccess }),
      { wrapper }
    );

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockProperty);
    });
  });

  it('should call error callback on fetch error', async () => {
    const onError = jest.fn();
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Test error'
      })
    });

    const wrapper = createWrapper();
    renderHook(
      () => useProperty('test-property-id', { onError }),
      { wrapper }
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(new Error('Test error'));
    });
  });

  it('should respect staleTime option', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockProperty
      })
    });

    const wrapper = createWrapper();
    const { rerender } = renderHook(
      ({ staleTime }) => useProperty('test-property-id', { staleTime }),
      { 
        wrapper,
        initialProps: { staleTime: 30000 }
      }
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Clear mock and rerender with same id - should not refetch due to staleTime
    mockFetch.mockClear();
    rerender({ staleTime: 30000 });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should respect retry option', async () => {
    // Setup to fail first call, succeed second
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockProperty
        })
      });

    const wrapper = createWrapper();
    renderHook(
      () => useProperty('test-property-id', { retry: 1 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});