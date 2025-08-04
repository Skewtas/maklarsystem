'use client'

import { forwardRef, ReactNode, useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface GlassFormSectionProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  contentClassName?: string
  icon?: ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
  badge?: string | number
  variant?: 'default' | 'outlined' | 'minimal'
}

const GlassFormSection = forwardRef<HTMLDivElement, GlassFormSectionProps>(
  ({ 
    title, 
    description, 
    children, 
    className = "", 
    contentClassName = "",
    icon,
    collapsible = false,
    defaultOpen = true,
    badge,
    variant = 'default'
  }, ref) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    const variantClasses = {
      default: 'backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl shadow-xl',
      outlined: 'border-2 border-white/30 rounded-3xl',
      minimal: 'border-b border-white/20 pb-8'
    }

    const HeaderComponent = () => (
      <div className={`
        ${variant === 'minimal' ? 'mb-6' : 'mb-6 pb-4'}
        ${variant !== 'minimal' && (title || description) ? 'border-b border-white/20' : ''}
      `}>
        {title && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="flex items-center justify-center w-10 h-10 backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl">
                  {icon}
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  {title}
                  {badge && (
                    <span className="px-2 py-1 text-xs rounded-full backdrop-blur-xl bg-blue-500/20 border border-blue-400/30 text-blue-700 font-medium">
                      {badge}
                    </span>
                  )}
                </h3>
                {description && (
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
                )}
              </div>
            </div>
            
            {collapsible && (
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
              >
                <ChevronDown 
                  size={20} 
                  className={`text-gray-600 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>
            )}
          </div>
        )}
      </div>
    )

    const ContentComponent = () => (
      <div className={`
        transition-all duration-300 ease-in-out
        ${collapsible && !isOpen ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100'}
        ${contentClassName}
      `}>
        {children}
      </div>
    )

    if (variant === 'minimal') {
      return (
        <div ref={ref} className={`${className}`}>
          <HeaderComponent />
          <ContentComponent />
        </div>
      )
    }

    return (
      <div 
        ref={ref} 
        className={`${variantClasses[variant]} ${variant !== 'outlined' ? 'p-8' : 'p-8'} ${className}`}
      >
        <HeaderComponent />
        <ContentComponent />
      </div>
    )
  }
)


GlassFormSection.displayName = 'GlassFormSection'

export default GlassFormSection