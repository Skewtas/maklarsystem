'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Plus, Filter, Download, Search, ChevronDown, Loader2, Building, MapPin, Eye, Heart, Phone, Mail, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import * as Select from '@radix-ui/react-select'
import * as Checkbox from '@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'
import { useObjekt, useObjektSubscription } from '@/lib/api/objekt'
import { Database } from '@/types/database'

type Objekt = Database['public']['Tables']['objekt']['Row'] & {
  maklare?: { id: string; full_name: string | null; email: string } | null
  saljare?: { id: string; fornamn: string | null; efternamn: string | null } | null
  kopare?: { id: string; fornamn: string | null; efternamn: string | null } | null
}

// Modern Glass Card Component
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

// Floating Background Elements
const FloatingElements = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl animate-pulse"></div>
    <div className="absolute top-60 right-40 w-56 h-56 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
    <div className="absolute bottom-40 left-1/4 w-32 h-32 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
    <div className="absolute bottom-60 right-1/4 w-72 h-72 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
  </div>
)

export default function ObjektPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('alla')
  const [typFilter, setTypFilter] = useState('alla')
  const [selectedObjekt, setSelectedObjekt] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Use real-time subscription
  useObjektSubscription()

  // Fetch objects with filters
  const { data: objekt = [], isLoading, error } = useObjekt({
    status: statusFilter !== 'alla' ? statusFilter : undefined,
    typ: typFilter !== 'alla' ? typFilter : undefined,
  })

  // Filter objects based on search query
  const filteredObjekt = objekt.filter((obj: Objekt) => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      obj.adress?.toLowerCase().includes(search) ||
      obj.ort?.toLowerCase().includes(search) ||
      obj.objektnummer?.toLowerCase().includes(search)
    )
  })

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      kundbearbetning: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
      uppdrag: 'bg-gradient-to-r from-blue-400 to-blue-500 text-white',
      till_salu: 'bg-gradient-to-r from-green-400 to-green-500 text-white',
      sald: 'bg-gradient-to-r from-purple-400 to-purple-500 text-white',
    }
    
    const labels = {
      kundbearbetning: 'Kundbearbetning',
      uppdrag: 'Uppdrag',
      till_salu: 'Till salu',
      sald: 'Såld',
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-lg ${statusStyles[status as keyof typeof statusStyles] || statusStyles.kundbearbetning}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  const getTypeBadge = (typ: string) => {
    const typeIcons = {
      villa: '🏡',
      lagenhet: '🏢', 
      radhus: '🏘️',
      fritidshus: '🏖️',
      tomt: '🌲'
    }
    
    return (
      <span className="inline-flex items-center space-x-1 backdrop-blur-xl bg-white/20 border border-white/30 px-3 py-1 rounded-full text-xs font-medium text-gray-700">
        <span>{typeIcons[typ as keyof typeof typeIcons] || '🏠'}</span>
        <span className="capitalize">{typ}</span>
      </span>
    )
  }

  // Use real data from Supabase
  const displayObjekt = filteredObjekt

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100 relative overflow-hidden -m-6 p-6">
          <FloatingElements />
          <div className="relative z-10 flex items-center justify-center min-h-[400px]">
            <GlassCard className="p-8 text-center">
              <p className="text-red-600 font-medium">Ett fel uppstod vid hämtning av objekt.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-2xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                Försök igen
              </button>
            </GlassCard>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-green-100 relative overflow-hidden -m-6 p-6">
        <FloatingElements />
        
        <div className="relative z-10 space-y-6">
          {/* Header */}
          <GlassCard className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-light text-gray-800 mb-2">Objekt 🏡</h1>
                <p className="text-gray-600">Hantera alla dina fastighetsobjekt på ett ställe</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link href="/nytt" className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <Plus className="w-5 h-5" />
                  <span>Nytt objekt</span>
                </Link>
                
                <button className="flex items-center justify-center space-x-2 backdrop-blur-xl bg-white/30 border border-white/40 text-gray-700 px-6 py-3 rounded-2xl font-medium hover:bg-white/40 transition-all duration-300">
                  <Download className="w-5 h-5" />
                  <span>Exportera</span>
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Filters and Search */}
          <GlassCard className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Sök objekt efter adress, ort eller objektnummer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
                  <Select.Trigger className="flex items-center justify-between backdrop-blur-xl bg-white/20 border border-white/30 px-4 py-3 rounded-2xl font-medium text-gray-700 hover:bg-white/30 transition-all duration-300 min-w-[160px]">
                    <Select.Value placeholder="Status" />
                    <ChevronDown className="w-4 h-4" />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="backdrop-blur-xl bg-white/90 border border-white/40 rounded-2xl shadow-xl z-50">
                      <Select.Viewport className="p-2">
                        <Select.Item value="alla" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                          <Select.ItemText>Alla statusar</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="kundbearbetning" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                          <Select.ItemText>Kundbearbetning</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="uppdrag" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                          <Select.ItemText>Uppdrag</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="till_salu" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                          <Select.ItemText>Till salu</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="sald" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                          <Select.ItemText>Såld</Select.ItemText>
                        </Select.Item>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>

                <Select.Root value={typFilter} onValueChange={setTypFilter}>
                  <Select.Trigger className="flex items-center justify-between backdrop-blur-xl bg-white/20 border border-white/30 px-4 py-3 rounded-2xl font-medium text-gray-700 hover:bg-white/30 transition-all duration-300 min-w-[160px]">
                    <Select.Value placeholder="Typ" />
                    <ChevronDown className="w-4 h-4" />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="backdrop-blur-xl bg-white/90 border border-white/40 rounded-2xl shadow-xl z-50">
                      <Select.Viewport className="p-2">
                        <Select.Item value="alla" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                          <Select.ItemText>Alla typer</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="villa" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                          <Select.ItemText>Villa</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="lagenhet" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                          <Select.ItemText>Lägenhet</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="radhus" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                          <Select.ItemText>Radhus</Select.ItemText>
                        </Select.Item>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>

                <div className="flex backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-3 transition-all duration-300 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-white/20'}`}
                  >
                    <Building className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-3 transition-all duration-300 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-white/20'}`}
                  >
                    <Filter className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Results Header */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Visar <span className="font-semibold text-gray-800">{displayObjekt.length}</span> objekt
              </p>
              {isLoading && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Uppdaterar...</span>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Objects Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayObjekt.map((obj: any) => (
                <GlassCard key={obj.id} className="p-0 overflow-hidden group">
                  <div className="relative">
                    {/* Image placeholder */}
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute top-4 left-4">
                        {getStatusBadge(obj.status || 'kundbearbetning')}
                      </div>
                      <div className="absolute top-4 right-4 flex space-x-2">
                        <button className="backdrop-blur-xl bg-white/20 border border-white/30 p-2 rounded-full hover:bg-white/30 transition-all duration-300">
                          <Heart className="w-4 h-4 text-white" />
                        </button>
                        <button className="backdrop-blur-xl bg-white/20 border border-white/30 p-2 rounded-full hover:bg-white/30 transition-all duration-300">
                          <Eye className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-semibold text-lg mb-1">{obj.adress}</h3>
                        <div className="flex items-center text-white/80 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          {obj.ort}
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        {getTypeBadge(obj.typ || 'villa')}
                        <span className="text-sm text-gray-600">#{obj.objektnummer}</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Pris</span>
                          <span className="font-bold text-lg text-gray-800">
                            {obj.utgangspris ? `${(obj.utgangspris / 1000000).toFixed(1)} Mkr` : 'Pris på begäran'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Storlek</span>
                          <span className="font-medium text-gray-800">
                            {obj.boarea ? `${obj.boarea} m²` : 'Ej angivet'} • {obj.rum ? `${obj.rum} rum` : 'Antal rum ej angivet'}
                          </span>
                        </div>
                        
                        {obj.maklare && (
                          <div className="flex items-center justify-between pt-3 border-t border-white/20">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {obj.maklare.full_name?.charAt(0) || 'M'}
                              </div>
                              <span className="text-sm text-gray-600">{obj.maklare.full_name}</span>
                            </div>
                            <div className="flex space-x-2">
                              <button className="text-gray-400 hover:text-green-500 transition-colors">
                                <Phone className="w-4 h-4" />
                              </button>
                              <button className="text-gray-400 hover:text-blue-500 transition-colors">
                                <Mail className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <Link href={`/objekt/${obj.id}`} className="block mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-3 rounded-2xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                        Se detaljer
                      </Link>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {displayObjekt.map((obj: any) => (
                <GlassCard key={obj.id} className="p-6 hover:scale-[1.01]">
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex-shrink-0 flex items-center justify-center">
                      <Building className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{obj.adress}</h3>
                        <div className="flex items-center text-gray-600 text-sm mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {obj.ort}
                        </div>
                        <div className="mt-2">
                          {getTypeBadge(obj.typ || 'villa')}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Pris</p>
                        <p className="font-bold text-gray-800">
                          {obj.utgangspris ? `${(obj.utgangspris / 1000000).toFixed(1)} Mkr` : 'På begäran'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Storlek & Rum</p>
                        <p className="font-medium text-gray-800">
                          {obj.boarea ? `${obj.boarea} m²` : 'Ej angivet'} • {obj.rum ? `${obj.rum} rum` : 'Ej angivet'}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          {getStatusBadge(obj.status || 'kundbearbetning')}
                        </div>
                        <Link href={`/objekt/${obj.id}`} className="text-blue-600 hover:text-blue-700 transition-colors">
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Empty State */}
          {displayObjekt.length === 0 && !isLoading && (
            <GlassCard className="p-12 text-center">
              <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Inga objekt hittades</h3>
              <p className="text-gray-600 mb-6">Försök justera dina sökfilter eller lägg till ett nytt objekt.</p>
              <Link href="/nytt" className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                <Plus className="w-5 h-5" />
                <span>Lägg till objekt</span>
              </Link>
            </GlassCard>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
} 