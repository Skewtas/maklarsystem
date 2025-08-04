'use client'

import { forwardRef, useState, useEffect, ReactNode } from 'react'

interface TabItem {
  id: string
  label: string
  icon?: ReactNode
  disabled?: boolean
  badge?: string | number
}

interface GlassTabsProps {
  tabs: TabItem[]
  activeTab?: string
  onTabChange?: (tabId: string) => void
  children?: ReactNode
  className?: string
  variant?: 'default' | 'pills' | 'underline'
  size?: 'sm' | 'md' | 'lg'
}

const GlassTabs = forwardRef<HTMLDivElement, GlassTabsProps>(
  ({ 
    tabs, 
    activeTab, 
    onTabChange, 
    children, 
    className = "", 
    variant = 'default',
    size = 'md'
  }, ref) => {
    const [internalActiveTab, setInternalActiveTab] = useState(activeTab || tabs[0]?.id)

    const currentActiveTab = activeTab || internalActiveTab

    useEffect(() => {
      if (activeTab && activeTab !== internalActiveTab) {
        setInternalActiveTab(activeTab)
      }
    }, [activeTab, internalActiveTab])

    const handleTabClick = (tabId: string) => {
      if (tabs.find(tab => tab.id === tabId)?.disabled) return
      
      setInternalActiveTab(tabId)
      onTabChange?.(tabId)
    }

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-sm',
      lg: 'px-6 py-4 text-base'
    }

    const getTabClasses = (tab: TabItem, isActive: boolean) => {
      const baseClasses = `
        ${sizeClasses[size]} font-medium transition-all duration-300 cursor-pointer
        flex items-center gap-2 relative
        ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `

      switch (variant) {
        case 'pills':
          return `${baseClasses} rounded-2xl backdrop-blur-xl border border-white/30 ${
            isActive 
              ? 'bg-blue-500/30 border-blue-400/50 text-blue-700 shadow-lg shadow-blue-500/20' 
              : 'bg-white/20 text-gray-700 hover:bg-white/30'
          }`
        
        case 'underline':
          return `${baseClasses} border-b-2 ${
            isActive 
              ? 'border-blue-500 text-blue-700 bg-blue-500/10' 
              : 'border-transparent text-gray-700 hover:border-gray-300 hover:bg-white/20'
          }`
        
        default:
          return `${baseClasses} rounded-t-2xl backdrop-blur-xl border-t border-l border-r border-white/30 ${
            isActive 
              ? 'bg-white/30 text-gray-800 shadow-lg -mb-px' 
              : 'bg-white/20 text-gray-600 hover:bg-white/25'
          }`
      }
    }

    return (
      <div ref={ref} className={className}>
        {/* Tab Headers */}
        <div className={`
          flex ${variant === 'underline' ? 'border-b border-white/30' : ''} 
          ${variant === 'pills' ? 'gap-2 p-1 backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20' : ''}
          ${variant === 'default' ? 'border-b border-white/30' : ''}
        `}>
          {tabs.map((tab) => {
            const isActive = currentActiveTab === tab.id
            
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                disabled={tab.disabled}
                className={getTabClasses(tab, isActive)}
              >
                {tab.icon && (
                  <span className="flex items-center justify-center">
                    {tab.icon}
                  </span>
                )}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`
                    px-2 py-1 text-xs rounded-full backdrop-blur-xl border font-medium
                    ${isActive 
                      ? 'bg-blue-600/20 border-blue-500/30 text-blue-700' 
                      : 'bg-gray-500/20 border-gray-400/30 text-gray-600'
                    }
                  `}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        {children && (
          <div className={`
            ${variant === 'default' ? 'backdrop-blur-xl bg-white/20 border-l border-r border-b border-white/30 rounded-b-2xl' : 'mt-4'}
            ${variant === 'pills' ? 'backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl' : ''}
            ${variant === 'underline' ? '' : 'p-6'}
          `}>
            {children}
          </div>
        )}
      </div>
    )
  }
)

GlassTabs.displayName = 'GlassTabs'

export default GlassTabs