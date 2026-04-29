import { cn }          from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  label:      string
  value:      string | number
  sub?:       string
  trend?:     'up' | 'down' | 'flat'
  trendVal?:  string
  accent?:    boolean
  mono?:      boolean
  className?: string
  icon?:      React.ReactNode
}

export function StatCard({
  label, value, sub, trend, trendVal,
  accent, mono, className, icon,
}: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor =
    trend === 'up'   ? 'var(--green)' :
    trend === 'down' ? 'var(--red)'   : 'var(--text-muted)'

  return (
    <div
      className={cn(
        'relative p-5 overflow-hidden',
        'border transition-all duration-200',
        'hover:border-[var(--border-light)]',
        accent ? 'border-amber-500/30 bg-amber-500/5' : 'border-[var(--border)] bg-[var(--bg-surface)]',
        className
      )}
      style={{ borderRadius: 'var(--radius-lg)' }}
    >
      {/* Corner accent */}
      {accent && (
        <div
          className="absolute top-0 right-0 w-16 h-16 opacity-10"
          style={{
            background: 'radial-gradient(circle at top right, var(--amber), transparent 70%)',
          }}
        />
      )}

      {/* Label row */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}
        >
          {label}
        </span>
        {icon && (
          <div style={{ color: accent ? 'var(--amber)' : 'var(--text-muted)' }}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div
        className="text-3xl font-bold mb-1 leading-none"
        style={{
          fontFamily: mono ? 'var(--font-mono)' : 'var(--font-display)',
          color: accent ? 'var(--amber)' : 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>

      {/* Sub / trend */}
      <div className="flex items-center gap-2 mt-2">
        {sub && (
          <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {sub}
          </span>
        )}
        {trend && trendVal && (
          <div className="flex items-center gap-1 ml-auto">
            <TrendIcon size={11} style={{ color: trendColor }} />
            <span className="text-xs" style={{ color: trendColor, fontFamily: 'var(--font-mono)' }}>
              {trendVal}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}