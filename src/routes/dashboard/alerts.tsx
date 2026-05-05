import { createFileRoute } from '@tanstack/react-router'
import { TenantErrorFeed } from '@/components/errors/TenantErrorFeed'
import { useUnresolvedErrorCount } from '@/hooks/useTenantErrors'
import { Bell }       from 'lucide-react'

export const Route = createFileRoute('/dashboard/alerts')({
  component: AlertsPage,
})

function AlertsPage() {
  const { data: countData } = useUnresolvedErrorCount()
  const count = countData?.data?.unresolved || 0

  return (
    <div className="p-6 max-w-225 mx-auto">
      <div className="mb-8">
        <div className="text-xs tracking-widest uppercase mb-1"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          notifications
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Activity &amp; Alerts
          </h1>
          {count > 0 && (
            <div
              className="px-3 py-1 text-sm font-bold"
              style={{
                background:   'rgba(239,68,68,0.1)',
                border:       '1px solid rgba(239,68,68,0.3)',
                color:        'var(--red)',
                borderRadius: 'var(--radius-md)',
                fontFamily:   'var(--font-mono)',
              }}
            >
              {count} unresolved
            </div>
          )}
        </div>
      </div>

      {/* Safe tenant-facing info block */}
      <div
        className="flex items-start gap-3 p-4 mb-6"
        style={{
          background:   'var(--bg-surface)',
          border:       '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <Bell size={16} style={{ color: 'var(--amber)', flexShrink: 0, marginTop: 2 }}/>
        <div>
          <div className="text-sm font-semibold mb-1"
            style={{ color: 'var(--text-primary)' }}>
            Processing Alerts
          </div>
          <div className="text-xs"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            When an extraction fails or a delivery issue occurs, it appears here with a plain explanation
            and suggested action. Our team is automatically notified of all issues.
          </div>
        </div>
      </div>

      <TenantErrorFeed />
    </div>
  )
}