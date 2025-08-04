'use client'

import { forwardRef, ReactNode } from 'react'

interface GlassFormGridProps {
  children: ReactNode
  className?: string
  columns?: 1 | 2 | 3 | 4 | 6
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  responsive?: boolean
  alignItems?: 'start' | 'center' | 'end' | 'stretch'
  autoRows?: boolean
}

const GlassFormGrid = forwardRef<HTMLDivElement, GlassFormGridProps>(
  ({ 
    children, 
    className = "", 
    columns = 2,
    gap = 'md',
    responsive = true,
    alignItems = 'start',
    autoRows = false
  }, ref) => {
    const gapClasses = {
      sm: 'gap-3',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-12'
    }

    const columnClasses = {
      1: 'grid-cols-1',
      2: responsive ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2',
      3: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-3',
      4: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-4',
      6: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6' : 'grid-cols-6'
    }

    const alignItemsClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch'
    }

    return (
      <div 
        ref={ref}
        className={`
          grid ${columnClasses[columns]} ${gapClasses[gap]} ${alignItemsClasses[alignItems]}
          ${autoRows ? 'auto-rows-fr' : ''}
          ${className}
        `}
      >
        {children}
      </div>
    )
  }
)

GlassFormGrid.displayName = 'GlassFormGrid'

export default GlassFormGrid