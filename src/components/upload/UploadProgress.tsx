import { Spinner } from '@/components/ui/Spinner'
import type { UploadStatus } from '@/hooks/useUpload'

interface UploadProgressProps {
  status:   UploadStatus
  progress: number
  filename?: string
}

const STATUS_LABELS: Record<UploadStatus, string> = {
  idle:       '',
  uploading:  'Uploading...',
  processing: 'AI extraction running...',
  done:       'Complete',
  error:      'Failed',
}

export function UploadProgress({ status, progress, filename }: UploadProgressProps) {
  if (status === 'idle') return null

  const color =
    status === 'done'  ? 'var(--green)' :
    status === 'error' ? 'var(--red)'   : 'var(--amber)'

  return (
    <div
      className="p-4"
      style={{
        background:   'var(--bg-elevated)',
        border:       '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        {status !== 'done' && status !== 'error' && <Spinner size="sm" />}
        {status === 'done' && <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--green)' }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2 2 4-4" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>}
        {status === 'error' && <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--red)' }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M3 3l4 4M7 3l-4 4" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>}

        <div className="flex-1 min-w-0">
          <div
            className="text-xs font-medium"
            style={{ color: status === 'error' ? 'var(--red)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
          >
            {STATUS_LABELS[status]}
          </div>
          {filename && (
            <div className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {filename}
            </div>
          )}
        </div>

        <span
          className="text-sm font-bold"
          style={{ color, fontFamily: 'var(--font-mono)' }}
        >
          {progress}%
        </span>
      </div>

      {/* Bar */}
      <div
        className="h-1 overflow-hidden"
        style={{ background: 'var(--bg-surface)', borderRadius: 1 }}
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            width:      `${progress}%`,
            background: color,
            boxShadow:  `0 0 8px ${color}`,
          }}
        />
      </div>
    </div>
  )
}
