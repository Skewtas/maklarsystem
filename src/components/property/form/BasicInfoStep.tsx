/**
 * BasicInfoStep - First step of property form
 * 
 * Handles fastighetsbeteckning, property type, and status
 */

'use client';

import { UseFormRegister, Control, FieldErrors, UseFormWatch } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreatePropertyData } from '@/lib/validation/schemas/property.schema';

// ============================================================
// TYPES
// ============================================================

interface BasicInfoStepProps {
  register: UseFormRegister<CreatePropertyData>;
  control: Control<CreatePropertyData>;
  errors: FieldErrors<CreatePropertyData>;
  watch: UseFormWatch<CreatePropertyData>;
  readonly?: boolean;
}

// ============================================================
// GLASSMORPHISM STYLES
// ============================================================

const glassStyles = {
  input: cn(
    "w-full px-4 py-3",
    "bg-white/5",
    "border border-white/10",
    "rounded-lg",
    "text-white placeholder-white/50",
    "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
    "focus:border-transparent",
    "transition-all duration-200",
    "hover:bg-white/10"
  ),
  label: cn(
    "block text-sm font-medium",
    "text-white/90",
    "mb-2"
  ),
  select: cn(
    "w-full px-4 py-3",
    "bg-white/5",
    "border border-white/10",
    "rounded-lg",
    "text-white",
    "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
    "focus:border-transparent",
    "transition-all duration-200",
    "hover:bg-white/10",
    "[&>option]:bg-gray-800 [&>option]:text-white"
  ),
  error: cn(
    "mt-1 text-sm text-red-400",
    "flex items-center gap-1"
  ),
  fieldGroup: "space-y-4",
  gridCols2: "grid grid-cols-1 md:grid-cols-2 gap-4",
  helpText: "mt-1 text-sm text-white/60"
};

// ============================================================
// COMPONENT
// ============================================================

export function BasicInfoStep({
  register,
  control,
  errors,
  watch,
  readonly = false
}: BasicInfoStepProps) {
  const watchedValues = watch();

  return (
    <div className={glassStyles.fieldGroup}>
      {/* Fastighetsbeteckning */}
      <div>
        <label htmlFor="fastighetsbeteckning" className={glassStyles.label}>
          Fastighetsbeteckning *
        </label>
        <input
          {...register('fastighetsbeteckning')}
          id="fastighetsbeteckning"
          type="text"
          placeholder="Ex: Vasastan 12:34"
          className={cn(
            glassStyles.input,
            errors.fastighetsbeteckning && "border-red-500/50 focus:ring-red-400/50"
          )}
          disabled={readonly}
          aria-invalid={!!errors.fastighetsbeteckning}
          aria-describedby={
            errors.fastighetsbeteckning 
              ? 'fastighetsbeteckning-error fastighetsbeteckning-help' 
              : 'fastighetsbeteckning-help'
          }
        />
        <p id="fastighetsbeteckning-help" className={glassStyles.helpText}>
          Fastighetsbeteckning enligt lantmäteriet (kommun, trakt, block:enhet)
        </p>
        {errors.fastighetsbeteckning && (
          <p id="fastighetsbeteckning-error" className={glassStyles.error}>
            <AlertCircle size={14} />
            {errors.fastighetsbeteckning.message}
          </p>
        )}
      </div>

      <div className={glassStyles.gridCols2}>
        {/* Property Type */}
        <div>
          <label htmlFor="propertyType" className={glassStyles.label}>
            Objekttyp *
          </label>
          <select
            {...register('propertyType')}
            id="propertyType"
            className={cn(
              glassStyles.select,
              errors.propertyType && "border-red-500/50 focus:ring-red-400/50"
            )}
            disabled={readonly}
            aria-invalid={!!errors.propertyType}
            aria-describedby={
              errors.propertyType 
                ? 'propertyType-error propertyType-help' 
                : 'propertyType-help'
            }
          >
            <option value="villa">Villa</option>
            <option value="lagenhet">Lägenhet</option>
            <option value="radhus">Radhus</option>
            <option value="tomt">Tomt</option>
            <option value="fritidshus">Fritidshus</option>
          </select>
          <p id="propertyType-help" className={glassStyles.helpText}>
            Välj den typ av fastighet som bäst beskriver objektet
          </p>
          {errors.propertyType && (
            <p id="propertyType-error" className={glassStyles.error}>
              <AlertCircle size={14} />
              {errors.propertyType.message}
            </p>
          )}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className={glassStyles.label}>
            Status *
          </label>
          <select
            {...register('status')}
            id="status"
            className={cn(
              glassStyles.select,
              errors.status && "border-red-500/50 focus:ring-red-400/50"
            )}
            disabled={readonly}
            aria-invalid={!!errors.status}
            aria-describedby={
              errors.status 
                ? 'status-error status-help' 
                : 'status-help'
            }
          >
            <option value="kommande">Kommande</option>
            <option value="till_salu">Till salu</option>
            <option value="under_kontrakt">Under kontrakt</option>
            <option value="sald">Såld</option>
          </select>
          <p id="status-help" className={glassStyles.helpText}>
            Objektets nuvarande status i försäljningsprocessen
          </p>
          {errors.status && (
            <p id="status-error" className={glassStyles.error}>
              <AlertCircle size={14} />
              {errors.status.message}
            </p>
          )}
        </div>
      </div>

      {/* Conditional Help Text based on selections */}
      {watchedValues.propertyType && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="text-white font-medium mb-2">
            Information om {watchedValues.propertyType === 'villa' ? 'villor' : 
                           watchedValues.propertyType === 'lagenhet' ? 'lägenheter' :
                           watchedValues.propertyType === 'radhus' ? 'radhus' :
                           watchedValues.propertyType === 'tomt' ? 'tomter' : 'fritidshus'}
          </h4>
          <p className="text-white/70 text-sm">
            {watchedValues.propertyType === 'villa' && 
              'Villor kräver normalt tomtarea och ska inte ha månadsavgift. Tänk på att inkludera information om trädgård och eventuella biutrymmen.'
            }
            {watchedValues.propertyType === 'lagenhet' && 
              'Lägenheter har oftast månadsavgift och ska inte ha tomtarea. Inkludera information om förening och eventuell balkong/terrass.'
            }
            {watchedValues.propertyType === 'radhus' && 
              'Radhus kombinerar fördelarna med villa och lägenhet. Inkludera information om tomtarea och eventuella gemensamma utrymmen.'
            }
            {watchedValues.propertyType === 'tomt' && 
              'Tomter ska inte ha boarea utan endast tomtarea. Inkludera information om byggrätt och anslutningar.'
            }
            {watchedValues.propertyType === 'fritidshus' && 
              'Fritidshus kan ha både boarea och tomtarea. Inkludera information om närhet till vatten och naturområden.'
            }
          </p>
        </div>
      )}

      {/* Status Information */}
      {watchedValues.status && (
        <div className="mt-4 p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg">
          <h4 className="text-white font-medium mb-2">
            Status: {watchedValues.status === 'kommande' ? 'Kommande' :
                     watchedValues.status === 'till_salu' ? 'Till salu' :
                     watchedValues.status === 'under_kontrakt' ? 'Under kontrakt' : 'Såld'}
          </h4>
          <p className="text-white/70 text-sm">
            {watchedValues.status === 'kommande' && 
              'Objektet förbereds för försäljning men är ännu inte publikt tillgängligt.'
            }
            {watchedValues.status === 'till_salu' && 
              'Objektet är aktivt till salu och visas för potentiella köpare.'
            }
            {watchedValues.status === 'under_kontrakt' && 
              'Ett köpeavtal har tecknats men affären är inte slutförd.'
            }
            {watchedValues.status === 'sald' && 
              'Objektet är sålt och äganderätten har övergått till köparen.'
            }
          </p>
        </div>
      )}
    </div>
  );
}