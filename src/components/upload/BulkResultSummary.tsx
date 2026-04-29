import { Badge }        from '@/components/ui/Badge'
import { Link }         from '@tanstack/react-router'
import { Button }       from '@/components/ui/Button'
import type { BulkResult } from '@/hooks/useUpload'
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'

interface BulkResultSummaryProps {
  result:   BulkResult
  onReset?: () => void
}

export function BulkResultSummary({ result, onReset }: BulkResultSummaryProps) {
  const { summary, files } = result

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',    value: summary.total,    color: 'var(--text-primary)' },
          { label: 'Queued',   value: summary.queued,   color: 'var(--green)' },
          { label: 'Rejected', value: summary.rejected, color: 'var(--red)' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="p-4 text-center"
            style={{
              background:   'var(--bg-elevated)',
              border:       '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color }}>
              {value}
            </div>
            <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* File list */}
      <div className="space-y-1 max-h-72 overflow-y-auto">
        {files.map((f, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-2"
            style={{
              background:   'var(--bg-elevated)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {f.status === 'queued'
              ? <CheckCircle size={13} style={{ color: 'var(--green)', flexShrink: 0 }} />
              : <XCircle    size={13} style={{ color: 'var(--red)',   flexShrink: 0 }} />
            }
            <span
              className="flex-1 text-xs truncate"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
            >
              {f.filename}
            </span>
            {f.size && (
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {f.size}
              </span>
            )}
            {f.error && (
              <span className="text-xs truncate max-w-48" style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                {f.error}
              </span>
            )}
            {f.executionId && (
              <Badge variant="amber">
                {f.executionId.slice(0, 8)}
              </Badge>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Link to="/dashboard/executions" className="flex-1">
          <Button variant="secondary" fullWidth size="md">
            <ExternalLink size={13} />
            View in Executions
          </Button>
        </Link>
        {onReset && (
          <Button variant="primary" size="md" onClick={onReset} className="flex-1">
            Upload More
          </Button>
        )}
      </div>
    </div>
  )
}