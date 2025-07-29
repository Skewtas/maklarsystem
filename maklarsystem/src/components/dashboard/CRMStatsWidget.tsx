'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

// CRM Stats data
const crmStats = [
  {
    label: "Tips och leads",
    description: "Obehandlade tips och leads",
    value: 3,
    color: "text-blue-500"
  },
  {
    label: "Kundmöten",
    description: "Framtida kundmöten",
    value: 0,
    color: "text-gray-500"
  },
  {
    label: "Återkomster",
    description: "Obehandlade återkomster",
    value: 6,
    color: "text-cyan-500"
  },
  {
    label: "Uppföljningar",
    description: "Efter möte, visning, tillträde",
    value: 0,
    color: "text-gray-500"
  },
  {
    label: "Ringlistor",
    description: "Aktiva, ej avslutade ringlistor",
    value: 0,
    color: "text-gray-500"
  },
  {
    label: "Utskick",
    description: "Kommande utskick",
    value: 0,
    color: "text-gray-500"
  }
]

// Glass Card Component matching the main design
const GlassCard = ({ children, className = "", hover = true, ...props }: { 
  children: React.ReactNode
  className?: string
  hover?: boolean
  [key: string]: any
}) => (
  <div 
    className={`backdrop-blur-xl bg-white/20 rounded-3xl border border-white/30 shadow-xl transition-all duration-300 ${hover ? 'hover:bg-white/30 hover:shadow-2xl hover:-translate-y-1' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
)

export default function CRMStatsWidget() {
  return (
    <GlassCard className="p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800">CRM</h2>
        <Link href="/crm" className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors">
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      {/* CRM Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        {crmStats.map((stat, index) => (
          <div key={index} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100/50 to-gray-200/30 rounded-xl blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
            <div className="relative bg-white/30 backdrop-blur-sm rounded-xl p-3 border border-white/40 hover:bg-white/40 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-xs font-medium text-gray-700 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500 leading-tight">
                  {stat.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
} 