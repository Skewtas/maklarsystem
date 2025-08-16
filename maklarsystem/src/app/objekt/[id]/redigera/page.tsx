'use client'

import { useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { objektFormSchema, objektFormDefaults, type ObjektFormData } from '@/lib/schemas/objekt-form.schema'
import { useObjektById, useUpdateObjekt } from '@/lib/api/objekt'
import { toast } from 'sonner'
import { GrundinformationSection } from '@/components/forms/sections/GrundinformationSection'
import { InteriorSection } from '@/components/forms/sections/InteriorSection'
import { BeskrivningarSection } from '@/components/forms/sections/BeskrivningarSection'
import { ByggnadSection } from '@/components/forms/sections/ByggnadSection'
import { AvgifterSection } from '@/components/forms/sections/AvgifterSection'
import { BYGGMATERIAL_VALUES, VENTILATION_VALUES, ENERGY_CLASS_VALUES, KOK_VALUES } from '@/lib/enums'
import type { ValidatedObjektUpdate } from '@/types/objekt.types'

const GlassCard = ({ children, className = "", hover = true, ...props }: {
  children: React.ReactNode
  className?: string
  hover?: boolean
  [key: string]: unknown
}) => (
  <div 
    className={`backdrop-blur-xl bg-white/20 rounded-3xl border border-white/30 shadow-xl transition-all duration-300 ${hover ? 'hover:bg-white/30 hover:shadow-2xl hover:scale-[1.02]' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
)

export default function RedigeraObjektPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: objekt, isLoading, error } = useObjektById(id)
  const updateObjekt = useUpdateObjekt()

  const defaultValues: Partial<ObjektFormData> = useMemo(() => {
    if (!objekt) return objektFormDefaults
    return {
      // Grundinfo
      sokbegrepp: objekt.sokbegrepp || '',
      typ: (objekt.typ as any) || 'lagenhet',
      upplatelse_form: (objekt.agandekategori as any) || 'bostadsratt',
      nyproduktion: false,
      adress: objekt.adress || '',
      postnummer: objekt.postnummer || '',
      ort: objekt.ort || '',
      kommun: objekt.kommun || 'Stockholm',
      omrade: objekt.omrade || '',
      fastighetsbeteckning: objekt.fastighetsbeteckning || '',

      // Karta
      latitude: objekt.latitude?.toString() || '',
      longitude: objekt.longitude?.toString() || '',

      // Interiör
      boarea: objekt.boarea?.toString() || '',
      biarea: objekt.biarea?.toString() || '',
      antal_rum: objekt.rum?.toString() || '',
      antal_sovrum: objekt.antal_sovrum?.toString() || '',
      kokstyp: (objekt.kok as any) || '',

      // Beskrivningar
      saljfras: objekt.salutext || '',
      saljrubrik: objekt.marknadsforingstext || '',
      kort_beskrivning: '',
      lang_beskrivning: objekt.beskrivning || '',

      // Byggnad
      byggnadstyp: objekt.byggnadstyp || '',
      byggaar: objekt.byggaar?.toString() || '',
      konstruktion: (objekt.byggmaterial as any) || '',
      ventilationstyp: (objekt.ventilation as any) || '',
      energiklass: (objekt.energiklass as any) || '',

      // Avgifter
      driftkostnad_manad: objekt.driftkostnad?.toString() || '',
      avgift_manad: objekt.manadsavgift?.toString() || '',
    }
  }, [objekt])

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ObjektFormData>({
    resolver: zodResolver(objektFormSchema) as unknown as Resolver<ObjektFormData>,
    defaultValues,
  })

  // Synka defaultValues när data laddas in
  if (objekt && !isLoading) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    reset(defaultValues)
  }

  const onSubmit = useCallback(async (data: ObjektFormData) => {
    let updates: ValidatedObjektUpdate | null = null

    const toNumber = (value?: string) => {
      if (value === undefined || value === null || value === '') return null
      const normalized = String(value).replace(/\s/g, '').replace(',', '.')
      const parsed = parseFloat(normalized)
      return Number.isFinite(parsed) ? parsed : null
    }
    const toInteger = (value?: string) => {
      if (value === undefined || value === null || value === '') return null
      const normalized = String(value).replace(/\s/g, '')
      const parsed = parseInt(normalized, 10)
      return Number.isFinite(parsed) ? parsed : null
    }

    const kokInput = data.kokstyp as string | undefined
    const byggInput = data.konstruktion as string | undefined
    const energiInput = data.energiklass as string | undefined
    const ventInput = data.ventilationstyp as string | undefined

    const safeKok = kokInput && (KOK_VALUES as readonly string[]).includes(kokInput)
      ? (kokInput as typeof KOK_VALUES[number])
      : null
    const safeByggmaterial = byggInput && (BYGGMATERIAL_VALUES as readonly string[]).includes(byggInput)
      ? (byggInput as typeof BYGGMATERIAL_VALUES[number])
      : null
    const safeEnergiklass = energiInput && (ENERGY_CLASS_VALUES as readonly string[]).includes(energiInput)
      ? (energiInput as typeof ENERGY_CLASS_VALUES[number])
      : null
    const safeVentilation = ventInput && (VENTILATION_VALUES as readonly string[]).includes(ventInput)
      ? (ventInput as typeof VENTILATION_VALUES[number])
      : null

    try {
      updates = {
        // Grundinfo
        typ: data.typ,
        adress: data.adress,
        postnummer: data.postnummer.replace(/\s/g, ''),
        ort: data.ort,
        kommun: data.kommun,
        // Ägandekategori från upplåtelseform
        agandekategori: data.upplatelse_form as any,

        // Numeriska fält
        boarea: toNumber(data.boarea) ?? undefined,
        biarea: toNumber(data.biarea) ?? undefined,
        rum: toNumber(data.antal_rum) ?? undefined,
        antal_sovrum: toInteger(data.antal_sovrum) ?? undefined,
        byggaar: toInteger(data.byggaar) ?? undefined,

        // Enum-säkrade
        kok: safeKok ?? undefined,
        byggmaterial: safeByggmaterial ?? undefined,
        energiklass: safeEnergiklass ?? undefined,
        ventilation: safeVentilation ?? undefined,

        // Ekonomi
        manadsavgift: toNumber(data.avgift_manad) ?? undefined,
        driftkostnad: toNumber(data.driftkostnad_manad) ?? undefined,

        // Övrigt
        beskrivning: (data.lang_beskrivning || data.kort_beskrivning) ?? undefined,
        fastighetsbeteckning: data.fastighetsbeteckning || undefined,
        vaning: toInteger(data.vaning) ?? undefined,
        latitude: toNumber(data.latitude || undefined) ?? undefined,
        longitude: toNumber(data.longitude || undefined) ?? undefined,
      }

      await updateObjekt.mutateAsync({ id, updates })
      toast.success('Objekt uppdaterat')
      router.push(`/objekt/${id}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Okänt fel'
      toast.error(`Kunde inte uppdatera objekt: ${msg}`)
    }
  }, [id, router, updateObjekt])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8">Laddar objekt...</div>
      </DashboardLayout>
    )
  }

  if (error || !objekt) {
    return (
      <DashboardLayout>
        <div className="p-8">Kunde inte hämta objekt.</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
        <div className="relative z-10">
          {/* Header */}
          <div className="bg-white/30 backdrop-blur-md border-b border-white/20 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-4">
                  <Link
                    href={`/objekt/${id}`}
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 text-gray-700 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Tillbaka
                  </Link>
                  <h1 className="text-2xl font-bold text-gray-800">Redigera Objekt</h1>
                </div>
                <button
                  onClick={() => handleSubmit(onSubmit)()}
                  disabled={isSubmitting}
                  className="inline-flex items-center px-6 py-2 rounded-xl bg-blue-500/80 hover:bg-blue-600/80 backdrop-blur-sm transition-all duration-300 text-white font-semibold disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Sparar...' : 'Spara ändringar'}
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex-1 max-w-4xl mx-auto">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <section>
                  <GlassCard className="p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                      <span className="mr-3">📋</span>
                      Grundinformation
                    </h2>
                    <GrundinformationSection register={register} errors={errors} />
                  </GlassCard>
                </section>

                <section>
                  <GlassCard className="p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                      <span className="mr-3">🏠</span>
                      Interiör
                    </h2>
                    <InteriorSection register={register} errors={errors} />
                  </GlassCard>
                </section>

                <section>
                  <GlassCard className="p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                      <span className="mr-3">📝</span>
                      Beskrivningar
                    </h2>
                    <BeskrivningarSection register={register} errors={errors} />
                  </GlassCard>
                </section>

                <section>
                  <GlassCard className="p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                      <span className="mr-3">🏗️</span>
                      Byggnad
                    </h2>
                    <ByggnadSection register={register} errors={errors} />
                  </GlassCard>
                </section>

                <section>
                  <GlassCard className="p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                      <span className="mr-3">💰</span>
                      Avgifter & Insats
                    </h2>
                    <AvgifterSection register={register} errors={errors} />
                  </GlassCard>
                </section>

                <div className="text-center pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-8 py-4 rounded-2xl bg-blue-500/80 hover:bg-blue-600/80 backdrop-blur-sm transition-all duration-300 text-white font-bold text-lg disabled:opacity-50 shadow-xl hover:shadow-2xl"
                  >
                    <Save className="w-5 h-5 mr-3" />
                    {isSubmitting ? 'Sparar...' : 'Spara ändringar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}


