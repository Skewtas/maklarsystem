'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  Plus, 
  Home, 
  Building, 
  Users, 
  FolderOpen, 
  Building2, 
  UserCheck, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  Settings, 
  HelpCircle 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  isPinned?: boolean
}

const menuItems = [
  { icon: Plus, label: 'Nytt', href: '/nytt' },
  { icon: Home, label: 'Startsida', href: '/dashboard' },
  { icon: Building, label: 'Objekt', href: '/objekt' },
  { icon: Users, label: 'Kontakter', href: '/kontakter' },
  { icon: FolderOpen, label: 'Projekt', href: '/projekt' },
  { icon: Building2, label: 'Organisationer', href: '/organisationer' },
  { icon: UserCheck, label: 'CRM', href: '/crm' },
  { icon: CheckSquare, label: 'Att göra', href: '/att-gora' },
  { icon: Calendar, label: 'Kalender', href: '/kalender' },
  { icon: BarChart3, label: 'Business Intelligence', href: '/bi' },
  { icon: Settings, label: 'Inställningar', href: '/installningar' },
  { icon: HelpCircle, label: 'Hjälp', href: '/hjalp' },
]

export default function Sidebar({ isOpen, isPinned = false }: SidebarProps) {
  const pathname = usePathname()
  const [isLargeScreen, setIsLargeScreen] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return (
    <aside
      className={cn(
        'bg-slate-900 text-white transition-all duration-300 flex flex-col border-r border-slate-800',
        // Mobile states - keep fixed positioning with proper z-index
        'fixed left-0 top-0 bottom-0 z-40 lg:relative lg:z-10',
        isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64',
        // Desktop states - use relative positioning in flex layout
        'lg:translate-x-0',
        isOpen ? 'lg:w-64 lg:min-w-[256px]' : 'lg:w-16 lg:min-w-[64px]'
      )}
    >
      {/* Sidebar Header - only show when expanded */}
      <div className={cn(
        'h-16 flex items-center px-6 border-b border-slate-800',
        !isOpen && 'lg:px-4 lg:justify-center'
      )}>
        {isOpen && (
          <h1 className="text-lg font-semibold text-white">Mäklarsystem</h1>
        )}
        {!isOpen && isLargeScreen && (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/dashboard')
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    'hover:bg-slate-800 group relative',
                    isActive && 'bg-blue-600 text-white shadow-lg',
                    !isActive && 'text-slate-300 hover:text-white',
                    !isOpen && 'lg:justify-center lg:px-3'
                  )}
                  title={!isOpen && isLargeScreen ? item.label : undefined}
                >
                  <Icon className={cn(
                    "flex-shrink-0 transition-all duration-200",
                    isActive ? "w-5 h-5" : "w-5 h-5 group-hover:scale-110"
                  )} />
                  
                  {/* Text - show when sidebar is open or on mobile */}
                  <span className={cn(
                    "text-sm font-medium transition-all duration-200 whitespace-nowrap",
                    !isOpen && 'lg:hidden'
                  )}>
                    {item.label}
                  </span>
                  
                  {/* Tooltip for collapsed state on desktop */}
                  {!isOpen && isLargeScreen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-60">
                      {item.label}
                    </div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer - Optional user info or settings */}
      <div className={cn(
        'p-4 border-t border-slate-800',
        !isOpen && 'lg:p-2'
      )}>
        {isOpen && (
          <div className="text-xs text-slate-400 text-center">
            v1.0.0
          </div>
        )}
      </div>
    </aside>
  )
} 