import { useTenantIntelligence }    from '@/hooks/useAdmin'
import { Card, CardHeader }         from '@/components/ui/Card'
import { Spinner }                  from '@/components/ui/Spinner'
import { formatNumber, formatBytes, formatMs } from '@/lib/utils'
import { formatCurrency }           from '@/lib/currency'
import { X, FileText, Zap, Users, CreditCard, AlertTriangle, BarChart2 } from 'lucide-react'

interface Props {
  tenantId:   string
  tenantSlug: string
  onClose:    () => void
}

export function TenantIntelligencePanel({ tenantId, tenantSlug, onClose }: Props) {
  const { data, isLoading } = useTenantIntelligence(tenantId)
  const intel = data?.data as any

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-2xl h-full overflow-y-auto animate-fade-in-up"
        style={{
          background:   'var(--bg-surface)',
          border:       '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sticky top-0 z-10"
          style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="text-xs uppercase tracking-widest mb-0.5"
              style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>tenant intelligence</div>
            <h2 className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {tenantSlug}
            </h2>
          </div>
          <button onClick={onClose} className="transition-colors hover:text-amber-400"
            style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : intel ? (
          <div className="p-5 space-y-5">

            {/* Execution stats */}
            <Card padding="md">
              <CardHeader title="Executions" action={<FileText size={14} style={{ color: 'var(--amber)' }} />} />
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total',   value: formatNumber(intel.executions.total),   color: 'var(--text-primary)' },
                  { label: 'Success', value: formatNumber(intel.executions.success), color: 'var(--green)' },
                  { label: 'Failed',  value: formatNumber(intel.executions.failed),  color: 'var(--red)' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-3 text-center"
                    style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-2xl font-bold" style={{ color, fontFamily: 'var(--font-mono)' }}>{value}</div>
                    <div className="text-xs uppercase tracking-wider mt-1"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>{label}</div>
                  </div>
                ))}
              </div>
              {intel.executions.avgMs > 0 && (
                <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Avg processing time: {formatMs(intel.executions.avgMs)} ·
                  Total data: {formatBytes(intel.executions.totalBytes)}
                </div>
              )}
              {Object.keys(intel.executions.bySource).length > 0 && (
                <div className="mt-3 flex gap-3 flex-wrap">
                  {Object.entries(intel.executions.bySource).map(([src, count]: any) => (
                    <div key={src} className="text-xs px-2 py-1"
                      style={{ background: 'var(--bg-overlay)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {src}: {count}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Pages */}
            <Card padding="md">
              <CardHeader title="Pages Processed" action={<BarChart2 size={14} style={{ color: 'var(--amber)' }} />} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-bold"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)' }}>
                    {formatNumber(intel.pages.total)}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    total pages
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>
                    {formatCurrency(parseFloat(intel.pages.totalCost))}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    total page cost
                  </div>
                </div>
              </div>
              {intel.plan && (
                <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Plan: {intel.plan.name} · Billing: {intel.plan.billingType}
                  {intel.plan.pagesPerMonth && ` · ${formatNumber(intel.plan.pagesUsed)}/${formatNumber(intel.plan.pagesPerMonth)} pages used`}
                </div>
              )}
            </Card>

            {/* AI Tokens — SUPER ADMIN ONLY */}
            <Card padding="md">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={14} style={{ color: 'var(--red)' }} />
                <span className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                  AI Usage (Super Admin Only)
                </span>
                <span className="text-xs px-2 py-0.5"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}>
                  CONFIDENTIAL
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-2xl font-bold"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {formatNumber(intel.tokens.total)}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    total tokens
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)' }}>
                    {formatCurrency(parseFloat(intel.tokens.totalCost))}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    AI cost (your cost)
                  </div>
                </div>
              </div>
              {intel.tokens.breakdown && (intel.tokens.breakdown as any[]).map((b: any) => (
                <div key={`${b.provider}-${b.model}`}
                  className="flex items-center justify-between py-1.5"
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {b.provider} / {b.model}
                  </span>
                  <div className="flex items-center gap-4 text-xs"
                    style={{ fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{formatNumber(b.tokens)} tok</span>
                    <span style={{ color: 'var(--amber)' }}>{formatCurrency(parseFloat(b.cost))}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{b.calls} calls</span>
                  </div>
                </div>
              ))}
            </Card>

            {/* Users */}
            <Card padding="md">
              <CardHeader title="Users" action={<Users size={14} style={{ color: 'var(--amber)' }} />} />
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total',   value: intel.users.total  },
                  { label: 'Active',  value: intel.users.active  },
                  { label: 'Admins',  value: intel.users.admins  },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 text-center"
                    style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-2xl font-bold"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {value}
                    </div>
                    <div className="text-xs uppercase tracking-wider mt-1"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Wallet */}
            <Card padding="md">
              <CardHeader title="Wallet" action={<CreditCard size={14} style={{ color: 'var(--amber)' }} />} />
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Balance',  value: formatCurrency(parseFloat(intel.wallet.balance)),                           color: 'var(--amber)' },
                  { label: 'Credits',  value: `+${formatCurrency(parseFloat(intel.wallet.totalCredits))}`,              color: 'var(--green)' },
                  { label: 'Debits',   value: `-${formatCurrency(parseFloat(intel.wallet.totalDebits))}`,               color: 'var(--red)' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-3 text-center"
                    style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-xl font-bold" style={{ color, fontFamily: 'var(--font-mono)' }}>{value}</div>
                    <div className="text-xs uppercase tracking-wider mt-1"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Errors */}
            {Object.keys(intel.errors.byType).length > 0 && (
              <Card padding="md">
                <CardHeader
                  title="Error Summary (Admin Only)"
                  action={<AlertTriangle size={14} style={{ color: 'var(--red)' }} />}
                />
                <div className="space-y-2">
                  {Object.entries(intel.errors.byType).map(([key, count]: any) => {
                    const [type, sev] = key.split('_')
                    return (
                      <div key={key} className="flex items-center justify-between py-1.5"
                        style={{ borderBottom: '1px solid var(--border)' }}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full"
                            style={{ background: sev === 'critical' ? 'var(--red)' : sev === 'high' ? '#fb923c' : 'var(--yellow)' }} />
                          <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                            {type}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            [{sev}]
                          </span>
                        </div>
                        <span className="text-sm font-bold"
                          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                          {count}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
