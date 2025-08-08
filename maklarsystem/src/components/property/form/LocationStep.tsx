/**
 * LocationStep - Address and location information step
 * 
 * Handles street address, postal code, city, municipality, and coordinates
 */

'use client';

import { useState } from 'react';
import { UseFormRegister, Control, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { AlertCircle, MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreatePropertyData } from '@/lib/validation/schemas/property.schema';

// ============================================================
// TYPES
// ============================================================

interface LocationStepProps {
  register: UseFormRegister<CreatePropertyData>;
  control: Control<CreatePropertyData>;
  errors: FieldErrors<CreatePropertyData>;
  watch: UseFormWatch<CreatePropertyData>;
  setValue: UseFormSetValue<CreatePropertyData>;
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
  fieldGroup: "space-y-4",
  gridCols2: "grid grid-cols-1 md:grid-cols-2 gap-4",
  gridCols3: "grid grid-cols-1 md:grid-cols-3 gap-4",
  helpText: "mt-1 text-sm text-white/60",
  button: cn(
    "px-4 py-3",
    "bg-gradient-to-r from-blue-500/80 to-purple-500/80",
    "hover:from-blue-600/80 hover:to-purple-600/80",
    "text-white font-medium",
    "rounded-lg",
    "transition-all duration-200",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
    "flex items-center gap-2"
  )
};

// Mock Swedish cities and municipalities for suggestions
const SWEDISH_CITIES = [
  'Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 
  'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping', 'Lund', 'Umeå'
];

const SWEDISH_MUNICIPALITIES = [
  'Stockholms kommun', 'Göteborgs kommun', 'Malmö kommun', 'Uppsala kommun',
  'Västerås kommun', 'Örebro kommun', 'Linköpings kommun', 'Helsingborgs kommun'
];

// ============================================================
// COMPONENT
// ============================================================

export function LocationStep({
  register,
  control,
  errors,
  watch,
  setValue,
  readonly = false
}: LocationStepProps) {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const watchedValues = watch();

  // Mock geocoding function (in real app, use Google Maps API or similar)
  const handleGeocode = async () => {
    const { street, postalCode, city } = watchedValues.address || {};
    
    if (!street || !city) {
      alert('Fyll i gatuadress och ort först');
      return;
    }

    setIsGeocoding(true);
    
    try {
      // Mock geocoding - in real app, call geocoding API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock coordinates for Swedish addresses
      const mockCoordinates = {
        lat: 59.3293 + (Math.random() - 0.5) * 2, // Around Stockholm
        lng: 18.0686 + (Math.random() - 0.5) * 2
      };
      
      setValue('address.coordinates', mockCoordinates);
      
    } catch (error) {
      console.error('Geocoding failed:', error);
      alert('Kunde inte hitta koordinater för adressen');
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className={glassStyles.fieldGroup}>
      {/* Street Address */}
      <div>
        <label htmlFor="address.street" className={glassStyles.label}>
          Gatuadress *
        </label>
        <input
          {...register('address.street')}
          id="address.street"
          type="text"
          placeholder="Ex: Storgatan 15"
          className={cn(
            glassStyles.input,
            errors.address?.street && "border-red-500/50 focus:ring-red-400/50"
          )}
          disabled={readonly}
          aria-invalid={!!errors.address?.street}
          aria-describedby={
            errors.address?.street 
              ? 'street-error street-help' 
              : 'street-help'
          }
        />
        <p id="street-help" className={glassStyles.helpText}>
          Ange fullständig gatuadress inklusive gatunummer
        </p>
        {errors.address?.street && (
          <p id="street-error" className={glassStyles.error}>
            <AlertCircle size={14} />
            {errors.address.street.message}
          </p>
        )}
      </div>

      <div className={glassStyles.gridCols3}>
        {/* Postal Code */}
        <div>
          <label htmlFor="address.postalCode" className={glassStyles.label}>
            Postnummer *
          </label>
          <input
            {...register('address.postalCode')}
            id="address.postalCode"
            type="text"
            placeholder="123 45"
            className={cn(
              glassStyles.input,
              errors.address?.postalCode && "border-red-500/50 focus:ring-red-400/50"
            )}
            disabled={readonly}
            aria-invalid={!!errors.address?.postalCode}
            aria-describedby={
              errors.address?.postalCode 
                ? 'postalCode-error postalCode-help' 
                : 'postalCode-help'
            }
          />
          <p id="postalCode-help" className={glassStyles.helpText}>
            5 siffror (XXX XX)
          </p>
          {errors.address?.postalCode && (
            <p id="postalCode-error" className={glassStyles.error}>
              <AlertCircle size={14} />
              {errors.address.postalCode.message}
            </p>
          )}
        </div>

        {/* City */}
        <div>
          <label htmlFor="address.city" className={glassStyles.label}>
            Ort *
          </label>
          <input
            {...register('address.city')}
            id="address.city"
            type="text"
            placeholder="Stockholm"
            className={cn(
              glassStyles.input,
              errors.address?.city && "border-red-500/50 focus:ring-red-400/50"
            )}
            disabled={readonly}
            list="cities"
            aria-invalid={!!errors.address?.city}
            aria-describedby={
              errors.address?.city 
                ? 'city-error city-help' 
                : 'city-help'
            }
          />
          <datalist id="cities">
            {SWEDISH_CITIES.map(city => (
              <option key={city} value={city} />
            ))}
          </datalist>
          <p id="city-help" className={glassStyles.helpText}>
            Ort eller stad
          </p>
          {errors.address?.city && (
            <p id="city-error" className={glassStyles.error}>
              <AlertCircle size={14} />
              {errors.address.city.message}
            </p>
          )}
        </div>

        {/* Municipality */}
        <div>
          <label htmlFor="address.municipality" className={glassStyles.label}>
            Kommun
          </label>
          <input
            {...register('address.municipality')}
            id="address.municipality"
            type="text"
            placeholder="Stockholms kommun"
            className={cn(
              glassStyles.input,
              errors.address?.municipality && "border-red-500/50 focus:ring-red-400/50"
            )}
            disabled={readonly}
            list="municipalities"
            aria-invalid={!!errors.address?.municipality}
            aria-describedby={
              errors.address?.municipality 
                ? 'municipality-error municipality-help' 
                : 'municipality-help'
            }
          />
          <datalist id="municipalities">
            {SWEDISH_MUNICIPALITIES.map(municipality => (
              <option key={municipality} value={municipality} />
            ))}
          </datalist>
          <p id="municipality-help" className={glassStyles.helpText}>
            Kommun (valfritt)
          </p>
          {errors.address?.municipality && (
            <p id="municipality-error" className={glassStyles.error}>
              <AlertCircle size={14} />
              {errors.address.municipality.message}
            </p>
          )}
        </div>
      </div>

      {/* County */}
      <div>
        <label htmlFor="address.county" className={glassStyles.label}>
          Län
        </label>
        <input
          {...register('address.county')}
          id="address.county"
          type="text"
          placeholder="Stockholms län"
          className={cn(
            glassStyles.input,
            errors.address?.county && "border-red-500/50 focus:ring-red-400/50"
          )}
          disabled={readonly}
          aria-invalid={!!errors.address?.county}
          aria-describedby={
            errors.address?.county 
              ? 'county-error county-help' 
              : 'county-help'
          }
        />
        <p id="county-help" className={glassStyles.helpText}>
          Län (valfritt, fylls i automatiskt baserat på ort)
        </p>
        {errors.address?.county && (
          <p id="county-error" className={glassStyles.error}>
            <AlertCircle size={14} />
            {errors.address.county.message}
          </p>
        )}
      </div>

      {/* Coordinates Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MapPin size={20} />
          Koordinater
        </h3>
        
        <div className="mb-4">
          <button
            type="button"
            onClick={handleGeocode}
            disabled={readonly || isGeocoding || !watchedValues.address?.street || !watchedValues.address?.city}
            className={glassStyles.button}
          >
            {isGeocoding ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Söker koordinater...
              </>
            ) : (
              <>
                <Search size={16} />
                Hitta koordinater automatiskt
              </>
            )}
          </button>
          <p className="mt-2 text-sm text-white/60">
            Använd adressen ovan för att automatiskt hitta GPS-koordinater
          </p>
        </div>

        <div className={glassStyles.gridCols2}>
          {/* Latitude */}
          <div>
            <label htmlFor="address.coordinates.lat" className={glassStyles.label}>
              Latitud
            </label>
            <input
              {...register('address.coordinates.lat', { valueAsNumber: true })}
              id="address.coordinates.lat"
              type="number"
              step="0.000001"
              placeholder="59.3293"
              className={cn(
                glassStyles.input,
                errors.address?.coordinates?.lat && "border-red-500/50 focus:ring-red-400/50"
              )}
              disabled={readonly}
              aria-invalid={!!errors.address?.coordinates?.lat}
              aria-describedby={
                errors.address?.coordinates?.lat 
                  ? 'lat-error lat-help' 
                  : 'lat-help'
              }
            />
            <p id="lat-help" className={glassStyles.helpText}>
              Latitud inom Sverige (55.0-69.1)
            </p>
            {errors.address?.coordinates?.lat && (
              <p id="lat-error" className={glassStyles.error}>
                <AlertCircle size={14} />
                {errors.address.coordinates.lat.message}
              </p>
            )}
          </div>

          {/* Longitude */}
          <div>
            <label htmlFor="address.coordinates.lng" className={glassStyles.label}>
              Longitud
            </label>
            <input
              {...register('address.coordinates.lng', { valueAsNumber: true })}
              id="address.coordinates.lng"
              type="number"
              step="0.000001"
              placeholder="18.0686"
              className={cn(
                glassStyles.input,
                errors.address?.coordinates?.lng && "border-red-500/50 focus:ring-red-400/50"
              )}
              disabled={readonly}
              aria-invalid={!!errors.address?.coordinates?.lng}
              aria-describedby={
                errors.address?.coordinates?.lng 
                  ? 'lng-error lng-help' 
                  : 'lng-help'
              }
            />
            <p id="lng-help" className={glassStyles.helpText}>
              Longitud inom Sverige (10.0-24.2)
            </p>
            {errors.address?.coordinates?.lng && (
              <p id="lng-error" className={glassStyles.error}>
                <AlertCircle size={14} />
                {errors.address.coordinates.lng.message}
              </p>
            )}
          </div>
        </div>

        {/* Coordinates Preview */}
        {watchedValues.address?.coordinates?.lat && watchedValues.address?.coordinates?.lng && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h4 className="text-white font-medium mb-2">Koordinater sparade</h4>
            <p className="text-white/70 text-sm">
              Lat: {watchedValues.address.coordinates.lat.toFixed(6)}, 
              Lng: {watchedValues.address.coordinates.lng.toFixed(6)}
            </p>
            <p className="text-white/60 text-xs mt-1">
              Koordinaterna kommer att användas för kartvisning och närområdessökning
            </p>
          </div>
        )}
      </div>

      {/* Address Preview */}
      {watchedValues.address?.street && watchedValues.address?.postalCode && watchedValues.address?.city && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="text-white font-medium mb-2">Adressförhandsvisning</h4>
          <p className="text-white text-lg">
            {watchedValues.address.street}
          </p>
          <p className="text-white/80">
            {watchedValues.address.postalCode} {watchedValues.address.city}
          </p>
          {watchedValues.address.municipality && (
            <p className="text-white/60 text-sm">
              {watchedValues.address.municipality}
            </p>
          )}
        </div>
      )}
    </div>
  );
}