'use client'

import { useState } from 'react'
import { Calendar, RefreshCw } from 'lucide-react'

interface StatsData {
  title: string
  period: string
  metrics: {
    kundmoten: { current: number, target: number, unit: string }
    salda: { current: number, target: number, unit: string }
    provision: { current: number, target: number, unit: string }
  }
  hitRate: number
}

const statsOptions = [
  {
    title: "Mina nyckeltal för 2025",
    period: "2025",
    metrics: {
      kundmoten: { current: 1, target: 435, unit: "st" },
      salda: { current: 2, target: 63, unit: "st" },
      provision: { current: 48, target: 2340, unit: "tkr" }
    },
    hitRate: 100
  },
  {
    title: "Mina nyckeltal för juli",
    period: "Juli 2024",
    metrics: {
      kundmoten: { current: 0, target: 30, unit: "st" },
      salda: { current: 0, target: 5, unit: "st" },
      provision: { current: 0, target: 200, unit: "tkr" }
    },
    hitRate: 0
  },
  {
    title: "Mina nyckeltal för Q4",
    period: "Q4 2024",
    metrics: {
      kundmoten: { current: 45, target: 120, unit: "st" },
      salda: { current: 8, target: 25, unit: "st" },
      provision: { current: 280, target: 800, unit: "tkr" }
    },
    hitRate: 85
  },
  {
    title: "Mina nyckeltal för månad",
    period: "December 2024",
    metrics: {
      kundmoten: { current: 15, target: 40, unit: "st" },
      salda: { current: 3, target: 8, unit: "st" },
      provision: { current: 120, target: 300, unit: "tkr" }
    },
    hitRate: 70
  }
]

export default function ModernStatsWidget() {
  const [currentStatsIndex, setCurrentStatsIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  
  const currentStats = statsOptions[currentStatsIndex]

  const handlePeriodChange = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentStatsIndex((prev) => (prev + 1) % statsOptions.length)
      setIsAnimating(false)
    }, 200)
  }

  const calculatePercentage = (current: number, target: number) => {
    return target > 0 ? Math.min((current / target) * 100, 100) : 0
  }

  return (
    <div className="backdrop-blur-xl bg-white/20 rounded-xl border border-white/30 shadow-lg p-6 transition-all duration-500">
      {/* Header and Stats in one row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            {currentStats.title}
          </h2>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Calendar className="w-3 h-3" />
            <span>{currentStats.period}</span>
          </div>
        </div>
        
        {/* Modern Stats Display */}
        <div className={`flex items-center gap-4 transition-all duration-500 ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
          {/* Kundmöten */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
            <div className="relative bg-white/40 backdrop-blur-sm rounded-xl p-3 border border-white/30 hover:bg-white/50 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse" />
                <div className="text-xs font-medium text-gray-700">Kundmöten</div>
              </div>
              <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {currentStats.metrics.kundmoten.current} {currentStats.metrics.kundmoten.unit}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex-1 bg-gray-200/60 rounded-full h-1 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${calculatePercentage(currentStats.metrics.kundmoten.current, currentStats.metrics.kundmoten.target)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-blue-600">
                  {calculatePercentage(currentStats.metrics.kundmoten.current, currentStats.metrics.kundmoten.target).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Sålda */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
            <div className="relative bg-white/40 backdrop-blur-sm rounded-xl p-3 border border-white/30 hover:bg-white/50 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse" />
                <div className="text-xs font-medium text-gray-700">Sålda</div>
              </div>
              <div className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {currentStats.metrics.salda.current} {currentStats.metrics.salda.unit}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex-1 bg-gray-200/60 rounded-full h-1 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${calculatePercentage(currentStats.metrics.salda.current, currentStats.metrics.salda.target)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-green-600">
                  {calculatePercentage(currentStats.metrics.salda.current, currentStats.metrics.salda.target).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Provision */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
            <div className="relative bg-white/40 backdrop-blur-sm rounded-xl p-3 border border-white/30 hover:bg-white/50 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
                <div className="text-xs font-medium text-gray-700">Provision</div>
              </div>
              <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {currentStats.metrics.provision.current} {currentStats.metrics.provision.unit}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex-1 bg-gray-200/60 rounded-full h-1 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${calculatePercentage(currentStats.metrics.provision.current, currentStats.metrics.provision.target)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-purple-600">
                  {calculatePercentage(currentStats.metrics.provision.current, currentStats.metrics.provision.target).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Period Switch Button */}
          <button
            onClick={handlePeriodChange}
            disabled={isAnimating}
            className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 text-xs"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-1">
              <RefreshCw className={`w-3 h-3 ${isAnimating ? 'animate-spin' : ''}`} />
              <span>Ändra</span>
            </div>
          </button>
        </div>
      </div>

      {/* Hit Rate Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-700">Hit rate</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-800">{currentStats.hitRate}%</span>
            
            {/* Period Indicators */}
            <div className="flex gap-1">
              {statsOptions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAnimating(true)
                    setTimeout(() => {
                      setCurrentStatsIndex(index)
                      setIsAnimating(false)
                    }, 200)
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStatsIndex 
                      ? 'bg-blue-500 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Hit Rate Progress Bar */}
        <div className="w-full bg-gray-200/50 rounded-full h-1.5 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${currentStats.hitRate}%` }}
          />
        </div>
      </div>
    </div>
  )
} 