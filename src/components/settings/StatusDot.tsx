import { cn } from '@/lib/utils'

interface StatusDotProps {
  active:    boolean
  label?:    string
  pulse?:    boolean
}

export function StatusDot({ active, label, pulse }: StatusDotProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn('w-2 h-2 rounded-full', pulse && active && 'animate-pulse')}
        style={{ background: active ? 'var(--green)' : 'var(--text-muted)' }}
      />
      {label && (
        <span className="text-xs" style={{
          color: active ? 'var(--green)' : 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}>
          {label || (active ? 'active' : 'inactive')}
        </span>
      )}
    </div>
  )
}