'use client'

import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { ObjektFormData } from '@/lib/schemas/objekt-form.schema'
import { FormField, FormSelect, FormCheckbox } from '../FormField'

interface GrundinformationSectionProps {
  register: UseFormRegister<ObjektFormData>
  errors: FieldErrors<ObjektFormData>
}

export const GrundinformationSection = ({ register, errors }: GrundinformationSectionProps) => {
  const typOptions = [
    { value: 'lagenhet', label: 'Lägenhet' },
    { value: 'villa', label: 'Villa' },
    { value: 'radhus', label: 'Radhus' },
    { value: 'fritidshus', label: 'Fritidshus' },
    { value: 'tomt', label: 'Tomt' },
  ]

  const upplatelseOptions = [
    { value: 'bostadsratt', label: 'Bostadsrätt' },
    { value: 'agt', label: 'Ägt' },
    { value: 'hyresratt', label: 'Hyresrätt' },
    { value: 'arrende', label: 'Arrende' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        name="sokbegrepp"
        label="Sökbegrepp"
        register={register}
        error={errors.sokbegrepp}
        required
        placeholder="Sökbegrepp för objektet"
      />

      <FormSelect
        name="typ"
        label="Typ"
        register={register}
        error={errors.typ}
        options={typOptions}
        required
      />

      <FormSelect
        name="upplatelse_form"
        label="Upplåtelseform"
        register={register}
        error={errors.upplatelse_form}
        options={upplatelseOptions}
        required
      />

      <div className="flex items-center py-4">
        <FormCheckbox
          name="nyproduktion"
          label="Nyproduktion"
          register={register}
          error={errors.nyproduktion}
        />
      </div>

      <FormField
        name="adress"
        label="Adress"
        register={register}
        error={errors.adress}
        required
        placeholder="Gatuadress"
      />

      <FormField
        name="postnummer"
        label="Postnummer"
        register={register}
        error={errors.postnummer}
        required
        placeholder="123 45"
      />

      <FormField
        name="ort"
        label="Ort"
        register={register}
        error={errors.ort}
        required
        placeholder="Ort"
      />

      <FormField
        name="kommun"
        label="Kommun"
        register={register}
        error={errors.kommun}
        required
        placeholder="Kommun"
      />

      <FormField
        name="omrade"
        label="Område"
        register={register}
        error={errors.omrade}
        placeholder="Område/stadsdel"
      />

      <FormField
        name="fastighetsbeteckning"
        label="Fastighetsbeteckning"
        register={register}
        error={errors.fastighetsbeteckning}
        placeholder="Fastighetsbeteckning"
      />

      <FormField
        name="lagenhetsnummer_forening"
        label="Lägenhetsnummer (förening)"
        register={register}
        error={errors.lagenhetsnummer_forening}
        placeholder="Lägenhetsnummer enligt förening"
      />

      <FormField
        name="lagenhetsnummer_register"
        label="Lägenhetsnummer (register)"
        register={register}
        error={errors.lagenhetsnummer_register}
        placeholder="Lägenhetsnummer enligt register"
      />

      <FormField
        name="portkod"
        label="Portkod"
        register={register}
        error={errors.portkod}
        placeholder="Portkod"
      />

      <FormField
        name="nyckelnummer"
        label="Nyckelnummer"
        register={register}
        error={errors.nyckelnummer}
        placeholder="Nyckelnummer"
      />

      <FormField
        name="arkivnummer"
        label="Arkivnummer"
        register={register}
        error={errors.arkivnummer}
        placeholder="Arkivnummer"
      />

      <div className="md:col-span-2">
        <FormField
          name="utokade_sokbegrepp"
          label="Utökade sökbegrepp"
          register={register}
          error={errors.utokade_sokbegrepp}
          placeholder="Ytterligare sökord separerade med komma"
        />
      </div>

      <div className="md:col-span-2">
        <FormField
          name="ovrigt_grundinfo"
          label="Övrigt"
          register={register}
          error={errors.ovrigt_grundinfo}
          placeholder="Övrig information"
        />
      </div>
    </div>
  )
}