'use client'

import { UseFormRegister, FieldError, Path } from 'react-hook-form'
import { ObjektFormData } from '@/lib/schemas/objekt-form.schema'

// Re-export other form components
export { FormDatePicker } from './FormDatePicker'
export { FormRadioGroup } from './FormRadioGroup'

interface FormFieldProps {
  name: Path<ObjektFormData>
  label: string
  register: UseFormRegister<ObjektFormData>
  error?: FieldError
  type?: 'text' | 'email' | 'number' | 'tel'
  placeholder?: string
  required?: boolean
}

export const FormField = ({ 
  name, 
  label, 
  register, 
  error, 
  type = 'text', 
  placeholder,
  required = false 
}: FormFieldProps) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={`w-full px-4 py-4 backdrop-blur-xl bg-white/20 border rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
          error 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-white/30'
        }`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  )
}

interface FormSelectProps {
  name: Path<ObjektFormData>
  label: string
  register: UseFormRegister<ObjektFormData>
  error?: FieldError
  options: { value: string; label: string }[]
  required?: boolean
}

export const FormSelect = ({ 
  name, 
  label, 
  register, 
  error, 
  options,
  required = false 
}: FormSelectProps) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        {...register(name)}
        className={`w-full px-4 py-4 backdrop-blur-xl bg-white/20 border rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
          error 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-white/30'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  )
}

interface FormTextareaProps {
  name: Path<ObjektFormData>
  label: string
  register: UseFormRegister<ObjektFormData>
  error?: FieldError
  rows?: number
  placeholder?: string
  required?: boolean
}

export const FormTextarea = ({ 
  name, 
  label, 
  register, 
  error, 
  rows = 3,
  placeholder,
  required = false 
}: FormTextareaProps) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        {...register(name)}
        className={`w-full px-4 py-4 backdrop-blur-xl bg-white/20 border rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none ${
          error 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-white/30'
        }`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  )
}

interface FormCheckboxProps {
  name: Path<ObjektFormData>
  label: string
  register: UseFormRegister<ObjektFormData>
  error?: FieldError
}

export const FormCheckbox = ({ 
  name, 
  label, 
  register, 
  error 
}: FormCheckboxProps) => {
  return (
    <div className="flex items-center">
      <input
        id={name}
        type="checkbox"
        {...register(name)}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label htmlFor={name} className="ml-2 block text-sm text-gray-700">
        {label}
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  )
}