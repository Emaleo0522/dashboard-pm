import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'raised' | 'overlay'
  hover?: boolean
}

export function Card({ variant = 'raised', hover = false, className, children, ...props }: CardProps) {
  const backgrounds = {
    default: 'bg-surface',
    raised: 'bg-surface-raised',
    overlay: 'bg-surface-overlay',
  }

  return (
    <div
      className={cn(
        'rounded-card border border-border',
        backgrounds[variant],
        hover && 'hover:border-border/80 hover:bg-surface-overlay transition-colors duration-150 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
