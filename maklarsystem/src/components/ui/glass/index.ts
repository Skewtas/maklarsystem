// Enhanced Glassmorphism Components for Maklarsystem
// Design System: backdrop-blur-xl bg-white/20 rounded-3xl border border-white/30 shadow-xl

// Form Input Components
export { default as GlassInput } from './GlassInput'
export { default as GlassTextarea } from './GlassTextarea'  
export { default as GlassSelect } from './GlassSelect'
export { default as GlassNumberInput } from './GlassNumberInput'
export { default as GlassDatePicker } from './GlassDatePicker'

// Form Control Components
export { default as GlassCheckbox } from './GlassCheckbox'
export { default as GlassRadioGroup } from './GlassRadioGroup'
export { default as GlassSwitch } from './GlassSwitch'

// Layout Components
export { default as GlassTabs } from './GlassTabs'
export { default as GlassAccordion } from './GlassAccordion'

// Form Layout Components
export { default as GlassFormSection } from './GlassFormSection'
export { default as GlassFormGrid } from './GlassFormGrid'
export { default as GlassFieldGroup } from './GlassFieldGroup'

// Type definitions for external use
export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  icon?: React.ReactNode
  description?: string
}

export interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
  badge?: string | number
}

export interface AccordionItem {
  id: string
  title: string
  content: React.ReactNode
  disabled?: boolean
  defaultOpen?: boolean
  icon?: React.ReactNode
  badge?: string | number
}