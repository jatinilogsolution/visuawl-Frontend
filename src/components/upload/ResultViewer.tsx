import { useState }              from 'react'
import { cn }                    from '@/lib/utils'
import { formatMs, formatBytes } from '@/lib/utils'
import { Badge, executionStatusBadge } from '@/components/ui/Badge'
import { Button }                from '@/components/ui/Button'
import { Card }                  from '@/components/ui/Card'
import {
  ChevronDown, ChevronRight, Copy,
  Download, ExternalLink,
} from 'lucide-react'
import { useExecution }          from '@/hooks/useExecution'
import { Spinner }               from '@/components/ui/Spinner'
import { Link }                  from '@tanstack/react-router'
import toast                     from 'react-hot-toast'

// ── JSON tree renderer ─────────────────────────────────────────────────────────

interface JsonNodeProps {
  data:     any
  depth?:   number
  expanded?: boolean
}

function JsonNode({ data, depth = 0, expanded = true }: JsonNodeProps) {
  const [open, setOpen] = useState(expanded && depth < 2)

  if (data === null) return <span style={{ color: 'var(--text-muted)' }}>null</span>
  if (typeof data === 'boolean') return <span style={{ color: 'var(--amber)' }}>{String(data)}</span>
  if (typeof data === 'number') return <span style={{ color: '#60a5fa' }}>{data}</span>
  if (typeof data === 'string') {
    return (
      <span style={{ color: '#4ade80' }}>
        "{data.length > 80 ? data.slice(0, 80) + '…' : data}"
      </span>
    )
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return <span style={{ color: 'var(--text-muted)' }}>[]</span>
    return (
      <span>
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-0.5 hover:opacity-80"
          style={{ color: 'var(--text-muted)' }}
        >
          {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          <span style={{ color: 'var(--text-primary)' }}>[</span>
          {!open && <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{data.length} items</span>}
          {!open && <span style={{ color: 'var(--text-primary)' }}>]</span>}
        </button>
        {open && (
          <div style={{ paddingLeft: 16 }}>
            {data.map((item, i) => (
              <div key={i} style={{ margin: '1px 0' }}>
                <JsonNode data={item} depth={depth + 1} expanded={depth < 1} />
                {i < data.length - 1 && <span style={{ color: 'var(--text-muted)' }}>,</span>}
              </div>
            ))}
            <span style={{ color: 'var(--text-primary)' }}>]</span>
          </div>
        )}
      </span>
    )
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data)
    if (keys.length === 0) return <span style={{ color: 'var(--text-muted)' }}>{'{}'}</span>
    return (
      <span>
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-0.5 hover:opacity-80"
          style={{ color: 'var(--text-muted)' }}
        >
          {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          <span style={{ color: 'var(--text-primary)' }}>{'{'}</span>
          {!open && <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{keys.length} keys</span>}
          {!open && <span style={{ color: 'var(--text-primary)' }}>{'}'}</span>}
        </button>
        {open && (
          <div style={{ paddingLeft: 16 }}>
            {keys.map((key, i) => (
              <div key={key} style={{ margin: '1px 0' }}>
                <span style={{ color: '#e879f9' }}>"{key}"</span>
                <span style={{ color: 'var(--text-muted)' }}>: </span>
                <JsonNode data={data[key]} depth={depth + 1} expanded={depth < 1} />
                {i < keys.length - 1 && <span style={{ color: 'var(--text-muted)' }}>,</span>}
              </div>
            ))}
            <span style={{ color: 'var(--text-primary)' }}>{'}'}</span>
          </div>
        )}
      </span>
    )
  }

  return null
}

// ── Stage timeline ─────────────────────────────────────────────────────────────

const STAGE_COLORS: Record<string, string> = {
  success: 'var(--green)',
  failed:  'var(--red)',
  running: 'var(--amber)',
  skipped: 'var(--text-muted)',
  pending: 'var(--border-light)',
}

function StageTimeline({ stages }: { stages: ExecutionDetail['stages'] }) {
  return (
    <div className="space-y-1">
      {stages.map((stage, i) => (
        <div key={stage.stage} className="flex items-center gap-3">
          {/* Connector */}
          <div className="flex flex-col items-center" style={{ width: 16 }}>
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: STAGE_COLORS[stage.status] || 'var(--border)' }}
            />
            {i < stages.length - 1 && (
              <div className="w-px flex-1 mt-1" style={{ background: 'var(--border)', minHeight: 12 }} />
            )}
          </div>

          {/* Stage info */}
          <div className="flex items-center gap-3 flex-1 pb-2">
            <div
              className="text-xs font-semibold uppercase tracking-wider flex-1"
              style={{
                color:      stage.status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {stage.stage}
            </div>
            {stage.durationMs != null && (
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {formatMs(stage.durationMs)}
              </span>
            )}
            <Badge variant={
              stage.status === 'success' ? 'success' :
              stage.status === 'failed'  ? 'error'   :
              stage.status === 'running' ? 'amber'   :
              stage.status === 'skipped' ? 'neutral' : 'neutral'
            }>
              {stage.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main ResultViewer ──────────────────────────────────────────────────────────

import type { ExecutionDetail } from '@/hooks/useExecution'

interface ResultViewerProps {
  executionId: string
  onReset?:    () => void
}

export function ResultViewer({ executionId, onReset }: ResultViewerProps) {
  const { data, isLoading }  = useExecution(executionId)
  const [tab, setTab]        = useState<'result' | 'stages' | 'raw'>('result')
  const execution            = data?.data

  const copyJson = () => {
    if (!execution?.extractedData) return
    navigator.clipboard.writeText(JSON.stringify(execution.extractedData, null, 2))
    toast.success('Copied to clipboard')
  }

  const downloadJson = () => {
    if (!execution?.extractedData) return
    const blob = new Blob([JSON.stringify(execution.extractedData, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${executionId.slice(0, 8)}_extracted.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <Card padding="md" className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="md" />
          <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Loading result...
          </span>
        </div>
      </Card>
    )
  }

  if (!execution) return null

  const isRunning = ['queued', 'processing'].includes(execution.status)

  return (
    <Card padding="none">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <Badge variant={executionStatusBadge(execution.status)} dot={isRunning}>
            {execution.status}
          </Badge>
          <div>
            <div
              className="text-xs font-medium"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
            >
              {execution.originalFilename}
            </div>
            <div
              className="text-xs"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {executionId.slice(0, 8)}…
              {execution.processingTimeMs && ` · ${formatMs(execution.processingTimeMs)}`}
              {execution.fileSizeBytes && ` · ${formatBytes(execution.fileSizeBytes)}`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {execution.extractedData && (
            <>
              <Button variant="ghost" size="sm" onClick={copyJson}>
                <Copy size={12} />
                Copy
              </Button>
              <Button variant="ghost" size="sm" onClick={downloadJson}>
                <Download size={12} />
                JSON
              </Button>
            </>
          )}
          <Link to="/dashboard/executions">
            <Button variant="ghost" size="sm">
              <ExternalLink size={12} />
              Full Detail
            </Button>
          </Link>
          {onReset && (
            <Button variant="secondary" size="sm" onClick={onReset}>
              New Upload
            </Button>
          )}
        </div>
      </div>

      {/* Processing indicator */}
      {isRunning && (
        <div
          className="flex items-center gap-3 px-5 py-3"
          style={{ background: 'var(--amber-glow)', borderBottom: '1px solid var(--amber-dim)' }}
        >
          <Spinner size="xs" />
          <span
            className="text-xs"
            style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}
          >
            AI extraction in progress — auto-refreshing every 2 seconds...
          </span>
        </div>
      )}

      {/* Error */}
      {execution.status === 'failed' && execution.errorMessage && (
        <div
          className="px-5 py-3 text-xs"
          style={{
            background:   'rgba(239,68,68,0.05)',
            borderBottom: '1px solid rgba(239,68,68,0.2)',
            color:        'var(--red)',
            fontFamily:   'var(--font-mono)',
          }}
        >
          ⚠ {execution.errorMessage}
        </div>
      )}

      {/* Tabs */}
      <div
        className="flex gap-0 px-5 pt-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {(['result', 'stages', 'raw'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-xs font-semibold uppercase tracking-widest',
              'border-b-2 transition-colors -mb-px',
              tab === t
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-(--text-muted) hover:text-(--text-secondary)'
            )}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5">

        {/* Result tab */}
        {tab === 'result' && (
          <div>
            {execution.extractedData ? (
              <div
                className="overflow-auto text-xs leading-relaxed p-4"
                style={{
                  background:   'var(--bg-base)',
                  borderRadius: 'var(--radius-md)',
                  border:       '1px solid var(--border)',
                  fontFamily:   'var(--font-mono)',
                  maxHeight:    480,
                }}
              >
                <JsonNode data={execution.extractedData} />
              </div>
            ) : (
              <div className="py-8 text-center">
                <span className="text-xs tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {isRunning ? 'EXTRACTION IN PROGRESS...' : 'NO DATA EXTRACTED'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Stages tab */}
        {tab === 'stages' && (
          <StageTimeline stages={execution.stages} />
        )}

        {/* Raw JSON tab */}
        {tab === 'raw' && (
          <pre
            className="text-xs overflow-auto p-4"
            style={{
              background:   'var(--bg-base)',
              borderRadius: 'var(--radius-md)',
              border:       '1px solid var(--border)',
              color:        'var(--text-secondary)',
              fontFamily:   'var(--font-mono)',
              maxHeight:    480,
            }}
          >
            {JSON.stringify(execution.extractedData, null, 2) || 'null'}
          </pre>
        )}
      </div>

      {/* Confidence + key fields summary */}
      {execution.extractedData && tab === 'result' && (
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 pb-5"
        >
          {[
            { label: 'Doc Type',   value: execution.extractedData?.document_type },
            { label: 'Grand Total',value: execution.extractedData?.grand_total != null ? `${execution.extractedData.currency || ''} ${execution.extractedData.grand_total}` : null },
            { label: 'Vendor',     value: execution.extractedData?.vendor?.name },
            { label: 'Confidence', value: execution.extractedData?.confidence != null ? `${Math.round(execution.extractedData.confidence * 100)}%` : null },
          ].map(({ label, value }) => value != null ? (
            <div
              key={label}
              className="p-3"
              style={{
                background:   'var(--bg-elevated)',
                border:       '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                {label}
              </div>
              <div className="text-sm font-semibold truncate" style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                {String(value)}
              </div>
            </div>
          ) : null)}
        </div>
      )}
    </Card>
  )
}
