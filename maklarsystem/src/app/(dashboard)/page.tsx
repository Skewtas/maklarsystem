'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import ModernStatsWidget from '@/components/dashboard/ModernStatsWidget'
import CRMStatsWidget from '@/components/dashboard/CRMStatsWidget'
import { 
  Home, 
  Users, 
  Eye, 
  CheckCircle, 
  ArrowRight, 
  Calendar, 
  Phone, 
  Mail,
  AlertCircle,
  Clock,
  MapPin,
  Camera,
  UserPlus,
  Search,
  Filter
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

// Modern Glass Card Component - same as objekt page
const GlassCard = ({ children, className = "", hover = true, ...props }: { 
  children: React.ReactNode
  className?: string
  hover?: boolean
  [key: string]: any
}) => (
  <div 
    className={`backdrop-blur-xl bg-white/20 rounded-3xl border border-white/30 shadow-xl transition-all duration-300 ${hover ? 'hover:bg-white/30 hover:shadow-2xl hover:scale-[1.02]' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
)

// Floating Background Elements - same as objekt page
const FloatingElements = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl animate-pulse"></div>
    <div className="absolute top-60 right-40 w-56 h-56 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
    <div className="absolute bottom-40 left-1/4 w-32 h-32 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
    <div className="absolute bottom-60 right-1/4 w-72 h-72 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
  </div>
)

// Search Section Component
const SearchSection = () => {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Main Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Sök objekt, kontakter eller projekt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex items-center justify-center space-x-2 backdrop-blur-xl bg-white/30 border border-white/40 text-gray-700 px-6 py-4 rounded-2xl font-medium hover:bg-white/40 transition-all duration-300">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
          <Link href="/nytt" className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-2xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
            <UserPlus className="w-5 h-5" />
            <span>Nytt objekt</span>
          </Link>
        </div>
      </div>
    </GlassCard>
  )
}

// Aktivitetsstatistik (24 objekt, 156 kontakter, etc.)
const ActivityStats = () => {
  const stats = [
    { icon: Home, label: 'Objekt till salu', value: '24', color: 'text-blue-500', bgColor: 'bg-blue-500/20' },
    { icon: Users, label: 'Aktiva kontakter', value: '156', color: 'text-green-500', bgColor: 'bg-green-500/20' },
    { icon: Eye, label: 'Genomförda visningar', value: '12', color: 'text-purple-500', bgColor: 'bg-purple-500/20' },
    { icon: CheckCircle, label: 'Avslutat denna månad', value: '8', color: 'text-orange-500', bgColor: 'bg-orange-500/20' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <GlassCard key={index} className="p-4 text-center">
          <div className={`w-10 h-10 ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div className="text-xl font-bold text-gray-800 mb-1">{stat.value}</div>
          <div className="text-xs text-gray-600">{stat.label}</div>
        </GlassCard>
      ))}
    </div>
  )
}

// Senaste objekten
const RecentProperties = () => {
  const properties = [
    {
      name: 'Storgatan 12',
      location: 'Villa',
      price: '4 500 000 kr',
      status: 'Till salu',
      statusColor: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Parkvägen 5',
      location: 'Lägenhet',
      price: '6 200 000 kr',
      status: 'Utgång',
      statusColor: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ]

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Senaste objekten</h3>
        <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
          Se alla <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        {properties.map((property, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-white/30 rounded-2xl">
            <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0"></div>
            <div className="flex-1">
              <div className="font-semibold text-gray-800 text-sm">{property.name}</div>
              <div className="text-xs text-gray-600">{property.location}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-800 text-sm">{property.price}</div>
              <div className={`text-xs px-2 py-1 rounded-lg ${property.bgColor} ${property.statusColor}`}>
                {property.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

// Senaste kontakterna
const RecentContacts = () => {
  const contacts = [
    { name: 'Anna Andersson', role: 'Säljare', avatar: 'A', color: 'bg-blue-500' },
    { name: 'Erik Eriksson', role: 'Köpare', avatar: 'E', color: 'bg-green-500' },
    { name: 'Maria Nilsson', role: 'Spekulant', avatar: 'M', color: 'bg-purple-500' },
  ]

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Senaste kontakterna</h3>
        <ArrowRight className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-3">
        {contacts.map((contact, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-8 h-8 ${contact.color} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
              {contact.avatar}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-800 text-sm">{contact.name}</div>
              <div className="text-xs text-gray-600">{contact.role}</div>
            </div>
            <div className="flex gap-1">
              <button className="p-1.5 hover:bg-white/30 rounded-lg">
                <Phone className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <button className="p-1.5 hover:bg-white/30 rounded-lg">
                <Mail className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

// Närmast i kalendern
const UpcomingCalendar = () => {
  const events = [
    { title: 'Visning - Storgatan 12', time: 'Idag 14:00', icon: Eye, color: 'text-blue-500' },
    { title: 'Möta med köpare', time: 'Idag 16:00', icon: Users, color: 'text-green-500' },
    { title: 'Fotografering', time: 'Imorgon 10:00', icon: Camera, color: 'text-purple-500' },
  ]

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Närmast i kalendern</h3>
        <ArrowRight className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-3">
        {events.map((event, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <div className="font-medium text-gray-800 text-sm">{event.title}</div>
              <div className="text-xs text-gray-600">{event.time}</div>
            </div>
            <button className="p-1.5 hover:bg-white/30 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

// Att göra-lista
const TodoList = () => {
  const todos = [
    { task: 'Ring tillbaka Anna Andersson', priority: 'high', icon: AlertCircle },
    { task: 'Uppdatera objektbeskrivning', priority: 'medium', icon: Clock },
    { task: 'Boka värdering', priority: 'low', icon: MapPin },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Att göra</h3>
        <ArrowRight className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-3">
        {todos.map((todo, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(todo.priority).replace('text-', 'bg-')}`}></div>
            <div className="flex-1">
              <div className="font-medium text-gray-800 text-sm">{todo.task}</div>
              <div className={`text-xs capitalize ${getPriorityColor(todo.priority)}`}>
                {todo.priority === 'high' ? 'Hög Prioritet' : 
                 todo.priority === 'medium' ? 'Medium Prioritet' : 'Låg Prioritet'}
              </div>
            </div>
            <button className="w-4 h-4 border-2 border-gray-300 rounded hover:border-blue-500 transition-colors"></button>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="flex-1 bg-gradient-to-br from-blue-100 via-purple-50 to-green-100 relative overflow-hidden px-6 py-8">
        <FloatingElements />
        
        <div className="relative z-10 space-y-6 w-full">
          {/* Search Section - FIRST PRIORITY AT TOP */}
          <SearchSection />

          {/* Välkomstmeddelande - Modern Glass Design */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <span className="text-3xl">👋</span>
              <div>
                <h1 className="text-3xl font-light text-gray-800 mb-2">Välkommen tillbaka!</h1>
                <p className="text-gray-600">Här är en översikt över dina objekt och aktiviteter</p>
              </div>
            </div>
          </GlassCard>

          {/* Nyckeltal widget */}
          <ModernStatsWidget />

          {/* Aktivitetsstatistik */}
          <ActivityStats />

          {/* Grid med alla sektioner */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
            <RecentProperties />
            <RecentContacts />
            <UpcomingCalendar />
            <TodoList />
          </div>

          {/* CRM Widget */}
          <CRMStatsWidget />
        </div>
      </div>
    </DashboardLayout>
  )
}
