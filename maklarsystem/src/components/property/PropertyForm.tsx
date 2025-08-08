/**
 * PropertyForm - Multi-step Property Form Component
 * 
 * Complete multi-step form for creating and editing Swedish real estate properties
 * with validation, auto-save, and glassmorphism styling.
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  AlertCircle, 
  Save,
  Eye,
  Home,
  MapPin,
  Ruler,
  CreditCard,
  FileText,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  createPropertySchema, 
  type CreatePropertyData 
} from '@/lib/validation/schemas/property.schema';
import { 
  PropertyFormProps, 
  PropertyFormStep 
} from '@/types/property.types';

// Import form step components
import { BasicInfoStep } from './form/BasicInfoStep';
import { LocationStep } from './form/LocationStep';
import { SpecificationsStep } from './form/SpecificationsStep';
import { PricingStep } from './form/PricingStep';
import { ContentStep } from './form/ContentStep';
import { ImagesStep } from './form/ImagesStep';

// ============================================================
// FORM STEPS CONFIGURATION
// ============================================================

const FORM_STEPS: PropertyFormStep[] = [
  {
    id: 'basic',
    title: 'Grundinformation',
    description: 'Objekttyp och status',
    fields: ['fastighetsbeteckning', 'propertyType', 'status'],
    isRequired: true,
    isValid: false,
    canSkip: false
  },
  {
    id: 'location',
    title: 'Adress',
    description: 'Plats och koordinater',
    fields: ['address.street', 'address.postalCode', 'address.city', 'address.municipality'],
    isRequired: true,
    isValid: false,
    canSkip: false
  },
  {
    id: 'specifications',
    title: 'Specifikationer',
    description: 'Yta, rum och byggår',
    fields: ['specifications.livingArea', 'specifications.rooms', 'specifications.buildYear'],
    isRequired: true,
    isValid: false,
    canSkip: false
  },
  {
    id: 'pricing',
    title: 'Prissättning',
    description: 'Utgångspris och avgifter',
    fields: ['pricing.askingPrice'],
    isRequired: true,
    isValid: false,
    canSkip: false
  },
  {
    id: 'content',
    title: 'Beskrivning',
    description: 'Rubrik och text',
    fields: ['content.title', 'content.fullDescription'],
    isRequired: true,
    isValid: false,
    canSkip: false
  },
  {
    id: 'images',
    title: 'Bilder',
    description: 'Ladda upp foton',
    fields: [],
    isRequired: false,
    isValid: true,
    canSkip: true
  }
];

// Step icons
const STEP_ICONS = {
  basic: Home,
  location: MapPin,
  specifications: Ruler,
  pricing: CreditCard,
  content: FileText,
  images: Calendar
};

// ============================================================
// GLASSMORPHISM STYLES
// ============================================================

const glassStyles = {
  container: cn(
    "backdrop-blur-xl",
    "bg-white/10",
    "border border-white/20",
    "shadow-2xl",
    "rounded-2xl"
  ),
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
  button: cn(
    "px-6 py-3",
    "bg-gradient-to-r from-blue-500/80 to-purple-500/80",
    "hover:from-blue-600/80 hover:to-purple-600/80",
    "text-white font-medium",
    "rounded-lg",
    "transition-all duration-200",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
    "flex items-center gap-2"
  ),
  stepButton: cn(
    "flex items-center gap-3 p-4",
    "bg-white/5 hover:bg-white/10",
    "border border-white/10 hover:border-white/20",
    "rounded-lg transition-all duration-200",
    "text-left w-full"
  ),
  stepActive: "bg-blue-500/20 border-blue-400/50",
  stepComplete: "bg-green-500/20 border-green-400/50",
  progressBar: "h-2 bg-white/10 rounded-full overflow-hidden",
  progressFill: "h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export function PropertyForm({
  initialData,
  propertyId,
  onSubmit,
  onCancel,
  onSaveDraft,
  readonly = false,
  className
}: PropertyFormProps) {
  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [steps, setSteps] = useState(FORM_STEPS);

  // Form setup
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isValid },
    setValue,
    getValues,
    trigger,
    reset
  } = useForm<CreatePropertyData>({
    resolver: zodResolver(createPropertySchema),
    mode: 'onBlur',
    defaultValues: {
      propertyType: 'villa',
      status: 'kommande',
      ...initialData
    }
  });

  // Watch all values for auto-save
  const formData = watch();

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!isDirty || readonly || !onSaveDraft) return;

    const interval = setInterval(async () => {
      try {
        await onSaveDraft(formData);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, isDirty, readonly, onSaveDraft]);

  // Update step validation status
  useEffect(() => {
    const updatedSteps = steps.map(step => {
      const stepFields = step.fields;
      const isStepValid = stepFields.length === 0 || stepFields.every(field => {
        const fieldValue = getNestedValue(formData, field);
        return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
      });
      
      return { ...step, isValid: isStepValid };
    });
    
    setSteps(updatedSteps);
  }, [formData, steps]);

  // Helper to get nested values
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Navigation functions
  const nextStep = async () => {
    const isCurrentStepValid = await trigger(steps[currentStep].fields as any);
    if (isCurrentStepValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = async (stepIndex: number) => {
    // Validate all previous steps
    let canNavigate = true;
    for (let i = 0; i < stepIndex; i++) {
      const stepValid = await trigger(steps[i].fields as any);
      if (!stepValid && !steps[i].canSkip) {
        canNavigate = false;
        break;
      }
    }
    
    if (canNavigate) {
      setCurrentStep(stepIndex);
    }
  };

  // Form submission
  const onFormSubmit = async (data: CreatePropertyData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(data);
    } catch (error) {
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Ett fel uppstod vid sparande'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manual save draft
  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;
    
    try {
      await onSaveDraft(formData);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  // Calculate progress
  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const StepIcon = STEP_ICONS[currentStepData.id as keyof typeof STEP_ICONS];

  return (
    <div className={cn(glassStyles.container, 'p-6 max-w-4xl mx-auto', className)}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {propertyId ? 'Redigera objekt' : 'Skapa nytt objekt'}
            </h1>
            <p className="text-white/60">
              Fyll i information om fastigheten steg för steg
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-sm text-white/50">
                Sparad {lastSaved.toLocaleTimeString('sv-SE')}
              </span>
            )}
            
            {!readonly && onSaveDraft && (
              <button
                type="button"
                onClick={handleSaveDraft}
                className={cn(
                  glassStyles.button,
                  "bg-gray-500/50 hover:bg-gray-600/50",
                  "px-4 py-2 text-sm"
                )}
              >
                <Save size={16} />
                Spara utkast
              </button>
            )}
            
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className={cn(
                  glassStyles.button,
                  "bg-gray-500/50 hover:bg-gray-600/50",
                  "px-4 py-2 text-sm"
                )}
              >
                Avbryt
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className={glassStyles.progressBar}>
          <div 
            className={glassStyles.progressFill} 
            style={{ width: `${progress}%` }} 
          />
        </div>
        
        <div className="flex justify-between mt-2 text-sm text-white/60">
          <span>Steg {currentStep + 1} av {steps.length}</span>
          <span>{Math.round(progress)}% färdig</span>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {steps.map((step, index) => {
          const Icon = STEP_ICONS[step.id as keyof typeof STEP_ICONS];
          const isActive = index === currentStep;
          const isComplete = step.isValid;
          const isPast = index < currentStep;
          
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => goToStep(index)}
              disabled={readonly}
              className={cn(
                glassStyles.stepButton,
                isActive && glassStyles.stepActive,
                isComplete && glassStyles.stepComplete,
                "relative"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  isComplete ? "bg-green-500" : 
                  isActive ? "bg-blue-500" : 
                  "bg-white/10"
                )}>
                  {isComplete ? (
                    <Check size={16} className="text-white" />
                  ) : (
                    <Icon size={16} className="text-white" />
                  )}
                </div>
                
                <div className="hidden md:block text-left">
                  <div className="font-medium text-white text-sm">
                    {step.title}
                  </div>
                  <div className="text-white/60 text-xs">
                    {step.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            {/* Current Step Header */}
            <div className="flex items-center gap-3 mb-6">
              <StepIcon size={24} className="text-blue-400" />
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {currentStepData.title}
                </h2>
                {currentStepData.description && (
                  <p className="text-white/60">
                    {currentStepData.description}
                  </p>
                )}
              </div>
            </div>

            {/* Step Content */}
            {currentStep === 0 && (
              <BasicInfoStep
                register={register}
                control={control}
                errors={errors}
                watch={watch}
                readonly={readonly}
              />
            )}
            
            {currentStep === 1 && (
              <LocationStep
                register={register}
                control={control}
                errors={errors}
                watch={watch}
                setValue={setValue}
                readonly={readonly}
              />
            )}
            
            {currentStep === 2 && (
              <SpecificationsStep
                register={register}
                control={control}
                errors={errors}
                watch={watch}
                readonly={readonly}
              />
            )}
            
            {currentStep === 3 && (
              <PricingStep
                register={register}
                control={control}
                errors={errors}
                watch={watch}
                readonly={readonly}
              />
            )}
            
            {currentStep === 4 && (
              <ContentStep
                register={register}
                control={control}
                errors={errors}
                watch={watch}
                readonly={readonly}
              />
            )}
            
            {currentStep === 5 && (
              <ImagesStep
                propertyId={propertyId}
                readonly={readonly}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error Display */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle size={20} />
              <span>{submitError}</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        {!readonly && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={previousStep}
              disabled={currentStep === 0}
              className={cn(
                glassStyles.button,
                "bg-gray-500/50 hover:bg-gray-600/50",
                currentStep === 0 && "opacity-50 cursor-not-allowed"
              )}
            >
              <ChevronLeft size={20} />
              Föregående
            </button>

            <div className="flex items-center gap-3">
              {currentStep === steps.length - 1 ? (
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className={glassStyles.button}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Sparar...
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      {propertyId ? 'Uppdatera objekt' : 'Skapa objekt'}
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className={glassStyles.button}
                >
                  Nästa
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}