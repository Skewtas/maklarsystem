'use client'

import { forwardRef } from 'react'

interface GlassSwitchProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  label?: string
  description?: string
  position?: 'left' | 'right'
}

const GlassSwitch = forwardRef<HTMLInputElement, GlassSwitchProps>(
  ({ 
    checked = false, 
    onChange, 
    disabled = false, 
    className = "", 
    size = 'md',
    label,
    description,
    position = 'right'
  }, ref) => {
    const sizeConfig = {
      sm: {
        track: 'w-10 h-6',
        thumb: 'w-4 h-4',
        translate: 'translate-x-4'
      },
      md: {
        track: 'w-12 h-7',
        thumb: 'w-5 h-5',
        translate: 'translate-x-5'
      },
      lg: {
        track: 'w-14 h-8',
        thumb: 'w-6 h-6',
        translate: 'translate-x-6'
      }
    }

    const config = sizeConfig[size]

    const switchElement = (
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
            ${config.track} cursor-pointer backdrop-blur-xl border border-white/30 rounded-full 
            transition-all duration-300 flex items-center
            ${checked 
              ? 'bg-blue-500/30 border-blue-400/50 shadow-lg shadow-blue-500/20' 
              : 'bg-white/20'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}
          `}
        >
          <div
            className={`
              ${config.thumb} backdrop-blur-xl bg-white border border-white/50 rounded-full 
              shadow-lg transition-all duration-300 ml-1
              ${checked ? config.translate : 'translate-x-0'}
              ${checked ? 'bg-blue-50 border-blue-200' : 'bg-white'}
            `}
          />
        </div>
      </div>
    )

    if (!label && !description) {
      return <div className={className}>{switchElement}</div>
    }

    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {position === 'left' && switchElement}
        
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
        
        {position === 'right' && switchElement}
      </div>
    )
  }
)

GlassSwitch.displayName = 'GlassSwitch'

export default GlassSwitch