import { useState, useMemo }  from 'react'
import { cn }                 from '@/lib/utils'
import {  Search, Filter } from 'lucide-react'


function flattenToRows(data: any, prefix = ''): { key: string; value: any; depth: number }[] {
  const rows: { key: string; value: any; depth: number }[] = []
  const depth = prefix.split('.').filter(Boolean).length

  for (const k of Object.keys(data || {})) {
    const val    = data[k]
    const fullKey = prefix ? `${prefix}.${k}` : k

    if (val === null || val === undefined) {
      rows.push({ key: fullKey, value: null, depth })
    } else if (Array.isArray(val)) {
      rows.push({ key: fullKey, value: `[${val.length} items]`, depth })
      val.forEach((item, i) => {
        if (typeof item === 'object' && item !== null) {
          rows.push(...flattenToRows(item, `${fullKey}[${i}]`))
        } else {
          rows.push({ key: `${fullKey}[${i}]`, value: item, depth: depth + 1 })
        }
      })
    } else if (typeof val === 'object') {
      rows.push({ key: fullKey, value: '{object}', depth })
      rows.push(...flattenToRows(val, fullKey))
    } else {
      rows.push({ key: fullKey, value: val, depth })
    }
  }
  return rows
}

// ── Extract array data for table view ────────────────────────────────────────

function extractArrayTable(data: any): { headers: string[]; rows: any[][] } | null {
  const arrayKeys = ['line_items', 'items', 'lineItems', 'products', 'charges', 'entries']

  for (const key of arrayKeys) {
    if (Array.isArray(data[key]) && data[key].length > 0 && typeof data[key][0] === 'object') {
      const headers = Array.from(new Set(
        data[key].flatMap((item: any) => Object.keys(item))
      )) as string[]
      const rows = data[key].map((item: any) => headers.map(h => item[h] ?? ''))
      return { headers, rows }
    }
  }
  return null
}

// ── Value renderer ────────────────────────────────────────────────────────────

function ValueCell({ value }: { value: any }) {
  if (value === null || value === undefined) {
    return <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>null</span>
  }
  if (typeof value === 'boolean') {
    return (
      <span style={{ color: value ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>
        {String(value)}
      </span>
    )
  }
  if (typeof value === 'number') {
    return <span style={{ color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>{value}</span>
  }
  const str = String(value)
  if (str === '{object}') return <span style={{ color: 'var(--text-muted)' }}>{'{ ... }'}</span>
  if (str.startsWith('[') && str.endsWith(']')) {
    return <span style={{ color: '#e879f9' }}>{str}</span>
  }
  return (
    <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
      {str.length > 80 ? str.slice(0, 80) + '…' : str}
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface DataTableViewProps {
  data:       any
  compact?:   boolean
}

export function DataTableView({ data, compact }: DataTableViewProps) {
  const [search, setSearch]       = useState('')
  const [viewMode, setViewMode]   = useState<'flat' | 'grid'>('flat')
  const [hideEmpty, setHideEmpty] = useState(false)

  const rows        = useMemo(() => flattenToRows(data), [data])
  const arrayTable  = useMemo(() => extractArrayTable(data), [data])

  const filtered = useMemo(() =>
    rows.filter(r => {
      if (hideEmpty && (r.value === null || r.value === '' || r.value === undefined)) return false
      if (!search) return true
      return (
        r.key.toLowerCase().includes(search.toLowerCase()) ||
        String(r.value ?? '').toLowerCase().includes(search.toLowerCase())
      )
    }),
    [rows, search, hideEmpty]
  )

  const topLevel = useMemo(() =>
    rows.filter(r => r.depth === 0 && r.value !== '{object}' && !String(r.value).startsWith('[')),
    [rows]
  )

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      {!compact && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search fields..."
              className="w-full h-8 pl-8 pr-3 text-xs border bg-transparent focus:outline-none focus:border-amber-500"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)' }}
            />
          </div>

          {/* View toggle */}
          <div className="flex"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            {(['flat', 'grid'] as const).map(m => (
              <button key={m}
                onClick={() => setViewMode(m)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold uppercase transition-all',
                  viewMode === m ? 'bg-amber-500 text-black' : 'text-(--text-muted) hover:text-(--text-secondary)'
                )}
                style={{ borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-display)' }}>
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={() => setHideEmpty(!hideEmpty)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-all',
              hideEmpty ? 'border-amber-500 text-amber-400' : 'border-(--border) text-(--text-muted)'
            )}
            style={{ borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)' }}>
            <Filter size={11} />
            Hide empty
          </button>

          <span className="text-xs ml-auto"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {filtered.length} fields
          </span>
        </div>
      )}

      {/* Grid view — key fields as cards */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {topLevel.slice(0, 18).map(r => (
            <div key={r.key}
              className="p-3"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div className="text-xs uppercase tracking-wider mb-1.5 truncate"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                {r.key.replace(/_/g, ' ')}
              </div>
              <div className="text-sm font-semibold truncate"
                style={{ fontFamily: 'var(--font-mono)' }}>
                <ValueCell value={r.value} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flat table view */}
      {viewMode === 'flat' && (
        <div className="overflow-auto"
          style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', maxHeight: compact ? 360 : 500 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-overlay)', position: 'sticky', top: 0, zIndex: 1 }}>
                <th className="text-left text-xs font-bold uppercase tracking-widest px-4 py-2.5"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', width: '40%', borderBottom: '1px solid var(--border)' }}>
                  Field
                </th>
                <th className="text-left text-xs font-bold uppercase tracking-widest px-4 py-2.5"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', borderBottom: '1px solid var(--border)' }}>
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={`${r.key}-${i}`}
                  style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)' }}>
                  <td className="px-4 py-2.5"
                    style={{ borderBottom: '1px solid var(--border)', paddingLeft: `${16 + r.depth * 16}px` }}>
                    <span className="text-xs"
                      style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {r.key.split('.').pop() || r.key}
                    </span>
                    {r.depth > 0 && (
                      <span className="ml-1 text-xs"
                        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                        {r.key}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <ValueCell value={r.value} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center">
                    <span className="text-xs"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {search ? 'No fields match search' : 'No data'}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Line items table */}
      {arrayTable && !compact && (
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
            Line Items ({arrayTable.rows.length})
          </div>
          <div className="overflow-auto"
            style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', maxHeight: 300 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ background: 'var(--bg-overlay)' }}>
                  {arrayTable.headers.map(h => (
                    <th key={h}
                      className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest whitespace-nowrap"
                      style={{ color: 'var(--amber)', fontFamily: 'var(--font-display)', borderBottom: '1px solid var(--border)' }}>
                      {h.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {arrayTable.rows.map((row, i) => (
                  <tr key={i}
                    style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)' }}>
                    {row.map((cell, j) => (
                      <td key={j}
                        className="px-4 py-2.5 text-xs"
                        style={{ borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        {String(cell ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}