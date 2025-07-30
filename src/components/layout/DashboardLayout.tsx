'use client'

import Navigation from './Navigation'
import Sidebar from './Sidebar'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true) // Start with sidebar open by default

  // Since auth is disabled, always show the dashboard
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="relative flex-1 flex flex-col">
        <Navigation onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
} 