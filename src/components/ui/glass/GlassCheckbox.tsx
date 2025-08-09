'use client'

import { forwardRef } from 'react'
import { Check } from 'lucide-react'

interface GlassCheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const GlassCheckbox = forwardRef<HTMLInputElement, GlassCheckboxProps>(
  ({ checked = false, onChange, label, description, disabled = false, className = "", size = 'md' }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    }

    const iconSizes = {
      sm: 12,
      md: 16,
      lg: 20
    }

    return (
      <div className={`flex items-start gap-3 ${className}`}>
        <div className="relative flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            disabled={disabled}
            className="sr-only"
          />
          <div
            onClick={() => !disabled && onChange?.(!checked)}
            className={`
              ${sizeClasses[size]} cursor-pointer backdrop-blur-xl border border-white/30 rounded-lg transition-all duration-300
              ${checked 
                ? 'bg-blue-500/30 border-blue-400/50 shadow-lg shadow-blue-500/20' 
                : 'bg-white/20 hover:bg-white/30'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:scale-105'}
              flex items-center justify-center
            `}
          >
            {checked && (
              <Check 
                size={iconSizes[size]} 
                className="text-blue-600 drop-shadow-sm animate-in zoom-in duration-200" 
              />
            )}
          </div>
        </div>
        
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label 
                onClick={() => !disabled && onChange?.(!checked)}
                className={`block text-sm font-medium text-gray-800 cursor-pointer ${disabled ? 'opacity-50' : ''}`}
              >
                {label}
              </label>
            )}
            {description && (
              <p className={`text-xs text-gray-600 mt-1 ${disabled ? 'opacity-50' : ''}`}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

GlassCheckbox.displayName = 'GlassCheckbox'

export default GlassCheckbox