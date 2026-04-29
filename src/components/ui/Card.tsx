import { cn } from '@/lib/utils'

interface CardProps {
  children:   React.ReactNode
  className?: string
  padding?:   'none' | 'sm' | 'md' | 'lg'
  glow?:      boolean
  as?:        React.ElementType
}

const paddings = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
}

export function Card({
  children,
  className,
  padding   = 'md',
  glow      = false,
  as: Tag   = 'div',
}: CardProps) {
  return (
    <Tag
      className={cn(
        'relative overflow-hidden',
        'bg-(--bg-surface) border border-(--border)',
        paddings[padding],
        glow && 'amber-glow',
        className
      )}
      style={{ borderRadius: 'var(--radius-lg)' }}
    >
      {children}
    </Tag>
  )
}

interface CardHeaderProps {
  title:       string
  subtitle?:   string
  action?:     React.ReactNode
  mono?:       boolean
  className?:  string
}

export function CardHeader({ title, subtitle, action, mono, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-5', className)}>
      <div>
        <h2
          className="text-sm font-semibold tracking-widest uppercase"
          style={{
            fontFamily: mono ? 'var(--font-mono)' : 'var(--font-display)',
            color: 'var(--text-secondary)',
            letterSpacing: '0.12em',
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}