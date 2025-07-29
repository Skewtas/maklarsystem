'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ArrowLeft, Save, Upload, MapPin, Home, DollarSign, Users, FileText, Camera, Building, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useCreateObjekt } from '@/lib/api/objekt'
import { useKontakter } from '@/lib/api/kontakter'
import { toast } from 'sonner'
import * as Select from '@radix-ui/react-select'

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

export default function NyttObjektPage() {
  const router = useRouter()
  const createObjekt = useCreateObjekt()
  const { data: kontakter = [] } = useKontakter()
  
  const [formData, setFormData] = useState({
    // Grundläggande information
    typ: 'villa' as 'villa' | 'lagenhet' | 'radhus' | 'fritidshus' | 'tomt',
    status: 'kundbearbetning' as 'kundbearbetning' | 'uppdrag' | 'till_salu' | 'sald' | 'tilltraden',
    
    // Ägare och klassificering
    agare_id: '',
    agare_typ: 'privatperson' as 'privatperson' | 'foretag' | 'kommun' | 'stat',
    agandekategori: 'agt' as 'agt' | 'bostadsratt' | 'hyresratt' | 'arrende',
    
    // Adress
    adress: '',
    postnummer: '',
    ort: '',
    kommun: '',
    lan: '',
    latitude: '',
    longitude: '',
    
    // Utökad prissättning och budgivning
    utgangspris: '',
    accepterat_pris: '',
    slutpris: '',
    budgivning: false,
    budgivningsdatum: '',
    pristyp: 'fast' as 'fast' | 'forhandling' | 'budgivning',
    prisutveckling: '',
    
    // Detaljerade månadsavgifter och kostnader
    manadsavgift: '',
    avgift_innefattar: '',
    kapitaltillskott: '',
    energikostnad_per_ar: '',
    drift_per_kvm: '',
    
    // Befintliga ekonomiska fält
    pantbrev: '',
    taxeringsvarde: '',
    kommunala_avgifter: '',
    forsakringskostnad: '',
    reparationsfond: '',
    driftkostnad: '',
    avgift: '',
    elforbrukning: '',
    vattenforbrukning: '',
    uppvarmningskostnad: '',
    
    // Utökad rumslayout
    boarea: '',
    biarea: '',
    tomtarea: '',
    kallare_area: '',
    garage_area: '',
    rum: '',
    antal_sovrum: '',
    antal_wc: '',
    antal_vaningar_hus: '',
    koksstorlek: '',
    vardagsrumsstorlek: '',
    byggaar: '',
    vaning: '',
    
    // Kök och badrum
    kok: '' as '' | 'kokso' | 'halvoppet' | 'oppet' | 'kokonk' | 'modernt' | 'renoverat' | 'originalskick',
    badrum_antal: '',
    
    // Utökade bekvämligheter
    balkong_terrass: false,
    hiss: false,
    garage: '',
    carport: false,
    forrad: false,
    tradgard: false,
    pool: false,
    bastu: false,
    kamin: false,
    vinkallare: false,
    hobbyrum: false,
    antal_parkeringsplatser: '',
    
    // Energicertifiering
    energiklass: '' as '' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G',
    energiprestanda: '',
    energicertifikat_nummer: '',
    energicertifikat_utfardad: '',
    energicertifikat_giltig_till: '',
    
    // Personer
    saljare_id: '',
    kopare_id: '',
    
    // Utökade beskrivningar
    beskrivning: '',
    maklartext: '',
    salutext: '',
    marknadsforingstext: '',
    
    // Tillbehör
    tillbehor_som_ingaar: '',
    tillbehor_som_ej_ingaar: '',
    
    // Tekniska detaljer - byggnad
    byggmaterial: '' as '' | 'tegel' | 'trak' | 'betong' | 'puts' | 'panel' | 'natursten' | 'annat',
    taktyp: '' as '' | 'tegeltak' | 'platt' | 'betongpannor' | 'sadeltak' | 'mansardtak' | 'pulpettak' | 'annat',
    fasadmaterial: '' as '' | 'tegel' | 'puts' | 'trak' | 'panel' | 'natursten' | 'betong' | 'eternit' | 'annat',
    fonstertyp: '' as '' | 'treglas' | 'tvaglas' | 'traglas_argon' | 'aluminiumkarmar' | 'trakarmar' | 'plastkarmar',
    isolering: '' as '' | 'mineralull' | 'cellulosa' | 'polyuretan' | 'eps' | 'xps' | 'annat',
    
    // Tekniska detaljer - installationer
    uppvarmning: '' as '' | 'fjärrvärme' | 'elvärme' | 'pelletsbrännare' | 'vedeldning' | 'olja' | 'gas' | 'bergvärme' | 'luftvärmepump' | 'annat',
    ventilation: '' as '' | 'mekanisk_til_och_franluft' | 'mekanisk_franluft' | 'naturlig' | 'balanserad' | 'frånluft',
    elnat: '' as '' | 'trefas' | 'enfas' | 'trefas_16A' | 'trefas_25A' | 'trefas_35A',
    vatten_avlopp: '',
    
    // Säkerhet och system
    brandskydd: '',
    larm: '',
    bredband: '' as '' | 'fiber' | 'adsl' | 'kabel' | 'mobilt' | 'satellit' | 'inte_tillgangligt',
    kabel_tv: false,
    internet: '',
    
    // Miljö och omgivning
    narmaste_skola: '',
    narmaste_vardcentral: '',
    narmaste_dagis: '',
    avstand_centrum: '',
    havsnara: false,
    sjonara: false,
    skogsnara: false,
    
    // Transport och parkering
    kollektivtrafik: '',
    parkering: '',
    
    // Renovering och historik
    bygglov: '',
    senaste_renovering: '',
    planerad_renovering: '',
    
    // Juridiska aspekter
    servitut: '',
    inskrankning: '',
    belastningar: '',
    gemensamhetsanlaggning: '',
    
    // Visning och marknadsföring
    tillgangsdatum: '',
    visningsinfo: '',
    visningsdagar: '',
    oppet_hus: '',
    visningsdagar_detaljer: '',
    oppet_hus_detaljer: '',
    
    // Tidslinje och status
    listningsdatum: '',
    avtal_datum: '',
    tilltraden_datum: '',
    
    // Dokument
    planritning_url: '',
    energideklaration_url: '',
    byggnadsbeskrivning_url: '',
    
    // Övrigt
    specialbestammelser: '',
    anmarkningar: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // For now, use the test user ID we created
      // In a real app, this would come from auth context
      const userId = '6a0af328-9be6-4dd9-ae83-ce2cf512da6d'
      
      await createObjekt.mutateAsync({
        // Basic info
        typ: formData.typ,
        status: formData.status,
        adress: formData.adress,
        postnummer: formData.postnummer,
        ort: formData.ort,
        kommun: formData.kommun,
        lan: formData.lan,
        
        // Ownership and classification
        agare_id: formData.agare_id || null,
        agare_typ: formData.agare_typ || null,
        agandekategori: formData.agandekategori || null,
        
        // Enhanced pricing and bidding
        utgangspris: formData.utgangspris ? parseFloat(formData.utgangspris) : null,
        accepterat_pris: formData.accepterat_pris ? parseFloat(formData.accepterat_pris) : null,
        slutpris: formData.slutpris ? parseFloat(formData.slutpris) : null,
        budgivning: formData.budgivning,
        budgivningsdatum: formData.budgivningsdatum || null,
        pristyp: formData.pristyp || null,
        prisutveckling: formData.prisutveckling || null,
        
        // Detailed monthly fees and costs
        manadsavgift: formData.manadsavgift ? parseInt(formData.manadsavgift) : null,
        avgift_innefattar: formData.avgift_innefattar || null,
        kapitaltillskott: formData.kapitaltillskott ? parseInt(formData.kapitaltillskott) : null,
        energikostnad_per_ar: formData.energikostnad_per_ar ? parseInt(formData.energikostnad_per_ar) : null,
        drift_per_kvm: formData.drift_per_kvm ? parseInt(formData.drift_per_kvm) : null,
        
        // Enhanced room layout
        boarea: formData.boarea ? parseInt(formData.boarea) : null,
        biarea: formData.biarea ? parseInt(formData.biarea) : null,
        tomtarea: formData.tomtarea ? parseInt(formData.tomtarea) : null,
        kallare_area: formData.kallare_area ? parseInt(formData.kallare_area) : null,
        garage_area: formData.garage_area ? parseInt(formData.garage_area) : null,
        rum: formData.rum ? parseInt(formData.rum) : null,
        antal_sovrum: formData.antal_sovrum ? parseInt(formData.antal_sovrum) : null,
        antal_wc: formData.antal_wc ? parseInt(formData.antal_wc) : null,
        antal_vaningar_hus: formData.antal_vaningar_hus ? parseInt(formData.antal_vaningar_hus) : null,
        koksstorlek: formData.koksstorlek ? parseInt(formData.koksstorlek) : null,
        vardagsrumsstorlek: formData.vardagsrumsstorlek ? parseInt(formData.vardagsrumsstorlek) : null,
        byggaar: formData.byggaar ? parseInt(formData.byggaar) : null,
        vaning: formData.vaning ? parseInt(formData.vaning) : null,
        
        // Energy certification
        energiklass: formData.energiklass || null,
        energiprestanda: formData.energiprestanda ? parseInt(formData.energiprestanda) : null,
        energicertifikat_nummer: formData.energicertifikat_nummer || null,
        energicertifikat_utfardad: formData.energicertifikat_utfardad || null,
        energicertifikat_giltig_till: formData.energicertifikat_giltig_till || null,
        
        // Enhanced amenities
        vinkallare: formData.vinkallare,
        hobbyrum: formData.hobbyrum,
        carport: formData.carport,
        bastu: formData.bastu,
        antal_parkeringsplatser: formData.antal_parkeringsplatser ? parseInt(formData.antal_parkeringsplatser) : null,
        
        // Kitchen and bathrooms
        kok: formData.kok || null,
        badrum_antal: formData.badrum_antal ? parseInt(formData.badrum_antal) : null,
        
        // Features (existing)
        balkong_terrass: formData.balkong_terrass,
        hiss: formData.hiss,
        garage: formData.garage || null,
        forrad: formData.forrad,
        tradgard: formData.tradgard,
        pool: formData.pool,
        kamin: formData.kamin,
        
        // People
        maklare_id: userId,
        saljare_id: formData.saljare_id && formData.saljare_id !== 'none' ? formData.saljare_id : null,
        kopare_id: formData.kopare_id || null,
        
        // Enhanced descriptions
        beskrivning: formData.beskrivning || null,
        maklartext: formData.maklartext || null,
        salutext: formData.salutext || null,
        marknadsforingstext: formData.marknadsforingstext || null,
        
        // What's included/excluded
        tillbehor_som_ingaar: formData.tillbehor_som_ingaar || null,
        tillbehor_som_ej_ingaar: formData.tillbehor_som_ej_ingaar || null,
        
        // Legal aspects
        servitut: formData.servitut || null,
        inskrankning: formData.inskrankning || null,
        belastningar: formData.belastningar || null,
        gemensamhetsanlaggning: formData.gemensamhetsanlaggning || null,
        planerad_renovering: formData.planerad_renovering || null,
        
        // Enhanced location data
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        
        // Document references
        planritning_url: formData.planritning_url || null,
        energideklaration_url: formData.energideklaration_url || null,
        byggnadsbeskrivning_url: formData.byggnadsbeskrivning_url || null,
        
        // Timeline and status tracking
        listningsdatum: formData.listningsdatum || null,
        avtal_datum: formData.avtal_datum || null,
        tilltraden_datum: formData.tilltraden_datum || null,
        
        // Costs (existing)
        driftkostnad: formData.driftkostnad ? parseInt(formData.driftkostnad) : null,
        avgift: formData.avgift ? parseInt(formData.avgift) : null,
        pantbrev: formData.pantbrev ? parseInt(formData.pantbrev) : null,
        taxeringsvarde: formData.taxeringsvarde ? parseInt(formData.taxeringsvarde) : null,
        kommunala_avgifter: formData.kommunala_avgifter ? parseInt(formData.kommunala_avgifter) : null,
        forsakringskostnad: formData.forsakringskostnad ? parseInt(formData.forsakringskostnad) : null,
        reparationsfond: formData.reparationsfond ? parseInt(formData.reparationsfond) : null,
        elforbrukning: formData.elforbrukning ? parseInt(formData.elforbrukning) : null,
        vattenforbrukning: formData.vattenforbrukning ? parseInt(formData.vattenforbrukning) : null,
        uppvarmningskostnad: formData.uppvarmningskostnad ? parseInt(formData.uppvarmningskostnad) : null,
        
        // Technical details (existing)
        byggmaterial: formData.byggmaterial || null,
        taktyp: formData.taktyp || null,
        fasadmaterial: formData.fasadmaterial || null,
        fonstertyp: formData.fonstertyp || null,
        isolering: formData.isolering || null,
        uppvarmning: formData.uppvarmning || null,
        ventilation: formData.ventilation || null,
        elnat: formData.elnat || null,
        vatten_avlopp: formData.vatten_avlopp || null,
        
        // Security and systems (existing)
        brandskydd: formData.brandskydd || null,
        larm: formData.larm || null,
        bredband: formData.bredband || null,
        kabel_tv: formData.kabel_tv,
        internet: formData.internet || null,
        
        // Environment (existing)
        narmaste_skola: formData.narmaste_skola || null,
        narmaste_vardcentral: formData.narmaste_vardcentral || null,
        narmaste_dagis: formData.narmaste_dagis || null,
        avstand_centrum: formData.avstand_centrum ? parseInt(formData.avstand_centrum) : null,
        havsnara: formData.havsnara,
        sjonara: formData.sjonara,
        skogsnara: formData.skogsnara,
        
        // Transport (existing)
        kollektivtrafik: formData.kollektivtrafik || null,
        parkering: formData.parkering || null,
        
        // Building history (existing)
        bygglov: formData.bygglov || null,
        senaste_renovering: formData.senaste_renovering || null,
        
        // Availability and showings
        tillgangsdatum: formData.tillgangsdatum || null,
        visningsinfo: formData.visningsinfo || null,
        visningsdagar: formData.visningsdagar || null,
        oppet_hus: formData.oppet_hus || null,
        visningsdagar_detaljer: formData.visningsdagar_detaljer || null,
        oppet_hus_detaljer: formData.oppet_hus_detaljer || null,
        
        // Other
        specialbestammelser: formData.specialbestammelser || null,
        anmarkningar: formData.anmarkningar || null
      })
      
      router.push('/objekt')
      toast.success('Objekt skapat!')
    } catch (error) {
      console.error('Error creating objekt:', error)
      toast.error('Kunde inte skapa objekt')
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-green-100 relative overflow-hidden -m-6 p-6">
        <FloatingElements />
        
        <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
          {/* Header */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/objekt" className="p-2 hover:bg-white/20 rounded-xl transition-all">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-3xl font-light text-gray-800">Nytt objekt</h1>
                  <p className="text-gray-600">Lägg till ett nytt fastighetsobjekt</p>
                </div>
              </div>
            </div>
          </GlassCard>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grundläggande information */}
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Grundläggande information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Objekttyp</label>
                  <Select.Root value={formData.typ} onValueChange={(value: any) => setFormData({...formData, typ: value})}>
                    <Select.Trigger className="w-full flex items-center justify-between backdrop-blur-xl bg-white/30 border border-white/40 px-4 py-3 rounded-2xl">
                      <Select.Value />
                      <ChevronDown className="w-4 h-4" />
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="backdrop-blur-xl bg-white/90 border border-white/40 rounded-2xl shadow-xl z-50">
                        <Select.Viewport className="p-2">
                          <Select.Item value="villa" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Villa</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="lagenhet" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Lägenhet</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="radhus" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Radhus</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="fritidshus" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Fritidshus</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="tomt" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Tomt</Select.ItemText>
                          </Select.Item>
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <Select.Root value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                    <Select.Trigger className="w-full flex items-center justify-between backdrop-blur-xl bg-white/30 border border-white/40 px-4 py-3 rounded-2xl">
                      <Select.Value />
                      <ChevronDown className="w-4 h-4" />
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="backdrop-blur-xl bg-white/90 border border-white/40 rounded-2xl shadow-xl z-50">
                        <Select.Viewport className="p-2">
                          <Select.Item value="kundbearbetning" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Kundbearbetning</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="uppdrag" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Uppdrag</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="till_salu" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Till salu</Select.ItemText>
                          </Select.Item>
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ägartyp</label>
                  <Select.Root value={formData.agare_typ} onValueChange={(value: any) => setFormData({...formData, agare_typ: value})}>
                    <Select.Trigger className="w-full flex items-center justify-between backdrop-blur-xl bg-white/30 border border-white/40 px-4 py-3 rounded-2xl">
                      <Select.Value />
                      <ChevronDown className="w-4 h-4" />
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="backdrop-blur-xl bg-white/90 border border-white/40 rounded-2xl shadow-xl z-50">
                        <Select.Viewport className="p-2">
                          <Select.Item value="privatperson" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Privatperson</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="foretag" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Företag</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="kommun" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Kommun</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="stat" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Stat</Select.ItemText>
                          </Select.Item>
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ägandekategori</label>
                  <Select.Root value={formData.agandekategori} onValueChange={(value: any) => setFormData({...formData, agandekategori: value})}>
                    <Select.Trigger className="w-full flex items-center justify-between backdrop-blur-xl bg-white/30 border border-white/40 px-4 py-3 rounded-2xl">
                      <Select.Value />
                      <ChevronDown className="w-4 h-4" />
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="backdrop-blur-xl bg-white/90 border border-white/40 rounded-2xl shadow-xl z-50">
                        <Select.Viewport className="p-2">
                          <Select.Item value="agt" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Ägt</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="bostadsratt" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Bostadsrätt</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="hyresratt" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Hyresrätt</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="arrende" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Arrende</Select.ItemText>
                          </Select.Item>
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
              </div>
            </GlassCard>

            {/* Adressinformation */}
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Adressinformation</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gatuadress</label>
                  <input
                    type="text"
                    value={formData.adress}
                    onChange={(e) => setFormData({...formData, adress: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postnummer</label>
                  <input
                    type="text"
                    value={formData.postnummer}
                    onChange={(e) => setFormData({...formData, postnummer: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ort</label>
                  <input
                    type="text"
                    value={formData.ort}
                    onChange={(e) => setFormData({...formData, ort: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kommun</label>
                  <input
                    type="text"
                    value={formData.kommun}
                    onChange={(e) => setFormData({...formData, kommun: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Län</label>
                  <input
                    type="text"
                    value={formData.lan}
                    onChange={(e) => setFormData({...formData, lan: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </GlassCard>

            {/* Prissättning och budgivning */}
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Prissättning och budgivning</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Utgångspris (kr)</label>
                  <input
                    type="number"
                    value={formData.utgangspris}
                    onChange={(e) => setFormData({...formData, utgangspris: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accepterat pris (kr)</label>
                  <input
                    type="number"
                    value={formData.accepterat_pris}
                    onChange={(e) => setFormData({...formData, accepterat_pris: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slutpris (kr)</label>
                  <input
                    type="number"
                    value={formData.slutpris}
                    onChange={(e) => setFormData({...formData, slutpris: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pristyp</label>
                  <Select.Root value={formData.pristyp} onValueChange={(value: any) => setFormData({...formData, pristyp: value})}>
                    <Select.Trigger className="w-full flex items-center justify-between backdrop-blur-xl bg-white/30 border border-white/40 px-4 py-3 rounded-2xl">
                      <Select.Value />
                      <ChevronDown className="w-4 h-4" />
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="backdrop-blur-xl bg-white/90 border border-white/40 rounded-2xl shadow-xl z-50">
                        <Select.Viewport className="p-2">
                          <Select.Item value="fast" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Fast pris</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="forhandling" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Förhandling</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="budgivning" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Budgivning</Select.ItemText>
                          </Select.Item>
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="budgivning"
                    checked={formData.budgivning}
                    onChange={(e) => setFormData({...formData, budgivning: e.target.checked})}
                    className="w-5 h-5 rounded border-white/40 bg-white/30 focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="budgivning" className="text-sm font-medium text-gray-700">
                    Budgivning tillåten
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budgivningsdatum</label>
                  <input
                    type="date"
                    value={formData.budgivningsdatum}
                    onChange={(e) => setFormData({...formData, budgivningsdatum: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prisutveckling</label>
                  <textarea
                    value={formData.prisutveckling}
                    onChange={(e) => setFormData({...formData, prisutveckling: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Beskriv prisutveckling och marknadsförhållanden..."
                  />
                </div>
              </div>
            </GlassCard>

            {/* Storlek och layout */}
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Storlek och layout</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Boarea (m²)</label>
                  <input
                    type="number"
                    value={formData.boarea}
                    onChange={(e) => setFormData({...formData, boarea: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Biarea (m²)</label>
                  <input
                    type="number"
                    value={formData.biarea}
                    onChange={(e) => setFormData({...formData, biarea: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tomtarea (m²)</label>
                  <input
                    type="number"
                    value={formData.tomtarea}
                    onChange={(e) => setFormData({...formData, tomtarea: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Källararea (m²)</label>
                  <input
                    type="number"
                    value={formData.kallare_area}
                    onChange={(e) => setFormData({...formData, kallare_area: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Garagearea (m²)</label>
                  <input
                    type="number"
                    value={formData.garage_area}
                    onChange={(e) => setFormData({...formData, garage_area: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Byggår</label>
                  <input
                    type="number"
                    value={formData.byggaar}
                    onChange={(e) => setFormData({...formData, byggaar: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Antal rum</label>
                  <input
                    type="number"
                    value={formData.rum}
                    onChange={(e) => setFormData({...formData, rum: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Antal sovrum</label>
                  <input
                    type="number"
                    value={formData.antal_sovrum}
                    onChange={(e) => setFormData({...formData, antal_sovrum: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Antal WC</label>
                  <input
                    type="number"
                    value={formData.antal_wc}
                    onChange={(e) => setFormData({...formData, antal_wc: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Våning</label>
                  <input
                    type="number"
                    value={formData.vaning}
                    onChange={(e) => setFormData({...formData, vaning: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Antal våningar hus</label>
                  <input
                    type="number"
                    value={formData.antal_vaningar_hus}
                    onChange={(e) => setFormData({...formData, antal_vaningar_hus: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Köksstorlek (m²)</label>
                  <input
                    type="number"
                    value={formData.koksstorlek}
                    onChange={(e) => setFormData({...formData, koksstorlek: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </GlassCard>

            {/* Personer */}
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Personer</h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Säljare</label>
                <Select.Root value={formData.saljare_id} onValueChange={(value) => setFormData({...formData, saljare_id: value})}>
                  <Select.Trigger className="w-full flex items-center justify-between backdrop-blur-xl bg-white/30 border border-white/40 px-4 py-3 rounded-2xl">
                    <Select.Value placeholder="Välj säljare" />
                    <ChevronDown className="w-4 h-4" />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="backdrop-blur-xl bg-white/90 border border-white/40 rounded-2xl shadow-xl z-50">
                      <Select.Viewport className="p-2 max-h-64 overflow-y-auto">
                                                 <Select.Item value="none" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                           <Select.ItemText>Ingen vald</Select.ItemText>
                         </Select.Item>
                        {kontakter.filter((k: any) => k.kategori === 'saljare').map((kontakt: any) => (
                          <Select.Item key={kontakt.id} value={kontakt.id} className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>{kontakt.fornamn} {kontakt.efternamn}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            </GlassCard>

            {/* Månadsavgifter och kostnader */}
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Månadsavgifter och kostnader</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Månadsavgift (kr)</label>
                  <input
                    type="number"
                    value={formData.manadsavgift}
                    onChange={(e) => setFormData({...formData, manadsavgift: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kapitaltillskott (kr)</label>
                  <input
                    type="number"
                    value={formData.kapitaltillskott}
                    onChange={(e) => setFormData({...formData, kapitaltillskott: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Energikostnad/år (kr)</label>
                  <input
                    type="number"
                    value={formData.energikostnad_per_ar}
                    onChange={(e) => setFormData({...formData, energikostnad_per_ar: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vad innefattar avgiften</label>
                  <textarea
                    value={formData.avgift_innefattar}
                    onChange={(e) => setFormData({...formData, avgift_innefattar: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="T.ex. Värme, vatten, el, bredband, kabel-TV, sophämtning..."
                  />
                </div>
              </div>
            </GlassCard>

            {/* Ekonomi och drift */}
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Ekonomi och drift</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Driftkostnad (kr/år)</label>
                  <input
                    type="number"
                    value={formData.driftkostnad}
                    onChange={(e) => setFormData({...formData, driftkostnad: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Avgift (kr/månad)</label>
                  <input
                    type="number"
                    value={formData.avgift}
                    onChange={(e) => setFormData({...formData, avgift: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pantbrev (kr)</label>
                  <input
                    type="number"
                    value={formData.pantbrev}
                    onChange={(e) => setFormData({...formData, pantbrev: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Taxeringsvärde (kr)</label>
                  <input
                    type="number"
                    value={formData.taxeringsvarde}
                    onChange={(e) => setFormData({...formData, taxeringsvarde: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kommunala avgifter (kr/år)</label>
                  <input
                    type="number"
                    value={formData.kommunala_avgifter}
                    onChange={(e) => setFormData({...formData, kommunala_avgifter: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Försäkringskostnad (kr/år)</label>
                  <input
                    type="number"
                    value={formData.forsakringskostnad}
                    onChange={(e) => setFormData({...formData, forsakringskostnad: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </GlassCard>

            {/* Energicertifiering */}
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Energicertifiering</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Energiklass</label>
                  <Select.Root value={formData.energiklass} onValueChange={(value: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G') => setFormData({...formData, energiklass: value})}>
                    <Select.Trigger className="w-full flex items-center justify-between backdrop-blur-xl bg-white/30 border border-white/40 px-4 py-3 rounded-2xl">
                      <Select.Value placeholder="Välj energiklass" />
                      <ChevronDown className="w-4 h-4" />
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="backdrop-blur-xl bg-white/90 border border-white/40 rounded-2xl shadow-xl z-50">
                        <Select.Viewport className="p-2">
                          <Select.Item value="A" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>A</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="B" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>B</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="C" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>C</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="D" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>D</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="E" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>E</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="F" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>F</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="G" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>G</Select.ItemText>
                          </Select.Item>
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Energiprestanda (kWh/m²/år)</label>
                  <input
                    type="number"
                    value={formData.energiprestanda}
                    onChange={(e) => setFormData({...formData, energiprestanda: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certifikatnummer</label>
                  <input
                    type="text"
                    value={formData.energicertifikat_nummer}
                    onChange={(e) => setFormData({...formData, energicertifikat_nummer: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Utfärdad datum</label>
                  <input
                    type="date"
                    value={formData.energicertifikat_utfardad}
                    onChange={(e) => setFormData({...formData, energicertifikat_utfardad: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giltig till</label>
                  <input
                    type="date"
                    value={formData.energicertifikat_giltig_till}
                    onChange={(e) => setFormData({...formData, energicertifikat_giltig_till: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Energideklaration URL</label>
                  <input
                    type="url"
                    value={formData.energideklaration_url}
                    onChange={(e) => setFormData({...formData, energideklaration_url: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </GlassCard>

            {/* Tekniska detaljer */}
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Tekniska detaljer</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Byggmaterial</label>
                  <Select.Root value={formData.byggmaterial} onValueChange={(value: 'tegel' | 'trak' | 'betong' | 'puts' | 'panel' | 'natursten' | 'annat') => setFormData({...formData, byggmaterial: value})}>
                    <Select.Trigger className="w-full flex items-center justify-between backdrop-blur-xl bg-white/30 border border-white/40 px-4 py-3 rounded-2xl">
                      <Select.Value placeholder="Välj byggmaterial" />
                      <ChevronDown className="w-4 h-4" />
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="backdrop-blur-xl bg-white/90 border border-white/40 rounded-2xl shadow-xl z-50">
                        <Select.Viewport className="p-2">
                          <Select.Item value="tegel" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Tegel</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="trak" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Trä</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="betong" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Betong</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="puts" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Puts</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="panel" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Panel</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="natursten" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Natursten</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="annat" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Annat</Select.ItemText>
                          </Select.Item>
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Uppvärmning</label>
                  <Select.Root value={formData.uppvarmning} onValueChange={(value: 'fjärrvärme' | 'elvärme' | 'pelletsbrännare' | 'vedeldning' | 'olja' | 'gas' | 'bergvärme' | 'luftvärmepump' | 'annat') => setFormData({...formData, uppvarmning: value})}>
                    <Select.Trigger className="w-full flex items-center justify-between backdrop-blur-xl bg-white/30 border border-white/40 px-4 py-3 rounded-2xl">
                      <Select.Value placeholder="Välj uppvärmning" />
                      <ChevronDown className="w-4 h-4" />
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="backdrop-blur-xl bg-white/90 border border-white/40 rounded-2xl shadow-xl z-50">
                        <Select.Viewport className="p-2 max-h-64 overflow-y-auto">
                          <Select.Item value="fjärrvärme" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Fjärrvärme</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="bergvärme" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Bergvärme</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="luftvärmepump" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Luftvärmepump</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="elvärme" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Elvärme</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="pelletsbrännare" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Pelletsbrännare</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="vedeldning" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Vedeldning</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="olja" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Olja</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="gas" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Gas</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="annat" className="px-4 py-2 rounded-xl hover:bg-white/50 cursor-pointer">
                            <Select.ItemText>Annat</Select.ItemText>
                          </Select.Item>
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Internet</label>
                  <input
                    type="text"
                    value={formData.internet}
                    onChange={(e) => setFormData({...formData, internet: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="T.ex. Fiber, ADSL"
                  />
                </div>
              </div>
            </GlassCard>

            {/* Juridiska aspekter */}
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Juridiska aspekter</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Servitut</label>
                  <textarea
                    value={formData.servitut}
                    onChange={(e) => setFormData({...formData, servitut: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Beskriv eventuella servitut..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Inskränkningar</label>
                  <textarea
                    value={formData.inskrankning}
                    onChange={(e) => setFormData({...formData, inskrankning: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Beskriv eventuella inskränkningar..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Belastningar</label>
                  <textarea
                    value={formData.belastningar}
                    onChange={(e) => setFormData({...formData, belastningar: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Beskriv eventuella belastningar..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gemensamhetsanläggning</label>
                  <textarea
                    value={formData.gemensamhetsanlaggning}
                    onChange={(e) => setFormData({...formData, gemensamhetsanlaggning: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Beskriv andel i gemensamhetsanläggning..."
                  />
                </div>
              </div>
            </GlassCard>

            {/* Visning och marknadsföring */}
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Visning och marknadsföring</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tillträdesdatum</label>
                  <input
                    type="date"
                    value={formData.tillgangsdatum}
                    onChange={(e) => setFormData({...formData, tillgangsdatum: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Listningsdatum</label>
                  <input
                    type="date"
                    value={formData.listningsdatum}
                    onChange={(e) => setFormData({...formData, listningsdatum: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visningsinformation</label>
                  <input
                    type="text"
                    value={formData.visningsinfo}
                    onChange={(e) => setFormData({...formData, visningsinfo: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="T.ex. Efter överenskommelse"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visningsdagar</label>
                  <input
                    type="text"
                    value={formData.visningsdagar}
                    onChange={(e) => setFormData({...formData, visningsdagar: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="T.ex. Måndag-fredag 18-19"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Öppet hus</label>
                  <input
                    type="text"
                    value={formData.oppet_hus}
                    onChange={(e) => setFormData({...formData, oppet_hus: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="T.ex. Söndag 14-15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Avtalsdatum</label>
                  <input
                    type="date"
                    value={formData.avtal_datum}
                    onChange={(e) => setFormData({...formData, avtal_datum: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Detaljerade visningsdagar</label>
                  <textarea
                    value={formData.visningsdagar_detaljer}
                    onChange={(e) => setFormData({...formData, visningsdagar_detaljer: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Detaljerad information om visningsdagar och tider..."
                  />
                </div>
              </div>
            </GlassCard>

            {/* Område och tillgänglighet */}
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Område och tillgänglighet</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kollektivtrafik</label>
                  <textarea
                    value={formData.kollektivtrafik}
                    onChange={(e) => setFormData({...formData, kollektivtrafik: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Beskriv närhet till kollektivtrafik..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parkering</label>
                  <textarea
                    value={formData.parkering}
                    onChange={(e) => setFormData({...formData, parkering: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Beskriv parkeringsmöjligheter..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Antal parkeringsplatser</label>
                  <input
                    type="number"
                    value={formData.antal_parkeringsplatser}
                    onChange={(e) => setFormData({...formData, antal_parkeringsplatser: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </GlassCard>

            {/* Beskrivningar och marknadsföring */}
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Beskrivningar och marknadsföring</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allmän beskrivning</label>
                  <textarea
                    value={formData.beskrivning}
                    onChange={(e) => setFormData({...formData, beskrivning: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Allmän beskrivning av objektet..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mäklartext</label>
                  <textarea
                    value={formData.maklartext}
                    onChange={(e) => setFormData({...formData, maklartext: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Professionell beskrivning för marknadsföring..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Säljtext</label>
                  <textarea
                    value={formData.salutext}
                    onChange={(e) => setFormData({...formData, salutext: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Säljarens egen beskrivning..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marknadsföringstext</label>
                  <textarea
                    value={formData.marknadsforingstext}
                    onChange={(e) => setFormData({...formData, marknadsforingstext: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Text för marknadsföring och annonser..."
                  />
                </div>
              </div>
            </GlassCard>

            {/* Tillbehör och ingående */}
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Tillbehör och ingående</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tillbehör som ingår</label>
                  <textarea
                    value={formData.tillbehor_som_ingaar}
                    onChange={(e) => setFormData({...formData, tillbehor_som_ingaar: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Lista vad som ingår i försäljningen..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tillbehör som ej ingår</label>
                  <textarea
                    value={formData.tillbehor_som_ej_ingaar}
                    onChange={(e) => setFormData({...formData, tillbehor_som_ej_ingaar: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Lista vad som ej ingår i försäljningen..."
                  />
                </div>
              </div>
            </GlassCard>

            {/* Dokument och media */}
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Dokument och media</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Planritning URL</label>
                  <input
                    type="url"
                    value={formData.planritning_url}
                    onChange={(e) => setFormData({...formData, planritning_url: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Byggnadsbeskrivning URL</label>
                  <input
                    type="url"
                    value={formData.byggnadsbeskrivning_url}
                    onChange={(e) => setFormData({...formData, byggnadsbeskrivning_url: e.target.value})}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>

                <div className="border-2 border-dashed border-white/40 rounded-2xl p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Dra och släpp bilder här</p>
                  <p className="text-sm text-gray-500">eller</p>
                  <button type="button" className="mt-2 text-blue-600 hover:text-blue-700 font-medium">
                    Välj filer
                  </button>
                </div>
              </div>
            </GlassCard>

            {/* Övrigt och anmärkningar */}
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Övrigt och anmärkningar</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialbestämmelser</label>
                  <textarea
                    value={formData.specialbestammelser}
                    onChange={(e) => setFormData({...formData, specialbestammelser: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Eventuella specialbestämmelser..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Anmärkningar</label>
                  <textarea
                    value={formData.anmarkningar}
                    onChange={(e) => setFormData({...formData, anmarkningar: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Övriga anmärkningar och noteringar..."
                  />
                </div>
              </div>
            </GlassCard>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Link href="/objekt" className="px-6 py-3 backdrop-blur-xl bg-white/30 border border-white/40 text-gray-700 rounded-2xl font-medium hover:bg-white/40 transition-all duration-300">
                Avbryt
              </Link>
              <button
                type="submit"
                disabled={createObjekt.isPending}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{createObjekt.isPending ? 'Sparar...' : 'Spara objekt'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
} 