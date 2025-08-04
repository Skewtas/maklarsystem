'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useCreateObjekt } from '@/lib/api/objekt'
import { toast } from 'sonner'
import { objektFormSchema, objektFormDefaults, type ObjektFormData } from '@/lib/schemas/objekt-form.schema'
import { GrundinformationSection } from '@/components/forms/sections/GrundinformationSection'
import { InteriorSection } from '@/components/forms/sections/InteriorSection'
import { BeskrivningarSection } from '@/components/forms/sections/BeskrivningarSection'
import { ByggnadSection } from '@/components/forms/sections/ByggnadSection'
import { AvgifterSection } from '@/components/forms/sections/AvgifterSection'
import { useSupabase } from '@/lib/supabase-provider'

// Glass Card Component
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

// Sticky Navigation
const StickyNavigation = ({ activeSection, onSectionClick }: { activeSection: string; onSectionClick: (section: string) => void }) => {
  const sections = [
    { id: 'grundinformation', label: 'GRUNDINFORMATION', icon: '📋' },
    { id: 'interior', label: 'INTERIÖR', icon: '🏠' },
    { id: 'beskrivningar', label: 'BESKRIVNINGAR', icon: '📝' },
    { id: 'byggnad', label: 'BYGGNAD', icon: '🏗️' },
    { id: 'avgifter', label: 'AVGIFTER & INSATS', icon: '💰' },
  ]

  return (
    <div className="w-72 flex-shrink-0">
      <div className="sticky top-24 w-72 h-[calc(100vh-8rem)] overflow-y-auto z-20">
        <GlassCard className="p-4 h-full">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Navigering
          </h3>
          <div className="space-y-2 overflow-y-auto h-[calc(100%-4rem)]">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => onSectionClick(section.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 text-left ${
                  activeSection === section.id
                    ? 'bg-white/40 text-gray-800 shadow-md'
                    : 'hover:bg-white/30 text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="text-xl filter drop-shadow-sm">{section.icon}</span>
                <span className="text-sm font-semibold">{section.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

export default function NyttObjektPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('grundinformation')
  
  // Section refs for smooth scrolling
  const sectionRefs = useRef<{[key: string]: HTMLElement | null}>({})
  
  // Get user from Supabase context
  const { user } = useSupabase()
  
  // Move createObjekt after useSupabase to ensure proper context
  const createObjekt = useCreateObjekt()
  
  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    getValues
  } = useForm<ObjektFormData>({
    resolver: zodResolver(objektFormSchema) as any,
    defaultValues: objektFormDefaults,
  })

  const scrollToSection = useCallback((sectionId: string) => {
    const element = sectionRefs.current[sectionId]
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(sectionId)
    }
  }, [setActiveSection])

  const onSubmit = async (data: ObjektFormData) => {
    console.log('Form data received:', data)
    console.log('Form validation errors:', errors)
    
    // Check if user is authenticated
    if (!user || !user.id) {
      toast.error('Du måste vara inloggad för att skapa objekt')
      router.push('/login')
      return
    }
    
    // Declare apiData outside try block so it's accessible in catch block
    let apiData: any = null
    
    try {
      // Transform form data to API format - mapping form fields to database fields
      apiData = {
        // Required fields - these match database column names exactly
        typ: data.typ,
        adress: data.adress, // Database column is 'adress', not 'gatuadress'
        postnummer: data.postnummer.replace(/\s/g, ''), // Remove any spaces from postal code
        ort: data.ort,
        kommun: data.kommun,
        lan: 'Stockholm', // Default to Stockholm
        status: 'kundbearbetning' as const, 
        maklare_id: user.id, // Database column is 'maklare_id', not just 'maklare'
        
        // Optional fields from form - map form field names to database field names
        beskrivning: data.lang_beskrivning || data.kort_beskrivning || null,
        boarea: data.boarea ? parseFloat(data.boarea) : null,
        biarea: data.biarea ? parseFloat(data.biarea) : null,
        rum: data.antal_rum ? parseFloat(data.antal_rum) : null,
        antal_sovrum: data.antal_sovrum ? parseInt(data.antal_sovrum) : null,
        byggaar: data.byggaar ? parseInt(data.byggaar) : null, // Fixed field name to match form
        fastighetsbeteckning: data.fastighetsbeteckning || null,
        
        // Map ownership type based on form field
        agandekategori: data.upplatelse_form === 'bostadsratt' ? 'bostadsratt' : 
                       data.upplatelse_form === 'agt' ? 'agt' :
                       data.upplatelse_form === 'hyresratt' ? 'hyresratt' :
                       data.upplatelse_form === 'arrende' ? 'arrende' : null,
        
        // Map kitchen type
        kok: data.kokstyp === 'oppet' ? 'oppet' :
             data.kokstyp === 'halvoppet' ? 'halvoppet' :
             data.kokstyp === 'kokso' ? 'kokso' : null,
        
        // Map building material
        byggmaterial: data.konstruktion as any || null,
        
        // Map energy class
        energiklass: data.energiklass as any || null,
        
        // Map ventilation
        ventilation: data.ventilationstyp as any || null,
        
        // Map financial fields - ensure correct column names
        avgift: data.avgift_manad ? parseFloat(data.avgift_manad) : null,
        driftkostnad: data.driftkostnad_manad ? parseFloat(data.driftkostnad_manad) : null,
        
        // Map floor
        vaning: data.vaning ? parseInt(data.vaning) : null,
        
        // Map boolean fields
        hiss: data.hiss === 'ja' ? true : data.hiss === 'nej' ? false : null,
        balkong_terrass: data.balkong_uteplats_typ ? true : false,
        
        // Map location coordinates
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        
        // Additional text fields
        marknadsforingstext: data.saljrubrik || null,
        salutext: data.saljfras || null,
        
        // Additional optional fields can be mapped here as needed
      }
      
      console.log('API data to send:', apiData)
      await createObjekt.mutateAsync(apiData)
      toast.success('Objekt skapat framgångsrikt!')
      router.push('/objekt')
    } catch (error) {
      console.error('Error creating objekt:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        formData: data,
        apiData,
        userId: user?.id
      })
      
      if (error instanceof Error) {
        // Show more specific error message
        if (error.message.includes('Valideringsfel')) {
          toast.error(error.message)
        } else {
          toast.error(`Fel vid skapande av objekt: ${error.message}`)
        }
      } else {
        toast.error('Fel vid skapande av objekt')
      }
    }
  }

  const handleSave = useCallback(() => {
    handleSubmit(onSubmit)()
  }, [handleSubmit, onSubmit])

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
        <FloatingElements />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="bg-white/30 backdrop-blur-md border-b border-white/20 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-4">
                  <Link
                    href="/objekt"
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 text-gray-700 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Tillbaka
                  </Link>
                  <h1 className="text-2xl font-bold text-gray-800">Nytt Objekt</h1>
                </div>
                
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="inline-flex items-center px-6 py-2 rounded-xl bg-blue-500/80 hover:bg-blue-600/80 backdrop-blur-sm transition-all duration-300 text-white font-semibold disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Sparar...' : 'Spara Objekt'}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-8">
              {/* Sticky Navigation */}
              <StickyNavigation 
                activeSection={activeSection} 
                onSectionClick={scrollToSection} 
              />

              {/* Form Content */}
              <div className="flex-1 max-w-4xl">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  
                  {/* Grundinformation Section */}
                  <section 
                    ref={(el) => { sectionRefs.current['grundinformation'] = el }}
                    id="grundinformation"
                  >
                    <GlassCard className="p-8">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="mr-3">📋</span>
                        Grundinformation
                      </h2>
                      <GrundinformationSection register={register} errors={errors} />
                    </GlassCard>
                  </section>

                  {/* Interior Section */}
                  <section 
                    ref={(el) => { sectionRefs.current['interior'] = el }}
                    id="interior"
                  >
                    <GlassCard className="p-8">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="mr-3">🏠</span>
                        Interiör
                      </h2>
                      <InteriorSection register={register} errors={errors} />
                    </GlassCard>
                  </section>

                  {/* Beskrivningar Section */}
                  <section 
                    ref={(el) => { sectionRefs.current['beskrivningar'] = el }}
                    id="beskrivningar"
                  >
                    <GlassCard className="p-8">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="mr-3">📝</span>
                        Beskrivningar
                      </h2>
                      <BeskrivningarSection register={register} errors={errors} />
                    </GlassCard>
                  </section>

                  {/* Byggnad Section */}
                  <section 
                    ref={(el) => { sectionRefs.current['byggnad'] = el }}
                    id="byggnad"
                  >
                    <GlassCard className="p-8">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="mr-3">🏗️</span>
                        Byggnad
                      </h2>
                      <ByggnadSection register={register} errors={errors} />
                    </GlassCard>
                  </section>

                  {/* Avgifter & Insats Section */}
                  <section 
                    ref={(el) => { sectionRefs.current['avgifter'] = el }}
                    id="avgifter"
                  >
                    <GlassCard className="p-8">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="mr-3">💰</span>
                        Avgifter & Insats
                      </h2>
                      <AvgifterSection register={register} errors={errors} />
                    </GlassCard>
                  </section>

                  {/* Submit Button at Bottom */}
                  <div className="text-center pt-8">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-8 py-4 rounded-2xl bg-blue-500/80 hover:bg-blue-600/80 backdrop-blur-sm transition-all duration-300 text-white font-bold text-lg disabled:opacity-50 shadow-xl hover:shadow-2xl"
                    >
                      <Save className="w-5 h-5 mr-3" />
                      {isSubmitting ? 'Sparar objekt...' : 'Spara Objekt'}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}