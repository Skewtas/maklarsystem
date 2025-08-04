'use client'

import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { ObjektFormData } from '@/lib/schemas/objekt-form.schema'
import { FormField, FormTextarea } from '../FormField'

interface ByggnadSectionProps {
  register: UseFormRegister<ObjektFormData>
  errors: FieldErrors<ObjektFormData>
}

export const ByggnadSection = ({ register, errors }: ByggnadSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        name="byggnadstyp"
        label="Byggnadstyp"
        register={register}
        error={errors.byggnadstyp}
        placeholder="Typ av byggnad"
      />

      <FormField
        name="byggaar"
        label="Byggår"
        register={register}
        error={errors.byggaar}
        placeholder="År då byggnaden uppfördes"
      />

      <FormField
        name="konstruktion"
        label="Konstruktion"
        register={register}
        error={errors.konstruktion}
        placeholder="Konstruktionstyp"
      />

      <FormField
        name="grundlaggning"
        label="Grundläggning"
        register={register}
        error={errors.grundlaggning}
        placeholder="Typ av grundläggning"
      />

      <FormField
        name="anlaggningsar"
        label="Anläggningsår"
        register={register}
        error={errors.anlaggningsar}
        placeholder="År för anläggning"
      />

      <div className="md:col-span-2">
        <FormTextarea
          name="tillbyggnader"
          label="Tillbyggnader"
          register={register}
          error={errors.tillbyggnader}
          placeholder="Information om tillbyggnader"
          rows={3}
        />
      </div>

      <div className="md:col-span-2">
        <FormTextarea
          name="renoveringar"
          label="Renoveringar"
          register={register}
          error={errors.renoveringar}
          placeholder="Information om renoveringar"
          rows={3}
        />
      </div>

      <div className="md:col-span-2">
        <FormTextarea
          name="ovrigt_byggnad"
          label="Övrigt om byggnad"
          register={register}
          error={errors.ovrigt_byggnad}
          placeholder="Övrig information om byggnaden"
          rows={3}
        />
      </div>
    </div>
  )
}