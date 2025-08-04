'use client'

import { forwardRef } from 'react'

interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface GlassRadioGroupProps {
  value?: string
  onChange?: (value: string) => void
  options: RadioOption[]
  name: string
  label?: string
  description?: string
  disabled?: boolean
  className?: string
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
}

const GlassRadioGroup = forwardRef<HTMLDivElement, GlassRadioGroupProps>(
  ({ 
    value, 
    onChange, 
    options, 
    name, 
    label, 
    description, 
    disabled = false, 
    className = "", 
    orientation = 'vertical',
    size = 'md'
  }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    }

    const dotSizes = {
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3'
    }

    return (
      <div ref={ref} className={`${className}`}>
        {label && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-800 mb-1">
              {label}
            </label>
            {description && (
              <p className="text-xs text-gray-600">{description}</p>
            )}
          </div>
        )}
        
        <div className={`
          ${orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-3'}
        `}>
          {options.map((option) => {
            const isSelected = value === option.value
            const isDisabled = disabled || option.disabled
            
            return (
              <div key={option.value} className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <input
                    type="radio"
                    name={name}
                    value={option.value}
                    checked={isSelected}
                    onChange={(e) => !isDisabled && onChange?.(e.target.value)}
                    disabled={isDisabled}
                    className="sr-only"
                  />
                  <div
                    onClick={() => !isDisabled && onChange?.(option.value)}
                    className={`
                      ${sizeClasses[size]} cursor-pointer backdrop-blur-xl border border-white/30 rounded-full transition-all duration-300
                      ${isSelected 
                        ? 'bg-blue-500/30 border-blue-400/50 shadow-lg shadow-blue-500/20' 
                        : 'bg-white/20 hover:bg-white/30'
                      }
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:scale-105'}
                      flex items-center justify-center
                    `}
                  >
                    {isSelected && (
                      <div className={`
                        ${dotSizes[size]} bg-blue-600 rounded-full transition-all duration-200 animate-in zoom-in
                      `} />
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <label 
                    onClick={() => !isDisabled && onChange?.(option.value)}
                    className={`block text-sm font-medium text-gray-800 cursor-pointer ${isDisabled ? 'opacity-50' : ''}`}
                  >
                    {option.label}
                  </label>
                  {option.description && (
                    <p className={`text-xs text-gray-600 mt-1 ${isDisabled ? 'opacity-50' : ''}`}>
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)

GlassRadioGroup.displayName = 'GlassRadioGroup'

export default GlassRadioGroup