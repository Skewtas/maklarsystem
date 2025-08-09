'use client'

import { forwardRef, useState, useRef, useEffect, ReactNode } from 'react'
import { ChevronDown, Search, X, Check } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  icon?: ReactNode
  description?: string
}

interface GlassSelectProps {
  value?: string
  onChange?: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  label?: string
  searchable?: boolean
  clearable?: boolean
  multiple?: boolean
  maxHeight?: string
}

const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ 
    value, 
    onChange, 
    options, 
    placeholder = "Välj alternativ", 
    disabled = false, 
    className = "",
    label,
    searchable = false,
    clearable = false,
    multiple = false,
    maxHeight = "200px"
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedValues, setSelectedValues] = useState<string[]>(
      multiple ? (value ? value.split(',') : []) : (value ? [value] : [])
    )
    
    const containerRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)

    const filteredOptions = options.filter(option =>
      !searchable || option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const selectedOption = !multiple ? options.find(opt => opt.value === value) : null
    const selectedOptionsData = multiple ? options.filter(opt => selectedValues.includes(opt.value)) : []

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
          setSearchTerm('')
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus()
      }
    }, [isOpen, searchable])

    const handleOptionClick = (optionValue: string) => {
      if (disabled) return

      if (multiple) {
        const newSelectedValues = selectedValues.includes(optionValue)
          ? selectedValues.filter(v => v !== optionValue)
          : [...selectedValues, optionValue]
        
        setSelectedValues(newSelectedValues)
        onChange?.(newSelectedValues.join(','))
      } else {
        onChange?.(optionValue)
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (multiple) {
        setSelectedValues([])
        onChange?.('')
      } else {
        onChange?.('')
      }
    }

    const displayText = () => {
      if (multiple) {
        if (selectedOptionsData.length === 0) return placeholder
        if (selectedOptionsData.length === 1) return selectedOptionsData[0].label
        return `${selectedOptionsData.length} valda`
      }
      return selectedOption?.label || placeholder
    }

    return (
      <div ref={containerRef} className={`relative ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-800 mb-2">
            {label}
          </label>
        )}
        
        {/* Hidden select for form compatibility */}
        <select
          ref={ref}
          value={value || ''}
          onChange={() => {}} // Controlled by our custom logic
          className="sr-only"
          multiple={multiple}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom Select Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-4 backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl 
            text-left text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 
            focus:border-transparent transition-all duration-300 flex items-center justify-between
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/30'}
            ${!selectedOption && !multiple ? 'text-gray-500' : ''}
          `}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedOption?.icon && !multiple && (
              <span className="flex-shrink-0">{selectedOption.icon}</span>
            )}
            <span className="truncate">{displayText()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {clearable && (value || selectedValues.length > 0) && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-200"
              >
                <X size={16} className="text-gray-500" />
              </button>
            )}
            <ChevronDown 
              size={20} 
              className={`text-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </div>
        </button>

        {/* Multiple Selection Display */}
        {multiple && selectedOptionsData.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedOptionsData.map(option => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1 px-3 py-1 backdrop-blur-xl bg-blue-500/20 border border-blue-400/30 rounded-full text-sm text-blue-700"
              >
                {option.icon && <span>{option.icon}</span>}
                {option.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOptionClick(option.value)
                  }}
                  className="ml-1 hover:bg-blue-500/30 rounded-full p-0.5 transition-colors duration-200"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50">
            <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl shadow-xl overflow-hidden">
              {searchable && (
                <div className="p-3 border-b border-white/20">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Sök..."
                      className="w-full pl-10 pr-4 py-2 backdrop-blur-xl bg-white/20 border border-white/30 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
              
              <div className="max-h-60 overflow-y-auto" style={{ maxHeight }}>
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-3 text-gray-500 text-center">
                    {searchTerm ? 'Inga resultat' : 'Inga alternativ'}
                  </div>
                ) : (
                  filteredOptions.map((option) => {
                    const isSelected = multiple 
                      ? selectedValues.includes(option.value)
                      : value === option.value
                    
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleOptionClick(option.value)}
                        disabled={option.disabled}
                        className={`
                          w-full px-4 py-3 text-left flex items-center gap-3 transition-colors duration-200
                          ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'}
                          ${isSelected ? 'bg-blue-500/20 text-blue-700' : 'text-gray-800'}
                        `}
                      >
                        {option.icon && (
                          <span className="flex-shrink-0">{option.icon}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{option.label}</div>
                          {option.description && (
                            <div className="text-xs text-gray-600 truncate">{option.description}</div>
                          )}
                        </div>
                        {isSelected && (
                          <Check size={16} className="flex-shrink-0 text-blue-600" />
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)

GlassSelect.displayName = 'GlassSelect'

export default GlassSelect