import { Badge, executionStatusBadge } from '@/components/ui/Badge'
import { formatDateTime, formatMs }    from '@/lib/utils'
import { FileText, Globe, Mail, Zap, HardDrive } from 'lucide-react'
import type { RecentExecution } from '@/hooks/useDashboard'

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  upload:  <FileText size={12} />,
  webhook: <Globe size={12} />,
  email:   <Mail size={12} />,
  api:     <Zap size={12} />,
  sftp:    <HardDrive size={12} />,
  bulk:    <FileText size={12} />,
}

interface ActivityFeedProps {
  executions: RecentExecution[]
  loading?:   boolean
}

export function ActivityFeed({ executions, loading }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse"
            style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}
          />
        ))}
      </div>
    )
  }

  if (executions.length === 0) {
    return (
      <div className="py-12 text-center">
        <div
          className="text-xs tracking-widest"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          NO EXECUTIONS YET
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Upload a document to get started
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {executions.map((ex, i) => (
        <div
          key={ex.id}
          className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-[var(--bg-elevated)] group"
          style={{
            borderRadius: 'var(--radius-sm)',
            animationDelay: `${i * 0.04}s`,
          }}
        >
          {/* Source icon */}
          <div
            className="w-6 h-6 flex items-center justify-center flex-shrink-0"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}
          >
            {SOURCE_ICONS[ex.source_type] || <FileText size={12} />}
          </div>

          {/* Filename */}
          <div className="flex-1 min-w-0">
            <div
              className="text-xs truncate"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
            >
              {ex.original_filename || 'unnamed'}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {formatDateTime(ex.created_at)}
            </div>
          </div>

          {/* Time */}
          {ex.processing_time_ms && (
            <div
              className="text-xs flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {formatMs(ex.processing_time_ms)}
            </div>
          )}

          {/* Status */}
          <Badge variant={executionStatusBadge(ex.status)} dot>
            {ex.status}
          </Badge>
        </div>
      ))}
    </div>
  )
}