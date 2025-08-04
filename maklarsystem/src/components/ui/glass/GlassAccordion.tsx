'use client'

import { forwardRef, useState, useRef, useEffect, ReactNode } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface AccordionItem {
  id: string
  title: string
  content: ReactNode
  disabled?: boolean
  defaultOpen?: boolean
  icon?: ReactNode
  badge?: string | number
}

interface GlassAccordionProps {
  items: AccordionItem[]
  type?: 'single' | 'multiple'
  className?: string
  itemClassName?: string
  contentClassName?: string
  collapsible?: boolean
  defaultOpen?: string | string[]
  onToggle?: (itemId: string, isOpen: boolean) => void
}

const GlassAccordion = forwardRef<HTMLDivElement, GlassAccordionProps>(
  ({ 
    items, 
    type = 'single', 
    className = "", 
    itemClassName = "",
    contentClassName = "",
    collapsible = true,
    defaultOpen,
    onToggle
  }, ref) => {
    const [openItems, setOpenItems] = useState<Set<string>>(() => {
      const initialOpen = new Set<string>()
      
      if (defaultOpen) {
        if (Array.isArray(defaultOpen)) {
          defaultOpen.forEach(id => initialOpen.add(id))
        } else {
          initialOpen.add(defaultOpen)
        }
      } else {
        // Use defaultOpen from items
        items.forEach(item => {
          if (item.defaultOpen) {
            initialOpen.add(item.id)
          }
        })
      }
      
      return initialOpen
    })

    const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

    const toggleItem = (itemId: string) => {
      const item = items.find(i => i.id === itemId)
      if (item?.disabled) return

      const isCurrentlyOpen = openItems.has(itemId)
      const newOpenItems = new Set(openItems)

      if (type === 'single') {
        // Close all other items
        newOpenItems.clear()
        if (!isCurrentlyOpen) {
          newOpenItems.add(itemId)
        } else if (!collapsible) {
          // If not collapsible and it's the only open item, keep it open
          newOpenItems.add(itemId)
        }
      } else {
        // Multiple type
        if (isCurrentlyOpen) {
          if (collapsible || newOpenItems.size > 1) {
            newOpenItems.delete(itemId)
          }
        } else {
          newOpenItems.add(itemId)
        }
      }

      setOpenItems(newOpenItems)
      onToggle?.(itemId, newOpenItems.has(itemId))
    }

    const AccordionItemComponent = ({ item }: { item: AccordionItem }) => {
      const isOpen = openItems.has(item.id)
      const contentRef = useRef<HTMLDivElement>(null)

      useEffect(() => {
        contentRefs.current[item.id] = contentRef.current
      }, [item.id])

      return (
        <div className={`
          backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl 
          transition-all duration-300 hover:bg-white/30 hover:shadow-xl
          ${itemClassName}
        `}>
          {/* Header */}
          <button
            type="button"
            onClick={() => toggleItem(item.id)}
            disabled={item.disabled}
            className={`
              w-full px-6 py-4 flex items-center justify-between text-left
              transition-all duration-300 rounded-2xl
              ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}
              ${isOpen ? 'border-b border-white/20' : ''}
            `}
          >
            <div className="flex items-center gap-3 flex-1">
              {item.icon && (
                <span className="flex items-center justify-center text-gray-600">
                  {item.icon}
                </span>
              )}
              <span className="font-medium text-gray-800">{item.title}</span>
              {item.badge && (
                <span className="px-2 py-1 text-xs rounded-full backdrop-blur-xl bg-blue-500/20 border border-blue-400/30 text-blue-700 font-medium">
                  {item.badge}
                </span>
              )}
            </div>
            
            <div className={`
              transition-transform duration-300 text-gray-600
              ${isOpen ? 'rotate-180' : ''}
            `}>
              <ChevronDown size={20} />
            </div>
          </button>

          {/* Content */}
          <div
            className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${isOpen ? 'opacity-100' : 'opacity-0 max-h-0'}
            `}
            style={{
              maxHeight: isOpen ? `${contentRef.current?.scrollHeight || 1000}px` : '0px'
            }}
          >
            <div
              ref={contentRef}
              className={`px-6 pb-6 ${contentClassName}`}
            >
              {item.content}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div ref={ref} className={`space-y-3 ${className}`}>
        {items.map((item) => (
          <AccordionItemComponent key={item.id} item={item} />
        ))}
      </div>
    )
  }
)

GlassAccordion.displayName = 'GlassAccordion'

export default GlassAccordion