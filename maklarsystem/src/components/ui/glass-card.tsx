import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'nav' | 'input' | 'strong' | 'subtle'
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  shadow?: 'sm' | 'md' | 'lg'
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    className, 
    variant = 'default', 
    blur = 'md',
    border = true,
    shadow = 'md',
    children, 
    ...props 
  }, ref) => {
    const variants = {
      default: 'bg-white/10 border-white/20',
      nav: 'bg-white/15 border-white/25',
      input: 'bg-white/8 border-white/15',
      strong: 'bg-white/20 border-white/30',
      subtle: 'bg-white/5 border-white/10',
    }

    const blurClasses = {
      sm: 'backdrop-blur-sm',
      md: 'backdrop-blur-glass',
      lg: 'backdrop-blur-xl',
      xl: 'backdrop-blur-strong',
    }

    const shadowClasses = {
      sm: 'shadow-glass',
      md: 'shadow-glass-lg',
      lg: 'shadow-glass-dark',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl transition-all duration-200',
          variants[variant],
          blurClasses[blur],
          shadow && shadowClasses[shadow],
          border && 'border',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

export { GlassCard } 