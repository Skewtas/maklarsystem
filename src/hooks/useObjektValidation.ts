/**
 * Hook for property (objekt) form validation
 */

import { useState, useCallback, useRef } from 'react'
import { z } from 'zod'
import { objektCreateSchema, objektUpdateSchema } from '@/lib/validation/schemas/objekt.schema'
import { parseZodError } from '@/lib/validation'
import type {
  ValidationState,
  FieldValidationState,
  ValidationError,
  FieldChangeHandler,
  FormSubmitHandler,
  ValidationMode
} from '@/types/validation.types'
import type { ValidatedObjektCreate, ValidatedObjektUpdate } from '@/types/objekt.types'

interface UseObjektValidationOptions {
  mode?: ValidationMode
  defaultValues?: Partial<ValidatedObjektCreate>
  isUpdate?: boolean
}

export function useObjektValidation(options: UseObjektValidationOptions = {}) {
  const { mode = 'onChange', defaultValues = {}, isUpdate = false } = options
  
  // Form data state
  const [formData, setFormData] = useState<Partial<ValidatedObjektCreate>>(defaultValues)
  
  // Validation state
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: true,
    errors: [],
    isDirty: false,
    isTouched: false,
    isSubmitting: false
  })
  
  // Field states
  const [fieldStates, setFieldStates] = useState<Record<string, FieldValidationState>>({})
  
  // Track touched fields
  const touchedFields = useRef<Set<string>>(new Set())
  
  // Get the appropriate schema
  const schema = isUpdate ? objektUpdateSchema : objektCreateSchema
  
  // Validate entire form
  const validateForm = useCallback((data: Partial<ValidatedObjektCreate>): ValidationError[] => {
    try {
      schema.parse(data)
      return []
    } catch (error) {
      if (error instanceof z.ZodError) {
        return parseZodError(error)
      }
      return [{ path: '', message: 'Validering misslyckades' }]
    }
  }, [schema])
  
  // Validate single field
  const validateField = useCallback((name: string, value: any): string | undefined => {
    try {
      // Get the field schema if it exists
      const fieldSchema = schema.shape[name as keyof typeof schema.shape]
      if (fieldSchema) {
        fieldSchema.parse(value)
      }
      return undefined
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message
      }
      return 'Ogiltigt värde'
    }
  }, [schema])
  
  // Handle field change
  const handleFieldChange: FieldChangeHandler = useCallback((name, value, shouldValidate = true) => {
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Mark as dirty
    setValidationState(prev => ({ ...prev, isDirty: true }))
    
    // Mark field as touched
    touchedFields.current.add(name)
    
    // Update field state
    if (shouldValidate && (mode === 'onChange' || mode === 'all')) {
      const error = validateField(name, value)
      setFieldStates(prev => ({
        ...prev,
        [name]: {
          isValid: !error,
          error,
          isDirty: true,
          isTouched: true
        }
      }))
    } else {
      setFieldStates(prev => ({
        ...prev,
        [name]: {
          ...prev[name],
          isDirty: true,
          isTouched: true
        }
      }))
    }
  }, [mode, validateField])
  
  // Handle field blur
  const handleFieldBlur = useCallback((name: string) => {
    touchedFields.current.add(name)
    
    if (mode === 'onBlur' || mode === 'all') {
      const value = formData[name as keyof typeof formData]
      const error = validateField(name, value)
      setFieldStates(prev => ({
        ...prev,
        [name]: {
          isValid: !error,
          error,
          isDirty: prev[name]?.isDirty || false,
          isTouched: true
        }
      }))
    }
  }, [mode, formData, validateField])
  
  // Handle form submit
  const handleSubmit = useCallback((onSubmit: FormSubmitHandler<ValidatedObjektCreate>) => {
    return async (e?: React.FormEvent) => {
      e?.preventDefault()
      
      // Set submitting state
      setValidationState(prev => ({ ...prev, isSubmitting: true }))
      
      // Validate entire form
      const errors = validateForm(formData)
      
      if (errors.length === 0) {
        // Valid - call submit handler
        try {
          await onSubmit(formData as ValidatedObjektCreate, validationState)
          setValidationState(prev => ({
            ...prev,
            isSubmitting: false,
            errors: []
          }))
        } catch (error) {
          setValidationState(prev => ({
            ...prev,
            isSubmitting: false,
            errors: [{ path: '', message: 'Något gick fel vid sparning' }]
          }))
        }
      } else {
        // Invalid - update errors
        setValidationState(prev => ({
          ...prev,
          isValid: false,
          errors,
          isSubmitting: false
        }))
        
        // Update field states
        const fieldErrors: Record<string, string> = {}
        errors.forEach(error => {
          if (error.path) {
            fieldErrors[error.path] = error.message
          }
        })
        
        setFieldStates(prev => {
          const newStates = { ...prev }
          Object.keys(formData).forEach(key => {
            newStates[key] = {
              isValid: !fieldErrors[key],
              error: fieldErrors[key],
              isDirty: true,
              isTouched: true
            }
          })
          return newStates
        })
      }
    }
  }, [formData, validateForm, validationState])
  
  // Reset form
  const reset = useCallback((newDefaultValues?: Partial<ValidatedObjektCreate>) => {
    setFormData(newDefaultValues || defaultValues)
    setValidationState({
      isValid: true,
      errors: [],
      isDirty: false,
      isTouched: false,
      isSubmitting: false
    })
    setFieldStates({})
    touchedFields.current.clear()
  }, [defaultValues])
  
  // Get field props helper
  const getFieldProps = useCallback((name: string) => {
    const value = formData[name as keyof typeof formData]
    const fieldState = fieldStates[name] || {
      isValid: true,
      error: undefined,
      isDirty: false,
      isTouched: false
    }
    
    return {
      name,
      value: value ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const newValue = e.target.type === 'checkbox' 
          ? (e.target as HTMLInputElement).checked
          : e.target.type === 'number'
          ? parseFloat(e.target.value) || 0
          : e.target.value
        handleFieldChange(name, newValue)
      },
      onBlur: () => handleFieldBlur(name),
      error: fieldState.error,
      'aria-invalid': !fieldState.isValid,
      'aria-describedby': fieldState.error ? `${name}-error` : undefined
    }
  }, [formData, fieldStates, handleFieldChange, handleFieldBlur])
  
  return {
    formData,
    setFormData,
    validationState,
    fieldStates,
    handleFieldChange,
    handleFieldBlur,
    handleSubmit,
    reset,
    getFieldProps,
    validateForm,
    validateField
  }
}