'use client'

import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { ObjektFormData } from '@/lib/schemas/objekt-form.schema'
import { FormField, FormTextarea } from '../FormField'

interface BeskrivningarSectionProps {
  register: UseFormRegister<ObjektFormData>
  errors: FieldErrors<ObjektFormData>
}

export const BeskrivningarSection = ({ register, errors }: BeskrivningarSectionProps) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <FormField
        name="saljfras"
        label="Säljfras"
        register={register}
        error={errors.saljfras}
        placeholder="Kort säljfras för objektet"
      />

      <FormField
        name="saljrubrik"
        label="Säljrubrik"
        register={register}
        error={errors.saljrubrik}
        placeholder="Rubrik för säljannons"
      />

      <FormTextarea
        name="kort_beskrivning"
        label="Kort beskrivning"
        register={register}
        error={errors.kort_beskrivning}
        placeholder="Kort beskrivning av objektet"
        rows={3}
      />

      <FormTextarea
        name="lang_beskrivning"
        label="Lång beskrivning"
        register={register}
        error={errors.lang_beskrivning}
        placeholder="Detaljerad beskrivning av objektet"
        rows={6}
      />

      <FormTextarea
        name="vagbeskrivning"
        label="Vägbeskrivning"
        register={register}
        error={errors.vagbeskrivning}
        placeholder="Beskrivning av vägen till objektet"
        rows={3}
      />

      <FormTextarea
        name="allmant_lagenhet"
        label="Allmänt om lägenheten"
        register={register}
        error={errors.allmant_lagenhet}
        placeholder="Allmän information om lägenheten"
        rows={4}
      />

      <FormTextarea
        name="ovrigt_beskrivning"
        label="Övrigt"
        register={register}
        error={errors.ovrigt_beskrivning}
        placeholder="Övrig information"
        rows={3}
      />
    </div>
  )
}