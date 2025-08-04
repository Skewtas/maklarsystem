'use client'

import { UseFormRegister, FieldError, Path } from 'react-hook-form'
import { ObjektFormData } from '@/lib/schemas/objekt-form.schema'

interface FormRadioGroupProps {
  name: Path<ObjektFormData>
  label: string
  register: UseFormRegister<ObjektFormData>
  error?: FieldError
  options: { value: string; label: string }[]
  required?: boolean
}

export const FormRadioGroup = ({ 
  name, 
  label, 
  register, 
  error, 
  options,
  required = false 
}: FormRadioGroupProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-4">
        {options.map((option) => (
          <label key={option.value} className="flex items-center cursor-pointer">
            <input
              type="radio"
              value={option.value}
              {...register(name)}
              className="w-4 h-4 text-blue-600 bg-white/20 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  )
}