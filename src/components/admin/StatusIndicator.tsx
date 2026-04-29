import { cn } from '@/lib/utils'

type Health = 'healthy' | 'degraded' | 'unhealthy' | 'ok' | 'down' | 'unknown' | 'never' | 'running' | 'error'

const COLORS: Record<Health, string> = {
  healthy:   'var(--green)',
  ok:        'var(--green)',
  running:   'var(--amber)',
  degraded:  'var(--yellow)',
  error:     'var(--red)',
  unhealthy: 'var(--red)',
  down:      'var(--red)',
  never:     'var(--text-muted)',
  unknown:   'var(--text-muted)',
}

interface StatusIndicatorProps {
  status:    string
  label?:    string
  size?:     'sm' | 'md' | 'lg'
  showLabel?: boolean
  pulse?:    boolean
}

export function StatusIndicator({
  status, label, size = 'md', showLabel = true, pulse,
}: StatusIndicatorProps) {
  const normalized = status?.toLowerCase()
  const color =
    normalized && normalized in COLORS
      ? COLORS[normalized as Health]
      : 'var(--text-muted)'
  const dotSize = size === 'sm' ? 6 : size === 'lg' ? 12 : 8

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(pulse && 'animate-pulse')}
        style={{
          width:        dotSize,
          height:       dotSize,
          borderRadius: '50%',
          background:   color,
          boxShadow:    `0 0 ${dotSize}px ${color}60`,
          flexShrink:   0,
        }}
      />
      {showLabel && (
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color, fontFamily: 'var(--font-mono)' }}
        >
          {label || status}
        </span>
      )}
    </div>
  )
}
