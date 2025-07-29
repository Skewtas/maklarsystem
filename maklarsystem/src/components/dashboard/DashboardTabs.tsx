'use client'

import * as Tabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

export type DashboardView = 'allman' | 'saljarresan' | 'koparresan' | 'maklarstod'

interface DashboardTabsProps {
  activeView: DashboardView
  onViewChange: (view: DashboardView) => void
  children: React.ReactNode
}

export default function DashboardTabs({ activeView, onViewChange, children }: DashboardTabsProps) {
  return (
    <Tabs.Root value={activeView} onValueChange={(value) => onViewChange(value as DashboardView)}>
      <Tabs.List className="flex gap-1 border-b border-gray-200 mb-6">
        <Tabs.Trigger
          value="allman"
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            'border-b-2 border-transparent',
            'hover:text-gray-900',
            'data-[state=active]:border-blue-500 data-[state=active]:text-blue-600'
          )}
        >
          Allmän vy
        </Tabs.Trigger>
        <Tabs.Trigger
          value="saljarresan"
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            'border-b-2 border-transparent',
            'hover:text-gray-900',
            'data-[state=active]:border-blue-500 data-[state=active]:text-blue-600'
          )}
        >
          Säljarresan vy
        </Tabs.Trigger>
        <Tabs.Trigger
          value="koparresan"
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            'border-b-2 border-transparent',
            'hover:text-gray-900',
            'data-[state=active]:border-blue-500 data-[state=active]:text-blue-600'
          )}
        >
          Köparresan vy
        </Tabs.Trigger>
        <Tabs.Trigger
          value="maklarstod"
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            'border-b-2 border-transparent',
            'hover:text-gray-900',
            'data-[state=active]:border-blue-500 data-[state=active]:text-blue-600'
          )}
        >
          Mäklarstöd vy
        </Tabs.Trigger>
      </Tabs.List>
      {children}
    </Tabs.Root>
  )
} 