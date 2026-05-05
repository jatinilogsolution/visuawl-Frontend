// import { formatMs, formatDateTime } from '@/lib/utils'
// import { Badge }                    from '@/components/ui/Badge'
// import { cn }                       from '@/lib/utils'
// import type { ExecutionDetail }     from '@/hooks/useExecution'

// const STAGE_META: Record<string, { label: string; desc: string }> = {
//   RECEIVED:      { label: 'Received',      desc: 'Document received and stored'          },
//   QUEUED:        { label: 'Queued',        desc: 'Waiting for AI processing slot'        },
//   PREPROCESSING: { label: 'Preprocessing', desc: 'Image normalisation and preparation'   },
//   AI_EXTRACTION: { label: 'AI Extraction', desc: 'Groq / Mistral processing document'    },
//   VALIDATION:    { label: 'Validation',    desc: 'Schema validation and quality checks'  },
//   DELIVERY:      { label: 'Delivery',      desc: 'Pushing result to destinations'        },
//   DONE:          { label: 'Done',          desc: 'Execution complete'                    },
// }

// const STATUS_DOT: Record<string, string> = {
//   success: '#22c55e',
//   failed:  '#ef4444',
//   running: '#f59e0b',
//   skipped: '#3d4060',
//   pending: '#1e2030',
// }

// const STATUS_LINE: Record<string, string> = {
//   success: 'var(--green)',
//   failed:  'var(--red)',
//   running: 'var(--amber)',
//   skipped: 'var(--text-muted)',
//   pending: 'var(--border)',
// }

// interface StageTimelineProps {
//   stages: ExecutionDetail['stages']
// }

// export function StageTimeline({ stages }: StageTimelineProps) {
//   return (
//     <div className="space-y-0">
//       {stages.map((stage, i) => {
//         const meta       = STAGE_META[stage.stage] || { label: stage.stage, desc: '' }
//         const isLast     = i === stages.length - 1
//         const dotColor   = STATUS_DOT[stage.status]  || '#1e2030'
//         const lineColor  = STATUS_LINE[stage.status] || 'var(--border)'
//         const isPending  = stage.status === 'pending'

//         return (
//           <div key={stage.stage} className="flex gap-4">
//             {/* Timeline track */}
//             <div className="flex flex-col items-center" style={{ width: 20 }}>
//               {/* Dot */}
//               <div
//                 className={cn(
//                   'w-3 h-3 rounded-full shrink-0 mt-3',
//                   stage.status === 'running' && 'animate-pulse'
//                 )}
//                 style={{
//                   background: dotColor,
//                   boxShadow:  stage.status === 'success'
//                     ? `0 0 6px ${dotColor}60`
//                     : stage.status === 'running'
//                     ? `0 0 8px ${dotColor}80`
//                     : 'none',
//                 }}
//               />
//               {/* Connector line */}
//               {!isLast && (
//                 <div
//                   className="w-px flex-1 mt-1"
//                   style={{
//                     background: lineColor,
//                     minHeight:  24,
//                     opacity:    isPending ? 0.3 : 1,
//                   }}
//                 />
//               )}
//             </div>

//             {/* Content */}
//             <div className={cn('flex-1 pb-4', isLast && 'pb-0')}>
//               <div className="flex items-start justify-between gap-3 pt-2">
//                 <div>
//                   <div className="flex items-center gap-2 mb-0.5">
//                     <span
//                       className="text-xs font-bold uppercase tracking-wider"
//                       style={{
//                         fontFamily: 'var(--font-display)',
//                         color:      isPending ? 'var(--text-muted)' : 'var(--text-primary)',
//                         letterSpacing: '0.1em',
//                       }}
//                     >
//                       {meta.label}
//                     </span>
//                     <Badge variant={
//                       stage.status === 'success' ? 'success' :
//                       stage.status === 'failed'  ? 'error'   :
//                       stage.status === 'running' ? 'amber'   :
//                       stage.status === 'skipped' ? 'neutral' : 'neutral'
//                     }>
//                       {stage.status}
//                     </Badge>
//                   </div>
//                   <div
//                     className="text-xs"
//                     style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
//                   >
//                     {meta.desc}
//                   </div>
//                   {stage.error && (
//                     <div
//                       className="mt-2 p-2 text-xs"
//                       style={{
//                         background:   'rgba(239,68,68,0.05)',
//                         border:       '1px solid rgba(239,68,68,0.2)',
//                         borderRadius: 'var(--radius-sm)',
//                         color:        'var(--red)',
//                         fontFamily:   'var(--font-mono)',
//                       }}
//                     >
//                       {stage.error}
//                     </div>
//                   )}
//                 </div>

//                 {/* Timing */}
//                 <div className="text-right shrink-0">
//                   {stage.durationMs != null && (
//                     <div
//                       className="text-sm font-bold"
//                       style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
//                     >
//                       {formatMs(stage.durationMs)}
//                     </div>
//                   )}
//                   {stage.startedAt && (
//                     <div
//                       className="text-xs"
//                       style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}
//                     >
//                       {formatDateTime(stage.startedAt)}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )
//       })}
//     </div>
//   )
// }

import { formatMs, formatDateTime } from '@/lib/utils'
import { Badge }                    from '@/components/ui/Badge'
import { cn }                       from '@/lib/utils'
import type { ExecutionDetail }     from '@/hooks/useExecution'

const STAGE_META: Record<string, { label: string; desc: string; phase: string }> = {
  RECEIVED:      { label: 'Received',      desc: 'Document received and stored',         phase: 'input'    },
  QUEUED:        { label: 'Queued',        desc: 'Waiting for processing slot',           phase: 'queue'    },
  PREPROCESSING: { label: 'Preprocessing', desc: 'Image normalization and preparation',   phase: 'prepare'  },
  AI_EXTRACTION: { label: 'AI Extraction', desc: 'Document content extracted by AI',      phase: 'ai'       },
  VALIDATION:    { label: 'Validation',    desc: 'Schema validation and quality checks',  phase: 'validate' },
  DELIVERY:      { label: 'Delivery',      desc: 'Results pushed to destinations',        phase: 'deliver'  },
  DONE:          { label: 'Complete',      desc: 'Execution finished successfully',        phase: 'done'     },
}

const PHASE_COLORS: Record<string, string> = {
  input:    '#60a5fa',
  queue:    'var(--text-muted)',
  prepare:  '#c084fc',
  ai:       'var(--amber)',
  validate: '#4ade80',
  deliver:  '#fb923c',
  done:     'var(--green)',
}

const STATUS_DOT: Record<string, string> = {
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
  // Calculate cumulative timing
  const withCumulative = stages.map((s, i) => {
    const prev        = stages.slice(0, i)
    const cumulativeMs = prev.reduce((sum, p) => sum + (p.durationMs || 0), 0)
    return { ...s, cumulativeMs }
  })

  const totalMs = stages.reduce((sum, s) => sum + (s.durationMs || 0), 0)

  return (
    <div>
      {/* Total time banner */}
      {totalMs > 0 && (
        <div className="flex items-center gap-4 mb-6 p-3"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <div className="text-xs uppercase tracking-widest"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
            Total Pipeline Time
          </div>
          <div className="text-xl font-bold"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)' }}>
            {formatMs(totalMs)}
          </div>
          {/* Mini gantt */}
          <div className="flex-1 flex h-4 rounded overflow-hidden gap-0.5">
            {withCumulative.filter(s => s.durationMs && s.durationMs > 0).map(s => {
              const meta  = STAGE_META[s.stage]
              const width = totalMs > 0 ? ((s.durationMs || 0) / totalMs * 100) : 0
              return (
                <div key={s.stage}
                  title={`${meta?.label}: ${formatMs(s.durationMs)}`}
                  style={{
                    width:      `${width}%`,
                    background: PHASE_COLORS[meta?.phase || ''] || 'var(--border)',
                    minWidth:   width > 0 ? 2 : 0,
                    transition: 'width 0.5s ease',
                  }}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Stage rows */}
      <div className="space-y-0">
        {withCumulative.map((stage, i) => {
          const meta     = STAGE_META[stage.stage] || { label: stage.stage, desc: '', phase: 'input' }
          const isLast   = i === stages.length - 1
          const dotColor = STATUS_DOT[stage.status] || 'var(--border)'
          const phaseColor = PHASE_COLORS[meta.phase] || 'var(--text-muted)'
          const isPending = stage.status === 'pending'
          const pct = totalMs > 0 && stage.durationMs
            ? Math.round((stage.durationMs / totalMs) * 100)
            : null

          return (
            <div key={stage.stage} className="flex gap-4">
              {/* Timeline track */}
              <div className="flex flex-col items-center" style={{ width: 20 }}>
                <div
                  className={cn(
                    'w-3 h-3 rounded-full shrink-0 mt-3',
                    stage.status === 'running' && 'animate-pulse'
                  )}
                  style={{
                    background: dotColor,
                    boxShadow:  stage.status === 'success' ? `0 0 8px ${dotColor}50` :
                                stage.status === 'running' ? `0 0 12px ${dotColor}80` : 'none',
                  }}
                />
                {!isLast && (
                  <div className="w-px flex-1 mt-1"
                    style={{
                      background: dotColor,
                      minHeight:  28,
                      opacity:    isPending ? 0.2 : 0.5,
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn('flex-1 pb-4', isLast && 'pb-0')}>
                <div className="flex items-start justify-between gap-3 pt-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-widest"
                        style={{
                          fontFamily: 'var(--font-display)',
                          color:      isPending ? 'var(--text-muted)' : 'var(--text-primary)',
                          letterSpacing: '0.1em',
                        }}>
                        {meta.label}
                      </span>
                      <div className="w-1.5 h-1.5 rounded-full"
                        style={{ background: phaseColor }} />
                      <Badge variant={
                        stage.status === 'success' ? 'success' :
                        stage.status === 'failed'  ? 'error'   :
                        stage.status === 'running' ? 'amber'   : 'neutral'
                      }>
                        {stage.status}
                      </Badge>
                      {pct !== null && pct > 0 && (
                        <span className="text-xs"
                          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {pct}% of total
                        </span>
                      )}
                    </div>

                    <div className="text-xs mb-2"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {meta.desc}
                    </div>

                    {/* Timestamps */}
                    {(stage.startedAt || stage.endedAt) && (
                      <div className="flex items-center gap-4 text-xs"
                        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                        {stage.startedAt && (
                          <span>Started: {formatDateTime(stage.startedAt)}</span>
                        )}
                        {stage.endedAt && (
                          <span>Ended: {formatDateTime(stage.endedAt)}</span>
                        )}
                      </div>
                    )}

                    {/* Duration bar */}
                    {pct !== null && pct > 0 && (
                      <div className="mt-2 h-1 overflow-hidden"
                        style={{ background: 'var(--bg-elevated)', borderRadius: 1, maxWidth: 200 }}>
                        <div className="h-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: phaseColor }} />
                      </div>
                    )}

                    {/* Error */}
                    {stage.error && (
                      <div className="mt-2 p-2 text-xs"
                        style={{
                          background:   'rgba(239,68,68,0.05)',
                          border:       '1px solid rgba(239,68,68,0.2)',
                          borderRadius: 'var(--radius-sm)',
                          color:        'var(--red)',
                          fontFamily:   'var(--font-mono)',
                        }}>
                        {stage.error}
                      </div>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="text-right shrink-0">
                    {stage.durationMs != null && stage.durationMs > 0 && (
                      <div className="text-lg font-bold"
                        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {formatMs(stage.durationMs)}
                      </div>
                    )}
                    {stage.cumulativeMs > 0 && (
                      <div className="text-xs"
                        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                        +{formatMs(stage.cumulativeMs)} total
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}