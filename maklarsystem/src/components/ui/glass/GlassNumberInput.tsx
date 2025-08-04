'use client'

import { forwardRef, useState, useEffect } from 'react'
import { Plus, Minus } from 'lucide-react'

interface GlassNumberInputProps {
  value?: number | string
  onChange?: (value: number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  min?: number
  max?: number
  step?: number
  label?: string
  prefix?: string
  suffix?: string
  thousandSeparator?: boolean
}

const GlassNumberInput = forwardRef<HTMLInputElement, GlassNumberInputProps>(
  ({ 
    value, 
    onChange, 
    placeholder, 
    disabled = false, 
    className = "", 
    min, 
    max, 
    step = 1,
    label,
    prefix,
    suffix,
    thousandSeparator = false
  }, ref) => {
    const [displayValue, setDisplayValue] = useState('')
    const [isFocused, setIsFocused] = useState(false)

    // Format number with thousand separator
    const formatNumber = (num: number) => {
      if (isNaN(num)) return ''
      return thousandSeparator 
        ? num.toLocaleString('sv-SE')
        : num.toString()
    }

    // Parse display value to number
    const parseNumber = (str: string) => {
      if (!str) return 0
      // Remove thousand separators and other non-numeric characters except decimal point
      const cleaned = str.replace(/[^\d.-]/g, '')
      const parsed = parseFloat(cleaned)
      return isNaN(parsed) ? 0 : parsed
    }

    useEffect(() => {
      if (!isFocused) {
        const numValue = typeof value === 'string' ? parseFloat(value) : value
        if (numValue !== undefined && !isNaN(numValue)) {
          setDisplayValue(formatNumber(numValue))
        } else {
          setDisplayValue('')
        }
      }
    }, [value, isFocused, thousandSeparator])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setDisplayValue(newValue)
      
      const numValue = parseNumber(newValue)
      if (!isNaN(numValue)) {
        onChange?.(numValue)
      }
    }

    const handleIncrement = () => {
      if (disabled) return
      const currentValue = parseNumber(displayValue) || 0
      const newValue = currentValue + step
      if (max === undefined || newValue <= max) {
        onChange?.(newValue)
      }
    }

    const handleDecrement = () => {
      if (disabled) return
      const currentValue = parseNumber(displayValue) || 0
      const newValue = currentValue - step
      if (min === undefined || newValue >= min) {
        onChange?.(newValue)
      }
    }

    const handleBlur = () => {
      setIsFocused(false)
      const numValue = parseNumber(displayValue)
      if (!isNaN(numValue)) {
        // Apply min/max constraints
        let constrainedValue = numValue
        if (min !== undefined && constrainedValue < min) constrainedValue = min
        if (max !== undefined && constrainedValue > max) constrainedValue = max
        
        if (constrainedValue !== numValue) {
          onChange?.(constrainedValue)
        }
      }
    }

    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-800 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-4 text-gray-600 text-sm font-medium">
              {prefix}
            </span>
          )}
          
          <input
            ref={ref}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl 
              text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-transparent transition-all duration-300
              ${prefix ? 'pl-12' : 'pl-4'} 
              ${suffix ? 'pr-20' : 'pr-16'} 
              py-4
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
          
          {suffix && (
            <span className="absolute right-16 text-gray-600 text-sm font-medium">
              {suffix}
            </span>
          )}
          
          <div className="absolute right-2 flex flex-col">
            <button
              type="button"
              onClick={handleIncrement}
              disabled={disabled || (max !== undefined && parseNumber(displayValue) >= max)}
              className={`
                p-1 rounded-lg transition-colors duration-200 hover:bg-white/20
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'}
              `}
            >
              <Plus size={14} />
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              disabled={disabled || (min !== undefined && parseNumber(displayValue) <= min)}
              className={`
                p-1 rounded-lg transition-colors duration-200 hover:bg-white/20
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'}
              `}
            >
              <Minus size={14} />
            </button>
          </div>
        </div>
        
        {(min !== undefined || max !== undefined) && (
          <div className="mt-1 text-xs text-gray-500">
            {min !== undefined && max !== undefined && (
              <>Värde mellan {formatNumber(min)} och {formatNumber(max)}</>
            )}
            {min !== undefined && max === undefined && (
              <>Minst {formatNumber(min)}</>
            )}
            {min === undefined && max !== undefined && (
              <>Högst {formatNumber(max)}</>
            )}
          </div>
        )}
      </div>
    )
  }
)

GlassNumberInput.displayName = 'GlassNumberInput'

export default GlassNumberInput