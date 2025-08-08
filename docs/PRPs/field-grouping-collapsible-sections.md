# Product Requirements Prompt: Field Grouping and Collapsible Sections

## Context
You are working on a Swedish real estate management system (Mäklarsystem) built with Next.js 15, TypeScript, Supabase, and Tailwind CSS. The system manages properties (objekt), contacts (kontakter), showings (visningar), and bids (bud).

## Current Feature
Implement field grouping and collapsible sections for the property form to improve UX and organization.

## Technical Stack
- Next.js 15 with App Router
- TypeScript with strict typing
- Tailwind CSS with glassmorphism effects
- React Hook Form + Zod validation
- Radix UI for accessible components
- Supabase for backend

## Requirements

### 1. Create Collapsible Field Groups
Organize the property form into logical, collapsible sections:

#### Required Sections:
- **Grunduppgifter** (Basic Information)
  - Fastighetsbeteckning
  - Objekttyp (villa, lägenhet, radhus, etc.)
  - Status (till_salu, under_kontrakt, såld)
  
- **Adressuppgifter** (Address Information)
  - Gatuadress
  - Postnummer (XXX XX format)
  - Ort
  - Län
  
- **Objektinformation** (Property Details)
  - Boarea (living area)
  - Biarea (secondary area)
  - Tomtarea (plot area)
  - Antal rum
  - Antal sovrum
  - Antal badrum
  
- **Ekonomi** (Financial)
  - Utgångspris
  - Accepterat pris
  - Månadsavgift (for apartments)
  - Driftskostnad
  
- **Byggnadsdetaljer** (Building Details)
  - Byggnadsår
  - Renoverat år
  - Energiklass
  - Uppvärmning
  
- **Beskrivningar** (Descriptions)
  - Kort beskrivning
  - Utförlig beskrivning
  - Områdesbeskrivning

### 2. Implementation Requirements

#### UI/UX Requirements:
- Use Radix UI Collapsible or Accordion components
- Maintain glassmorphism styling consistent with the project
- Show validation errors within each section
- Indicate sections with errors using visual markers
- Default state: Basic information expanded, others collapsed
- Smooth expand/collapse animations
- Persist collapse state in localStorage

#### Technical Requirements:
- Use React Hook Form with proper field registration
- Implement section-level validation
- Support keyboard navigation (Space/Enter to toggle)
- ARIA attributes for accessibility
- Mobile-responsive layout
- Performance: Lazy render collapsed content

#### Code Structure:
```typescript
// Expected component structure
<ObjektForm>
  <FormSection 
    title="Grunduppgifter" 
    defaultOpen={true}
    hasErrors={hasBasicErrors}
  >
    <BasicInfoFields />
  </FormSection>
  
  <FormSection 
    title="Adressuppgifter"
    hasErrors={hasAddressErrors}
  >
    <AddressFields />
  </FormSection>
  // ... more sections
</ObjektForm>
```

### 3. Validation Patterns

Each section should have:
- Field-level validation with Swedish error messages
- Section-level validation status
- Visual indication of required fields
- Real-time validation feedback

### 4. State Management

- Form state managed by React Hook Form
- Collapse state in component state or localStorage
- Error state derived from form state
- Loading states for async operations

## File Structure

Expected files to create/modify:
```
src/
  components/
    objekt/
      ObjektForm.tsx           # Main form component
      FormSection.tsx          # Collapsible section wrapper
      form-sections/
        BasicInfoSection.tsx   # Grunduppgifter fields
        AddressSection.tsx     # Adressuppgifter fields
        PropertySection.tsx    # Objektinformation fields
        FinancialSection.tsx   # Ekonomi fields
        BuildingSection.tsx    # Byggnadsdetaljer fields
        DescriptionSection.tsx # Beskrivningar fields
      validation/
        objekt-schema.ts       # Zod schemas for validation
```

## Styling Guidelines

Use existing glass morphism patterns:
```css
/* Glass panel effect */
.glass-section {
  @apply backdrop-blur-xl bg-white/10 border border-white/20;
  @apply rounded-2xl p-6 transition-all duration-300;
  @apply hover:bg-white/15 hover:border-white/25;
}

/* Section header */
.section-header {
  @apply flex items-center justify-between;
  @apply cursor-pointer select-none;
  @apply py-2 font-medium text-lg;
}

/* Error indication */
.has-error {
  @apply border-red-400/30 bg-red-500/5;
}
```

## Swedish Language Requirements

All UI text must be in Swedish:
- Section titles in Swedish
- Field labels in Swedish
- Error messages in Swedish
- Placeholder text in Swedish
- Tooltips in Swedish

## Testing Requirements

Create tests for:
- Expand/collapse functionality
- Form submission with collapsed sections
- Validation across sections
- Keyboard navigation
- Screen reader compatibility
- Mobile responsiveness

## Performance Considerations

- Lazy load collapsed section content
- Debounce validation for text inputs
- Optimize re-renders with React.memo
- Use field arrays for repeating sections
- Implement virtual scrolling for long forms

## Accessibility Requirements

- ARIA expanded/collapsed states
- Keyboard navigation support
- Focus management
- Screen reader announcements
- High contrast mode support
- Reduced motion preferences

## Success Criteria

The implementation is complete when:
1. All form fields are organized into collapsible sections
2. Sections can be expanded/collapsed smoothly
3. Validation works within collapsed sections
4. Error indicators show on section headers
5. The form is fully accessible
6. Mobile experience is optimized
7. All text is in Swedish
8. Performance targets are met (< 100ms interaction)

## Code Quality Standards

- TypeScript strict mode compliance
- No any types
- Proper error boundaries
- Comprehensive JSDoc comments
- Unit test coverage > 80%
- Follow existing project patterns

## Example Code References

See `/examples/objekt-form-example.tsx` for form patterns
See `/examples/glassmorphism-component.tsx` for styling patterns
See `/examples/swedish-validation.ts` for validation patterns

## Notes

- Maintain consistency with existing codebase patterns
- Use Swedish terminology throughout
- Follow the established validation message format
- Ensure smooth UX on both desktop and mobile
- Consider future extensibility for additional sections