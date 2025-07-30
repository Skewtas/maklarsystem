'use client'

import { TrendingUp, DollarSign, Home, Users } from 'lucide-react'

// Glass Card Component matching the main design
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

export default function ModernStatsWidget() {
  const stats = [
    {
      title: 'Totalt värde',
      value: '125.4M kr',
      change: '+12%',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20'
    },
    {
      title: 'Aktiva objekt',
      value: '24',
      change: '+3',
      icon: Home,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20'
    },
    {
      title: 'Nya leads',
      value: '156',
      change: '+15%',
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20'
    },
    {
      title: 'Försäljning',
      value: '8.2M kr',
      change: '+8%',
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/20'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <GlassCard key={index} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${stat.bgColor} rounded-2xl flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <span className={`text-sm font-medium ${stat.color}`}>
              {stat.change}
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-600">{stat.title}</p>
          </div>
        </GlassCard>
      ))}
    </div>
  )
}