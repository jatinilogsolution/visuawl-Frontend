import { useState }               from 'react'
import {
  useTenantEncryptedSummary,
  useDecryptAuditLog,
  useDecryptAuditStats,
} from '@/hooks/useAdmin'
import { DecryptFieldButton }     from './DecryptFieldButton'
import { Card, CardHeader }       from '@/components/ui/Card'
import { Badge }                  from '@/components/ui/Badge'
import { Pagination }             from '@/components/executions/Pagination'
import { formatDateTime, formatNumber } from '@/lib/utils'
import { cn }                     from '@/lib/utils'
import { ShieldAlert, Eye, Database } from 'lucide-react'

// ── Tenant field viewer ───────────────────────────────────────────────────────

function TenantFieldViewer({ tenantId, tenantSlug }: { tenantId: string; tenantSlug: string }) {
  const { data: summaryData } = useTenantEncryptedSummary(tenantId)
  const byTable = (summaryData?.data || {}) as Record<string, any[]>

  const tableEntries = Object.entries(byTable)

  return (
    <div className="space-y-4">
      <div className="p-3"
        style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)' }}>
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert size={13} style={{ color: 'var(--red)' }} />
          <span className="text-xs font-bold uppercase tracking-widest"
            style={{ color: 'var(--red)', fontFamily: 'var(--font-display)' }}>
            Confidential Data Access
          </span>
        </div>
        <div className="text-xs"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          All decrypt actions are permanently logged with your IP address and timestamp.
          Do not share decrypted values. Tenant: {tenantSlug}
        </div>
      </div>

      {tableEntries.length === 0 && (
        <Card padding="md">
          <div className="py-6 text-center">
            <Database size={20} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
            <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              No decryptable fields with data found for this tenant
            </div>
          </div>
        </Card>
      )}

      {tableEntries.map(([table, fields]) => (
        <Card key={table} padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Database size={13} style={{ color: 'var(--amber)' }} />
            <span className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
              {table}
            </span>
          </div>
          <div className="space-y-3">
            {fields.map((f: any) => (
              <div key={`${f.tableName}.${f.fieldName}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium"
                    style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {f.displayName}
                    <span className="ml-2 text-xs"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                      ({f.fieldName})
                    </span>
                  </span>
                  <Badge variant={
                    f.sensitivity === 'critical' ? 'error' :
                    f.sensitivity === 'high'     ? 'warning' :
                    f.sensitivity === 'medium'   ? 'info'    : 'neutral'
                  }>
                    {f.sensitivity}
                  </Badge>
                </div>
                <DecryptFieldButton
                  tenantId={tenantId}
                  tableName={f.tableName}
                  fieldName={f.fieldName}
                  rowId={f.rowId}
                  displayName={f.displayName}
                  sensitivity={f.sensitivity}
                  context={`Admin decrypt dashboard - tenant ${tenantSlug}`}
                />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

// ── Audit log view ────────────────────────────────────────────────────────────

function AuditLogView() {
  const [page, setPage]     = useState(1)
  const [tableFilter, setTableFilter] = useState('')

  const { data: logData }   = useDecryptAuditLog({ page, limit: 25, table: tableFilter || undefined })
  const { data: statsData } = useDecryptAuditStats()

  const logs  = logData?.data?.rows        || []
  const total = logData?.data?.total       || 0
  const pages = logData?.data?.totalPages  || 1
  const stats = statsData?.data

  return (
    <div className="space-y-5">

      {/* Stats grid */}
      {stats?.overall && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Decrypts',      value: formatNumber(stats.overall.total_decrypts    || 0), color: 'var(--amber)' },
            { label: 'Last 24 Hours',        value: formatNumber(stats.overall.last_24h          || 0), color: stats.overall.last_24h > 10 ? 'var(--red)' : 'var(--text-primary)' },
            { label: 'Tenants Accessed',     value: formatNumber(stats.overall.tenants_accessed  || 0), color: 'var(--yellow)' },
            { label: 'Admins Who Decrypted', value: formatNumber(stats.overall.admins_who_decrypted || 0), color: 'var(--blue)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
              <div className="text-xs uppercase tracking-widest mb-1"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                {label}
              </div>
              <div className="text-2xl font-bold"
                style={{ color, fontFamily: 'var(--font-mono)' }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Most accessed fields */}
      {stats?.byTable?.length > 0 && (
        <Card padding="md">
          <CardHeader title="Most Decrypted Fields" />
          <div className="space-y-2">
            {stats.byTable.slice(0, 8).map((row: any) => (
              <div key={`${row.table_name}.${row.field_name}`}
                className="flex items-center justify-between py-1.5"
                style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-xs"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {row.table_name}.{row.field_name}
                </span>
                <div className="flex items-center gap-3">
                  <div
                    className="h-1.5 overflow-hidden"
                    style={{ width: `${Math.round((row.count / stats.byTable[0].count) * 80)}px`, background: 'var(--amber-dim)', borderRadius: 1 }}>
                    <div className="h-full" style={{ width: '100%', background: 'var(--amber)' }} />
                  </div>
                  <span className="text-sm font-bold"
                    style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                    {row.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Audit log */}
      <Card padding="md">
        <CardHeader
          title="Decrypt Audit Log"
          subtitle="Immutable record of all decrypt actions"
          action={
            <select
              value={tableFilter}
              onChange={e => { setTableFilter(e.target.value); setPage(1) }}
              className="h-7 px-2 text-xs border bg-transparent focus:outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}>
              <option value="" style={{ background: 'var(--bg-overlay)' }}>All Tables</option>
              {['tenants','users','email_configs','input_sources','destinations','api_keys'].map(t => (
                <option key={t} value={t} style={{ background: 'var(--bg-overlay)' }}>{t}</option>
              ))}
            </select>
          }
        />

        {logs.length === 0 ? (
          <div className="py-12 text-center">
            <Eye size={24} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
            <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              No decrypt actions logged yet
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Header */}
            <div className="grid gap-3 px-3 py-2"
              style={{ gridTemplateColumns: '140px 140px 100px 1fr 100px', borderBottom: '1px solid var(--border)' }}>
              {['Admin', 'Tenant', 'Table', 'Field', 'Time'].map(h => (
                <span key={h} className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                  {h}
                </span>
              ))}
            </div>

            {logs.map((log: any) => (
              <div key={log.id}
                className="grid gap-3 px-3 py-2.5 items-center hover:bg-(--bg-elevated) transition-colors"
                style={{ gridTemplateColumns: '140px 140px 100px 1fr 100px', borderRadius: 'var(--radius-sm)' }}>
                <span className="text-xs truncate"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {log.super_admin_id.slice(0,8)}…
                </span>
                <span className="text-xs truncate"
                  style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                  {log.tenant_slug || log.tenant_id?.slice(0,8)}
                </span>
                <Badge variant="neutral">{log.table_name}</Badge>
                <span className="text-xs truncate"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {log.field_name}
                  {log.context && (
                    <span style={{ color: 'var(--text-muted)' }}> · {log.context.slice(0,40)}</span>
                  )}
                </span>
                <span className="text-xs"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                  {formatDateTime(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <Pagination page={page} totalPages={pages} total={total} limit={25} onChange={setPage} />
        )}
      </Card>
    </div>
  )
}

// ── Main decrypt dashboard ────────────────────────────────────────────────────

interface Props {
  tenantId?:   string
  tenantSlug?: string
}

export function DecryptDashboard({ tenantId, tenantSlug }: Props) {
  const [view, setView] = useState<'fields' | 'audit'>('fields')

  const VIEWS = [
    { id: 'fields', label: 'Decrypt Fields', icon: Eye       },
    { id: 'audit',  label: 'Audit Log',      icon: ShieldAlert },
  ] as const

  return (
    <div className="space-y-5">

      {/* View toggle */}
      <div className="flex gap-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
        {VIEWS.map(({ id, label, icon: Icon }) => (
          <button key={id}
            onClick={() => setView(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest',
              'border-b-2 transition-colors -mb-px',
              view === id
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-(--text-muted) hover:text-(--text-secondary)'
            )}
            style={{ fontFamily: 'var(--font-display)' }}>
            <Icon size={13}/>
            {label}
          </button>
        ))}
      </div>

      {view === 'fields' && tenantId ? (
        <TenantFieldViewer tenantId={tenantId} tenantSlug={tenantSlug || tenantId} />
      ) : view === 'fields' ? (
        <div className="py-12 text-center">
          <Database size={24} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
          <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Select a tenant from the Tenants tab to decrypt their fields
          </div>
        </div>
      ) : null}

      {view === 'audit' && <AuditLogView />}
    </div>
  )
}
