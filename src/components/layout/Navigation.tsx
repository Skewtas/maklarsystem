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
    <nav className="bg-white border-b border-gray-200 h-16 flex items-center px-6 gap-4 shadow-sm relative z-50">
      {/* Left section */}
      <div className="flex items-center gap-2">
        {/* Hamburger menu */}
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Desktop menu toggle */}
        <button
          onClick={onMenuClick}
          className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* History button */}
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Recent items"
        >
          <RotateCcw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Sök objekt, kontakter eller projekt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
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