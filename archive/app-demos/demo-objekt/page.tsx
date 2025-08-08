'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Edit, Trash2, MapPin, Home, Calendar, Users, Eye, Heart, Phone, Mail, Share2, Download, Camera, DollarSign, Ruler, CalendarDays, Building } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

// Glass Card Component
const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`backdrop-blur-xl bg-white/20 rounded-3xl border border-white/30 shadow-xl ${className}`}>
    {children}
  </div>
)

// Floating Background
const FloatingElements = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl animate-pulse"></div>
    <div className="absolute bottom-40 right-40 w-56 h-56 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
  </div>
)

export default function DemoObjektPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Mock data
  const objekt = {
    id: '1',
    adress: 'Storgatan 1',
    objektnummer: '2024-001',
    status: 'till_salu',
    typ: 'lagenhet',
    utgangspris: 3500000,
    boarea: 75,
    rum: 3,
    biarea: 10,
    tomtarea: null,
    byggaar: '2018',
    beskrivning: 'Välplanerad och ljus 3:a i populära området. Balkong i västerläge med kvällssol.',
    postnummer: '114 51',
    ort: 'Stockholm',
    kommun: 'Stockholm',
    lan: 'Stockholm',
    maklare: {
      full_name: 'Anna Andersson',
      email: 'anna@maklare.se'
    },
    saljare: {
      fornamn: 'Erik',
      efternamn: 'Eriksson',
      telefon: '070-123 45 67',
      email: 'erik@example.com'
    },
    visningar: [
      { id: 1, datum: '2024-01-20', starttid: '10:00', sluttid: '11:00', typ: 'Öppen visning' },
      { id: 2, datum: '2024-01-21', starttid: '14:00', sluttid: '15:00', typ: 'Öppen visning' }
    ]
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      kundbearbetning: 'bg-gradient-to-r from-gray-400 to-gray-500',
      uppdrag: 'bg-gradient-to-r from-blue-400 to-blue-500',
      till_salu: 'bg-gradient-to-r from-green-400 to-green-500',
      sald: 'bg-gradient-to-r from-purple-400 to-purple-500',
    }
    
    const labels = {
      kundbearbetning: 'Kundbearbetning',
      uppdrag: 'Uppdrag',
      till_salu: 'Till salu',
      sald: 'Såld',
    }

    return (
      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white shadow-lg ${statusStyles[status as keyof typeof statusStyles] || statusStyles.kundbearbetning}`}>
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
      <span className="inline-flex items-center space-x-2 backdrop-blur-xl bg-white/30 border border-white/40 px-4 py-2 rounded-full text-sm font-medium text-gray-700">
        <span className="text-lg">{typeIcons[typ as keyof typeof typeIcons] || '🏠'}</span>
        <span className="capitalize">{typ}</span>
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-green-100 relative overflow-hidden p-6">
      <FloatingElements />
      
      <div className="relative z-10 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/objekt" className="p-2 hover:bg-white/20 rounded-xl transition-all">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-light text-gray-800">{objekt.adress}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-gray-600">#{objekt.objektnummer}</span>
                  {getStatusBadge(objekt.status || 'kundbearbetning')}
                  {getTypeBadge(objekt.typ || 'villa')}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="p-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl hover:bg-white/40 transition-all">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl hover:bg-white/40 transition-all">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
              <Link href={`/objekt/${objekt.id}/redigera`} className="p-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl hover:bg-white/40 transition-all">
                <Edit className="w-5 h-5 text-gray-600" />
              </Link>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="p-3 backdrop-blur-xl bg-red-500/20 border border-red-500/40 rounded-2xl hover:bg-red-500/30 transition-all"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Tab Navigation */}
        <Tabs defaultValue="oversikt" className="w-full">
          <GlassCard className="p-2 mb-6">
            <TabsList className="grid grid-cols-4 lg:grid-cols-7 xl:grid-cols-13 gap-1 bg-transparent">
              <TabsTrigger value="oversikt" className="data-[state=active]:bg-white/40">Översikt</TabsTrigger>
              <TabsTrigger value="beskrivningar" className="data-[state=active]:bg-white/40">Beskrivningar</TabsTrigger>
              <TabsTrigger value="spekulanter" className="data-[state=active]:bg-white/40">Spekulanter</TabsTrigger>
              <TabsTrigger value="dokument" className="data-[state=active]:bg-white/40">Dokument</TabsTrigger>
              <TabsTrigger value="parter" className="data-[state=active]:bg-white/40">Parter</TabsTrigger>
              <TabsTrigger value="affaren" className="data-[state=active]:bg-white/40">Affären</TabsTrigger>
              <TabsTrigger value="bilder" className="data-[state=active]:bg-white/40">Bilder</TabsTrigger>
              <TabsTrigger value="visningar" className="data-[state=active]:bg-white/40">Visningar</TabsTrigger>
              <TabsTrigger value="foreningen" className="data-[state=active]:bg-white/40">Föreningen</TabsTrigger>
              <TabsTrigger value="marknadsforing" className="data-[state=active]:bg-white/40">Marknadsföring</TabsTrigger>
              <TabsTrigger value="tjanster" className="data-[state=active]:bg-white/40">Tjänster</TabsTrigger>
              <TabsTrigger value="lan-och-pant" className="data-[state=active]:bg-white/40">Lån och Pant</TabsTrigger>
              <TabsTrigger value="att-gora" className="data-[state=active]:bg-white/40">Att göra</TabsTrigger>
            </TabsList>
          </GlassCard>

          {/* Tab Content */}
          <TabsContent value="oversikt">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Images and Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Image Gallery */}
                <GlassCard className="p-0 overflow-hidden">
                  <div className="relative h-[500px] bg-gradient-to-br from-blue-400 to-purple-500">
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Camera className="w-16 h-16 text-white/50" />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 w-20 bg-white/20 backdrop-blur-xl rounded-xl"></div>
                      ))}
                    </div>
                  </div>
                </GlassCard>

                {/* Property Details */}
                <GlassCard className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Objektinformation</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-2">
                        <DollarSign className="w-5 h-5" />
                        <span className="text-sm">Utgångspris</span>
                      </div>
                      <p className="text-xl font-bold text-gray-800">
                        {objekt.utgangspris ? `${(objekt.utgangspris / 1000000).toFixed(1)} Mkr` : 'Ej angivet'}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-2">
                        <Ruler className="w-5 h-5" />
                        <span className="text-sm">Boarea</span>
                      </div>
                      <p className="text-xl font-bold text-gray-800">
                        {objekt.boarea ? `${objekt.boarea} m²` : 'Ej angivet'}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-2">
                        <Home className="w-5 h-5" />
                        <span className="text-sm">Antal rum</span>
                      </div>
                      <p className="text-xl font-bold text-gray-800">
                        {objekt.rum ? `${objekt.rum} rum` : 'Ej angivet'}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-2">
                        <Building className="w-5 h-5" />
                        <span className="text-sm">Biarea</span>
                      </div>
                      <p className="text-xl font-bold text-gray-800">
                        {objekt.biarea ? `${objekt.biarea} m²` : 'Ej angivet'}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-2">
                        <MapPin className="w-5 h-5" />
                        <span className="text-sm">Tomtarea</span>
                      </div>
                      <p className="text-xl font-bold text-gray-800">
                        {objekt.tomtarea ? `${objekt.tomtarea} m²` : 'Ej angivet'}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-2">
                        <CalendarDays className="w-5 h-5" />
                        <span className="text-sm">Byggår</span>
                      </div>
                      <p className="text-xl font-bold text-gray-800">
                        {objekt.byggaar || 'Ej angivet'}
                      </p>
                    </div>
                  </div>
                </GlassCard>

                {/* Description */}
                {objekt.beskrivning && (
                  <GlassCard className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Beskrivning</h2>
                    <p className="text-gray-600 whitespace-pre-wrap">{objekt.beskrivning}</p>
                  </GlassCard>
                )}

                {/* Location */}
                <GlassCard className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Plats</h2>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">{objekt.adress}</p>
                        <p className="text-gray-600">{objekt.postnummer} {objekt.ort}</p>
                        <p className="text-gray-600">{objekt.kommun}, {objekt.lan}</p>
                      </div>
                    </div>
                    
                    {/* Map placeholder */}
                    <div className="h-64 bg-gradient-to-br from-blue-200 to-green-200 rounded-2xl mt-4"></div>
                  </div>
                </GlassCard>
              </div>

              {/* Right Column - Actions and Info */}
              <div className="space-y-6">
                {/* Price Card */}
                <GlassCard className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Utgångspris</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {objekt.utgangspris ? `${objekt.utgangspris.toLocaleString('sv-SE')} kr` : 'Pris på begäran'}
                    </p>
                  </div>
                </GlassCard>

                {/* Agent Card */}
                {objekt.maklare && (
                  <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Ansvarig mäklare</h3>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-semibold">
                        {objekt.maklare.full_name?.charAt(0) || 'M'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{objekt.maklare.full_name}</p>
                        <p className="text-sm text-gray-600">{objekt.maklare.email}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button className="flex-1 flex items-center justify-center space-x-2 bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 transition-all">
                        <Phone className="w-4 h-4" />
                        <span>Ring</span>
                      </button>
                      <button className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition-all">
                        <Mail className="w-4 h-4" />
                        <span>E-post</span>
                      </button>
                    </div>
                  </GlassCard>
                )}

                {/* Actions */}
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Åtgärder</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-center space-x-2 backdrop-blur-xl bg-white/30 border border-white/40 py-3 rounded-2xl hover:bg-white/40 transition-all">
                      <Download className="w-5 h-5" />
                      <span>Ladda ner objektpresentation</span>
                    </button>
                    <button className="w-full flex items-center justify-center space-x-2 backdrop-blur-xl bg-white/30 border border-white/40 py-3 rounded-2xl hover:bg-white/40 transition-all">
                      <Eye className="w-5 h-5" />
                      <span>Förhandsgranska annons</span>
                    </button>
                  </div>
                </GlassCard>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="beskrivningar">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Beskrivningar</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Allmänt</h3>
                  <p className="text-gray-600">Välkommen till denna fantastiska bostad!</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Interiör</h3>
                  <p className="text-gray-600">Ljus och rymlig planlösning med genomgående parkettgolv.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Exteriör</h3>
                  <p className="text-gray-600">Balkong i västerläge med kvällssol.</p>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="spekulanter">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Spekulanter</h2>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">Johan Johansson</p>
                      <p className="text-sm text-gray-600">johan@example.com • 070-111 22 33</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Hög intresse</span>
                  </div>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">Maria Andersson</p>
                      <p className="text-sm text-gray-600">maria@example.com • 070-444 55 66</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Medel intresse</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="dokument">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Dokument</h2>
              <div className="space-y-4">
                <button className="w-full text-left p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-all">
                  <p className="font-medium text-gray-800">Objektbeskrivning.pdf</p>
                  <p className="text-sm text-gray-600">Uppladdad 2024-01-15</p>
                </button>
                <button className="w-full text-left p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-all">
                  <p className="font-medium text-gray-800">Planlösning.pdf</p>
                  <p className="text-sm text-gray-600">Uppladdad 2024-01-15</p>
                </button>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="parter">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Parter</h2>
              {objekt.saljare && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Säljare</h3>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-800">
                      {objekt.saljare.fornamn} {objekt.saljare.efternamn}
                    </p>
                    {objekt.saljare.telefon && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{objekt.saljare.telefon}</span>
                      </div>
                    )}
                    {objekt.saljare.email && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{objekt.saljare.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </GlassCard>
          </TabsContent>

          <TabsContent value="affaren">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Affären</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Uppdraget</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Uppdragstyp: <span className="font-medium">Ensamrätt</span></p>
                    <p className="text-sm text-gray-600">Startdatum: <span className="font-medium">2024-01-01</span></p>
                    <p className="text-sm text-gray-600">Slutdatum: <span className="font-medium">2024-06-30</span></p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Provision</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Typ: <span className="font-medium">Procent</span></p>
                    <p className="text-sm text-gray-600">Sats: <span className="font-medium">2,5%</span></p>
                    <p className="text-sm text-gray-600">Beräknad: <span className="font-medium">87 500 kr</span></p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="bilder">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Bilder</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="aspect-square bg-gradient-to-br from-blue-200 to-purple-200 rounded-xl"></div>
                ))}
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="visningar">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Visningar</h2>
              {objekt.visningar && objekt.visningar.length > 0 ? (
                <div className="space-y-3">
                  {objekt.visningar.map((visning) => (
                    <div key={visning.id} className="flex items-center justify-between p-3 bg-white/20 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-800">{visning.datum}</p>
                          <p className="text-sm text-gray-600">{visning.starttid} - {visning.sluttid}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">{visning.typ}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Inga visningar inbokade</p>
              )}
              <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-2xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all">
                Boka visning
              </button>
            </GlassCard>
          </TabsContent>

          <TabsContent value="foreningen">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Föreningen</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Föreningsnamn</h3>
                  <p className="text-gray-600">Brf Storgatan 1</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Månadsavgift</h3>
                  <p className="text-gray-600">4 250 kr/mån</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Ekonomi</h3>
                  <p className="text-gray-600">God ekonomi med låg belåning</p>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="marknadsforing">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Marknadsföring</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/20 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800">Hemnet</p>
                    <p className="text-sm text-gray-600">Aktiv sedan 2024-01-15</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">1 245 visningar</p>
                    <p className="text-sm text-gray-600">45 sparade</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/20 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800">Booli</p>
                    <p className="text-sm text-gray-600">Aktiv sedan 2024-01-15</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">567 visningar</p>
                    <p className="text-sm text-gray-600">23 sparade</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="tjanster">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Tjänster</h2>
              <p className="text-gray-600">Här kan du beställa tilläggstjänster som styling, fotografering, drönarbilder m.m.</p>
            </GlassCard>
          </TabsContent>

          <TabsContent value="lan-och-pant">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Lån och Pant</h2>
              <p className="text-gray-600">Information om lån och pantsättning för objektet.</p>
            </GlassCard>
          </TabsContent>

          <TabsContent value="att-gora">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Att göra</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-white/20 rounded-xl">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-gray-800">Ta professionella bilder</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/20 rounded-xl">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-gray-800">Skapa objektbeskrivning</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/20 rounded-xl">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-gray-800">Publicera på Hemnet</span>
                </div>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}