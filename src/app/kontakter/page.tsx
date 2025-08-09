'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Plus, Filter, Download, Search, ChevronDown, Mail, Phone, Building2, User, Loader2, Users, MapPin, Calendar, Star, ArrowRight, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import * as Select from '@radix-ui/react-select'
import * as Checkbox from '@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'
import { useKontakter, useKontakterSubscription } from '@/lib/api/kontakter'
import { Database } from '@/types/database'

type Kontakt = Database['public']['Tables']['kontakter']['Row']

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
    <div className="absolute top-16 left-16 w-36 h-36 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-2xl animate-pulse"></div>
    <div className="absolute top-48 right-32 w-52 h-52 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
    <div className="absolute bottom-32 left-1/3 w-28 h-28 bg-gradient-to-br from-orange-200/20 to-yellow-200/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
    <div className="absolute bottom-48 right-1/5 w-64 h-64 bg-gradient-to-br from-cyan-200/20 to-teal-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
  </div>
)

export default function KontakterPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [kategoriFilter, setKategoriFilter] = useState<'saljare' | 'kopare' | 'spekulant' | 'ovrig' | 'alla'>('alla')
  const [typFilter, setTypFilter] = useState<'privatperson' | 'foretag' | 'alla'>('alla')
  const [selectedKontakter, setSelectedKontakter] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Use real-time subscription
  useKontakterSubscription()

  // Fetch contacts with filters
  const { data: kontakter = [], isLoading, error } = useKontakter({
    kategori: kategoriFilter !== 'alla' ? kategoriFilter : undefined,
    typ: typFilter !== 'alla' ? typFilter : undefined,
    search: searchQuery,
  })

  const getKategoriBadge = (kategori: string) => {
    const kategoriStyles = {
      saljare: 'bg-gradient-to-r from-blue-400 to-blue-500 text-white',
      kopare: 'bg-gradient-to-r from-green-400 to-green-500 text-white',
      spekulant: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
      ovrig: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
    }

    const kategoriLabels = {
      saljare: 'Säljare',
      kopare: 'Köpare',
      spekulant: 'Spekulant',
      ovrig: 'Övrig',
    }

    const kategoriIcons = {
      saljare: '🏡',
      kopare: '🔍',
      spekulant: '👀',
      ovrig: '👤'
    }

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium shadow-lg ${kategoriStyles[kategori as keyof typeof kategoriStyles] || kategoriStyles.ovrig}`}>
        <span>{kategoriIcons[kategori as keyof typeof kategoriIcons] || '👤'}</span>
        <span>{kategoriLabels[kategori as keyof typeof kategoriLabels] || kategori}</span>
      </span>
    )
  }

  const getTypBadge = (typ: string) => {
    return (
      <span className="inline-flex items-center backdrop-blur-xl bg-white/20 border border-white/30 px-2 py-1 rounded-full text-xs font-medium text-gray-700 capitalize">
        {typ === 'privatperson' ? 'Privatperson' : 
         typ === 'foretag' ? 'Företag' : 
         typ === 'organisation' ? 'Organisation' : typ}
      </span>
    )
  }

  // Mock data for demonstration when no real data
  const mockKontakter = kontakter.length > 0 ? kontakter : [
    {
      id: '1',
      fornamn: 'Anna',
      efternamn: 'Andersson',
      email: 'anna.andersson@email.com',
      telefon: '070-123 45 67',
      kategori: 'saljare',
      typ: 'privatperson',
      adress: 'Storgatan 12',
      ort: 'Stockholm',
      created_at: new Date().toISOString(),
      anteckningar: 'Intresserad av att sälja villa i Södermalm'
    },
    {
      id: '2',
      fornamn: 'Erik',
      efternamn: 'Eriksson',
      email: 'erik.eriksson@company.se',
      telefon: '070-234 56 78',
      kategori: 'kopare',
      typ: 'privatperson',
      adress: 'Parkvägen 5',
      ort: 'Göteborg',
      created_at: new Date().toISOString(),
      anteckningar: 'Söker lägenhet i centrala Göteborg, budget 4-6 Mkr'
    },
    {
      id: '3',
      fornamn: 'Maria',
      efternamn: 'Nilsson',
      email: 'maria.nilsson@example.com',
      telefon: '070-345 67 89',
      kategori: 'spekulant',
      typ: 'privatperson',
      adress: 'Sjövägen 8',
      ort: 'Malmö',
      created_at: new Date().toISOString(),
      anteckningar: 'Investeringsintresse i Malmöområdet'
    }
  ]

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100 relative overflow-hidden -m-6 p-6 pt-2">
          <FloatingElements />
          <div className="relative z-10 flex items-center justify-center min-h-[400px]">
            <GlassCard className="p-8 text-center">
              <p className="text-red-600 font-medium">Ett fel uppstod vid hämtning av kontakter.</p>
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
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 relative overflow-hidden -m-6 p-6 pt-2">
        <FloatingElements />
        
        <div className="relative z-10 space-y-6">
          {/* Header */}
          <GlassCard className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-light text-gray-800 mb-2">Kontakter 👥</h1>
                <p className="text-gray-600">Hantera alla dina kunder, säljare och affärskontakter</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link href="/nytt?typ=kontakt" className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <Plus className="w-5 h-5" />
                  <span>Ny kontakt</span>
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
                    placeholder="Sök kontakter efter namn, email eller telefon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Select.Root value={kategoriFilter} onValueChange={(value) => setKategoriFilter(value as 'saljare' | 'kopare' | 'spekulant' | 'ovrig' | 'alla')}>
                  <Select.Trigger className="flex items-center justify-between backdrop-blur-xl bg-white/20 border border-white/30 px-4 py-3 rounded-2xl font-medium text-gray-700 hover:bg-white/30 transition-all duration-300 min-w-[160px]">
                    <Select.Value placeholder="Kategori" />
                    <ChevronDown className="w-4 h-4" />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="backdrop-blur-xl bg-white/90 border border-white/40 rounded-2xl shadow-xl z-50">
                      <Select.Viewport className="p-2">
                        <Select.Item value="alla" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                          <Select.ItemText>Alla kategorier</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="saljare" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                          <Select.ItemText>Säljare</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="kopare" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                          <Select.ItemText>Köpare</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="spekulant" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                          <Select.ItemText>Spekulant</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="ovrig" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                          <Select.ItemText>Övrig</Select.ItemText>
                        </Select.Item>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>

                <Select.Root value={typFilter} onValueChange={(value) => setTypFilter(value as 'privatperson' | 'foretag' | 'alla')}>
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
                        <Select.Item value="privatperson" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                          <Select.ItemText>Privatperson</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="foretag" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                          <Select.ItemText>Företag</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="organisation" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                          <Select.ItemText>Organisation</Select.ItemText>
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
                    <Users className="w-5 h-5" />
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
                Visar <span className="font-semibold text-gray-800">{mockKontakter.length}</span> kontakter
              </p>
              {isLoading && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Uppdaterar...</span>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Contacts Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockKontakter.map((kontakt) => (
                <GlassCard key={kontakt.id} className="p-6 group">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {kontakt.fornamn?.charAt(0)}{kontakt.efternamn?.charAt(0)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">
                            {kontakt.fornamn} {kontakt.efternamn}
                          </h3>
                          <div className="mt-1">
                            {getKategoriBadge(kontakt.kategori || 'ovrig')}
                          </div>
                        </div>
                        <div className="text-right">
                          {getTypBadge(kontakt.typ || 'privatperson')}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {kontakt.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{kontakt.email}</span>
                          </div>
                        )}
                        
                        {kontakt.telefon && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>{kontakt.telefon}</span>
                          </div>
                        )}
                        
                        {(kontakt.adress || kontakt.ort) && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">
                              {kontakt.adress && kontakt.ort ? `${kontakt.adress}, ${kontakt.ort}` : 
                               kontakt.adress || kontakt.ort}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {kontakt.anteckningar && (
                        <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-xl p-3 mb-4">
                          <p className="text-sm text-gray-700 line-clamp-2">{kontakt.anteckningar}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-3 border-t border-white/20">
                        <div className="flex space-x-2">
                          {kontakt.telefon && (
                            <button className="text-gray-400 hover:text-green-500 transition-colors p-2 backdrop-blur-xl bg-white/20 border border-white/30 rounded-xl">
                              <Phone className="w-4 h-4" />
                            </button>
                          )}
                          {kontakt.email && (
                            <button className="text-gray-400 hover:text-blue-500 transition-colors p-2 backdrop-blur-xl bg-white/20 border border-white/30 rounded-xl">
                              <Mail className="w-4 h-4" />
                            </button>
                          )}
                          <button className="text-gray-400 hover:text-purple-500 transition-colors p-2 backdrop-blur-xl bg-white/20 border border-white/30 rounded-xl">
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <Link href={`/kontakter/${kontakt.id}`} className="text-blue-600 hover:text-blue-700 transition-colors">
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {mockKontakter.map((kontakt) => (
                <GlassCard key={kontakt.id} className="p-6 hover:scale-[1.01]">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {kontakt.fornamn?.charAt(0)}{kontakt.efternamn?.charAt(0)}
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{kontakt.fornamn} {kontakt.efternamn}</h3>
                        <div className="mt-1">
                          {getKategoriBadge(kontakt.kategori || 'ovrig')}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Kontaktinfo</p>
                        <div className="space-y-1">
                          {kontakt.email && <p className="text-sm text-gray-800 truncate">{kontakt.email}</p>}
                          {kontakt.telefon && <p className="text-sm text-gray-800">{kontakt.telefon}</p>}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Adress</p>
                        <p className="text-sm text-gray-800">
                          {kontakt.adress && kontakt.ort ? `${kontakt.adress}, ${kontakt.ort}` : 
                           kontakt.adress || kontakt.ort || 'Ej angiven'}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          {kontakt.telefon && (
                            <button className="text-gray-400 hover:text-green-500 transition-colors">
                              <Phone className="w-4 h-4" />
                            </button>
                          )}
                          {kontakt.email && (
                            <button className="text-gray-400 hover:text-blue-500 transition-colors">
                              <Mail className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <Link href={`/kontakter/${kontakt.id}`} className="text-blue-600 hover:text-blue-700 transition-colors">
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
          {mockKontakter.length === 0 && !isLoading && (
            <GlassCard className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Inga kontakter hittades</h3>
              <p className="text-gray-600 mb-6">Försök justera dina sökfilter eller lägg till en ny kontakt.</p>
              <Link href="/nytt?typ=kontakt" className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                <Plus className="w-5 h-5" />
                <span>Lägg till kontakt</span>
              </Link>
            </GlassCard>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
} 