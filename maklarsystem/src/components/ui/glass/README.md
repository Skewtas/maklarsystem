# Glassmorphism Components Library

A comprehensive collection of glassmorphism-styled form and UI components for the Maklarsystem project. All components follow the consistent design system:

```css
backdrop-blur-xl bg-white/20 rounded-3xl border border-white/30 shadow-xl
```

## Installation & Usage

```typescript
import {
  GlassInput,
  GlassSelect,
  GlassTextarea,
  // ... other components
} from '@/components/ui/glass'
```

## Form Input Components

### GlassInput
Enhanced input field with prefix/suffix support, character counting, and password visibility toggle.

```tsx
<GlassInput
  label="Adress"
  placeholder="Gatuadress"
  prefix={<MapPin size={16} />}
  suffix="SEK"
  maxLength={100}
  showCharacterCount
  required
  error="Detta fält är obligatoriskt"
/>
```

**Props:**
- `type`: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search'
- `prefix/suffix`: ReactNode - Icons or text
- `maxLength`: number - Character limit
- `showCharacterCount`: boolean - Show character counter
- `error`: string - Error message
- `required`: boolean - Required field indicator

### GlassTextarea
Auto-resizing textarea with character counting.

```tsx
<GlassTextarea
  label="Beskrivning"
  placeholder="Beskriv fastigheten..."
  autoResize
  minRows={3}
  maxRows={8}
  maxLength={1000}
  showCharacterCount
/>
```

**Props:**
- `autoResize`: boolean - Auto-resize based on content
- `minRows/maxRows`: number - Height constraints
- `resize`: 'none' | 'vertical' | 'horizontal' | 'both'

### GlassSelect
Advanced select with search, multiple selection, and custom options.

```tsx
<GlassSelect
  options={[
    { value: 'villa', label: 'Villa', icon: <Home />, description: 'Fristående hus' },
    { value: 'apartment', label: 'Lägenhet' }
  ]}
  searchable
  clearable
  multiple
  label="Fastighetstyp"
/>
```

**Props:**
- `searchable`: boolean - Enable search functionality
- `clearable`: boolean - Show clear button
- `multiple`: boolean - Allow multiple selections
- `options`: Array of `{ value, label, icon?, description?, disabled? }`

### GlassNumberInput
Number input with increment/decrement buttons and formatting.

```tsx
<GlassNumberInput
  label="Pris"
  prefix="Kr"
  suffix="SEK"
  thousandSeparator
  min={0}
  step={10000}
/>
```

**Props:**
- `thousandSeparator`: boolean - Format with thousand separators
- `prefix/suffix`: string - Display text
- `min/max`: number - Value constraints
- `step`: number - Increment/decrement amount

### GlassDatePicker
Swedish-localized date picker with keyboard input support.

```tsx
<GlassDatePicker
  label="Tillgänglig från"
  min={new Date().toISOString().split('T')[0]}
  placeholder="Välj datum"
/>
```

**Props:**
- `min/max`: string - Date constraints (ISO format)
- Supports Swedish date format (YYYY-MM-DD, DD/MM/YYYY, DD.MM.YYYY)

## Form Control Components

### GlassCheckbox
Stylized checkbox with labels and descriptions.

```tsx
<GlassCheckbox
  checked={hasParking}
  onChange={setHasParking}
  label="Parkering tillgänglig"
  description="Finns det parkeringsplats?"
  size="md"
/>
```

### GlassRadioGroup
Radio button group with horizontal/vertical layouts.

```tsx
<GlassRadioGroup
  name="energyRating"
  value={energyRating}
  onChange={setEnergyRating}
  options={[
    { value: 'A', label: 'A - Mycket bra', description: 'Under 50 kWh/m²' },
    { value: 'B', label: 'B - Bra', description: '50-75 kWh/m²' }
  ]}
  orientation="horizontal"
  label="Energiklass"
/>
```

### GlassSwitch
Toggle switch with customizable sizes.

```tsx
<GlassSwitch
  checked={allowsPets}
  onChange={setAllowsPets}
  label="Husdjur tillåtna"
  description="Är husdjur välkomna?"
  size="lg"
  position="right"
/>
```

## Layout Components

### GlassTabs
Tabbed interface with multiple variants.

```tsx
<GlassTabs
  tabs={[
    { id: 'basic', label: 'Grundinfo', icon: <Home size={16} />, badge: '3' },
    { id: 'details', label: 'Detaljer', icon: <Building size={16} /> }
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="pills" // 'default' | 'pills' | 'underline'
>
  <TabContent />
</GlassTabs>
```

### GlassAccordion
Collapsible content sections.

```tsx
<GlassAccordion
  items={[
    {
      id: 'pricing',
      title: 'Prissättning',
      icon: <DollarSign size={18} />,
      badge: 'Viktigt',
      content: <PricingContent />,
      defaultOpen: true
    }
  ]}
  type="multiple" // 'single' | 'multiple'
  collapsible
/>
```

## Form Layout Components

### GlassFormSection
Section wrapper with title, description, and collapsible functionality.

```tsx
<GlassFormSection
  title="Fastighetsinformation"
  description="Grundläggande information om fastigheten"
  icon={<Building size={24} />}
  variant="default" // 'default' | 'outlined' | 'minimal'
  collapsible
  badge="Obligatorisk"
>
  <FormContent />
</GlassFormSection>
```

### GlassFormGrid
Responsive grid layout for forms.

```tsx
<GlassFormGrid
  columns={3}
  gap="md"
  responsive
  alignItems="start"
>
  <GlassInput label="Rum" />
  <GlassInput label="Yta" />
  <GlassInput label="Byggår" />
</GlassFormGrid>
```

**Props:**
- `columns`: 1 | 2 | 3 | 4 | 6
- `gap`: 'sm' | 'md' | 'lg' | 'xl'
- `responsive`: boolean - Auto-responsive breakpoints
- `alignItems`: 'start' | 'center' | 'end' | 'stretch'

### GlassFieldGroup
Groups related form fields with shared labels.

```tsx
<GlassFieldGroup
  label="Adressinformation"
  description="Fyll i fullständig adress"
  orientation="vertical"
  spacing="md"
  required
  error="Adress krävs"
>
  <GlassInput placeholder="Gatuadress" />
  <GlassFormGrid columns={2}>
    <GlassInput placeholder="Stad" />
    <GlassInput placeholder="Postnummer" />
  </GlassFormGrid>
</GlassFieldGroup>
```

## Accessibility Features

All components include:
- **WCAG 2.1 AA compliance**
- **Keyboard navigation** with proper focus management
- **Screen reader support** with ARIA labels
- **High contrast** mode compatibility
- **Focus indicators** with visible outline rings
- **Semantic HTML** structure

## Integration with React Hook Form

All components are designed to work seamlessly with React Hook Form:

```tsx
import { useForm, Controller } from 'react-hook-form'

const { control, handleSubmit } = useForm()

<Controller
  name="propertyTitle"
  control={control}
  rules={{ required: 'Titel är obligatorisk' }}
  render={({ field, fieldState: { error } }) => (
    <GlassInput
      {...field}
      label="Fastighetstitel"
      error={error?.message}
      required
    />
  )}
/>
```

## Styling Guidelines

### Color Scheme
- **Primary**: Blue tones (`blue-500/30`, `blue-400/50`)
- **Success**: Green tones (`green-500/30`)
- **Error**: Red tones (`red-500/30`, `red-400/50`)
- **Text**: Gray scale (`gray-800`, `gray-600`)

### Glass Effect
- **Background**: `bg-white/20`
- **Backdrop**: `backdrop-blur-xl`
- **Border**: `border-white/30`
- **Shadow**: `shadow-xl`
- **Radius**: `rounded-2xl` to `rounded-3xl`

### Hover States
- **Background**: `hover:bg-white/30`
- **Scale**: `hover:scale-[1.02]`
- **Shadow**: `hover:shadow-2xl`

## Swedish Localization

Components include Swedish language support:
- Date formatting (YYYY-MM-DD, DD/MM/YYYY, DD.MM.YYYY)
- Number formatting with Swedish locale
- Swedish placeholder text and labels
- Cultural design patterns

## Performance Considerations

- **Lazy loading** for large option lists
- **Virtualization** for dropdown menus with 100+ items
- **Debounced search** to prevent excessive API calls
- **Memoization** of expensive calculations
- **Bundle splitting** for optional features

## Browser Support

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Fallbacks**: Graceful degradation for older browsers
- **Progressive enhancement**: Core functionality without JavaScript

## Examples

See `examples/EnhancedForm.tsx` for a complete implementation showing all components working together in a real estate property form.

## Migration from Existing Components

To migrate from the existing simple glass components in `/nytt/page.tsx`:

1. **Replace imports**: Import from the new glass component library
2. **Update props**: New components have enhanced prop interfaces
3. **Add labels**: Use the new `label` prop instead of separate label elements
4. **Error handling**: Use the `error` prop for validation messages
5. **Form integration**: Wrap with `Controller` for React Hook Form

### Before:
```tsx
<GlassInput
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  placeholder="Fastighetstitel"
/>
```

### After:
```tsx
<Controller
  name="title"
  control={control}
  render={({ field, fieldState: { error } }) => (
    <GlassInput
      {...field}
      label="Fastighetstitel"
      placeholder="Ange titel för fastigheten"
      error={error?.message}
      maxLength={100}
      showCharacterCount
      required
    />
  )}
/>
```