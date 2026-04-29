import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?:      'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { xs: 'w-3 h-3', sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'border-2 border-(--border-light) border-t-amber-500 rounded-full animate-spin',
        sizes[size],
        className
      )}
    />
  )
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4"
      style={{ background: 'var(--bg-base)' }}>
      <div className="relative">
        <Spinner size="lg" />
      </div>
      <p className="text-xs tracking-widest uppercase"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        Loading...
      </p>
    </div>
  )
}