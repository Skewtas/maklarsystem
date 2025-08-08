/**
 * ContentStep - Property content and descriptions step
 * 
 * Handles title, short description, full description, and features
 */

'use client';

import { useState } from 'react';
import { UseFormRegister, Control, FieldErrors, UseFormWatch } from 'react-hook-form';
import { AlertCircle, FileText, Eye, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreatePropertyData } from '@/lib/validation/schemas/property.schema';

// ============================================================
// TYPES
// ============================================================

interface ContentStepProps {
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
  textarea: cn(
    "w-full px-4 py-3",
    "bg-white/5",
    "border border-white/10",
    "rounded-lg",
    "text-white placeholder-white/50",
    "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
    "focus:border-transparent",
    "transition-all duration-200",
    "resize-vertical",
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
  helpText: "mt-1 text-sm text-white/60",
  characterCount: "text-xs text-white/50 mt-1",
  sectionTitle: "text-lg font-semibold text-white mb-4 flex items-center gap-2",
  button: cn(
    "px-3 py-2",
    "bg-gradient-to-r from-blue-500/80 to-purple-500/80",
    "hover:from-blue-600/80 hover:to-purple-600/80",
    "text-white font-medium text-sm",
    "rounded-lg",
    "transition-all duration-200",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
    "flex items-center gap-2"
  ),
  featureItem: cn(
    "flex items-center gap-2 p-2",
    "bg-white/5 border border-white/10",
    "rounded-lg text-sm text-white"
  ),
  preview: "mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
};

// ============================================================
// COMPONENT
// ============================================================

export function ContentStep({
  register,
  control,
  errors,
  watch,
  readonly = false
}: ContentStepProps) {
  const [newFeature, setNewFeature] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const watchedValues = watch();
  const content = watchedValues.content;

  // Character counts
  const titleLength = content?.title?.length || 0;
  const shortDescLength = content?.shortDescription?.length || 0;
  const fullDescLength = content?.fullDescription?.length || 0;

  // Features management
  const features = content?.features || [];

  const addFeature = () => {
    if (!newFeature.trim() || readonly) return;
    
    const currentFeatures = features;
    const updatedFeatures = [...currentFeatures, newFeature.trim()];
    
    // Use register to update the form
    register('content.features').onChange({
      target: { value: updatedFeatures }
    });
    
    setNewFeature('');
  };

  const removeFeature = (index: number) => {
    if (readonly) return;
    
    const updatedFeatures = features.filter((_, i) => i !== index);
    register('content.features').onChange({
      target: { value: updatedFeatures }
    });
  };

  return (
    <div className={glassStyles.fieldGroup}>
      {/* Title Section */}
      <section>
        <h3 className={glassStyles.sectionTitle}>
          <FileText size={20} />
          Rubrik och sammanfattning
        </h3>
        
        {/* Title */}
        <div>
          <label htmlFor="content.title" className={glassStyles.label}>
            Rubrik *
          </label>
          <input
            {...register('content.title')}
            id="content.title"
            type="text"
            placeholder="Ex: Ljus och välplanerad 3:a i hjärtat av Vasastan"
            className={cn(
              glassStyles.input,
              errors.content?.title && "border-red-500/50 focus:ring-red-400/50"
            )}
            disabled={readonly}
            maxLength={255}
            aria-invalid={!!errors.content?.title}
            aria-describedby={
              errors.content?.title 
                ? 'title-error title-help title-count' 
                : 'title-help title-count'
            }
          />
          <div className="flex justify-between items-start mt-1">
            <p id="title-help" className={glassStyles.helpText}>
              Attraktiv rubrik som sammanfattar objektets främsta egenskaper
            </p>
            <span 
              id="title-count"
              className={cn(
                glassStyles.characterCount,
                titleLength > 255 && "text-red-400"
              )}
            >
              {titleLength}/255
            </span>
          </div>
          {errors.content?.title && (
            <p id="title-error" className={glassStyles.error}>
              <AlertCircle size={14} />
              {errors.content.title.message}
            </p>
          )}
        </div>

        {/* Short Description */}
        <div>
          <label htmlFor="content.shortDescription" className={glassStyles.label}>
            Kort beskrivning
          </label>
          <textarea
            {...register('content.shortDescription')}
            id="content.shortDescription"
            rows={3}
            placeholder="En kort sammanfattning som visas i sökresultat och förhandsvisningar..."
            className={cn(
              glassStyles.textarea,
              errors.content?.shortDescription && "border-red-500/50 focus:ring-red-400/50"
            )}
            disabled={readonly}
            maxLength={200}
            aria-invalid={!!errors.content?.shortDescription}
            aria-describedby={
              errors.content?.shortDescription 
                ? 'shortDescription-error shortDescription-help shortDescription-count' 
                : 'shortDescription-help shortDescription-count'
            }
          />
          <div className="flex justify-between items-start mt-1">
            <p id="shortDescription-help" className={glassStyles.helpText}>
              Kort beskrivning för förhandsvisningar och sökresultat
            </p>
            <span 
              id="shortDescription-count"
              className={cn(
                glassStyles.characterCount,
                shortDescLength > 200 && "text-red-400"
              )}
            >
              {shortDescLength}/200
            </span>
          </div>
          {errors.content?.shortDescription && (
            <p id="shortDescription-error" className={glassStyles.error}>
              <AlertCircle size={14} />
              {errors.content.shortDescription.message}
            </p>
          )}
        </div>
      </section>

      {/* Full Description Section */}
      <section>
        <h3 className={glassStyles.sectionTitle}>
          <FileText size={20} />
          Fullständig beskrivning
        </h3>
        
        <div>
          <label htmlFor="content.fullDescription" className={glassStyles.label}>
            Detaljerad beskrivning *
          </label>
          <textarea
            {...register('content.fullDescription')}
            id="content.fullDescription"
            rows={12}
            placeholder="Beskriv objektet i detalj: läge, planösning, renoveringar, närområde, kommunikationer, etc..."
            className={cn(
              glassStyles.textarea,
              errors.content?.fullDescription && "border-red-500/50 focus:ring-red-400/50"
            )}
            disabled={readonly}
            maxLength={10000}
            aria-invalid={!!errors.content?.fullDescription}
            aria-describedby={
              errors.content?.fullDescription 
                ? 'fullDescription-error fullDescription-help fullDescription-count' 
                : 'fullDescription-help fullDescription-count'
            }
          />
          <div className="flex justify-between items-start mt-1">
            <p id="fullDescription-help" className={glassStyles.helpText}>
              Fullständig beskrivning som visas på objektets detaljsida
            </p>
            <span 
              id="fullDescription-count"
              className={cn(
                glassStyles.characterCount,
                fullDescLength > 10000 ? "text-red-400" : 
                fullDescLength < 50 ? "text-yellow-400" : "text-green-400"
              )}
            >
              {fullDescLength}/10000
            </span>
          </div>
          {errors.content?.fullDescription && (
            <p id="fullDescription-error" className={glassStyles.error}>
              <AlertCircle size={14} />
              {errors.content.fullDescription.message}
            </p>
          )}
          {fullDescLength < 50 && fullDescLength > 0 && (
            <p className="text-yellow-400 text-sm mt-1 flex items-center gap-1">
              <AlertCircle size={14} />
              Beskrivningen bör vara minst 50 tecken för bästa resultat
            </p>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h3 className={glassStyles.sectionTitle}>
          <Plus size={20} />
          Särdrag och egenskaper
        </h3>
        
        {/* Add Feature */}
        {!readonly && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addFeature();
                }
              }}
              placeholder="Lägg till särdrag (ex: Balkong, Hiss, Parkering)"
              className={cn(glassStyles.input, "flex-1")}
              maxLength={100}
              disabled={features.length >= 20}
            />
            <button
              type="button"
              onClick={addFeature}
              disabled={!newFeature.trim() || features.length >= 20}
              className={glassStyles.button}
            >
              <Plus size={16} />
              Lägg till
            </button>
          </div>
        )}

        {/* Features List */}
        {features.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-white/70">
              Särdrag ({features.length}/20):
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {features.map((feature, index) => (
                <div key={index} className={glassStyles.featureItem}>
                  <span className="flex-1">{feature}</span>
                  {!readonly && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-400 hover:text-red-300 p-1"
                      aria-label={`Ta bort ${feature}`}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <p className={glassStyles.helpText}>
          Lägg till viktiga egenskaper som balkong, hiss, parkering, etc. 
          Max 20 särdrag per objekt.
        </p>
      </section>

      {/* Preview Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className={glassStyles.sectionTitle}>
            <Eye size={20} />
            Förhandsvisning
          </h3>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={glassStyles.button}
          >
            <Eye size={16} />
            {showPreview ? 'Dölj' : 'Visa'} förhandsvisning
          </button>
        </div>

        {showPreview && (content?.title || content?.fullDescription) && (
          <div className={glassStyles.preview}>
            <h4 className="text-xl font-bold text-white mb-3">
              {content.title || 'Rubrik saknas'}
            </h4>
            
            {content.shortDescription && (
              <p className="text-white/80 text-sm mb-4 italic">
                {content.shortDescription}
              </p>
            )}
            
            {content.fullDescription && (
              <div className="text-white/90 text-sm whitespace-pre-wrap mb-4">
                {content.fullDescription}
              </div>
            )}
            
            {features.length > 0 && (
              <div>
                <h5 className="text-white font-medium mb-2">Särdrag:</h5>
                <div className="flex flex-wrap gap-2">
                  {features.map((feature, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-200"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-white/50 text-xs mt-4 border-t border-white/10 pt-2">
              Förhandsvisning av hur innehållet kommer att visas för besökare
            </p>
          </div>
        )}
      </section>

      {/* Content Guidelines */}
      <div className="p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg">
        <h4 className="text-white font-medium mb-3">Tips för bra innehåll</h4>
        <div className="space-y-2 text-sm text-white/70">
          <div className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span>Använd beskrivande och positiva ord</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span>Nämn läge, kommunikationer och närservice</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span>Beskriv planösning och ljusförhållanden</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span>Inkludera information om renoveringar</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span>Lägg till särdrag som balkong, parkering, etc.</span>
          </div>
        </div>
      </div>
    </div>
  );
}