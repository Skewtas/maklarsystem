// Example: Glassmorphism UI Component Pattern
// Shows how to create consistent glass-effect components

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'subtle';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
}

export function GlassCard({ 
  children, 
  className,
  variant = 'default',
  blur = 'xl'
}: GlassCardProps) {
  const blurMap = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  const variants = {
    default: 'bg-white/10 border-white/20',
    elevated: 'bg-white/20 border-white/30 shadow-2xl',
    subtle: 'bg-white/5 border-white/10',
  };

  return (
    <div
      className={cn(
        // Base glass effect
        blurMap[blur],
        variants[variant],
        'border rounded-2xl',
        'transition-all duration-300',
        
        // Hover effect
        'hover:bg-white/15',
        'hover:shadow-xl',
        'hover:border-white/25',
        
        // Content padding
        'p-6',
        
        // Custom classes
        className
      )}
    >
      {children}
    </div>
  );
}

// Example: Glass button component
export function GlassButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}) {
  const variants = {
    primary: 'bg-blue-500/20 border-blue-400/30 hover:bg-blue-500/30 text-blue-100',
    secondary: 'bg-white/10 border-white/20 hover:bg-white/20 text-white',
    danger: 'bg-red-500/20 border-red-400/30 hover:bg-red-500/30 text-red-100',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Glass effect
        'backdrop-blur-xl',
        'border rounded-xl',
        'transition-all duration-200',
        
        // Variant styles
        variants[variant],
        sizes[size],
        
        // Interactive states
        'hover:scale-105',
        'active:scale-95',
        
        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed',
        
        className
      )}
    >
      {children}
    </button>
  );
}

// Example: Glass input field
export function GlassInput({
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  className,
}: {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
  className?: string;
}) {
  return (
    <div className="space-y-1">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          // Glass effect
          'backdrop-blur-xl',
          'bg-white/10',
          'border border-white/20',
          'rounded-xl',
          
          // Text styling
          'text-white',
          'placeholder:text-white/50',
          
          // Padding
          'px-4 py-2',
          
          // Focus state
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-white/30',
          'focus:border-white/40',
          
          // Error state
          error && 'border-red-400/50 focus:ring-red-400/30',
          
          // Transition
          'transition-all duration-200',
          
          className
        )}
      />
      {error && (
        <p className="text-red-400 text-sm ml-1">{error}</p>
      )}
    </div>
  );
}

// Example usage in a form
export function ObjektCardExample() {
  return (
    <GlassCard variant="elevated" className="max-w-md">
      <h3 className="text-xl font-semibold text-white mb-4">
        Villa i Djursholm
      </h3>
      
      <div className="space-y-2 text-white/80">
        <p>Fastighetsbeteckning: Djursholm 1:234</p>
        <p>Boarea: 245 m²</p>
        <p>Tomtarea: 1,200 m²</p>
        <p>Utgångspris: 12,500,000 kr</p>
      </div>
      
      <div className="flex gap-2 mt-6">
        <GlassButton variant="primary" size="md">
          Visa detaljer
        </GlassButton>
        <GlassButton variant="secondary" size="md">
          Boka visning
        </GlassButton>
      </div>
    </GlassCard>
  );
}