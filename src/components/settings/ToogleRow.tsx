import { cn } from '@/lib/utils'

interface ToggleRowProps {
  label:      string
  sub?:       string
  value:      boolean
  onChange:   (v: boolean) => void
  disabled?:  boolean
}

export function ToggleRow({ label, sub, value, onChange, disabled }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3"
      style={{ borderBottom: '1px solid var(--border)' }}>
      <div>
        <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</div>
        {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{sub}</div>}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={cn(
          'relative w-10 h-5 rounded-full transition-all duration-200 shrink-0',
          value ? 'bg-amber-500' : 'bg-(--bg-overlay)',
          'disabled:opacity-40 disabled:cursor-not-allowed'
        )}
        style={{ border: `1px solid ${value ? 'var(--amber)' : 'var(--border-light)'}` }}
      >
        <div
          className={cn(
            'absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200',
            value ? 'left-5 bg-black' : 'left-0.5 bg-[var(--text-muted)]'
          )}
        />
      </button>
    </div>
  )
}