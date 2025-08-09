/**
 * usePropertyForm Hook Tests
 * 
 * Tests for the multi-step property form management hook including
 * form state, validation, auto-save, step navigation, and submission.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { usePropertyForm } from '../usePropertyForm';
import type { CreatePropertyData, Property } from '@/types/property.types';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock useProperty hook
const mockUpdateProperty = jest.fn();
jest.mock('../useProperty', () => ({
  useProperty: jest.fn(() => ({
    property: null,
    update: mockUpdateProperty,
    isLoading: false,
    isError: false,
    error: null
  }))
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Test data
const validFormData: CreatePropertyData = {
  fastighetsbeteckning: 'Stockholm 1:23',
  propertyType: 'lagenhet',
  status: 'kommande',
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
    fullDescription: 'Välkommen till denna exklusiva 3-rumslägenhet på den prestigefulla Strandvägen. Lägenheten erbjuder en fantastisk utsikt över vattnet och har genomgått en smakfull renovering med höga kvalitetsval.',
    features: ['balkong', 'hiss', 'renoverad', 'havsutsikt']
  }
};

const mockProperty: Property = {
  id: 'existing-property-id',
  slug: 'elegant-3a-strandvagen',
  fastighetsbeteckning: validFormData.fastighetsbeteckning,
  propertyType: validFormData.propertyType,
  status: validFormData.status,
  address: validFormData.address!,
  specifications: validFormData.specifications!,
  pricing: validFormData.pricing!,
  content: validFormData.content!,
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

describe('usePropertyForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});
    mockLocalStorage.removeItem.mockImplementation(() => {});
    
    // Reset useProperty mock
    const { useProperty } = require('../useProperty');
    useProperty.mockReturnValue({
      property: null,
      update: mockUpdateProperty,
      isLoading: false,
      isError: false,
      error: null
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================================
  // BASIC HOOK INITIALIZATION TESTS
  // ============================================================

  it('should initialize with default form state', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePropertyForm(), { wrapper });

    expect(result.current.formState.currentStep).toBe(0);
    expect(result.current.formState.totalSteps).toBe(6);
    expect(result.current.steps).toHaveLength(6);
    expect(result.current.steps[0].id).toBe('basic');
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.canSubmit).toBe(false);
  });

  it('should initialize with provided initial data', () => {
    const wrapper = createWrapper();
    const initialData: Partial<CreatePropertyData> = {
      propertyType: 'villa',
      status: 'till_salu',
      address: {
        city: 'Stockholm'
      }
    };

    const { result } = renderHook(
      () => usePropertyForm(undefined, initialData),
      { wrapper }
    );

    expect(result.current.formState.data.propertyType).toBe('villa');
    expect(result.current.formState.data.status).toBe('till_salu');
    expect(result.current.formState.data.address?.city).toBe('Stockholm');
  });

  it('should initialize in editing mode with existing property', () => {
    const wrapper = createWrapper();
    
    // Mock useProperty to return existing property
    const { useProperty } = require('../useProperty');
    useProperty.mockReturnValue({
      property: mockProperty,
      update: mockUpdateProperty,
      isLoading: false,
      isError: false,
      error: null
    });

    const { result } = renderHook(
      () => usePropertyForm('existing-property-id'),
      { wrapper }
    );

    expect(result.current.formState.data.fastighetsbeteckning)
      .toBe(mockProperty.fastighetsbeteckning);
    expect(result.current.formState.data.propertyType)
      .toBe(mockProperty.propertyType);
  });

  // ============================================================
  // STEP NAVIGATION TESTS
  // ============================================================

  it('should navigate between steps', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePropertyForm(), { wrapper });

    expect(result.current.formState.currentStep).toBe(0);

    // Go to next step
    act(() => {
      result.current.nextStep();
    });

    expect(result.current.formState.currentStep).toBe(1);

    // Go to specific step
    act(() => {
      result.current.goToStep(3);
    });

    expect(result.current.formState.currentStep).toBe(3);

    // Go to previous step
    act(() => {
      result.current.previousStep();
    });

    expect(result.current.formState.currentStep).toBe(2);
  });

  it('should not navigate beyond step boundaries', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePropertyForm(), { wrapper });

    // Try to go to step -1
    act(() => {
      result.current.goToStep(-1);
    });

    expect(result.current.formState.currentStep).toBe(0);

    // Try to go beyond last step
    act(() => {
      result.current.goToStep(10);
    });

    expect(result.current.formState.currentStep).toBe(0);

    // Go to last step and try next
    act(() => {
      result.current.goToStep(5);
    });

    expect(result.current.formState.currentStep).toBe(5);

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.formState.currentStep).toBe(5); // Should stay at last step
  });

  it('should call onStepChange callback', () => {
    const onStepChange = jest.fn();
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => usePropertyForm(undefined, undefined, { onStepChange }),
      { wrapper }
    );

    act(() => {
      result.current.nextStep();
    });

    expect(onStepChange).toHaveBeenCalledWith(1);

    act(() => {
      result.current.goToStep(3);
    });

    expect(onStepChange).toHaveBeenCalledWith(3);
  });

  // ============================================================
  // FORM DATA MANAGEMENT TESTS
  // ============================================================

  it('should update form fields', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePropertyForm(), { wrapper });

    act(() => {
      result.current.updateField('fastighetsbeteckning', 'Stockholm 2:45');
    });

    expect(result.current.formState.data.fastighetsbeteckning).toBe('Stockholm 2:45');

    act(() => {
      result.current.updateField('address.city', 'Göteborg');
    });

    expect(result.current.formState.data.address?.city).toBe('Göteborg');
  });

  it('should validate individual steps', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePropertyForm(), { wrapper });

    // Fill basic step with valid data
    act(() => {
      result.current.updateField('fastighetsbeteckning', 'Stockholm 1:23');
      result.current.updateField('propertyType', 'lagenhet');
      result.current.updateField('status', 'till_salu');
    });

    // Validate basic step (step 0)
    let isValid: boolean;
    act(() => {
      isValid = result.current.validateStep(0);
    });

    expect(isValid).toBe(true);

    // Test invalid data
    act(() => {
      result.current.updateField('fastighetsbeteckning', 'invalid format');
    });

    act(() => {
      isValid = result.current.validateStep(0);
    });

    expect(isValid).toBe(false);
  });

  it('should validate all steps', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => usePropertyForm(undefined, validFormData),
      { wrapper }
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validateAll();
    });

    expect(isValid).toBe(true);
  });

  // ============================================================
  // AUTO-SAVE TESTS
  // ============================================================

  it('should save to localStorage automatically', async () => {
    jest.useFakeTimers();
    
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => usePropertyForm(undefined, undefined, { 
        enableAutoSave: true, 
        autoSaveInterval: 1000 
      }),
      { wrapper }
    );

    // Update form field
    act(() => {
      result.current.updateField('fastighetsbeteckning', 'Stockholm 1:23');
    });

    // Fast-forward timer to trigger auto-save
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'property-form-new',
        expect.stringContaining('Stockholm 1:23')
      );
    });

    jest.useRealTimers();
  });

  it('should load from localStorage on initialization', () => {
    const savedData = {
      fastighetsbeteckning: 'Saved Property',
      propertyType: 'villa'
    };

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedData));

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => usePropertyForm(undefined, undefined, { enableAutoSave: true }),
      { wrapper }
    );

    expect(result.current.formState.data.fastighetsbeteckning)
      .toBe('Saved Property');
    expect(result.current.formState.data.propertyType).toBe('villa');
  });

  it('should disable auto-save when option is false', () => {
    jest.useFakeTimers();

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => usePropertyForm(undefined, undefined, { enableAutoSave: false }),
      { wrapper }
    );

    act(() => {
      result.current.updateField('fastighetsbeteckning', 'Stockholm 1:23');
    });

    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('should manually save draft', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePropertyForm(), { wrapper });

    act(() => {
      result.current.updateField('fastighetsbeteckning', 'Stockholm 1:23');
    });

    await act(async () => {
      await result.current.saveDraft();
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'property-form-new',
      expect.stringContaining('Stockholm 1:23')
    );
  });

  // ============================================================
  // FORM SUBMISSION TESTS
  // ============================================================

  it('should submit form for editing existing property', async () => {
    const wrapper = createWrapper();
    
    // Mock successful update
    mockUpdateProperty.mockResolvedValueOnce(mockProperty);

    // Mock useProperty to return existing property
    const { useProperty } = require('../useProperty');
    useProperty.mockReturnValue({
      property: mockProperty,
      update: mockUpdateProperty,
      isLoading: false,
      isError: false,
      error: null
    });

    const onSubmitSuccess = jest.fn();
    const { result } = renderHook(
      () => usePropertyForm('existing-property-id', undefined, {
        onSubmitSuccess
      }),
      { wrapper }
    );

    // Update some data
    act(() => {
      result.current.updateField('pricing.askingPrice', 9000000);
    });

    await act(async () => {
      await result.current.submitForm();
    });

    expect(mockUpdateProperty).toHaveBeenCalledWith(
      expect.objectContaining({
        pricing: expect.objectContaining({
          askingPrice: 9000000
        })
      })
    );

    expect(onSubmitSuccess).toHaveBeenCalledWith(mockProperty);
  });

  it('should handle form submission errors', async () => {
    const wrapper = createWrapper();
    
    // Mock update error
    const updateError = new Error('Uppdatering misslyckades');
    mockUpdateProperty.mockRejectedValueOnce(updateError);

    // Mock useProperty to return existing property
    const { useProperty } = require('../useProperty');
    useProperty.mockReturnValue({
      property: mockProperty,
      update: mockUpdateProperty,
      isLoading: false,
      isError: false,
      error: null
    });

    const onSubmitError = jest.fn();
    const { result } = renderHook(
      () => usePropertyForm('existing-property-id', undefined, {
        onSubmitError
      }),
      { wrapper }
    );

    await act(async () => {
      try {
        await result.current.submitForm();
      } catch (error) {
        // Expected to throw
      }
    });

    expect(onSubmitError).toHaveBeenCalledWith(updateError);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should clear localStorage after successful submission', async () => {
    const wrapper = createWrapper();
    
    mockUpdateProperty.mockResolvedValueOnce(mockProperty);

    const { useProperty } = require('../useProperty');
    useProperty.mockReturnValue({
      property: mockProperty,
      update: mockUpdateProperty,
      isLoading: false,
      isError: false,
      error: null
    });

    const { result } = renderHook(
      () => usePropertyForm('existing-property-id', undefined, {
        enableAutoSave: true
      }),
      { wrapper }
    );

    await act(async () => {
      await result.current.submitForm();
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      'property-form-existing-property-id'
    );
  });

  it('should prevent submission for new properties', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePropertyForm(), { wrapper });

    await act(async () => {
      try {
        await result.current.submitForm();
        expect(true).toBe(false); // Should not reach this line
      } catch (error) {
        expect(error).toEqual(
          new Error('Skapande av nya fastigheter implementeras senare')
        );
      }
    });
  });

  // ============================================================
  // FORM RESET TESTS
  // ============================================================

  it('should reset form to initial state', () => {
    const wrapper = createWrapper();
    const initialData = { propertyType: 'villa' as const };
    const { result } = renderHook(
      () => usePropertyForm(undefined, initialData),
      { wrapper }
    );

    // Modify form data
    act(() => {
      result.current.updateField('fastighetsbeteckning', 'Stockholm 1:23');
      result.current.goToStep(3);
    });

    expect(result.current.formState.currentStep).toBe(3);
    expect(result.current.formState.data.fastighetsbeteckning).toBe('Stockholm 1:23');

    // Reset form
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formState.currentStep).toBe(0);
    expect(result.current.formState.data.propertyType).toBe('villa');
    expect(result.current.formState.data.fastighetsbeteckning).toBeUndefined();
  });

  it('should clear localStorage on reset', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => usePropertyForm(undefined, undefined, { enableAutoSave: true }),
      { wrapper }
    );

    act(() => {
      result.current.resetForm();
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('property-form-new');
  });

  // ============================================================
  // STEP CONFIGURATION TESTS
  // ============================================================

  it('should have correct step configuration', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePropertyForm(), { wrapper });

    const steps = result.current.steps;

    expect(steps).toHaveLength(6);

    // Check basic step
    expect(steps[0]).toMatchObject({
      id: 'basic',
      title: 'Grundinformation',
      isRequired: true,
      canSkip: false
    });

    // Check location step
    expect(steps[1]).toMatchObject({
      id: 'location',
      title: 'Adress',
      isRequired: true,
      canSkip: false
    });

    // Check images step (should be optional)
    expect(steps[5]).toMatchObject({
      id: 'images',
      title: 'Bilder',
      isRequired: false,
      canSkip: true
    });
  });

  it('should update step validation status', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePropertyForm(), { wrapper });

    // Initially steps should be invalid (except optional ones)
    expect(result.current.steps[0].isValid).toBe(false); // basic - required
    expect(result.current.steps[5].isValid).toBe(true);  // images - optional

    // Fill basic step
    act(() => {
      result.current.updateField('fastighetsbeteckning', 'Stockholm 1:23');
      result.current.updateField('propertyType', 'lagenhet');
      result.current.updateField('status', 'till_salu');
    });

    // Basic step should now be valid
    expect(result.current.steps[0].isValid).toBe(true);
  });

  // ============================================================
  // CURRENT STEP DATA TESTS
  // ============================================================

  it('should provide current step data', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePropertyForm(), { wrapper });

    // Fill some basic data
    act(() => {
      result.current.updateField('fastighetsbeteckning', 'Stockholm 1:23');
      result.current.updateField('propertyType', 'lagenhet');
    });

    const currentStepData = result.current.currentStepData;
    expect(currentStepData).toMatchObject({
      fastighetsbeteckning: 'Stockholm 1:23',
      propertyType: 'lagenhet'
    });

    // Go to location step
    act(() => {
      result.current.goToStep(1);
      result.current.updateField('address.street', 'Testgatan 1');
      result.current.updateField('address.city', 'Stockholm');
    });

    const locationStepData = result.current.currentStepData;
    expect(locationStepData).toMatchObject({
      address: {
        street: 'Testgatan 1',
        city: 'Stockholm'
      }
    });
  });

  // ============================================================
  // FORM VALIDATION INTEGRATION TESTS
  // ============================================================

  it('should integrate with form validation properly', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePropertyForm(), { wrapper });

    // canSubmit should be false initially
    expect(result.current.canSubmit).toBe(false);

    // Fill form with valid data
    act(() => {
      // Basic step
      result.current.updateField('fastighetsbeteckning', 'Stockholm 1:23');
      result.current.updateField('propertyType', 'lagenhet');
      result.current.updateField('status', 'till_salu');

      // Location step
      result.current.updateField('address.street', 'Strandvägen 7A');
      result.current.updateField('address.city', 'Stockholm');
      result.current.updateField('address.postalCode', '11456');

      // Specifications
      result.current.updateField('specifications.livingArea', 85);
      result.current.updateField('specifications.rooms', 3.0);
      result.current.updateField('specifications.buildYear', 1925);

      // Pricing
      result.current.updateField('pricing.askingPrice', 8500000);

      // Content
      result.current.updateField('content.title', 'Test title');
      result.current.updateField('content.fullDescription', 'A'.repeat(60));
    });

    // Now form should be valid and submittable
    expect(result.current.canSubmit).toBe(true);
  });

  // ============================================================
  // ERROR HANDLING TESTS
  // ============================================================

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage to throw errors
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Storage full');
    });

    jest.useFakeTimers();

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => usePropertyForm(undefined, undefined, { enableAutoSave: true }),
      { wrapper }
    );

    // Should not crash when localStorage fails
    act(() => {
      result.current.updateField('fastighetsbeteckning', 'Stockholm 1:23');
    });

    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // Form should still function
    expect(result.current.formState.data.fastighetsbeteckning).toBe('Stockholm 1:23');

    jest.useRealTimers();
  });

  it('should handle malformed localStorage data', () => {
    // Mock invalid JSON in localStorage
    mockLocalStorage.getItem.mockReturnValue('invalid json {');

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => usePropertyForm(undefined, undefined, { enableAutoSave: true }),
      { wrapper }
    );

    // Should fallback to default values
    expect(result.current.formState.data.status).toBe('kommande');
  });

  // ============================================================
  // CLEANUP TESTS
  // ============================================================

  it('should cleanup timers on unmount', () => {
    jest.useFakeTimers();
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout' as any);

    const wrapper = createWrapper();
    const { result, unmount } = renderHook(
      () => usePropertyForm(undefined, undefined, { enableAutoSave: true }),
      { wrapper }
    );

    // Trigger auto-save timer
    act(() => {
      result.current.updateField('fastighetsbeteckning', 'Stockholm 1:23');
    });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();

    jest.useRealTimers();
    clearTimeoutSpy.mockRestore();
  });
});