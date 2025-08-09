/**
 * usePropertyForm Hook - Multi-step Property Form Management
 * 
 * Handles form state, validation, auto-save, and submission
 * for the multi-step property creation/editing wizard.
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { 
  createPropertySchema,
  updatePropertySchema,
  type CreatePropertyData,
  type UpdatePropertyData
} from '@/lib/validation/schemas/property.schema';
import {
  PropertyFormStep,
  PropertyFormState,
  UsePropertyFormReturn
} from '@/types/property.types';
import { useProperty } from './useProperty';

// ============================================================
// FORM STEPS CONFIGURATION
// ============================================================

const FORM_STEPS: PropertyFormStep[] = [
  {
    id: 'basic',
    title: 'Grundinformation',
    description: 'Fastighetsbeteckning, typ och status',
    fields: ['fastighetsbeteckning', 'propertyType', 'status'],
    isRequired: true,
    isValid: false,
    canSkip: false
  },
  {
    id: 'location',
    title: 'Adress',
    description: 'Gatuadress, stad och koordinater',
    fields: ['address.street', 'address.city', 'address.postalCode', 'address.municipality', 'address.coordinates'],
    isRequired: true,
    isValid: false,
    canSkip: false
  },
  {
    id: 'specifications',
    title: 'Specifikationer',
    description: 'Yta, rum och byggdetaljer',
    fields: ['specifications.livingArea', 'specifications.rooms', 'specifications.buildYear'],
    isRequired: true,
    isValid: false,
    canSkip: false
  },
  {
    id: 'pricing',
    title: 'Prissättning',
    description: 'Utgångspris och löpande kostnader',
    fields: ['pricing.askingPrice', 'pricing.monthlyFee', 'pricing.operatingCost'],
    isRequired: true,
    isValid: false,
    canSkip: false
  },
  {
    id: 'content',
    title: 'Beskrivning',
    description: 'Rubrik, beskrivning och särdrag',
    fields: ['content.title', 'content.fullDescription'],
    isRequired: true,
    isValid: false,
    canSkip: false
  },
  {
    id: 'images',
    title: 'Bilder',
    description: 'Uppladdning och hantering av bilder',
    fields: ['images'],
    isRequired: false,
    isValid: true,
    canSkip: true
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get fields for a specific step
 */
function getStepFields(step: PropertyFormStep, data: any): any {
  const stepData: any = {};
  
  step.fields.forEach(field => {
    const value = getNestedValue(data, field);
    if (value !== undefined) {
      setNestedValue(stepData, field, value);
    }
  });
  
  return stepData;
}

/**
 * Get nested object value by dot notation path
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Set nested object value by dot notation path
 */
function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  
  target[lastKey] = value;
}

/**
 * Validate specific step data
 */
function validateStepData(step: PropertyFormStep, data: any): boolean {
  try {
    const stepData = getStepFields(step, data);
    
    // Create a partial schema for this step's fields
    const schema = step.id === 'basic' ? createPropertySchema.pick({ 
      fastighetsbeteckning: true, 
      propertyType: true, 
      status: true 
    }) :
    step.id === 'location' ? createPropertySchema.pick({ 
      address: true 
    }) :
    step.id === 'specifications' ? createPropertySchema.pick({ 
      specifications: true 
    }) :
    step.id === 'pricing' ? createPropertySchema.pick({ 
      pricing: true 
    }) :
    step.id === 'content' ? createPropertySchema.pick({ 
      content: true 
    }) :
    createPropertySchema; // images step or fallback
    
    schema.parse(stepData);
    return true;
  } catch {
    return false;
  }
}

/**
 * Auto-save to localStorage
 */
function saveToLocalStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Could not save to localStorage:', error);
  }
}

/**
 * Load from localStorage
 */
function loadFromLocalStorage(key: string): any {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('Could not load from localStorage:', error);
    return null;
  }
}

/**
 * Remove from localStorage
 */
function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Could not remove from localStorage:', error);
  }
}

// ============================================================
// HOOK IMPLEMENTATION
// ============================================================

export function usePropertyForm(
  propertyId?: string,
  initialData?: Partial<CreatePropertyData>,
  options?: {
    enableAutoSave?: boolean;
    autoSaveInterval?: number;
    onStepChange?: (step: number) => void;
    onSubmitSuccess?: (property: any) => void;
    onSubmitError?: (error: Error) => void;
    onAutoSave?: (data: Partial<CreatePropertyData>) => void;
  }
): UsePropertyFormReturn {
  
  // Auto-save configuration
  const autoSaveEnabled = options?.enableAutoSave ?? true;
  const autoSaveInterval = options?.autoSaveInterval ?? 30000; // 30 seconds
  const autoSaveKey = `property-form-${propertyId || 'new'}`;
  
  // Initialize form state
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<PropertyFormStep[]>(FORM_STEPS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const autoSaveTimer = useRef<NodeJS.Timeout>();
  
  // Get property data if editing
  const { property, update: updateProperty } = useProperty(propertyId, {
    enabled: Boolean(propertyId)
  });
  
  // Determine if we're editing or creating
  const isEditing = Boolean(propertyId);
  const schema = isEditing ? updatePropertySchema : createPropertySchema;
  
  // Load initial data
  const getInitialData = (): Partial<CreatePropertyData> => {
    if (property) {
      // Transform Property to CreatePropertyData format
      return {
        fastighetsbeteckning: property.fastighetsbeteckning,
        propertyType: property.propertyType,
        status: property.status,
        address: property.address,
        specifications: property.specifications,
        pricing: property.pricing,
        content: property.content
      };
    }
    
    if (initialData) return initialData;
    
    // Try to load from localStorage
    if (autoSaveEnabled) {
      const savedData = loadFromLocalStorage(autoSaveKey);
      if (savedData) return savedData;
    }
    
    // Default empty form
    return {
      status: 'kommande',
      address: {},
      specifications: {},
      pricing: {},
      content: {}
    };
  };
  
  // Initialize React Hook Form
  const form = useForm<CreatePropertyData>({
    resolver: zodResolver(schema),
    defaultValues: getInitialData(),
    mode: 'onChange'
  });

  const {
    watch,
    getValues,
    setValue,
    trigger,
    formState: { errors, isDirty, isValid }
  } = form;

  // Watch all form data for auto-save
  const formData = watch();
  
  // Create form state
  const formState: PropertyFormState = {
    currentStep,
    totalSteps: steps.length,
    isValid: isValid,
    isDirty: isDirty,
    data: formData,
    errors: errors as any,
    touched: {} // Would need to track touched fields
  };

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled || !isDirty) return;
    
    // Clear existing timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    
    // Set new timer
    autoSaveTimer.current = setTimeout(() => {
      const data = getValues();
      saveToLocalStorage(autoSaveKey, data);
      options?.onAutoSave?.(data);
      
      // Show subtle feedback
      toast.success('Utkast sparat', {
        duration: 2000,
        position: 'bottom-right',
        style: {
          fontSize: '14px',
          padding: '8px 12px'
        }
      });
    }, autoSaveInterval);
    
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [formData, autoSaveEnabled, autoSaveInterval, isDirty]);

  // Update step validation status
  useEffect(() => {
    const updatedSteps = steps.map(step => ({
      ...step,
      isValid: validateStepData(step, formData)
    }));
    setSteps(updatedSteps);
  }, [formData, steps]);

  // Navigation functions
  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
      options?.onStepChange?.(step);
    }
  }, [steps.length, options]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      options?.onStepChange?.(newStep);
    }
  }, [currentStep, steps.length, options]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      options?.onStepChange?.(newStep);
    }
  }, [currentStep, options]);

  // Field update function
  const updateField = useCallback((field: string, value: any) => {
    setValue(field as any, value, { shouldDirty: true, shouldValidate: true });
  }, [setValue]);

  // Validation functions
  const validateStep = useCallback((step?: number): boolean => {
    const stepIndex = step ?? currentStep;
    const stepConfig = steps[stepIndex];
    return validateStepData(stepConfig, getValues());
  }, [currentStep, steps, getValues]);

  const validateAll = useCallback((): boolean => {
    return steps.every(step => validateStepData(step, getValues()));
  }, [steps, getValues]);

  // Auto-save function
  const saveDraft = useCallback(async (): Promise<void> => {
    const data = getValues();
    saveToLocalStorage(autoSaveKey, data);
    options?.onAutoSave?.(data);
    toast.success('Utkast sparat');
  }, [getValues, autoSaveKey, options]);

  // Form submission
  const submitForm = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      const data = getValues();
      
      let result;
      if (isEditing && propertyId) {
        // Update existing property
        result = await updateProperty(data);
      } else {
        // Create new property - would need to implement this
        throw new Error('Skapande av nya fastigheter implementeras senare');
      }
      
      // Clear auto-saved data on successful submit
      if (autoSaveEnabled) {
        removeFromLocalStorage(autoSaveKey);
      }
      
      options?.onSubmitSuccess?.(result);
      toast.success(isEditing ? 'Fastighet uppdaterad' : 'Fastighet skapad');
      
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Okänt fel';
      options?.onSubmitError?.(new Error(errorMessage));
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [getValues, isEditing, propertyId, updateProperty, autoSaveEnabled, autoSaveKey, options]);

  // Reset form
  const resetForm = useCallback(() => {
    form.reset(getInitialData());
    setCurrentStep(0);
    if (autoSaveEnabled) {
      removeFromLocalStorage(autoSaveKey);
    }
  }, [form, autoSaveEnabled, autoSaveKey]);

  // Check if form can be submitted
  const canSubmit = validateAll() && !isSubmitting;

  // Get current step data
  const currentStepData = getStepFields(steps[currentStep], formData);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, []);

  return {
    // Form state
    formState,
    currentStepData,
    steps,
    
    // Navigation
    goToStep,
    nextStep,
    previousStep,
    
    // Data management
    updateField,
    validateStep,
    validateAll,
    saveDraft,
    submitForm,
    resetForm,
    
    // Status
    isSubmitting,
    canSubmit,
    
    // React Hook Form integration
    form,
    watch,
    setValue,
    getValues,
    trigger,
    errors: errors as any
  };
}