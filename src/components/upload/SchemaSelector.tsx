import { useState }     from 'react'
import { cn }           from '@/lib/utils'
 import { ChevronDown, FileJson, Star, Sparkles } from 'lucide-react'
import { useSchemas } from '@/hooks/useSchemas'

interface SchemaSelectorProps {
  value?:    string | null
  onChange:  (id: string | null) => void
}

export function SchemaSelector({ value, onChange }: SchemaSelectorProps) {
  const { data, isLoading }  = useSchemas()
  const [open, setOpen]      = useState(false)

  const schemas = data?.data || []

  const options = [
    { id: null, name: 'Universal Schema', description: 'Built-in: invoices, bills & receipts', isDefault: false, isUniversal: true },
    ...schemas.map(s => ({ ...s, isUniversal: false })),
  ]

  const current = value === null
    ? options[0]
    : options.find(o => o.id === value) || options[0]

  return (
    <div className={cn('relative', open && 'z-50')}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-all',
          'border',
          open
            ? 'border-amber-500 bg-(--bg-elevated)'
            : 'border-(--border) bg-(--bg-elevated) hover:border-(--border-light)'
        )}
        style={{ borderRadius: 'var(--radius-md)' }}
        disabled={isLoading}
      >
        <FileJson size={14} style={{ color: 'var(--amber)', flexShrink: 0 }} />

        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {current?.name || 'Select schema...'}
          </div>
          <div className="text-xs truncate" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {(current as any)?.description || 'Choose extraction format'}
          </div>
        </div>

        <ChevronDown
          size={14}
          className={cn('shrink-0 transition-transform', open && 'rotate-180')}
          style={{ color: 'var(--text-muted)' }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div
            className="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden"
            style={{
              background:   'var(--bg-overlay)',
              border:       '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              boxShadow:    '0 12px 32px rgba(0,0,0,0.5)',
            }}
          >
            {options.map(opt => {
              const isSelected = opt.id === value || (opt.id === null && value === null) || (opt.id === null && value === undefined)
              return (
                <button
                  key={opt.id || 'universal'}
                  type="button"
                  onClick={() => { onChange(opt.id); setOpen(false) }}
                  className={cn(
                    'w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors',
                    'hover:bg-(--bg-elevated)',
                    isSelected && 'bg-amber-500/5'
                  )}
                >
                  <div className="mt-0.5">
                    {(opt as any).isUniversal
                      ? <Sparkles size={13} style={{ color: 'var(--amber)' }} />
                      : (opt as any).isDefault
                      ? <Star size={13} style={{ color: 'var(--amber)' }} />
                      : <FileJson size={13} style={{ color: 'var(--text-muted)' }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-xs font-medium"
                      style={{ color: isSelected ? 'var(--amber)' : 'var(--text-primary)' }}
                    >
                      {opt.name}
                      {(opt as any).isDefault && (
                        <span className="ml-2 text-xs" style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                          DEFAULT
                        </span>
                      )}
                    </div>
                    {(opt as any).description && (
                      <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {(opt as any).description}
                      </div>
                    )}
                    {!(opt as any).isUniversal && (opt as any).fieldCount !== undefined && (
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {(opt as any).fieldCount} fields
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ background: 'var(--amber)' }} />
                  )}
                </button>
              )
            })}

            {/* Create new */}
            <div style={{ borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors hover:bg-(--bg-elevated)"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                onClick={() => { setOpen(false); window.location.href = '/dashboard/schemas' }}
              >
                <FileJson size={12} />
                Manage schemas →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
