'use client'

import { forwardRef, useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface GlassDatePickerProps {
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  min?: string
  max?: string
  label?: string
}

const GlassDatePicker = forwardRef<HTMLInputElement, GlassDatePickerProps>(
  ({ value, onChange, placeholder = "Välj datum", disabled = false, className = "", min, max, label }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [displayValue, setDisplayValue] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Format date for display (Swedish format)
    const formatDisplayDate = (dateString: string) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''
      return date.toLocaleDateString('sv-SE')
    }

    // Convert display format back to ISO string
    const parseDisplayDate = (displayString: string) => {
      if (!displayString) return ''
      const parts = displayString.split(/[-./]/)
      if (parts.length !== 3) return ''
      
      // Handle different formats: YYYY-MM-DD, DD/MM/YYYY, DD.MM.YYYY
      let year, month, day
      if (parts[0].length === 4) {
        [year, month, day] = parts
      } else {
        [day, month, year] = parts
      }
      
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      if (isNaN(date.getTime())) return ''
      return date.toISOString().split('T')[0]
    }

    useEffect(() => {
      setDisplayValue(value ? formatDisplayDate(value) : '')
    }, [value])

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setDisplayValue(newValue)
      
      // Try to parse and validate the date
      const isoDate = parseDisplayDate(newValue)
      if (isoDate && (!min || isoDate >= min) && (!max || isoDate <= max)) {
        onChange?.(isoDate)
      }
    }

    const handleDateSelect = (dateString: string) => {
      onChange?.(dateString)
      setDisplayValue(formatDisplayDate(dateString))
      setIsOpen(false)
    }

    return (
      <div ref={containerRef} className={`relative ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-800 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full px-4 py-4 pr-12 backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl 
              text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-transparent transition-all duration-300
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onFocus={() => !disabled && setIsOpen(true)}
          />
          
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`
              absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20 text-gray-600'}
            `}
          >
            <Calendar size={20} />
          </button>
        </div>

        {isOpen && !disabled && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50">
            <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl shadow-xl p-4 max-h-64 overflow-y-auto">
              <input
                type="date"
                value={value || ''}
                onChange={(e) => handleDateSelect(e.target.value)}
                min={min}
                max={max}
                className="w-full px-3 py-2 backdrop-blur-xl bg-white/20 border border-white/30 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <div className="mt-3 flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleDateSelect(new Date().toISOString().split('T')[0])}
                  className="px-3 py-1 backdrop-blur-xl bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-700 hover:bg-blue-500/30 transition-colors duration-200"
                >
                  Idag
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange?.('')
                    setDisplayValue('')
                    setIsOpen(false)
                  }}
                  className="px-3 py-1 backdrop-blur-xl bg-red-500/20 border border-red-400/30 rounded-lg text-red-700 hover:bg-red-500/30 transition-colors duration-200"
                >
                  Rensa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)

GlassDatePicker.displayName = 'GlassDatePicker'

export default GlassDatePicker