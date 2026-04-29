import { useState }        from 'react'
import { useAdminErrorLogs, useErrorSummary } from '@/hooks/useAdmin'
import { Card } from '@/components/ui/Card'
import { Badge }            from '@/components/ui/Badge'
import { Pagination }       from '@/components/executions/Pagination'
import { formatDateTime }   from '@/lib/utils'
import { cn }               from '@/lib/utils'
import { AlertTriangle, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react'
import { Button } from '../ui/Button'

const SEV_COLORS: Record<string, string> = {
  critical: 'var(--red)',
  high:     '#fb923c',
  medium:   'var(--yellow)',
  low:      'var(--text-muted)',
}

const SEV_BADGE: Record<string, any> = {
  critical: 'error',
  high:     'warning',
  medium:   'warning',
  low:      'neutral',
}

export function ErrorLogPanel() {
  const [page, setPage]       = useState(1)
  const [severity, setSev]    = useState('')
  const [errorType, setType]  = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const { data, isLoading, refetch, isFetching } = useAdminErrorLogs({
    page, limit: 25, severity: severity || undefined, type: errorType || undefined,
  })
  const { data: summaryData } = useErrorSummary()

  const logs       = (data?.data as any)?.rows || []
  const total      = (data?.data as any)?.total || 0
  const totalPages = Math.ceil(total / 25)
  const summary    = summaryData?.data as any

  return (
    <div className="space-y-5">

      {/* Error summary */}
      {summary?.recentCritical?.length > 0 && (
        <div
          className="p-4"
          style={{
            background:   'rgba(239,68,68,0.06)',
            border:       '1px solid rgba(239,68,68,0.25)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} style={{ color: 'var(--red)' }} />
            <span className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--red)', fontFamily: 'var(--font-display)' }}>
              Critical Errors — Last 24 Hours ({summary.recentCritical.length})
            </span>
          </div>
          <div className="space-y-1">
            {summary.recentCritical.slice(0, 3).map((e: any) => (
              <div key={e.id} className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                [{e.error_type}] {e.tenant_slug || 'system'} — {e.message.slice(0, 80)}…
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1">
          {['', 'critical', 'high', 'medium', 'low'].map(s => (
            <button key={s}
              onClick={() => { setSev(s); setPage(1) }}
              className={cn(
                'px-3 py-1 text-xs font-semibold uppercase border transition-all',
                severity === s
                  ? 'border-amber-500 text-amber-400 bg-amber-500/8'
                  : 'border-(--border) text-(--text-muted) hover:border-(--border-light)'
              )}
              style={{ borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-display)' }}>
              {s || 'All'}
            </button>
          ))}
        </div>

        <select
          value={errorType}
          onChange={e => { setType(e.target.value); setPage(1) }}
          className="h-7 px-2 text-xs border bg-transparent focus:outline-none"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}>
          <option value="" style={{ background: 'var(--bg-overlay)' }}>All Error Types</option>
          {['AI_FAILURE','DELIVERY_FAILURE','SCHEMA_ERROR','AUTH_ERROR','QUOTA_EXCEEDED','SYSTEM'].map(t => (
            <option key={t} value={t} style={{ background: 'var(--bg-overlay)' }}>{t}</option>
          ))}
        </select>

        <Button variant="ghost" size="sm" onClick={() => refetch()} loading={isFetching}>
          <RefreshCw size={12} />
        </Button>

        <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {total} total errors
        </span>
      </div>

      {/* Log entries */}
      <Card padding="md">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse"
                style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }} />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-xs tracking-widest uppercase"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              No errors found
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log: any) => (
              <div key={log.id}
                style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-(--bg-elevated)"
                  onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: SEV_COLORS[log.severity] || 'var(--text-muted)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold"
                        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {log.error_type}
                      </span>
                      <Badge variant={SEV_BADGE[log.severity] || 'neutral'}>
                        {log.severity}
                      </Badge>
                      {log.tenant_slug && (
                        <span className="text-xs px-1.5 py-0.5"
                          style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {log.tenant_slug}
                        </span>
                      )}
                    </div>
                    <div className="text-xs truncate"
                      style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {log.message}
                    </div>
                  </div>
                  <div className="text-xs shrink-0"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {formatDateTime(log.created_at)}
                  </div>
                  {expanded === log.id ? <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
                    : <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />}
                </div>

                {/* Expanded: full technical details — super admin only */}
                {expanded === log.id && (
                  <div
                    className="px-4 py-4"
                    style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}>
                    <div className="space-y-3">
                      {/* Full message */}
                      <div>
                        <div className="text-xs uppercase tracking-widest mb-1"
                          style={{ color: 'var(--red)', fontFamily: 'var(--font-display)' }}>
                          Internal Message (Admin Only)
                        </div>
                        <div className="text-xs p-3"
                          style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                          {log.message}
                        </div>
                      </div>

                      {/* Public message */}
                      {log.public_message && (
                        <div>
                          <div className="text-xs uppercase tracking-widest mb-1"
                            style={{ color: 'var(--green)', fontFamily: 'var(--font-display)' }}>
                            Public Message (Shown to Tenant)
                          </div>
                          <div className="text-xs p-3"
                            style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                            {log.public_message}
                          </div>
                        </div>
                      )}

                      {/* Context */}
                      {log.context && (
                        <div>
                          <div className="text-xs uppercase tracking-widest mb-1"
                            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                            Context
                          </div>
                          <pre className="text-xs p-3 overflow-auto"
                            style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', maxHeight: 200 }}>
                            {JSON.stringify(typeof log.context === 'string' ? JSON.parse(log.context) : log.context, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Stack trace */}
                      {log.stack_trace && (
                        <div>
                          <div className="text-xs uppercase tracking-widest mb-1"
                            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                            Stack Trace
                          </div>
                          <pre className="text-xs p-3 overflow-auto"
                            style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', maxHeight: 200, fontSize: '10px' }}>
                            {log.stack_trace}
                          </pre>
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs"
                        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        <span>ID: {log.id}</span>
                        {log.execution_id && <span>Exec: {log.execution_id.slice(0,8)}…</span>}
                        {log.tenant_id && <span>Tenant: {log.tenant_id.slice(0,8)}…</span>}
                        <span>Visibility: {log.visibility}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} total={total} limit={25} onChange={setPage} />
        )}
      </Card>
    </div>
  )
}