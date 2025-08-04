'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  GlassInput,
  GlassTextarea,
  GlassSelect,
  GlassNumberInput,
  GlassDatePicker,
  GlassCheckbox,
  GlassRadioGroup,
  GlassSwitch,
  GlassTabs,
  GlassAccordion,
  GlassFormSection,
  GlassFormGrid,
  GlassFieldGroup
} from '../index'
import { 
  Home,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Settings,
  FileText,
  Building
} from 'lucide-react'

interface PropertyFormData {
  // Basic info
  title: string
  description: string
  price: number
  rooms: number
  area: number
  address: string
  city: string
  postalCode: string
  
  // Dates
  availableFrom: string
  viewingDate: string
  
  // Features
  hasParking: boolean
  hasBalcony: boolean
  allowsPets: boolean
  furnished: string
  heating: string
  
  // Contact preference
  contactMethod: string
  priority: string
  
  // Advanced
  energyRating: string
  buildingYear: number
  floorLevel: number
  monthlyFee: number
}

const EnhancedPropertyForm = () => {
  const [activeTab, setActiveTab] = useState('basic')
  
  const { control, handleSubmit, watch, formState: { errors } } = useForm<PropertyFormData>({
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      rooms: 1,
      area: 0,
      address: '',
      city: '',
      postalCode: '',
      availableFrom: '',
      viewingDate: '',
      hasParking: false,
      hasBalcony: false,
      allowsPets: false,
      furnished: 'unfurnished',
      heating: 'district',
      contactMethod: 'email',
      priority: 'normal',
      energyRating: 'A',
      buildingYear: 2020,
      floorLevel: 1,
      monthlyFee: 0
    }
  })

  const onSubmit = (data: PropertyFormData) => {
    console.log('Form submitted:', data)
  }

  const furnishingOptions = [
    { value: 'unfurnished', label: 'Omöblerad' },
    { value: 'semi-furnished', label: 'Delvis möblerad' },
    { value: 'furnished', label: 'Möblerad' }
  ]

  const heatingOptions = [
    { value: 'district', label: 'Fjärrvärme' },
    { value: 'electric', label: 'Elvärme' },
    { value: 'gas', label: 'Gas' },
    { value: 'oil', label: 'Olja' }
  ]

  const energyRatingOptions = [
    { value: 'A', label: 'A - Mycket bra', description: 'Under 50 kWh/m²' },
    { value: 'B', label: 'B - Bra', description: '50-75 kWh/m²' },
    { value: 'C', label: 'C - Acceptabel', description: '75-100 kWh/m²' },
    { value: 'D', label: 'D - Sämre', description: '100-150 kWh/m²' }
  ]

  const contactMethodOptions = [
    { value: 'email', label: 'E-post', description: 'Föredrar kontakt via e-post' },
    { value: 'phone', label: 'Telefon', description: 'Föredrar telefonkontakt' },
    { value: 'both', label: 'Båda', description: 'Okej med både e-post och telefon' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Låg prioritet' },
    { value: 'normal', label: 'Normal prioritet' },
    { value: 'high', label: 'Hög prioritet' },
    { value: 'urgent', label: 'Brådskande' }
  ]

  const tabs = [
    { id: 'basic', label: 'Grundinfo', icon: <Home size={16} /> },
    { id: 'details', label: 'Detaljer', icon: <Building size={16} /> },
    { id: 'features', label: 'Funktioner', icon: <Settings size={16} /> },
    { id: 'contact', label: 'Kontakt', icon: <Users size={16} /> }
  ]

  const accordionItems = [
    {
      id: 'pricing',
      title: 'Prissättning',
      icon: <DollarSign size={18} />,
      content: (
        <GlassFormGrid columns={2} gap="md">
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <GlassNumberInput
                {...field}
                label="Pris"
                suffix="SEK"
                thousandSeparator
                min={0}
                step={10000}
              />
            )}
          />
          <Controller
            name="monthlyFee"
            control={control}
            render={({ field }) => (
              <GlassNumberInput
                {...field}
                label="Månadsavgift"
                suffix="SEK"
                thousandSeparator
                min={0}
              />
            )}
          />
        </GlassFormGrid>
      )
    },
    {
      id: 'location',
      title: 'Adressinformation',
      icon: <MapPin size={18} />,
      defaultOpen: true,
      content: (
        <GlassFieldGroup
          label="Adress"
          description="Fyll i fullständig adress"
          orientation="vertical"
        >
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <GlassInput
                {...field}
                placeholder="Gatuadress"
                required
              />
            )}
          />
          <GlassFormGrid columns={2} gap="md">
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <GlassInput
                  {...field}
                  placeholder="Stad"
                  required
                />
              )}
            />
            <Controller
              name="postalCode"
              control={control}
              render={({ field }) => (
                <GlassInput
                  {...field}
                  placeholder="Postnummer"
                  maxLength={6}
                  showCharacterCount
                />
              )}
            />
          </GlassFormGrid>
        </GlassFieldGroup>
      )
    }
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6">
      <GlassFormSection
        title="Ny Fastighet"
        description="Skapa en ny fastighet i systemet"
        icon={<Building size={24} />}
        variant="default"
        className="mb-8"
      >
        <GlassTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="pills"
        >
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Titel är obligatorisk' }}
                render={({ field }) => (
                  <GlassInput
                    {...field}
                    label="Titel"
                    placeholder="Beskrivande titel för fastigheten"
                    required
                    error={errors.title?.message}
                    maxLength={100}
                    showCharacterCount
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <GlassTextarea
                    {...field}
                    label="Beskrivning"
                    placeholder="Detaljerad beskrivning av fastigheten..."
                    rows={4}
                    maxLength={1000}
                    showCharacterCount
                    autoResize
                    maxRows={8}
                  />
                )}
              />

              <GlassFormGrid columns={3} gap="md">
                <Controller
                  name="rooms"
                  control={control}
                  render={({ field }) => (
                    <GlassNumberInput
                      {...field}
                      label="Antal rum"
                      min={1}
                      max={20}
                      step={1}
                    />
                  )}
                />
                <Controller
                  name="area"
                  control={control}
                  render={({ field }) => (
                    <GlassNumberInput
                      {...field}
                      label="Boarea"
                      suffix="m²"
                      min={0}
                      step={0.5}
                    />
                  )}
                />
                <Controller
                  name="buildingYear"
                  control={control}
                  render={({ field }) => (
                    <GlassNumberInput
                      {...field}
                      label="Byggår"
                      min={1800}
                      max={new Date().getFullYear()}
                      step={1}
                    />
                  )}
                />
              </GlassFormGrid>

              <GlassAccordion
                items={accordionItems}
                type="multiple"
                className="mt-6"
              />
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              <GlassFormGrid columns={2} gap="md">
                <Controller
                  name="availableFrom"
                  control={control}
                  render={({ field }) => (
                    <GlassDatePicker
                      {...field}
                      label="Tillgänglig från"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  )}
                />
                <Controller
                  name="viewingDate"
                  control={control}
                  render={({ field }) => (
                    <GlassDatePicker
                      {...field}
                      label="Visningsdatum"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  )}
                />
              </GlassFormGrid>

              <GlassFieldGroup
                label="Uppvärmning och energi"
                orientation="vertical"
                spacing="md"
              >
                <Controller
                  name="heating"
                  control={control}
                  render={({ field }) => (
                    <GlassSelect
                      {...field}
                      options={heatingOptions}
                      label="Uppvärmning"
                      searchable
                    />
                  )}
                />
                <Controller
                  name="energyRating"
                  control={control}
                  render={({ field }) => (
                    <GlassRadioGroup
                      {...field}
                      name="energyRating"
                      options={energyRatingOptions}
                      label="Energiklass"
                      orientation="horizontal"
                    />
                  )}
                />
              </GlassFieldGroup>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-6">
              <GlassFormSection
                title="Fastighetsfunktioner"
                variant="outlined"
              >
                <div className="space-y-4">
                  <Controller
                    name="hasParking"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <GlassCheckbox
                        checked={value}
                        onChange={onChange}
                        label="Parkering tillgänglig"
                        description="Finns det parkeringsplats?"
                      />
                    )}
                  />
                  <Controller
                    name="hasBalcony"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <GlassCheckbox
                        checked={value}
                        onChange={onChange}
                        label="Balkong/Terrass"
                        description="Har fastigheten balkong eller terrass?"
                      />
                    )}
                  />
                  <Controller
                    name="allowsPets"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <GlassSwitch
                        checked={value}
                        onChange={onChange}
                        label="Husdjur tillåtna"
                        description="Är husdjur välkomna?"
                        size="md"
                      />
                    )}
                  />
                </div>
              </GlassFormSection>

              <Controller
                name="furnished"
                control={control}
                render={({ field }) => (
                  <GlassSelect
                    {...field}
                    options={furnishingOptions}
                    label="Möblering"
                    clearable
                  />
                )}
              />
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <Controller
                name="contactMethod"
                control={control}
                render={({ field }) => (
                  <GlassRadioGroup
                    {...field}
                    name="contactMethod"
                    options={contactMethodOptions}
                    label="Föredragen kontaktmetod"
                    orientation="vertical"
                  />
                )}
              />

              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <GlassSelect
                    {...field}
                    options={priorityOptions}
                    label="Prioritet"
                    searchable
                  />
                )}
              />
            </div>
          )}
        </GlassTabs>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-white/20">
          <button
            type="button"
            className="px-6 py-3 backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl text-gray-700 hover:bg-white/30 transition-all duration-300"
          >
            Avbryt
          </button>
          <button
            type="submit"
            className="px-8 py-3 backdrop-blur-xl bg-blue-500/30 border border-blue-400/50 rounded-2xl text-blue-700 hover:bg-blue-500/40 transition-all duration-300 shadow-lg shadow-blue-500/20"
          >
            Spara Fastighet
          </button>
        </div>
      </GlassFormSection>
    </form>
  )
}

export default EnhancedPropertyForm