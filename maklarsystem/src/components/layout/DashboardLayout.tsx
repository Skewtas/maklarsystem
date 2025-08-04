'use client'

import Navigation from './Navigation'
import Sidebar from './Sidebar'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useSupabase } from '@/lib/supabase-provider'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true) // Start with sidebar open by default
  const { user, loading } = useSupabase()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Laddar...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className={cn(
        "relative flex-1 flex flex-col transition-all duration-300",
        // Add proper margin for desktop to prevent overlap
        sidebarOpen ? "lg:ml-0" : "lg:ml-0"
      )}>
        <Navigation onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className={cn(
          "flex-1 transition-all duration-300",
          // Add mobile overlay protection
          sidebarOpen && "lg:relative"
        )}>
          {children}
        </main>
      </div>

      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
} 