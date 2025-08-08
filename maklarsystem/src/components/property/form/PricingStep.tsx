/**
 * PricingStep - Property pricing information step
 * 
 * Handles asking price, accepted price, monthly fee, and operating costs
 */

'use client';

import { UseFormRegister, Control, FieldErrors, UseFormWatch } from 'react-hook-form';
import { AlertCircle, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreatePropertyData } from '@/lib/validation/schemas/property.schema';
import { formatSEK, calculatePricePerSqm } from '@/lib/utils/property.utils';

// ============================================================
// TYPES
// ============================================================

interface PricingStepProps {
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
  helpText: "mt-1 text-sm text-white/60",
  sectionTitle: "text-lg font-semibold text-white mb-4 flex items-center gap-2",
  calculation: "mt-2 text-sm text-blue-400",
  priceDisplay: "mt-2 text-lg font-semibold text-green-400",
  warning: "mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg",
  info: "mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
};

// ============================================================
// COMPONENT
// ============================================================

export function PricingStep({
  register,
  control,
  errors,
  watch,
  readonly = false
}: PricingStepProps) {
  const watchedValues = watch();
  const propertyType = watchedValues.propertyType;
  const pricing = watchedValues.pricing;
  const specifications = watchedValues.specifications;

  // Calculate price per sqm
  const pricePerSqm = pricing?.askingPrice && specifications?.livingArea
    ? calculatePricePerSqm(pricing.askingPrice, specifications.livingArea)
    : null;

  // Calculate price change if both asking and accepted prices exist
  const priceChange = pricing?.askingPrice && pricing?.acceptedPrice
    ? {
        amount: pricing.acceptedPrice - pricing.askingPrice,
        percentage: ((pricing.acceptedPrice - pricing.askingPrice) / pricing.askingPrice) * 100
      }
    : null;

  // Calculate total monthly cost for apartments
  const totalMonthlyCost = pricing?.monthlyFee && pricing?.operatingCost
    ? pricing.monthlyFee + pricing.operatingCost
    : pricing?.monthlyFee || pricing?.operatingCost || null;

  return (
    <div className={glassStyles.fieldGroup}>
      {/* Main Pricing Section */}
      <section>
        <h3 className={glassStyles.sectionTitle}>
          <CreditCard size={20} />
          Huvudprissättning
        </h3>
        
        <div className={glassStyles.gridCols2}>
          {/* Asking Price */}
          <div>
            <label htmlFor="pricing.askingPrice" className={glassStyles.label}>
              Utgångspris (SEK) *
            </label>
            <input
              {...register('pricing.askingPrice', { valueAsNumber: true })}
              id="pricing.askingPrice"
              type="number"
              min="0"
              max="1000000000"
              step="1000"
              placeholder="4500000"
              className={cn(
                glassStyles.input,
                errors.pricing?.askingPrice && "border-red-500/50 focus:ring-red-400/50"
              )}
              disabled={readonly}
              aria-invalid={!!errors.pricing?.askingPrice}
              aria-describedby={
                errors.pricing?.askingPrice 
                  ? 'askingPrice-error askingPrice-help' 
                  : 'askingPrice-help'
              }
            />
            <p id="askingPrice-help" className={glassStyles.helpText}>
              Det pris som objektet marknadsförs för
            </p>
            {errors.pricing?.askingPrice && (
              <p id="askingPrice-error" className={glassStyles.error}>
                <AlertCircle size={14} />
                {errors.pricing.askingPrice.message}
              </p>
            )}
            {pricing?.askingPrice && (
              <>
                <p className={glassStyles.priceDisplay}>
                  {formatSEK(pricing.askingPrice)}
                </p>
                {pricePerSqm && (
                  <p className={glassStyles.calculation}>
                    {pricePerSqm.toLocaleString('sv-SE')} kr/m²
                  </p>
                )}
              </>
            )}
          </div>

          {/* Accepted Price */}
          <div>
            <label htmlFor="pricing.acceptedPrice" className={glassStyles.label}>
              Accepterat pris (SEK)
            </label>
            <input
              {...register('pricing.acceptedPrice', { 
                valueAsNumber: true,
                setValueAs: (value) => value === '' ? null : Number(value)
              })}
              id="pricing.acceptedPrice"
              type="number"
              min="0"
              max="1000000000"
              step="1000"
              placeholder="Lämna tomt om ej såld"
              className={cn(
                glassStyles.input,
                errors.pricing?.acceptedPrice && "border-red-500/50 focus:ring-red-400/50"
              )}
              disabled={readonly}
              aria-invalid={!!errors.pricing?.acceptedPrice}
              aria-describedby={
                errors.pricing?.acceptedPrice 
                  ? 'acceptedPrice-error acceptedPrice-help' 
                  : 'acceptedPrice-help'
              }
            />
            <p id="acceptedPrice-help" className={glassStyles.helpText}>
              Slutligt köpeskilling (endast för sålda objekt)
            </p>
            {errors.pricing?.acceptedPrice && (
              <p id="acceptedPrice-error" className={glassStyles.error}>
                <AlertCircle size={14} />
                {errors.pricing.acceptedPrice.message}
              </p>
            )}
            {pricing?.acceptedPrice && (
              <>
                <p className={glassStyles.priceDisplay}>
                  {formatSEK(pricing.acceptedPrice)}
                </p>
                {priceChange && (
                  <div className={cn(
                    "flex items-center gap-1 mt-2",
                    priceChange.amount >= 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {priceChange.amount >= 0 ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                    <span className="text-sm">
                      {priceChange.amount >= 0 ? '+' : ''}{formatSEK(priceChange.amount)}
                      ({priceChange.percentage >= 0 ? '+' : ''}{priceChange.percentage.toFixed(1)}%)
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Monthly Costs Section (primarily for apartments) */}
      <section>
        <h3 className={glassStyles.sectionTitle}>
          <CreditCard size={20} />
          Löpande kostnader
        </h3>
        
        <div className={glassStyles.gridCols2}>
          {/* Monthly Fee */}
          <div>
            <label htmlFor="pricing.monthlyFee" className={glassStyles.label}>
              Månadsavgift (SEK)
              {propertyType === 'lagenhet' && ' *'}
            </label>
            <input
              {...register('pricing.monthlyFee', { valueAsNumber: true })}
              id="pricing.monthlyFee"
              type="number"
              min="0"
              max="100000"
              step="100"
              placeholder={propertyType === 'lagenhet' ? '3500' : 'Ej tillämpligt för denna objekttyp'}
              className={cn(
                glassStyles.input,
                errors.pricing?.monthlyFee && "border-red-500/50 focus:ring-red-400/50",
                propertyType !== 'lagenhet' && "opacity-60"
              )}
              disabled={readonly || propertyType !== 'lagenhet'}
              aria-invalid={!!errors.pricing?.monthlyFee}
              aria-describedby={
                errors.pricing?.monthlyFee 
                  ? 'monthlyFee-error monthlyFee-help' 
                  : 'monthlyFee-help'
              }
            />
            <p id="monthlyFee-help" className={glassStyles.helpText}>
              {propertyType === 'lagenhet' 
                ? 'Månadsavgift till bostadsrättsförening eller HSB'
                : 'Månadsavgift är normalt endast relevant för lägenheter'
              }
            </p>
            {errors.pricing?.monthlyFee && (
              <p id="monthlyFee-error" className={glassStyles.error}>
                <AlertCircle size={14} />
                {errors.pricing.monthlyFee.message}
              </p>
            )}
            {pricing?.monthlyFee && (
              <p className={glassStyles.calculation}>
                {formatSEK(pricing.monthlyFee)}/månad
              </p>
            )}
          </div>

          {/* Operating Cost */}
          <div>
            <label htmlFor="pricing.operatingCost" className={glassStyles.label}>
              Driftskostnad (SEK/månad)
            </label>
            <input
              {...register('pricing.operatingCost', { valueAsNumber: true })}
              id="pricing.operatingCost"
              type="number"
              min="0"
              max="1000000"
              step="100"
              placeholder="2500"
              className={cn(
                glassStyles.input,
                errors.pricing?.operatingCost && "border-red-500/50 focus:ring-red-400/50"
              )}
              disabled={readonly}
              aria-invalid={!!errors.pricing?.operatingCost}
              aria-describedby={
                errors.pricing?.operatingCost 
                  ? 'operatingCost-error operatingCost-help' 
                  : 'operatingCost-help'
              }
            />
            <p id="operatingCost-help" className={glassStyles.helpText}>
              Uppskattade månadskostnader (el, värme, vatten, etc.)
            </p>
            {errors.pricing?.operatingCost && (
              <p id="operatingCost-error" className={glassStyles.error}>
                <AlertCircle size={14} />
                {errors.pricing.operatingCost.message}
              </p>
            )}
            {pricing?.operatingCost && (
              <p className={glassStyles.calculation}>
                {formatSEK(pricing.operatingCost)}/månad
              </p>
            )}
          </div>
        </div>

        {/* Total Monthly Cost Display */}
        {totalMonthlyCost && (
          <div className={glassStyles.info}>
            <h4 className="text-white font-medium mb-2">Total månadskostnad</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {pricing?.monthlyFee && (
                <div>
                  <span className="text-white/70">Månadsavgift:</span>
                  <span className="text-white ml-2 font-medium">
                    {formatSEK(pricing.monthlyFee)}
                  </span>
                </div>
              )}
              {pricing?.operatingCost && (
                <div>
                  <span className="text-white/70">Driftskostnad:</span>
                  <span className="text-white ml-2 font-medium">
                    {formatSEK(pricing.operatingCost)}
                  </span>
                </div>
              )}
              <div>
                <span className="text-white/70">Totalt per månad:</span>
                <span className="text-green-400 ml-2 font-bold">
                  {formatSEK(totalMonthlyCost)}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Price Analysis */}
      {pricing?.askingPrice && pricePerSqm && (
        <div className={glassStyles.info}>
          <h4 className="text-white font-medium mb-4">Prisanalys</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-white/80 font-medium mb-2">Prisinformation</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Utgångspris:</span>
                  <span className="text-white font-medium">{formatSEK(pricing.askingPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Pris per m²:</span>
                  <span className="text-white font-medium">{pricePerSqm.toLocaleString('sv-SE')} kr/m²</span>
                </div>
                {specifications?.livingArea && (
                  <div className="flex justify-between">
                    <span className="text-white/70">Boarea:</span>
                    <span className="text-white font-medium">{specifications.livingArea} m²</span>
                  </div>
                )}
              </div>
            </div>
            
            {totalMonthlyCost && (
              <div>
                <h5 className="text-white/80 font-medium mb-2">Månadskostnader</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Totalt per månad:</span>
                    <span className="text-white font-medium">{formatSEK(totalMonthlyCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Per år:</span>
                    <span className="text-white font-medium">{formatSEK(totalMonthlyCost * 12)}</span>
                  </div>
                  {specifications?.livingArea && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Per m²/månad:</span>
                      <span className="text-white font-medium">
                        {Math.round(totalMonthlyCost / specifications.livingArea)} kr/m²
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Validation Warnings */}
      {propertyType !== 'lagenhet' && pricing?.monthlyFee && pricing.monthlyFee > 0 && (
        <div className={glassStyles.warning}>
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertCircle size={16} />
            <span className="font-medium">Månadskostnad för {propertyType}</span>
          </div>
          <p className="text-yellow-300 text-sm">
            Du har angett månadsavgift för en {propertyType}. Månadsavgifter är normalt endast 
            relevanta för lägenheter/bostadsrätter. Kontrollera att objekttypen är korrekt.
          </p>
        </div>
      )}

      {priceChange && Math.abs(priceChange.percentage) > 50 && (
        <div className={glassStyles.warning}>
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertCircle size={16} />
            <span className="font-medium">Stor prisavvikelse</span>
          </div>
          <p className="text-yellow-300 text-sm">
            Det accepterade priset avviker mer än 50% från utgångspriset. 
            Kontrollera att båda priserna är korrekta.
          </p>
        </div>
      )}

      {pricePerSqm && (pricePerSqm < 5000 || pricePerSqm > 200000) && (
        <div className={glassStyles.warning}>
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertCircle size={16} />
            <span className="font-medium">Ovanligt pris per m²</span>
          </div>
          <p className="text-yellow-300 text-sm">
            Priset per kvadratmeter ({pricePerSqm.toLocaleString('sv-SE')} kr/m²) verkar 
            {pricePerSqm < 5000 ? 'mycket lågt' : 'mycket högt'} för svenska förhållanden. 
            Kontrollera att pris och yta är korrekta.
          </p>
        </div>
      )}
    </div>
  );
}