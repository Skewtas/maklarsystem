'use client'

import { forwardRef, ReactNode } from 'react'

interface GlassFieldGroupProps {
  children: ReactNode
  label?: string
  description?: string
  className?: string
  contentClassName?: string
  orientation?: 'vertical' | 'horizontal'
  spacing?: 'sm' | 'md' | 'lg'
  required?: boolean
  error?: string
  helpText?: string
}

const GlassFieldGroup = forwardRef<HTMLFieldSetElement, GlassFieldGroupProps>(
  ({ 
    children, 
    label, 
    description, 
    className = "", 
    contentClassName = "",
    orientation = 'vertical',
    spacing = 'md',
    required = false,
    error,
    helpText
  }, ref) => {
    const spacingClasses = {
      sm: orientation === 'vertical' ? 'space-y-3' : 'space-x-3',
      md: orientation === 'vertical' ? 'space-y-4' : 'space-x-4',
      lg: orientation === 'vertical' ? 'space-y-6' : 'space-x-6'
    }

    const orientationClasses = {
      vertical: 'flex flex-col',
      horizontal: 'flex flex-row items-end'
    }

    return (
      <fieldset ref={ref} className={`${className}`}>
        {(label || description) && (
          <legend className="mb-4">
            {label && (
              <div className="text-sm font-medium text-gray-800 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </div>
            )}
            {description && (
              <div className="text-xs text-gray-600">{description}</div>
            )}
          </legend>
        )}
        
        <div className={`
          ${orientationClasses[orientation]} ${spacingClasses[spacing]} 
          ${contentClassName}
        `}>
          {children}
        </div>
        
        {(error || helpText) && (
          <div className="mt-2">
            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-600 rounded-full flex-shrink-0"></span>
                {error}
              </p>
            )}
            {helpText && !error && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></span>
                {helpText}
              </p>
            )}
          </div>
        )}
      </fieldset>
    )
  }
)

GlassFieldGroup.displayName = 'GlassFieldGroup'

export default GlassFieldGroup