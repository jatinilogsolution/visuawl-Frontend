import { formatMs, formatDateTime } from '@/lib/utils'
import { Badge }                    from '@/components/ui/Badge'
import { cn }                       from '@/lib/utils'
import type { ExecutionDetail }     from '@/hooks/useExecution'

const STAGE_META: Record<string, { label: string; desc: string }> = {
  RECEIVED:      { label: 'Received',      desc: 'Document received and stored'          },
  QUEUED:        { label: 'Queued',        desc: 'Waiting for AI processing slot'        },
  PREPROCESSING: { label: 'Preprocessing', desc: 'Image normalisation and preparation'   },
  AI_EXTRACTION: { label: 'AI Extraction', desc: 'Groq / Mistral processing document'    },
  VALIDATION:    { label: 'Validation',    desc: 'Schema validation and quality checks'  },
  DELIVERY:      { label: 'Delivery',      desc: 'Pushing result to destinations'        },
  DONE:          { label: 'Done',          desc: 'Execution complete'                    },
}

const STATUS_DOT: Record<string, string> = {
  success: '#22c55e',
  failed:  '#ef4444',
  running: '#f59e0b',
  skipped: '#3d4060',
  pending: '#1e2030',
}

const STATUS_LINE: Record<string, string> = {
  success: 'var(--green)',
  failed:  'var(--red)',
  running: 'var(--amber)',
  skipped: 'var(--text-muted)',
  pending: 'var(--border)',
}

interface StageTimelineProps {
  stages: ExecutionDetail['stages']
}

export function StageTimeline({ stages }: StageTimelineProps) {
  return (
    <div className="space-y-0">
      {stages.map((stage, i) => {
        const meta       = STAGE_META[stage.stage] || { label: stage.stage, desc: '' }
        const isLast     = i === stages.length - 1
        const dotColor   = STATUS_DOT[stage.status]  || '#1e2030'
        const lineColor  = STATUS_LINE[stage.status] || 'var(--border)'
        const isPending  = stage.status === 'pending'

        return (
          <div key={stage.stage} className="flex gap-4">
            {/* Timeline track */}
            <div className="flex flex-col items-center" style={{ width: 20 }}>
              {/* Dot */}
              <div
                className={cn(
                  'w-3 h-3 rounded-full flex-shrink-0 mt-3',
                  stage.status === 'running' && 'animate-pulse'
                )}
                style={{
                  background: dotColor,
                  boxShadow:  stage.status === 'success'
                    ? `0 0 6px ${dotColor}60`
                    : stage.status === 'running'
                    ? `0 0 8px ${dotColor}80`
                    : 'none',
                }}
              />
              {/* Connector line */}
              {!isLast && (
                <div
                  className="w-px flex-1 mt-1"
                  style={{
                    background: lineColor,
                    minHeight:  24,
                    opacity:    isPending ? 0.3 : 1,
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn('flex-1 pb-4', isLast && 'pb-0')}>
              <div className="flex items-start justify-between gap-3 pt-2">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{
                        fontFamily: 'var(--font-display)',
                        color:      isPending ? 'var(--text-muted)' : 'var(--text-primary)',
                        letterSpacing: '0.1em',
                      }}
                    >
                      {meta.label}
                    </span>
                    <Badge variant={
                      stage.status === 'success' ? 'success' :
                      stage.status === 'failed'  ? 'error'   :
                      stage.status === 'running' ? 'amber'   :
                      stage.status === 'skipped' ? 'neutral' : 'neutral'
                    }>
                      {stage.status}
                    </Badge>
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                  >
                    {meta.desc}
                  </div>
                  {stage.error && (
                    <div
                      className="mt-2 p-2 text-xs"
                      style={{
                        background:   'rgba(239,68,68,0.05)',
                        border:       '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 'var(--radius-sm)',
                        color:        'var(--red)',
                        fontFamily:   'var(--font-mono)',
                      }}
                    >
                      {stage.error}
                    </div>
                  )}
                </div>

                {/* Timing */}
                <div className="text-right flex-shrink-0">
                  {stage.durationMs != null && (
                    <div
                      className="text-sm font-bold"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                    >
                      {formatMs(stage.durationMs)}
                    </div>
                  )}
                  {stage.startedAt && (
                    <div
                      className="text-xs"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}
                    >
                      {formatDateTime(stage.startedAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}