import { useState }       from 'react'
import { cn }             from '@/lib/utils'
import { Filter, X }      from 'lucide-react'
import type { ExecutionFilters } from '@/hooks/useExecutions'

const STATUSES = [
  { value: '',           label: 'All Status' },
  { value: 'success',    label: 'Success'    },
  { value: 'failed',     label: 'Failed'     },
  { value: 'processing', label: 'Processing' },
  { value: 'queued',     label: 'Queued'     },
  { value: 'stopped',    label: 'Stopped'    },
]

const SOURCES = [
  { value: '',        label: 'All Sources' },
  { value: 'upload',  label: 'Upload'      },
  { value: 'bulk',    label: 'Bulk'        },
  { value: 'webhook', label: 'Webhook'     },
  { value: 'email',   label: 'Email'       },
  { value: 'sftp',    label: 'SFTP'        },
  { value: 'api',     label: 'API'         },
]

interface ExecutionFiltersProps {
  filters:   ExecutionFilters
  onChange:  (f: ExecutionFilters) => void
}

export function ExecutionFilterBar({ filters, onChange }: ExecutionFiltersProps) {
  const [showDates, setShowDates] = useState(false)

  const hasActiveFilters =
    !!filters.status || !!filters.sourceType || !!filters.from || !!filters.to

  const clear = () => {
    setShowDates(false)
    onChange({ page: 1, limit: filters.limit })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Status pills */}
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => onChange({ ...filters, status: s.value || undefined, page: 1 })}
              className={cn(
                'px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all',
                'border',
                filters.status === s.value || (!filters.status && !s.value)
                  ? 'border-amber-500 text-amber-400 bg-amber-500/8'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-light)] hover:text-[var(--text-secondary)]'
              )}
              style={{ borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-display)' }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-5" style={{ background: 'var(--border)' }} />

        {/* Source select */}
        <select
          value={filters.sourceType || ''}
          onChange={e => onChange({ ...filters, sourceType: e.target.value || undefined, page: 1 })}
          className="h-7 px-2 text-xs border bg-transparent cursor-pointer focus:outline-none focus:border-amber-500"
          style={{
            borderColor:  'var(--border)',
            color:        'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            fontFamily:   'var(--font-mono)',
          }}
        >
          {SOURCES.map(s => (
            <option key={s.value} value={s.value}
              style={{ background: 'var(--bg-overlay)', color: 'var(--text-primary)' }}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Date range toggle */}
        <button
          onClick={() => setShowDates(!showDates)}
          className={cn(
            'flex items-center gap-1.5 h-7 px-3 text-xs border transition-all',
            (filters.from || filters.to)
              ? 'border-amber-500 text-amber-400'
              : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-light)]'
          )}
          style={{ borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}
        >
          <Filter size={11} />
          Date Range
        </button>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={clear}
            className="flex items-center gap-1 h-7 px-2 text-xs transition-colors hover:text-red-400"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            <X size={11} />
            Clear
          </button>
        )}
      </div>

      {/* Date range inputs */}
      {showDates && (
        <div className="flex items-center gap-3 animate-fade-in-up">
          <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>from</span>
          <input
            type="date"
            value={filters.from?.slice(0, 10) || ''}
            onChange={e => onChange({ ...filters, from: e.target.value || undefined, page: 1 })}
            className="h-7 px-2 text-xs border bg-transparent focus:outline-none focus:border-amber-500"
            style={{
              borderColor:  'var(--border)',
              color:        'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              fontFamily:   'var(--font-mono)',
              colorScheme:  'dark',
            }}
          />
          <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>to</span>
          <input
            type="date"
            value={filters.to?.slice(0, 10) || ''}
            onChange={e => onChange({ ...filters, to: e.target.value || undefined, page: 1 })}
            className="h-7 px-2 text-xs border bg-transparent focus:outline-none focus:border-amber-500"
            style={{
              borderColor:  'var(--border)',
              color:        'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              fontFamily:   'var(--font-mono)',
              colorScheme:  'dark',
            }}
          />
        </div>
      )}
    </div>
  )
}
