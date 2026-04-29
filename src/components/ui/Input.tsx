import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'> {
    label?: string
    error?: string
    hint?: string
    prefix?: React.ReactNode
    suffix?: React.ReactNode
}
export const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    hint,
    prefix,
    suffix,
    className,
    ...props
}, ref) => (
    <div className="flex flex-col gap-1.5">
        {label && (
            <label className="text-xs font-medium tracking-widest uppercase"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                {label}
            </label>
        )}
        <div className="relative flex items-center">
            {prefix && (
                <div className="absolute left-3 flex items-center"
                    style={{ color: 'var(--text-muted)' }}>
                    {prefix}
                </div>
            )}
            <input
                ref={ref}
                className={cn(
                    'w-full h-10 px-3 text-sm transition-all duration-150',
                    'bg-(--bg-elevated) text-(--text-primary)',
                    'border border-(--border)',
                    'placeholder:text-(--text-muted)',
                    'focus:outline-none focus:border-amber-500',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    error && 'border-red-500 focus:border-red-500',
                    prefix && 'pl-9',
                    suffix && 'pr-9',
                    className
                )}
                style={{ borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)' }}
                {...props}
            />
            {suffix && (
                <div className="absolute right-3 flex items-center"
                    style={{ color: 'var(--text-muted)' }}>
                    {suffix}
                </div>
            )}
        </div>
        {error && (
            <span className="text-xs text-red-400">{error}</span>
        )}
        {hint && !error && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</span>
        )}
    </div>
))

Input.displayName = 'Input'