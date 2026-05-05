import { Link }                    from '@tanstack/react-router'
import { Badge, executionStatusBadge } from '@/components/ui/Badge'
import { Button }                  from '@/components/ui/Button'
import { formatDateTime, formatMs, formatBytes } from '@/lib/utils'
import { cn }                      from '@/lib/utils'
import {
  FileText, Globe, Mail, Zap,
  HardDrive, ChevronRight, RefreshCw, RotateCcw, Trash2,
} from 'lucide-react'
import type { ExecutionListItem }  from '@/hooks/useExecutions'

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  upload:  <FileText size={12} />,
  bulk:    <FileText size={12} />,
  webhook: <Globe    size={12} />,
  email:   <Mail     size={12} />,
  api:     <Zap      size={12} />,
  sftp:    <HardDrive size={12} />,
}

interface ExecutionTableProps {
  executions: ExecutionListItem[]
  loading?:   boolean
  selectedIds?: string[]
  onToggleSelect?: (id: string, checked: boolean) => void
  onToggleSelectAll?: (checked: boolean) => void
  onRetry?: (id: string) => void
  onDelete?: (id: string) => void
  actionLoadingId?: string | null
  actionDisabled?: boolean
}

export function ExecutionTable({
  executions,
  loading,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onRetry,
  onDelete,
  actionLoadingId,
  actionDisabled,
}: ExecutionTableProps) {
  const selected = new Set(selectedIds)
  const allSelected = executions.length > 0 && executions.every((ex) => selected.has(ex.id))

  if (loading) {
    return (
      <div className="space-y-1">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse"
            style={{
              background:   'var(--bg-elevated)',
              borderRadius: 'var(--radius-sm)',
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
      </div>
    )
  }

  if (executions.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="text-xs tracking-widest uppercase mb-2"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          No executions found
        </div>
        <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Try changing filters or upload a document
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header row */}
      <div
        className="grid gap-4 px-4 py-2 mb-1"
        style={{
          gridTemplateColumns: '36px 2fr 1fr 1fr 1fr 1fr 170px 24px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onToggleSelectAll?.(e.target.checked)}
            className="w-3.5 h-3.5 rounded"
            aria-label="Select all executions"
          />
        </div>
        {['File', 'Source', 'Status', 'Duration', 'Created', 'Actions', ''].map(h => (
          <div
            key={h}
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-0.5">
        {executions.map((ex, i) => (
          <div
            key={ex.id}
            className={cn(
              'grid gap-4 px-4 py-3 items-center transition-all duration-100',
              'hover:bg-[var(--bg-elevated)]',
            )}
            style={{
              gridTemplateColumns: '36px 2fr 1fr 1fr 1fr 1fr 170px 24px',
              borderRadius:        'var(--radius-sm)',
              animationDelay:      `${i * 0.03}s`,
            }}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selected.has(ex.id)}
                onChange={(e) => onToggleSelect?.(ex.id, e.target.checked)}
                className="w-3.5 h-3.5 rounded"
                aria-label={`Select execution ${ex.id}`}
              />
            </div>

            {/* File */}
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                style={{
                  background:   'var(--bg-overlay)',
                  borderRadius: 'var(--radius-sm)',
                  color:        'var(--text-muted)',
                }}
              >
                <FileText size={13} />
              </div>
              <div className="min-w-0">
                <Link to="/dashboard/executions/$id" params={{ id: ex.id }}>
                  <div
                    className="text-xs truncate font-medium hover:text-amber-400 transition-colors"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                  >
                    {ex.original_filename || 'unnamed'}
                  </div>
                </Link>
                <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {ex.id.slice(0, 8)}…
                  {ex.file_size_bytes ? ` · ${formatBytes(ex.file_size_bytes)}` : ''}
                </div>
              </div>
            </div>

            {/* Source */}
            <div className="flex items-center gap-1.5">
              <span style={{ color: 'var(--text-muted)' }}>
                {SOURCE_ICONS[ex.source_type] || <FileText size={12} />}
              </span>
              <span
                className="text-xs uppercase font-semibold"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
              >
                {ex.source_type}
              </span>
            </div>

            {/* Status */}
            <div>
              <Badge
                variant={executionStatusBadge(ex.status)}
                dot={ex.status === 'processing'}
              >
                {ex.status}
              </Badge>
              {ex.retry_count > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <RefreshCw size={9} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {ex.retry_count}x
                  </span>
                </div>
              )}
            </div>

            {/* Duration */}
            <div
              className="text-xs"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
            >
              {formatMs(ex.processing_time_ms)}
            </div>

            {/* Created */}
            <div
              className="text-xs"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {formatDateTime(ex.created_at)}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-1">
              {['failed', 'stopped'].includes(ex.status) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRetry?.(ex.id)}
                  loading={actionLoadingId === `retry:${ex.id}`}
                  disabled={actionDisabled}
                >
                  <RotateCcw size={11} /> Retry
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(ex.id)}
                loading={actionLoadingId === `delete:${ex.id}`}
                disabled={actionDisabled}
              >
                <Trash2 size={11} />
              </Button>
            </div>

            {/* Arrow */}
            <Link
              to="/dashboard/executions/$id"
              params={{ id: ex.id }}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={14} style={{ color: 'var(--amber)' }} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
