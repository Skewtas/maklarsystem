'use client'

import { useState } from 'react'
import { Menu, ArrowLeft, RotateCcw, Bell, Search, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import UserMenu from './UserMenu'

interface NavigationProps {
  onMenuClick: () => void
  notificationCount?: number
}

export default function Navigation({ onMenuClick, notificationCount = 0 }: NavigationProps) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <nav className="glass-nav h-16 flex items-center px-6 gap-4 sticky top-0 z-40">
      {/* Left section */}
      <div className="flex items-center gap-2">
        {/* Hamburger menu */}
        <button
          onClick={onMenuClick}
          className="glass-button p-2 text-white/80 hover:text-white lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop menu toggle */}
        <button
          onClick={onMenuClick}
          className="hidden lg:flex glass-button p-2 text-white/80 hover:text-white"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="glass-button p-2 text-white/80 hover:text-white"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* History button */}
        <button
          className="glass-button p-2 text-white/80 hover:text-white"
          aria-label="Recent items"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
          <input
            type="text"
            placeholder="Sök objekt, kontakter eller projekt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass-input text-white placeholder-white/60 text-sm 
                       focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40
                       transition-all duration-200"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          className="glass-button p-2 text-white/80 hover:text-white relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-lg">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* User menu */}
        <UserMenu />
      </div>
    </nav>
  )
} 