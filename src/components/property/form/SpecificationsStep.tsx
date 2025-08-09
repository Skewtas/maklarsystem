/**
 * SpecificationsStep - Property specifications step
 * 
 * Handles living area, supplementary area, plot area, rooms, bathrooms, 
 * build year, and floors
 */

'use client';

import { UseFormRegister, Control, FieldErrors, UseFormWatch } from 'react-hook-form';
import { AlertCircle, Home, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreatePropertyData } from '@/lib/validation/schemas/property.schema';
import { formatArea, formatRooms } from '@/lib/utils/property.utils';

// ============================================================
// TYPES
// ============================================================

interface SpecificationsStepProps {
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
  error: cn(
    "mt-1 text-sm text-red-400",
    "flex items-center gap-1"
  ),
  fieldGroup: "space-y-6",
  gridCols2: "grid grid-cols-1 md:grid-cols-2 gap-4",
  gridCols3: "grid grid-cols-1 md:grid-cols-3 gap-4",
  helpText: "mt-1 text-sm text-white/60",
  sectionTitle: "text-lg font-semibold text-white mb-4 flex items-center gap-2",
  calculation: "mt-2 text-sm text-blue-400",
  warning: "mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
};

// ============================================================
// COMPONENT
// ============================================================

export function SpecificationsStep({
  register,
  control,
  errors,
  watch,
  readonly = false
}: SpecificationsStepProps) {
  const watchedValues = watch();
  const propertyType = watchedValues.propertyType;
  const specifications = watchedValues.specifications;

  // Calculate price per sqm if pricing is available
  const pricePerSqm = watchedValues.pricing?.askingPrice && specifications?.livingArea
    ? Math.round(watchedValues.pricing.askingPrice / specifications.livingArea)
    : null;

  return (
    <div className={glassStyles.fieldGroup}>
      {/* Area Section */}
      <section>
        <h3 className={glassStyles.sectionTitle}>
          <Home size={20} />
          Ytor
        </h3>
        
        <div className={glassStyles.gridCols3}>
          {/* Living Area */}
          <div>
            <label htmlFor="specifications.livingArea" className={glassStyles.label}>
              Boarea (m²) *
            </label>
            <input
              {...register('specifications.livingArea', { valueAsNumber: true })}
              id="specifications.livingArea"
              type="number"
              min="1"
              max="10000"
              placeholder="75"
              className={cn(
                glassStyles.input,
                errors.specifications?.livingArea && "border-red-500/50 focus:ring-red-400/50"
              )}
              disabled={readonly}
              aria-invalid={!!errors.specifications?.livingArea}
              aria-describedby={
                errors.specifications?.livingArea 
                  ? 'livingArea-error livingArea-help' 
                  : 'livingArea-help'
              }
            />
            <p id="livingArea-help" className={glassStyles.helpText}>
              Boyta enligt svensk standard
            </p>
            {errors.specifications?.livingArea && (
              <p id="livingArea-error" className={glassStyles.error}>
                <AlertCircle size={14} />
                {errors.specifications.livingArea.message}
              </p>
            )}
            {specifications?.livingArea && (
              <p className={glassStyles.calculation}>
                {formatArea(specifications.livingArea)}
                {pricePerSqm && ` • ${pricePerSqm.toLocaleString('sv-SE')} kr/m²`}
              </p>
            )}
          </div>

          {/* Supplementary Area */}
          {propertyType !== 'tomt' && (
            <div>
              <label htmlFor="specifications.supplementaryArea" className={glassStyles.label}>
                Biarea (m²)
              </label>
              <input
                {...register('specifications.supplementaryArea', { valueAsNumber: true })}
                id="specifications.supplementaryArea"
                type="number"
                min="0"
                max="10000"
                placeholder="25"
                className={cn(
                  glassStyles.input,
                  errors.specifications?.supplementaryArea && "border-red-500/50 focus:ring-red-400/50"
                )}
                disabled={readonly}
                aria-invalid={!!errors.specifications?.supplementaryArea}
                aria-describedby={
                  errors.specifications?.supplementaryArea 
                    ? 'supplementaryArea-error supplementaryArea-help' 
                    : 'supplementaryArea-help'
                }
              />
              <p id="supplementaryArea-help" className={glassStyles.helpText}>
                Biutrymmen som inte räknas som boarea
              </p>
              {errors.specifications?.supplementaryArea && (
                <p id="supplementaryArea-error" className={glassStyles.error}>
                  <AlertCircle size={14} />
                  {errors.specifications.supplementaryArea.message}
                </p>
              )}
              {specifications?.supplementaryArea && (
                <p className={glassStyles.calculation}>
                  {formatArea(specifications.supplementaryArea)}
                </p>
              )}
            </div>
          )}

          {/* Plot Area */}
          {propertyType !== 'lagenhet' && (
            <div>
              <label htmlFor="specifications.plotArea" className={glassStyles.label}>
                Tomtarea (m²) {propertyType === 'tomt' ? '*' : ''}
              </label>
              <input
                {...register('specifications.plotArea', { valueAsNumber: true })}
                id="specifications.plotArea"
                type="number"
                min="0"
                max="1000000"
                placeholder="800"
                className={cn(
                  glassStyles.input,
                  errors.specifications?.plotArea && "border-red-500/50 focus:ring-red-400/50"
                )}
                disabled={readonly}
                aria-invalid={!!errors.specifications?.plotArea}
                aria-describedBy={
                  errors.specifications?.plotArea 
                    ? 'plotArea-error plotArea-help' 
                    : 'plotArea-help'
                }
              />
              <p id="plotArea-help" className={glassStyles.helpText}>
                Tomtens totala yta
              </p>
              {errors.specifications?.plotArea && (
                <p id="plotArea-error" className={glassStyles.error}>
                  <AlertCircle size={14} />
                  {errors.specifications.plotArea.message}
                </p>
              )}
              {specifications?.plotArea && (
                <p className={glassStyles.calculation}>
                  {formatArea(specifications.plotArea)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Total Area Calculation */}
        {specifications?.livingArea && specifications?.supplementaryArea && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-white font-medium mb-2">Totala ytor</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/70">Total inomhusyta:</span>
                <span className="text-white ml-2 font-medium">
                  {formatArea(specifications.livingArea + specifications.supplementaryArea)}
                </span>
              </div>
              {specifications.plotArea && (
                <div>
                  <span className="text-white/70">Total fastighetsyta:</span>
                  <span className="text-white ml-2 font-medium">
                    {formatArea(specifications.plotArea)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Rooms and Layout Section */}
      <section>
        <h3 className={glassStyles.sectionTitle}>
          <Home size={20} />
          Rum och layout
        </h3>
        
        <div className={glassStyles.gridCols3}>
          {/* Rooms */}
          {propertyType !== 'tomt' && (
            <div>
              <label htmlFor="specifications.rooms" className={glassStyles.label}>
                Antal rum *
              </label>
              <input
                {...register('specifications.rooms', { valueAsNumber: true })}
                id="specifications.rooms"
                type="number"
                min="0.5"
                max="20"
                step="0.5"
                placeholder="3.5"
                className={cn(
                  glassStyles.input,
                  errors.specifications?.rooms && "border-red-500/50 focus:ring-red-400/50"
                )}
                disabled={readonly}
                aria-invalid={!!errors.specifications?.rooms}
                aria-describedby={
                  errors.specifications?.rooms 
                    ? 'rooms-error rooms-help' 
                    : 'rooms-help'
                }
              />
              <p id="rooms-help" className={glassStyles.helpText}>
                Anges i halva rum (ex: 3.5)
              </p>
              {errors.specifications?.rooms && (
                <p id="rooms-error" className={glassStyles.error}>
                  <AlertCircle size={14} />
                  {errors.specifications.rooms.message}
                </p>
              )}
              {specifications?.rooms && (
                <p className={glassStyles.calculation}>
                  {formatRooms(specifications.rooms)}
                </p>
              )}
            </div>
          )}

          {/* Bathrooms */}
          {propertyType !== 'tomt' && (
            <div>
              <label htmlFor="specifications.bathrooms" className={glassStyles.label}>
                Antal badrum
              </label>
              <input
                {...register('specifications.bathrooms', { valueAsNumber: true })}
                id="specifications.bathrooms"
                type="number"
                min="0"
                max="10"
                placeholder="1"
                className={cn(
                  glassStyles.input,
                  errors.specifications?.bathrooms && "border-red-500/50 focus:ring-red-400/50"
                )}
                disabled={readonly}
                aria-invalid={!!errors.specifications?.bathrooms}
                aria-describedby={
                  errors.specifications?.bathrooms 
                    ? 'bathrooms-error bathrooms-help' 
                    : 'bathrooms-help'
                }
              />
              <p id="bathrooms-help" className={glassStyles.helpText}>
                Inkluderar WC och badrum
              </p>
              {errors.specifications?.bathrooms && (
                <p id="bathrooms-error" className={glassStyles.error}>
                  <AlertCircle size={14} />
                  {errors.specifications.bathrooms.message}
                </p>
              )}
            </div>
          )}

          {/* Floors */}
          {(propertyType === 'villa' || propertyType === 'radhus') && (
            <div>
              <label htmlFor="specifications.floors" className={glassStyles.label}>
                Antal våningar
              </label>
              <input
                {...register('specifications.floors', { valueAsNumber: true })}
                id="specifications.floors"
                type="number"
                min="1"
                max="50"
                placeholder="2"
                className={cn(
                  glassStyles.input,
                  errors.specifications?.floors && "border-red-500/50 focus:ring-red-400/50"
                )}
                disabled={readonly}
                aria-invalid={!!errors.specifications?.floors}
                aria-describedby={
                  errors.specifications?.floors 
                    ? 'floors-error floors-help' 
                    : 'floors-help'
                }
              />
              <p id="floors-help" className={glassStyles.helpText}>
                Antal våningsplan
              </p>
              {errors.specifications?.floors && (
                <p id="floors-error" className={glassStyles.error}>
                  <AlertCircle size={14} />
                  {errors.specifications.floors.message}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Build Information Section */}
      <section>
        <h3 className={glassStyles.sectionTitle}>
          <Calendar size={20} />
          Bygginformation
        </h3>
        
        <div className={glassStyles.gridCols2}>
          {/* Build Year */}
          <div>
            <label htmlFor="specifications.buildYear" className={glassStyles.label}>
              Byggår *
            </label>
            <input
              {...register('specifications.buildYear', { valueAsNumber: true })}
              id="specifications.buildYear"
              type="number"
              min="1800"
              max={new Date().getFullYear() + 10}
              placeholder="1995"
              className={cn(
                glassStyles.input,
                errors.specifications?.buildYear && "border-red-500/50 focus:ring-red-400/50"
              )}
              disabled={readonly}
              aria-invalid={!!errors.specifications?.buildYear}
              aria-describedby={
                errors.specifications?.buildYear 
                  ? 'buildYear-error buildYear-help' 
                  : 'buildYear-help'
              }
            />
            <p id="buildYear-help" className={glassStyles.helpText}>
              År då byggnaden uppfördes
            </p>
            {errors.specifications?.buildYear && (
              <p id="buildYear-error" className={glassStyles.error}>
                <AlertCircle size={14} />
                {errors.specifications.buildYear.message}
              </p>
            )}
            {specifications?.buildYear && (
              <p className={glassStyles.calculation}>
                {new Date().getFullYear() - specifications.buildYear} år gammal
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Validation Warnings */}
      {specifications?.livingArea && specifications?.supplementaryArea && 
       specifications.supplementaryArea > specifications.livingArea && (
        <div className={glassStyles.warning}>
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertCircle size={16} />
            <span className="font-medium">Kontrollera ytor</span>
          </div>
          <p className="text-yellow-300 text-sm">
            Biarea ({formatArea(specifications.supplementaryArea)}) är större än boarea 
            ({formatArea(specifications.livingArea)}). Detta är ovanligt - kontrollera att 
            värdena är korrekta.
          </p>
        </div>
      )}

      {propertyType === 'lagenhet' && specifications?.plotArea && specifications.plotArea > 0 && (
        <div className={glassStyles.warning}>
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertCircle size={16} />
            <span className="font-medium">Objekttyp och tomtarea</span>
          </div>
          <p className="text-yellow-300 text-sm">
            Du har angett tomtarea för en lägenhet. Lägenheter har normalt inte egen tomtarea.
            Kontrollera att objekttypen är korrekt.
          </p>
        </div>
      )}

      {propertyType === 'tomt' && specifications?.livingArea && specifications.livingArea > 0 && (
        <div className={glassStyles.warning}>
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertCircle size={16} />
            <span className="font-medium">Tomt med boarea</span>
          </div>
          <p className="text-yellow-300 text-sm">
            Du har angett boarea för en tomt. Tomter ska normalt inte ha boarea.
            Kontrollera att objekttypen är korrekt.
          </p>
        </div>
      )}
    </div>
  );
}