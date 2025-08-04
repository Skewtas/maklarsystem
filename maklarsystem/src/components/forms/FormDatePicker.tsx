'use client'

import { Control, Controller, FieldError, Path } from 'react-hook-form'
import { ObjektFormData } from '@/lib/schemas/objekt-form.schema'
import { Calendar } from 'lucide-react'

interface FormDatePickerProps {
  name: Path<ObjektFormData>
  label: string
  control: Control<ObjektFormData>
  error?: FieldError
  placeholder?: string
  required?: boolean
}

export const FormDatePicker = ({ 
  name, 
  label, 
  control, 
  error, 
  placeholder = 'ÅÅÅÅ-MM-DD',
  required = false 
}: FormDatePickerProps) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="relative">
            <input
              {...field}
              value={field.value as string || ''}
              id={name}
              type="date"
              placeholder={placeholder}
              className={`w-full px-4 py-4 pr-12 backdrop-blur-xl bg-white/20 border rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                error 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-white/30'
              }`}
            />
            <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
          </div>
        )}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  )
}