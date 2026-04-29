import { cn } from '@/lib/utils'

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'amber'

const styles: Record<BadgeVariant, string> = {
  success: 'bg-green-500/10 text-green-400 border-green-500/20',
  error:   'bg-red-500/10   text-red-400   border-red-500/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  info:    'bg-blue-500/10  text-blue-400  border-blue-500/20',
  neutral: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)]',
  amber:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

interface BadgeProps {
  variant?:  BadgeVariant
  children:  React.ReactNode
  className?: string
  dot?:      boolean
}

const DOT_COLORS: Record<BadgeVariant, string> = {
  success: 'bg-green-400',
  error:   'bg-red-400',
  warning: 'bg-yellow-400',
  info:    'bg-blue-400',
  neutral: 'bg-gray-400',
  amber:   'bg-amber-400',
}

export function Badge({ variant = 'neutral', children, className, dot }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5',
      'text-xs font-medium border tracking-wide',
      styles[variant],
      className
    )} style={{ borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}>
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', DOT_COLORS[variant])}
          style={{ animation: 'pulse-dot 2s infinite' }} />
      )}
      {children}
    </span>
  )
}

// Status-to-variant mapper used across the app
export function executionStatusBadge(status: string): BadgeVariant {
  switch (status) {
    case 'success':    return 'success'
    case 'failed':     return 'error'
    case 'processing': return 'amber'
    case 'queued':     return 'amber'
    case 'stopped':    return 'warning'
    default:           return 'neutral'
  }
}
