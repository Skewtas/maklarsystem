// Example: Property Form with Swedish Validation
// This shows the pattern for creating forms with proper Swedish field validation

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

// Swedish-specific validation schema
const objektSchema = z.object({
  // Property identification
  fastighetsbeteckning: z.string()
    .regex(/^[A-ZÅÄÖ][a-zåäö]+\s+\d+:\d+$/, 'Ogiltig fastighetsbeteckning'),
  
  // Address information
  adress: z.object({
    gatuadress: z.string().min(1, 'Gatuadress krävs'),
    postnummer: z.string().regex(/^\d{3}\s?\d{2}$/, 'Ogiltigt postnummer'),
    ort: z.string().min(1, 'Ort krävs'),
  }),
  
  // Property details
  objektTyp: z.enum(['villa', 'lagenhet', 'radhus', 'fritidshus', 'tomt']),
  boarea: z.number().min(0, 'Boarea kan inte vara negativ'),
  biarea: z.number().min(0).optional(),
  tomtarea: z.number().min(0).optional(),
  rum: z.number().min(1, 'Antal rum måste vara minst 1'),
  
  // Pricing
  utgangspris: z.number().min(0, 'Utgångspris kan inte vara negativt'),
  accepteratPris: z.number().min(0).optional(),
  
  // Status
  status: z.enum(['till_salu', 'under_kontrakt', 'sald', 'vilande']),
  
  // Energy
  energiklass: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G']).optional(),
  
  // Dates with Swedish format
  tilltradesdag: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Använd format ÅÅÅÅ-MM-DD'),
});

type ObjektFormData = z.infer<typeof objektSchema>;

export function ObjektForm({ onSubmit }: { onSubmit: (data: ObjektFormData) => void }) {
  const form = useForm<ObjektFormData>({
    resolver: zodResolver(objektSchema),
    defaultValues: {
      status: 'till_salu',
      objektTyp: 'villa',
    },
  });

  const handleSubmit = async (data: ObjektFormData) => {
    try {
      await onSubmit(data);
      toast.success('Objekt sparat!');
    } catch (error) {
      toast.error('Kunde inte spara objektet');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Grouped sections with collapsible panels */}
      <div className="glass-panel">
        <h3 className="text-lg font-semibold mb-4">Grunduppgifter</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Fastighetsbeteckning
            </label>
            <input
              {...form.register('fastighetsbeteckning')}
              placeholder="Exempel: Kungsholmen 1:23"
              className="input-field"
            />
            {form.formState.errors.fastighetsbeteckning && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.fastighetsbeteckning.message}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Objekttyp
            </label>
            <select {...form.register('objektTyp')} className="input-field">
              <option value="villa">Villa</option>
              <option value="lagenhet">Lägenhet</option>
              <option value="radhus">Radhus</option>
              <option value="fritidshus">Fritidshus</option>
              <option value="tomt">Tomt</option>
            </select>
          </div>
        </div>
      </div>

      {/* More sections following the same pattern... */}
      
      <button
        type="submit"
        className="btn-primary"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? 'Sparar...' : 'Spara objekt'}
      </button>
    </form>
  );
}