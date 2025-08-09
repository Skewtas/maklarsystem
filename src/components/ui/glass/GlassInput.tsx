'use client'

import { forwardRef, useState, ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface GlassInputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search'
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  label?: string
  description?: string
  error?: string
  prefix?: ReactNode
  suffix?: ReactNode
  maxLength?: number
  showCharacterCount?: boolean
  required?: boolean
  autoComplete?: string
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ 
    type = "text", 
    value = "", 
    onChange, 
    placeholder, 
    disabled = false, 
    className = "",
    label,
    description,
    error,
    prefix,
    suffix,
    maxLength,
    showCharacterCount = false,
    required = false,
    autoComplete,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type
    const characterCount = value?.length || 0

    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-800 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {description && (
          <p className="text-xs text-gray-600 mb-2">{description}</p>
        )}
        
        <div className="relative">
          {prefix && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
              {prefix}
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            required={required}
            autoComplete={autoComplete}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`
              w-full backdrop-blur-xl bg-white/20 border rounded-2xl 
              text-gray-800 placeholder-gray-500 focus:outline-none transition-all duration-300
              ${prefix ? 'pl-12' : 'pl-4'} 
              ${suffix || isPassword ? 'pr-12' : 'pr-4'} 
              py-4
              ${error 
                ? 'border-red-400/50 focus:ring-2 focus:ring-red-500 focus:border-transparent' 
                : 'border-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/30'}
              ${isFocused ? 'shadow-xl' : ''}
            `}
            {...props}
          />
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {suffix && !isPassword && (
              <div className="text-gray-600 pointer-events-none">
                {suffix}
              </div>
            )}
            
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={disabled}
                className={`p-1 rounded-lg transition-colors duration-200 ${
                  disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20 text-gray-600'
                }`}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-1">
          <div>
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
          </div>
          
          {showCharacterCount && maxLength && (
            <p className={`text-xs ${
              characterCount > maxLength * 0.9 
                ? characterCount >= maxLength 
                  ? 'text-red-600' 
                  : 'text-orange-600'
                : 'text-gray-500'
            }`}>
              {characterCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)

GlassInput.displayName = 'GlassInput'

export default GlassInput