import { useSystemStatus, useCronHealth, useDbStats, useQueueStatus, useRunMaintenance } from '@/hooks/useAdmin'
import { StatusIndicator }  from './StatusIndicator'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button }           from '@/components/ui/Button'
import { formatMs, formatNumber } from '@/lib/utils'
import { RefreshCw, Wrench } from 'lucide-react'

export function SystemStatusPanel() {
  const { data: statusData, refetch, isFetching } = useSystemStatus(false)
  const { data: cronData }    = useCronHealth()
  const { data: dbData }      = useDbStats()
  const { data: queueData }   = useQueueStatus()
  const maintenanceMutation   = useRunMaintenance()

  const status = statusData?.data
  const crons  = cronData?.data
  const db     = dbData?.data
  const queues = queueData?.data

  return (
    <div className="space-y-5">

      {/* Overall status */}
      <div
        className="flex items-center justify-between p-4"
        style={{
          background:   status?.status === 'healthy' ? 'rgba(34,197,94,0.05)' :
                        status?.status === 'degraded' ? 'rgba(234,179,8,0.05)' : 'rgba(239,68,68,0.05)',
          border:       `1px solid ${status?.status === 'healthy' ? 'rgba(34,197,94,0.2)' :
                         status?.status === 'degraded' ? 'rgba(234,179,8,0.2)' : 'rgba(239,68,68,0.2)'}`,
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div className="flex items-center gap-4">
          <StatusIndicator
            status={status?.status || 'unknown'}
            label={status?.status || 'Unknown'}
            size="lg"
            pulse={status?.status === 'healthy'}
          />
          <div>
            <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Uptime: {status?.uptime ? `${Math.floor(status.uptime / 3600)}h ${Math.floor((status.uptime % 3600) / 60)}m` : '—'}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              v{status?.version || '1.0.0'} · {status?.timestamp ? new Date(status.timestamp).toLocaleTimeString() : '—'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => refetch()} loading={isFetching}>
            <RefreshCw size={12} /> Refresh
          </Button>
          <Button variant="secondary" size="sm"
            onClick={() => maintenanceMutation.mutate()}
            loading={maintenanceMutation.isPending}>
            <Wrench size={12} /> Maintenance
          </Button>
        </div>
      </div>

      {/* Component grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {status?.components && Object.entries(status.components)
          .filter(([k]) => k !== 'crons')
          .map(([name, comp]: [string, any]) => (
          <div key={name}
            className="p-3"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-widest"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                {name}
              </span>
              <StatusIndicator status={comp.status} showLabel={false} size="sm" />
            </div>
            {comp.latencyMs != null && (
              <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {comp.latencyMs}ms
              </div>
            )}
            {comp.message && (
              <div className="text-xs truncate" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {comp.message}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">

        {/* Summary */}
        <div className="col-span-12 lg:col-span-4">
          <Card padding="md">
            <CardHeader title="Summary" />
            {status?.summary && (
              <div className="space-y-2">
                {[
                  { label: 'Total Executions',  value: formatNumber(status.summary.totalExecutions),   color: 'var(--text-primary)' },
                  { label: 'Today',             value: formatNumber(status.summary.executionsToday),   color: 'var(--amber)' },
                  { label: 'Success Rate',      value: `${status.summary.successRateToday}%`,          color: 'var(--green)' },
                  { label: 'Active Tenants',    value: formatNumber(status.summary.activeTenantsCount), color: 'var(--blue)' },
                  { label: 'Pending Deliveries',value: formatNumber(status.summary.pendingDeliveries), color: status.summary.pendingDeliveries > 0 ? 'var(--yellow)' : 'var(--text-muted)' },
                  { label: 'Failed Last Hour',  value: formatNumber(status.summary.failedLastHour),    color: status.summary.failedLastHour > 0 ? 'var(--red)' : 'var(--green)' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between py-1.5"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="text-xs uppercase tracking-widest"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                      {label}
                    </span>
                    <span className="text-sm font-bold"
                      style={{ color, fontFamily: 'var(--font-mono)' }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Cron health */}
        <div className="col-span-12 lg:col-span-8">
          <Card padding="md">
            <CardHeader title="Cron Jobs" subtitle="Background worker health" />
            {crons?.crons ? (
              <div className="space-y-2">
                {crons.crons.map((c: any) => (
                  <div key={c.cron_name}
                    className="flex items-center gap-4 p-3"
                    style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                    <StatusIndicator status={c.last_status} showLabel={false} size="sm"
                      pulse={c.last_status === 'running'} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold"
                        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {c.cron_name}
                        {c.isOverdue && (
                          <span className="ml-2 text-xs" style={{ color: 'var(--red)' }}>OVERDUE</span>
                        )}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Runs: {c.run_count} · Errors: {c.error_count}
                        {c.avg_duration_ms && ` · Avg: ${formatMs(c.avg_duration_ms)}`}
                        {c.minutesSinceLastRun != null && ` · ${c.minutesSinceLastRun}m ago`}
                      </div>
                      {c.last_error && (
                        <div className="text-xs mt-1" style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                          {c.last_error}
                        </div>
                      )}
                    </div>
                    <StatusIndicator status={c.last_status} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Loading cron health...
                </span>
              </div>
            )}
          </Card>
        </div>

        {/* DB stats */}
        <div className="col-span-12 lg:col-span-6">
          <Card padding="md">
            <CardHeader title="Database" subtitle={db ? `Total: ${db.totalSizeMb}MB · Connections: ${db.connections}` : 'Loading...'} />
            {db?.tables && (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {db.tables.slice(0, 15).map((t: any) => (
                  <div key={t.table_name}
                    className="flex items-center gap-3 py-1.5"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="text-xs flex-1" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {t.table_name}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      ~{formatNumber(t.row_estimate || 0)} rows
                    </span>
                    <span className="text-xs" style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                      {t.total_mb}MB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Queue status */}
        <div className="col-span-12 lg:col-span-6">
          <Card padding="md">
            <CardHeader title="Queue Status" />
            {queues && (
              <div className="space-y-3">
                {[
                  { section: 'Executions',  items: [
                    { label: 'Queued',     value: queues.executions?.queued,     warn: queues.executions?.queued > 10 },
                    { label: 'Processing', value: queues.executions?.processing, warn: false },
                  ]},
                  { section: 'Deliveries', items: [
                    { label: 'Pending', value: queues.deliveries?.pending, warn: queues.deliveries?.pending > 0 },
                    { label: 'Failed',  value: queues.deliveries?.failed,  warn: queues.deliveries?.failed > 0  },
                  ]},
                  { section: 'Misc', items: [
                    { label: 'Pending Alerts',     value: queues.alerts?.pendingAlerts,        warn: false },
                    { label: 'Pending Invitations',value: queues.misc?.pendingInvitations,     warn: false },
                    { label: 'Password Resets',    value: queues.misc?.activePasswordResets,   warn: false },
                  ]},
                ].map(({ section, items }) => (
                  <div key={section}>
                    <div className="text-xs uppercase tracking-widest mb-2"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                      {section}
                    </div>
                    {items.map(({ label, value, warn }) => (
                      <div key={label} className="flex items-center justify-between py-1.5"
                        style={{ borderBottom: '1px solid var(--border)' }}>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          {label}
                        </span>
                        <span className="text-sm font-bold"
                          style={{ color: warn ? 'var(--yellow)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                          {value ?? 0}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  )
}