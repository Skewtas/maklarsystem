/**
 * useProperties Hook Tests
 * 
 * Tests for the property list management hook including
 * search, filtering, pagination, and creation functionality.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useProperties, usePropertySearch, usePropertyStatistics } from '../useProperties';
import type { 
  PropertyListApiResponse, 
  PropertySearchParams, 
  CreatePropertyData,
  PropertyListItem,
  PropertyStatistics
} from '@/types/property.types';

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
const mockPropertyList: PropertyListItem[] = [
  {
    id: 'property-1',
    slug: 'elegant-3a-strandvagen',
    fastighetsbeteckning: 'Stockholm 1:23',
    propertyType: 'lagenhet',
    status: 'till_salu',
    title: 'Elegant 3:a med havsutsikt på Strandvägen',
    shortDescription: 'Exklusiv lägenhet med fantastisk utsikt över vattnet',
    street: 'Strandvägen 7A',
    city: 'Stockholm',
    postalCode: '11456',
    livingArea: 85,
    rooms: 3.0,
    buildYear: 1925,
    plotArea: null,
    askingPrice: 8500000,
    acceptedPrice: null,
    pricePerSqm: 100000,
    primaryImage: {
      id: 'img-1',
      url: 'https://example.com/image1.jpg',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      caption: 'Vardagsrum',
      isPrimary: true,
      isFloorplan: false,
      displayOrder: 1,
      width: 800,
      height: 600,
      mimeType: 'image/jpeg'
    },
    imageCount: 15,
    publishedAt: new Date('2024-01-15'),
    viewCount: 125,
    isNew: true,
    daysSincePublished: 5,
    formattedPrice: '8 500 000 kr',
    formattedArea: '85 m²',
    formattedRooms: '3 rum'
  },
  {
    id: 'property-2',
    slug: 'rymlig-villa-goteborg',
    fastighetsbeteckning: 'Göteborg 5:44',
    propertyType: 'villa',
    status: 'till_salu',
    title: 'Rymlig villa nära havet',
    shortDescription: 'Charmig villa med trädgård och garage',
    street: 'Oceanvägen 15',
    city: 'Göteborg',
    postalCode: '42633',
    livingArea: 145,
    rooms: 5.0,
    buildYear: 1978,
    plotArea: 800,
    askingPrice: 4200000,
    acceptedPrice: null,
    pricePerSqm: 29000,
    primaryImage: null,
    imageCount: 8,
    publishedAt: new Date('2024-01-10'),
    viewCount: 67,
    isNew: false,
    daysSincePublished: 10,
    formattedPrice: '4 200 000 kr',
    formattedArea: '145 m²',
    formattedRooms: '5 rum'
  }
];

const mockStatistics: PropertyStatistics = {
  totalCount: 156,
  averagePrice: 6850000,
  medianPrice: 5200000,
  priceRange: {
    min: 1200000,
    max: 25000000
  },
  averagePricePerSqm: 65000,
  averageArea: 95,
  areaRange: {
    min: 28,
    max: 350
  },
  propertyTypeDistribution: [
    { type: 'lagenhet', count: 89, percentage: 57 },
    { type: 'villa', count: 45, percentage: 29 },
    { type: 'radhus', count: 22, percentage: 14 }
  ],
  cityDistribution: [
    { city: 'Stockholm', count: 78, percentage: 50 },
    { city: 'Göteborg', count: 45, percentage: 29 },
    { city: 'Malmö', count: 33, percentage: 21 }
  ]
};

const mockApiResponse: PropertyListApiResponse = {
  success: true,
  data: mockPropertyList,
  pagination: {
    currentPage: 1,
    totalPages: 8,
    totalCount: 156,
    hasNextPage: true,
    hasPreviousPage: false,
    pageSize: 20
  },
  statistics: mockStatistics,
  message: 'Fastigheter hämtade'
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

describe('useProperties', () => {
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

  it('should return initial state', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useProperties(), { wrapper });

    expect(result.current.properties).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.pagination).toEqual({
      currentPage: 1,
      totalPages: 0,
      totalCount: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      pageSize: 20
    });
  });

  it('should fetch properties with default parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useProperties(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.properties).toEqual(mockPropertyList);
    expect(result.current.pagination).toEqual(mockApiResponse.pagination);
    expect(result.current.statistics).toEqual(mockStatistics);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/properties?'),
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );
  });

  it('should use initial parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    const initialParams: Partial<PropertySearchParams> = {
      query: 'Stockholm',
      propertyTypes: ['lagenhet'],
      priceMin: 2000000,
      priceMax: 10000000,
      city: 'Stockholm',
      page: 1,
      limit: 10,
      sortBy: 'askingPrice',
      sortOrder: 'asc'
    };

    const wrapper = createWrapper();
    renderHook(() => useProperties(initialParams), { wrapper });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const fetchCall = mockFetch.mock.calls[0];
    const url = new URL(fetchCall[0], 'http://localhost');
    const searchParams = url.searchParams;

    expect(searchParams.get('query')).toBe('Stockholm');
    expect(searchParams.get('propertyTypes')).toBe('lagenhet');
    expect(searchParams.get('priceMin')).toBe('2000000');
    expect(searchParams.get('priceMax')).toBe('10000000');
    expect(searchParams.get('city')).toBe('Stockholm');
    expect(searchParams.get('page')).toBe('1');
    expect(searchParams.get('limit')).toBe('10');
    expect(searchParams.get('sortBy')).toBe('askingPrice');
    expect(searchParams.get('sortOrder')).toBe('asc');
  });

  // ============================================================
  // ERROR HANDLING TESTS
  // ============================================================

  it('should handle API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Kunde inte hämta fastigheter'
      })
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useProperties(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(
      new Error('Kunde inte hämta fastigheter')
    );
    expect(result.current.properties).toEqual([]);
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const wrapper = createWrapper();
    const { result } = renderHook(() => useProperties(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(new Error('Network error'));
  });

  it('should handle invalid response format', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        message: 'Ogiltigt svar från servern'
      })
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useProperties(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(
      new Error('Ogiltigt svar från servern')
    );
  });

  // ============================================================
  // SEARCH AND FILTERING TESTS
  // ============================================================

  it('should update search parameters', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useProperties(), { wrapper });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Clear mock for new search
    mockFetch.mockClear();

    // Update search
    act(() => {
      result.current.search({
        query: 'villa',
        propertyTypes: ['villa'],
        priceMin: 3000000
      });
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const fetchCall = mockFetch.mock.calls[0];
    const url = new URL(fetchCall[0], 'http://localhost');
    const searchParams = url.searchParams;

    expect(searchParams.get('query')).toBe('villa');
    expect(searchParams.get('propertyTypes')).toBe('villa');
    expect(searchParams.get('priceMin')).toBe('3000000');
    expect(searchParams.get('page')).toBe('1'); // Should reset to first page
  });

  it('should reset filters', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProperties({ query: 'Stockholm', priceMin: 5000000 }),
      { wrapper }
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Clear mock for reset
    mockFetch.mockClear();

    // Reset filters
    act(() => {
      result.current.resetFilters();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const fetchCall = mockFetch.mock.calls[0];
    const url = new URL(fetchCall[0], 'http://localhost');
    const searchParams = url.searchParams;

    // Should only have default parameters
    expect(searchParams.get('page')).toBe('1');
    expect(searchParams.get('limit')).toBe('20');
    expect(searchParams.get('sortBy')).toBe('publishedAt');
    expect(searchParams.get('sortOrder')).toBe('desc');
    expect(searchParams.get('query')).toBeNull();
    expect(searchParams.get('priceMin')).toBeNull();
  });

  // ============================================================
  // PAGINATION TESTS
  // ============================================================

  it('should handle page navigation', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useProperties(), { wrapper });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Clear mock for page navigation
    mockFetch.mockClear();

    // Go to page 2
    act(() => {
      result.current.goToPage(2);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const fetchCall = mockFetch.mock.calls[0];
    const url = new URL(fetchCall[0], 'http://localhost');
    expect(url.searchParams.get('page')).toBe('2');
  });

  it('should handle page size changes', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useProperties(), { wrapper });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockFetch.mockClear();

    // Change page size
    act(() => {
      result.current.changePageSize(50);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const fetchCall = mockFetch.mock.calls[0];
    const url = new URL(fetchCall[0], 'http://localhost');
    expect(url.searchParams.get('limit')).toBe('50');
    expect(url.searchParams.get('page')).toBe('1'); // Should reset to first page
  });

  it('should handle sorting changes', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useProperties(), { wrapper });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockFetch.mockClear();

    // Change sorting
    act(() => {
      result.current.changeSorting('askingPrice', 'asc');
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const fetchCall = mockFetch.mock.calls[0];
    const url = new URL(fetchCall[0], 'http://localhost');
    expect(url.searchParams.get('sortBy')).toBe('askingPrice');
    expect(url.searchParams.get('sortOrder')).toBe('asc');
    expect(url.searchParams.get('page')).toBe('1'); // Should reset to first page
  });

  // ============================================================
  // PROPERTY CREATION TESTS
  // ============================================================

  it('should create property successfully', async () => {
    // Setup initial properties fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useProperties(), { wrapper });

    await waitFor(() => {
      expect(result.current.properties).toEqual(mockPropertyList);
    });

    // Setup create response
    const newProperty = { ...mockPropertyList[0], id: 'new-property-id' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          ...newProperty,
          images: []
        }
      })
    });

    const createData: CreatePropertyData = {
      fastighetsbeteckning: 'Malmö 2:15',
      propertyType: 'lagenhet',
      status: 'kommande',
      address: {
        street: 'Testgatan 1',
        city: 'Malmö',
        postalCode: '21145'
      },
      specifications: {
        livingArea: 75,
        rooms: 2.5,
        buildYear: 2020
      },
      pricing: {
        askingPrice: 4500000
      },
      content: {
        title: 'Ny lägenhet',
        fullDescription: 'Beskrivning av ny lägenhet'
      }
    };

    // Create property
    await act(async () => {
      await result.current.createProperty(createData);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/properties',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createData)
      })
    );
  });

  it('should handle create property errors', async () => {
    // Setup initial properties fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useProperties(), { wrapper });

    await waitFor(() => {
      expect(result.current.properties).toEqual(mockPropertyList);
    });

    // Setup create error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Skapande misslyckades'
      })
    });

    const createData: CreatePropertyData = {
      fastighetsbeteckning: 'Invalid',
      propertyType: 'lagenhet',
      status: 'kommande',
      address: { street: 'Test', city: 'Test', postalCode: '12345' },
      specifications: { livingArea: 50, rooms: 1, buildYear: 2020 },
      pricing: { askingPrice: 1000000 },
      content: { title: 'Test', fullDescription: 'Test description' }
    };

    // Create property that fails
    await act(async () => {
      try {
        await result.current.createProperty(createData);
      } catch (error) {
        expect(error).toEqual(new Error('Skapande misslyckades'));
      }
    });

    expect(result.current.createError?.message).toBe('Skapande misslyckades');
  });

  // ============================================================
  // OPTIONS TESTS
  // ============================================================

  it('should respect enabled option', () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse
    });

    const wrapper = createWrapper();
    renderHook(
      () => useProperties({}, { enabled: false }),
      { wrapper }
    );

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should use placeholder data during navigation', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProperties({}, { placeholderData: true }),
      { wrapper }
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Navigate to next page
    act(() => {
      result.current.goToPage(2);
    });

    // Should maintain previous data while loading
    expect(result.current.isPreviousData).toBe(true);
    expect(result.current.properties).toEqual(mockPropertyList);
  });

  // ============================================================
  // REFETCH TESTS
  // ============================================================

  it('should refetch data', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useProperties(), { wrapper });

    await waitFor(() => {
      expect(result.current.properties).toEqual(mockPropertyList);
    });

    // Clear mock and refetch
    mockFetch.mockClear();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockApiResponse,
        data: [...mockPropertyList, { ...mockPropertyList[0], id: 'new-id' }]
      })
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  // ============================================================
  // LOADING STATES TESTS
  // ============================================================

  it('should show combined loading states', async () => {
    // Setup initial load
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useProperties(), { wrapper });

    // Initial loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isCreating).toBe(false);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Setup delayed create response
    let createResolve: (value: any) => void;
    const createPromise = new Promise(resolve => {
      createResolve = resolve;
    });
    mockFetch.mockImplementationOnce(() => createPromise);

    // Start creating
    const createData: CreatePropertyData = {
      fastighetsbeteckning: 'Test 1:1',
      propertyType: 'lagenhet',
      status: 'kommande',
      address: { street: 'Test', city: 'Test', postalCode: '12345' },
      specifications: { livingArea: 50, rooms: 1, buildYear: 2020 },
      pricing: { askingPrice: 1000000 },
      content: { title: 'Test', fullDescription: 'Test description' }
    };

    act(() => {
      result.current.createProperty(createData);
    });

    // Should show creating state
    expect(result.current.isCreating).toBe(true);
    expect(result.current.isLoading).toBe(true); // Combined loading

    // Complete creation
    createResolve({
      ok: true,
      json: async () => ({
        success: true,
        data: { ...mockPropertyList[0], id: 'created-id' }
      })
    });

    await waitFor(() => {
      expect(result.current.isCreating).toBe(false);
    });
  });
});

// ============================================================
// PROPERTY SEARCH HOOK TESTS
// ============================================================

describe('usePropertySearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  it('should only fetch when query has minimum length', () => {
    const wrapper = createWrapper();
    
    // Short query should not fetch
    renderHook(() => usePropertySearch('a'), { wrapper });
    expect(mockFetch).not.toHaveBeenCalled();

    // Empty query should not fetch
    renderHook(() => usePropertySearch(''), { wrapper });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should fetch when query meets minimum length', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    const wrapper = createWrapper();
    renderHook(() => usePropertySearch('Stockholm villa'), { wrapper });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const fetchCall = mockFetch.mock.calls[0];
    const url = new URL(fetchCall[0], 'http://localhost');
    expect(url.searchParams.get('query')).toBe('Stockholm villa');
    expect(url.searchParams.get('limit')).toBe('10'); // Smaller limit for search
  });
});

// ============================================================
// PROPERTY STATISTICS HOOK TESTS
// ============================================================

describe('usePropertyStatistics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  it('should fetch statistics only', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => usePropertyStatistics({ city: 'Stockholm' }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.statistics).toEqual(mockStatistics);
    });

    const fetchCall = mockFetch.mock.calls[0];
    const url = new URL(fetchCall[0], 'http://localhost');
    expect(url.searchParams.get('city')).toBe('Stockholm');
    expect(url.searchParams.get('limit')).toBe('1'); // Minimal data fetch
  });

  it('should handle statistics fetch errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Statistics error'));

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => usePropertyStatistics(),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(new Error('Statistics error'));
    expect(result.current.statistics).toBeUndefined();
  });

  it('should refetch statistics', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => usePropertyStatistics(),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.statistics).toEqual(mockStatistics);
    });

    // Clear and refetch
    mockFetch.mockClear();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockApiResponse,
        statistics: {
          ...mockStatistics,
          totalCount: 200
        }
      })
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});