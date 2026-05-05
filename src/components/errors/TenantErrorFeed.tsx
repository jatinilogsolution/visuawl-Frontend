import { useState }              from 'react'
import { useTenantErrorFeed, useResolveError } from '@/hooks/useTenantErrors'
import { Badge }                 from '@/components/ui/Badge'
import { Button }                from '@/components/ui/Button'
import { Pagination }            from '@/components/executions/Pagination'
import { Link }                  from '@tanstack/react-router'
import { formatDateTime }        from '@/lib/utils'
import { cn }                    from '@/lib/utils'
import {
  AlertTriangle, CheckCircle, Info,
  ExternalLink, ChevronDown, ChevronRight,
} from 'lucide-react'

const SEV_META = {
  error: {
    icon:    <AlertTriangle size={14}/>,
    color:   'var(--red)',
    bg:      'rgba(239,68,68,0.05)',
    border:  'rgba(239,68,68,0.2)',
    badge:   'error' as const,
  },
  warning: {
    icon:    <AlertTriangle size={14}/>,
    color:   'var(--yellow)',
    bg:      'rgba(234,179,8,0.05)',
    border:  'rgba(234,179,8,0.2)',
    badge:   'warning' as const,
  },
  info: {
    icon:    <Info size={14}/>,
    color:   'var(--blue)',
    bg:      'rgba(59,130,246,0.05)',
    border:  'rgba(59,130,246,0.2)',
    badge:   'info' as const,
  },
}

interface TenantErrorFeedProps {
  compact?: boolean
}

export function TenantErrorFeed({ compact }: TenantErrorFeedProps) {
  const [page, setPage]         = useState(1)
  const [severity, setSeverity] = useState('')
  const [showResolved, setShowResolved] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const { data, isLoading }  = useTenantErrorFeed({
    page,
    limit:    compact ? 5 : 20,
    severity: severity || undefined,
    resolved: showResolved ? true : false,
  })
  const resolveMutation      = useResolveError()

  const rows  = (data?.data as any)?.rows       || []
  const total = (data?.data as any)?.total      || 0
  const pages = (data?.data as any)?.totalPages || 1

  if (isLoading && !compact) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_,i) => (
          <div key={i} className="h-20 animate-pulse"
            style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}/>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Filters — only show when not compact */}
      {!compact && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1">
            {['', 'error', 'warning', 'info'].map(s => (
              <button key={s}
                onClick={() => { setSeverity(s); setPage(1) }}
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
          <button
            onClick={() => { setShowResolved(!showResolved); setPage(1) }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 text-xs border transition-all',
              showResolved ? 'border-green-500 text-green-400' : 'border-(--border) text-(--text-muted)'
            )}
            style={{ borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}>
            <CheckCircle size={11}/>
            {showResolved ? 'Showing resolved' : 'Show resolved'}
          </button>
          <span className="ml-auto text-xs"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {total} events
          </span>
        </div>
      )}

      {/* Error list */}
      {rows.length === 0 ? (
        <div className={cn('flex flex-col items-center justify-center', compact ? 'py-6' : 'py-12')}>
          <CheckCircle size={compact ? 20 : 32} className="mb-2"
            style={{ color: 'var(--green)' }}/>
          <div className="text-xs"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {showResolved ? 'No resolved events' : 'No issues — all clear'}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((err: any) => {
            const meta     = SEV_META[err.severity as keyof typeof SEV_META] || SEV_META.info
            const isExpanded = expanded === err.id

            return (
              <div key={err.id}
                style={{
                  background:   err.is_resolved ? 'var(--bg-surface)' : meta.bg,
                  border:       `1px solid ${err.is_resolved ? 'var(--border)' : meta.border}`,
                  borderRadius: 'var(--radius-md)',
                  opacity:      err.is_resolved ? 0.65 : 1,
                }}>
                {/* Header row */}
                <div
                  className="flex items-start gap-3 p-4 cursor-pointer"
                  onClick={() => setExpanded(isExpanded ? null : err.id)}>
                  <div className="shrink-0 mt-0.5"
                    style={{ color: meta.color }}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant={meta.badge}>
                        {err.error_code.replace(/_/g, ' ')}
                      </Badge>
                      {err.is_resolved && (
                        <Badge variant="success">
                          <CheckCircle size={9} className="mr-1"/>
                          Resolved
                        </Badge>
                      )}
                      <span className="text-xs ml-auto"
                        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {formatDateTime(err.created_at)}
                      </span>
                    </div>
                    <p className="text-xs"
                      style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>
                      {err.public_message}
                    </p>
                  </div>
                  <div className="shrink-0"
                    style={{ color: 'var(--text-muted)' }}>
                    {isExpanded ? <ChevronDown size={13}/> : <ChevronRight size={13}/>}
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div
                    className="px-4 pb-4 pt-0 space-y-3"
                    style={{ borderTop: `1px solid ${meta.border}` }}>
                    {/* Action hint */}
                    {err.action_hint && (
                      <div
                        className="flex items-start gap-2 p-3 text-xs"
                        style={{
                          background:   'var(--bg-elevated)',
                          border:       '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          color:        'var(--text-secondary)',
                          fontFamily:   'var(--font-mono)',
                        }}>
                        <Info size={12} className="shrink-0 mt-0.5"
                          style={{ color: 'var(--amber)' }}/>
                        <span>{err.action_hint}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {err.execution_id && (
                        <Link to="/dashboard/executions/$id"
                          params={{ id: err.execution_id }}>
                          <Button variant="secondary" size="sm">
                            <ExternalLink size={11}/>
                            View Execution
                          </Button>
                        </Link>
                      )}
                      {!err.is_resolved && (
                        <Button variant="ghost" size="sm"
                          loading={resolveMutation.isPending}
                          onClick={() => resolveMutation.mutate(err.id)}>
                          <CheckCircle size={11}/>
                          Mark Resolved
                        </Button>
                      )}
                      {/* IMPORTANT: NO "View Details" that shows internal info */}
                      {/* IMPORTANT: NO raw error messages visible */}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {!compact && pages > 1 && (
        <Pagination page={page} totalPages={pages} total={total} limit={20} onChange={setPage}/>
      )}

      {/* Tenant isolation notice */}
      {!compact && (
        <div className="text-xs text-center pt-2"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Error details are reviewed by our team. Contact support with your execution ID if you need further assistance.
        </div>
      )}
    </div>
  )
}