'use client'

import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { ObjektFormData } from '@/lib/schemas/objekt-form.schema'
import { FormField, FormTextarea } from '../FormField'

interface AvgifterSectionProps {
  register: UseFormRegister<ObjektFormData>
  errors: FieldErrors<ObjektFormData>
}

export const AvgifterSection = ({ register, errors }: AvgifterSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        name="driftkostnad_manad"
        label="Driftkostnad per månad (kr)"
        register={register}
        error={errors.driftkostnad_manad}
        type="number"
        placeholder="Månadskostnad för drift"
      />

      <FormField
        name="avgift_manad"
        label="Avgift per månad (kr)"
        register={register}
        error={errors.avgift_manad}
        type="number"
        placeholder="Månadsavgift"
      />

      <FormField
        name="hyra_manad"
        label="Hyra per månad (kr)"
        register={register}
        error={errors.hyra_manad}
        type="number"
        placeholder="Månadshyra"
      />

      <FormField
        name="andel_kapital"
        label="Andel av kapital (kr)"
        register={register}
        error={errors.andel_kapital}
        type="number"
        placeholder="Kapitalandel"
      />

      <div className="md:col-span-2">
        <FormTextarea
          name="ovrigt_avgifter"
          label="Övrigt om avgifter"
          register={register}
          error={errors.ovrigt_avgifter}
          placeholder="Övrig information om avgifter och kostnader"
          rows={3}
        />
      </div>
    </div>
  )
}