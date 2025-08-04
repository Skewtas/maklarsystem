'use client'

import { forwardRef, useState, useEffect, useRef } from 'react'

interface GlassTextareaProps {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  label?: string
  description?: string
  error?: string
  rows?: number
  minRows?: number
  maxRows?: number
  maxLength?: number
  showCharacterCount?: boolean
  required?: boolean
  autoResize?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ 
    value = "", 
    onChange, 
    placeholder, 
    disabled = false, 
    className = "",
    label,
    description,
    error,
    rows = 3,
    minRows = 3,
    maxRows = 10,
    maxLength,
    showCharacterCount = false,
    required = false,
    autoResize = false,
    resize = 'vertical',
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const combinedRef = (ref as any) || textareaRef

    const characterCount = value?.length || 0

    // Auto resize functionality
    useEffect(() => {
      if (autoResize && combinedRef.current) {
        const textarea = combinedRef.current
        textarea.style.height = 'auto'
        
        const scrollHeight = textarea.scrollHeight
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight)
        const paddingTop = parseInt(getComputedStyle(textarea).paddingTop)
        const paddingBottom = parseInt(getComputedStyle(textarea).paddingBottom)
        
        const contentHeight = scrollHeight - paddingTop - paddingBottom
        const currentRows = Math.round(contentHeight / lineHeight)
        
        const finalRows = Math.min(Math.max(currentRows, minRows), maxRows)
        textarea.style.height = `${(finalRows * lineHeight) + paddingTop + paddingBottom}px`
      }
    }, [value, autoResize, minRows, maxRows])

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize'
    }

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
          <textarea
            ref={combinedRef}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            rows={autoResize ? minRows : rows}
            maxLength={maxLength}
            required={required}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`
              w-full px-4 py-4 backdrop-blur-xl bg-white/20 border rounded-2xl 
              text-gray-800 placeholder-gray-500 focus:outline-none transition-all duration-300
              ${error 
                ? 'border-red-400/50 focus:ring-2 focus:ring-red-500 focus:border-transparent' 
                : 'border-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/30'}
              ${isFocused ? 'shadow-xl' : ''}
              ${autoResize ? 'resize-none overflow-hidden' : resizeClasses[resize]}
            `}
            {...props}
          />
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

GlassTextarea.displayName = 'GlassTextarea'

export default GlassTextarea