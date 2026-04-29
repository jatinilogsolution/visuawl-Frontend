import { cn } from '@/lib/utils'

interface SettingSectionProps {
  title:      string
  subtitle?:  string
  action?:    React.ReactNode
  children:   React.ReactNode
  className?: string
}

export function SettingSection({
  title, subtitle, action, children, className,
}: SettingSectionProps) {
  return (
    <div className={cn('pb-8 mb-8', className)}
      style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2
            className="text-sm font-bold uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', letterSpacing: '0.12em' }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      {children}
    </div>
  )
}