import { useState, useMemo } from 'react'
import { useCompareExecutions } from '@/hooks/useExecutionCompare'
import { useExecutions } from '@/hooks/useExecutions'
import { Button } from '@/components/ui/Button'
import { Badge, executionStatusBadge } from '@/components/ui/Badge'
import { ExportMenu } from './ExportMenu'
import { cn, formatMs, formatDateTime } from '@/lib/utils'
import {
  Plus, X, GitCompare, AlertCircle, Check, Search,
} from 'lucide-react'

function flatDeep(obj: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {}
  for (const k of Object.keys(obj || {})) {
    const val = obj[k]
    const newKey = prefix ? `${prefix}.${k}` : k
    if (val === null || val === undefined || typeof val !== 'object' || Array.isArray(val)) {
      result[newKey] = val
    } else {
      Object.assign(result, flatDeep(val, newKey))
    }
  }
  return result
}

type DiffStatus = 'same' | 'different' | 'missing'

function getDiffStatus(vals: any[]): DiffStatus {
  const defined = vals.filter(v => v !== undefined && v !== null && v !== '')
  if (defined.length === 0) return 'missing'
  if (vals.some(v => v === undefined || v === null || v === '')) return 'different'
  const first = String(vals[0])
  return vals.every(v => String(v) === first) ? 'same' : 'different'
}

function DiffBadge({ status }: { status: DiffStatus }) {
  if (status === 'same') return (
    <div className="w-4 h-4 flex items-center justify-center shrink-0" style={{ color: 'var(--green)' }}>
      <Check size={10} />
    </div>
  )
  if (status === 'different') return (
    <div className="w-4 h-4 flex items-center justify-center shrink-0" style={{ color: 'var(--yellow)' }}>
      <AlertCircle size={10} />
    </div>
  )
  return (
    <div className="w-4 h-4 flex items-center justify-center shrink-0" style={{ color: 'var(--text-muted)' }}>
      <X size={9} />
    </div>
  )
}

const normalizeText = (v: unknown): string =>
  String(v ?? '')
    .toLowerCase()
    .trim()

export function CompareView() {
  const [selectedSlots, setSelectedSlots] = useState<(string | null)[]>([null, null, null, null])
  const [results, setResults] = useState<any[]>([])
  const [compared, setCompared] = useState(false)
  const [diffOnly, setDiffOnly] = useState(false)
  const [pickingSlot, setPickingSlot] = useState<number | null>(0)
  const [executionSearch, setExecutionSearch] = useState('')
  const [executionFromDate, setExecutionFromDate] = useState('')
  const [executionToDate, setExecutionToDate] = useState('')
  const [fieldSearch, setFieldSearch] = useState('')

  const compareMutation = useCompareExecutions()
  const { data: execData } = useExecutions({ page: 1, limit: 100, status: 'success' })
  const execList = (execData?.data as any)?.data || []

  const selectedIds = useMemo(
    () => selectedSlots.filter((id): id is string => !!id),
    [selectedSlots]
  )

  const handleCompare = async () => {
    if (selectedIds.length < 2) return
    const res = await compareMutation.mutateAsync(selectedIds)
    setResults(res.data || [])
    setCompared(true)
  }

  const addExecution = (id: string, slot: number) => {
    setSelectedSlots(prev => {
      const next = [...prev]
      next[slot] = id
      return next
    })
    setCompared(false)
    setResults([])
  }

  const addToActiveOrNextSlot = (id: string) => {
    if (selectedIds.includes(id)) return
    if (pickingSlot !== null) {
      addExecution(id, pickingSlot)
      return
    }
    const openSlot = selectedSlots.findIndex(s => !s)
    if (openSlot >= 0) addExecution(id, openSlot)
  }

  const removeSlot = (slot: number) => {
    setSelectedSlots(prev => {
      const next = [...prev]
      next[slot] = null
      return next
    })
    setCompared(false)
    setResults([])
  }

  const availableExecutions = useMemo(() => {
    const search = normalizeText(executionSearch)
    const from = executionFromDate ? new Date(`${executionFromDate}T00:00:00`) : null
    const to = executionToDate ? new Date(`${executionToDate}T23:59:59.999`) : null

    return execList
      .filter((e: any) => !selectedIds.includes(e.id))
      .filter((e: any) => {
        const createdAt = e?.created_at ? new Date(e.created_at) : null
        if (from && createdAt && createdAt < from) return false
        if (to && createdAt && createdAt > to) return false
        return true
      })
      .filter((e: any) => {
        if (!search) return true
        const haystack = [
          e.id,
          e.original_filename,
          e.status,
          e.source_type,
          formatDateTime(e.created_at),
        ].map(normalizeText).join(' ')
        return haystack.includes(search)
      })
  }, [execList, selectedIds, executionSearch, executionFromDate, executionToDate])

  const comparisonRows = useMemo(() => {
    if (results.length < 2) return []
    const flattened = results.map(r => flatDeep(r.extractedData || {}))
    const allKeys = Array.from(new Set(flattened.flatMap(f => Object.keys(f))))
    const search = normalizeText(fieldSearch)

    return allKeys
      .map(key => {
        const vals = flattened.map(f => f[key])
        const status = getDiffStatus(vals)
        return { key, vals, status }
      })
      .filter(r => !diffOnly || r.status !== 'same')
      .filter(r => {
        if (!search) return true
        const valueText = r.vals.map(v => String(v ?? '')).join(' ')
        const haystack = `${r.key} ${valueText}`.toLowerCase()
        return haystack.includes(search)
      })
  }, [results, diffOnly, fieldSearch])

  const diffCount = comparisonRows.filter(r => r.status === 'different').length
  const sameCount = comparisonRows.filter(r => r.status === 'same').length

  return (
    <div className="space-y-5">
      <div className="p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Compare Extractions
            </div>
            <div className="text-xl font-bold mt-0.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Select 2–4 executions
            </div>
          </div>
          <Button variant="primary" size="md" disabled={selectedIds.length < 2} loading={compareMutation.isPending} onClick={handleCompare}>
            <GitCompare size={13} />
            Compare
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map(slot => {
            const execId = selectedSlots[slot]
            const exec = execList.find((e: any) => e.id === execId)
            const isActive = pickingSlot === slot

            return (
              <div key={slot}>
                {execId && exec ? (
                  <div
                    className="p-3 relative"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: `2px solid ${isActive ? 'var(--amber)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                    }}
                    onClick={() => setPickingSlot(slot)}
                  >
                    <button
                      onClick={(evt) => {
                        evt.stopPropagation()
                        removeSlot(slot)
                      }}
                      className="absolute top-2 right-2 transition-colors hover:text-red-400"
                      style={{ color: 'var(--text-muted)' }}>
                      <X size={12} />
                    </button>
                    <div className="text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Slot {slot + 1}
                    </div>
                    <div className="text-xs font-semibold truncate pr-4" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {exec.original_filename || 'unnamed'}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {formatDateTime(exec.created_at)}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setPickingSlot(slot)}
                    className={cn(
                      'w-full p-3 flex flex-col items-center justify-center gap-2 border-2 border-dashed transition-all',
                      isActive ? 'border-amber-500 bg-amber-500/5' : 'border-(--border) hover:border-(--border-light)'
                    )}
                    style={{ borderRadius: 'var(--radius-md)', minHeight: 80 }}>
                    <Plus size={16} style={{ color: isActive ? 'var(--amber)' : 'var(--text-muted)' }} />
                    <span className="text-xs uppercase tracking-wider" style={{ color: isActive ? 'var(--amber)' : 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                      {isActive ? 'Pick below' : `Slot ${slot + 1}`}
                    </span>
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-5 p-3" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-overlay)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Search size={13} style={{ color: 'var(--amber)' }} />
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--amber)', fontFamily: 'var(--font-display)' }}>
              Available Executions
            </div>
            <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {availableExecutions.length} matches
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
            <input
              value={executionSearch}
              onChange={(e) => setExecutionSearch(e.target.value)}
              placeholder="Search name, date, ID, status, source..."
              className="px-2.5 py-2 text-xs md:col-span-2"
              style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
            />
            <input
              type="date"
              value={executionFromDate}
              onChange={(e) => setExecutionFromDate(e.target.value)}
              className="px-2.5 py-2 text-xs"
              style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
            />
            <input
              type="date"
              value={executionToDate}
              onChange={(e) => setExecutionToDate(e.target.value)}
              className="px-2.5 py-2 text-xs"
              style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div className="space-y-1 max-h-64 overflow-y-auto">
            {availableExecutions.map((e: any) => (
              <button
                key={e.id}
                onClick={() => addToActiveOrNextSlot(e.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-(--bg-elevated)"
                style={{ borderRadius: 'var(--radius-sm)' }}>
                <Badge variant={executionStatusBadge(e.status)}>
                  {e.status}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-xs truncate" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {e.original_filename || 'unnamed'}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {formatDateTime(e.created_at)} · {formatMs(e.processing_time_ms)} · {e.source_type}
                  </div>
                </div>
                <Plus size={12} style={{ color: 'var(--amber)' }} />
              </button>
            ))}
            {availableExecutions.length === 0 && (
              <div className="py-6 text-center text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                No executions matched your filters
              </div>
            )}
          </div>
        </div>
      </div>

      {compared && results.length >= 2 && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Fields', value: comparisonRows.length + sameCount, color: 'var(--text-primary)' },
              { label: 'Matching', value: sameCount, color: 'var(--green)' },
              { label: 'Different', value: diffCount, color: 'var(--yellow)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-4 text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                <div className="text-3xl font-bold" style={{ color, fontFamily: 'var(--font-display)' }}>
                  {value}
                </div>
                <div className="text-xs uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-3" style={{ gridTemplateColumns: `200px repeat(${results.length}, 1fr)` }}>
            <div />
            {results.map((r, i) => (
              <div key={r.id} className="p-3 text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div className="text-xs font-bold mb-1" style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                  Execution {i + 1}
                </div>
                <div className="text-xs truncate" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {r.filename || 'unnamed'}
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant={executionStatusBadge(r.status)}>
                    {r.status}
                  </Badge>
                  <ExportMenu executionId={r.id} filename={r.filename} />
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {formatMs(r.processingTimeMs)} · {formatDateTime(r.createdAt)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setDiffOnly(!diffOnly)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-all',
                diffOnly ? 'border-amber-500 text-amber-400 bg-amber-500/8' : 'border-(--border) text-(--text-muted)'
              )}
              style={{ borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}>
              <AlertCircle size={11} />
              Show differences only
            </button>
            <input
              value={fieldSearch}
              onChange={(e) => setFieldSearch(e.target.value)}
              placeholder="Search fields (invoice no, date, amount, etc.)"
              className="px-2.5 py-1.5 text-xs min-w-64"
              style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
            />
            <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {comparisonRows.length} rows
            </span>
          </div>

          <div className="overflow-auto" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ background: 'var(--bg-overlay)', position: 'sticky', top: 0 }}>
                  <th
                    className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', width: 200, borderBottom: '1px solid var(--border)' }}>
                    Field
                  </th>
                  {results.map((r, i) => (
                    <th
                      key={r.id}
                      className="text-left px-4 py-3 text-xs font-bold"
                      style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--border)' }}>
                      {r.filename?.slice(0, 20) || `Exec ${i + 1}`}
                    </th>
                  ))}
                  <th style={{ width: 28, borderBottom: '1px solid var(--border)' }} />
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.key}
                    style={{
                      background:
                        row.status === 'different' ? 'rgba(234,179,8,0.04)' :
                        i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)',
                    }}>
                    <td className="px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {row.key}
                      </span>
                    </td>
                    {row.vals.map((val, j) => (
                      <td
                        key={j}
                        className="px-4 py-2.5"
                        style={{
                          borderBottom: '1px solid var(--border)',
                          borderLeft: '1px solid var(--border)',
                        }}>
                        <span
                          className="text-xs"
                          style={{
                            fontFamily: 'var(--font-mono)',
                            color:
                              val === undefined || val === null ? 'var(--text-muted)' :
                              row.status === 'same' ? 'var(--green)' :
                              row.status === 'different' ? 'var(--yellow)' :
                              'var(--text-primary)',
                          }}>
                          {val !== undefined && val !== null ? String(val).slice(0, 140) : '—'}
                        </span>
                      </td>
                    ))}
                    <td className="px-2" style={{ borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)' }}>
                      <DiffBadge status={row.status} />
                    </td>
                  </tr>
                ))}
                {comparisonRows.length === 0 && (
                  <tr>
                    <td colSpan={results.length + 2} className="px-4 py-12 text-center">
                      <span className="text-xs" style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>
                        ✓ No rows matched your current filters
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
