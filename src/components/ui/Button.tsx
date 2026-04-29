import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    fullWidth?: boolean
}

const variants = {
    primary: 'bg-amber-500 text-black font-semibold hover:bg-amber-400 active:bg-amber-600 border border-amber-500',
    secondary: 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-light)] hover:border-[var(--border-focus)] hover:text-amber-400',
    ghost: 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/60',
    outline: 'bg-transparent text-amber-400 border border-amber-500/40 hover:bg-amber-500/10 hover:border-amber-500',
}

const sizes = {
    sm: 'h-7 px-3 text-xs gap-1.5',
    md: 'h-9 px-4 text-sm gap-2',
    lg: 'h-11 px-6 text-sm gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    variant = 'secondary',
    size = 'md',
    loading = false,
    fullWidth = false,
    disabled,
    className,
    children,
    ...props
}, ref) => (
    <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
            'inline-flex items-center justify-center transition-all duration-150',
            'font-medium tracking-wide select-none',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'focus-visible:outline-1 focus-visible:outline-amber-500',
            variants[variant],
            sizes[size],
            fullWidth && 'w-full',
            className
        )}
        style={{ borderRadius: 'var(--radius-md)' }}
        {...props}
    >
        {loading && <Loader2 className="animate-spin" size={14} />}
        {children}
    </button>
))

Button.displayName = 'Button'