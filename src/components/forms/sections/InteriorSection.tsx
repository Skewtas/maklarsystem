'use client'

import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { ObjektFormData } from '@/lib/schemas/objekt-form.schema'
import { FormField, FormTextarea } from '../FormField'

interface InteriorSectionProps {
  register: UseFormRegister<ObjektFormData>
  errors: FieldErrors<ObjektFormData>
}

export const InteriorSection = ({ register, errors }: InteriorSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        name="boarea"
        label="Boarea (m²)"
        register={register}
        error={errors.boarea}
        type="number"
        placeholder="Boarea i kvadratmeter"
      />

      <FormField
        name="biarea"
        label="Biarea (m²)"
        register={register}
        error={errors.biarea}
        type="number"
        placeholder="Biarea i kvadratmeter"
      />

      <FormField
        name="byggnadsyta"
        label="Byggnadsyta (m²)"
        register={register}
        error={errors.byggnadsyta}
        type="number"
        placeholder="Byggnadsyta i kvadratmeter"
      />

      <FormField
        name="antal_rum"
        label="Antal rum"
        register={register}
        error={errors.antal_rum}
        placeholder="Antal rum"
      />

      <FormField
        name="antal_sovrum"
        label="Antal sovrum"
        register={register}
        error={errors.antal_sovrum}
        placeholder="Antal sovrum"
      />

      <FormField
        name="kokstyp"
        label="Kökstyp"
        register={register}
        error={errors.kokstyp}
        placeholder="Typ av kök"
      />

      <FormField
        name="areakalla"
        label="Areakälla"
        register={register}
        error={errors.areakalla}
        placeholder="Källa för areauppgifter"
      />

      <div className="md:col-span-2">
        <FormTextarea
          name="kommentar_areakalla"
          label="Kommentar areakälla"
          register={register}
          error={errors.kommentar_areakalla}
          placeholder="Kommentar om areakälla"
          rows={2}
        />
      </div>

      <div className="md:col-span-2">
        <FormTextarea
          name="allmant_interior"
          label="Allmänt om interiör"
          register={register}
          error={errors.allmant_interior}
          placeholder="Allmän beskrivning av interiören"
          rows={4}
        />
      </div>
    </div>
  )
}