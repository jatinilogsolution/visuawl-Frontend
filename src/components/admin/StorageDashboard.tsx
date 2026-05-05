import { useState }           from 'react'
import {
  useStorageHealth,
  useStorageStats,
  useStorageFiles,
  useSignFile,
  useLifecycleRules,
  useLifecyclePreview,
  useCreateLifecycleRule,
  useDeleteLifecycleRule,
  useRunLifecycle,
} from '@/hooks/useStorage'
import { StatusIndicator }    from './StatusIndicator'
import { Card, CardHeader }   from '@/components/ui/Card'
import { Button }             from '@/components/ui/Button'
import { Badge }              from '@/components/ui/Badge'
import { Pagination }         from '@/components/executions/Pagination'
import {  formatDateTime, formatNumber } from '@/lib/utils'
import { cn }                 from '@/lib/utils'
import {
  HardDrive, Cloud, File, RefreshCw, Trash2,
  Plus, Link2, Eye, AlertTriangle, Layers, Play,
} from 'lucide-react'
import toast                  from 'react-hot-toast'

// ── Format bytes ──────────────────────────────────────────────────────────────

function prettyBytes(bytes: number): string {
  if (!bytes) return '0 B'
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024**2)     return `${(bytes/1024).toFixed(1)} KB`
  if (bytes < 1024**3)     return `${(bytes/1024**2).toFixed(1)} MB`
  return `${(bytes/1024**3).toFixed(2)} GB`
}

// ── File browser ──────────────────────────────────────────────────────────────

function FileBrowser({ tenantId }: { tenantId?: string }) {
  const [page, setPage]     = useState(1)
  const [mime, setMime]     = useState('')
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})

  const { data, isLoading } = useStorageFiles({ tenantId, page, limit: 15, mime: mime || undefined })
  const signMutation        = useSignFile()

  const files      = data?.data?.files      || []
  const total      = data?.data?.total      || 0
  const totalPages = data?.data?.totalPages || 1

  const handleSign = async (storageKey: string) => {
    try {
      const res = await signMutation.mutateAsync({ storageKey, expirySeconds: 3600 })
      setSignedUrls(prev => ({ ...prev, [storageKey]: res.data.url }))
      toast.success('Signed URL generated — expires in 1 hour')
    } catch {}
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={mime}
          onChange={e => { setMime(e.target.value); setPage(1) }}
          className="h-8 px-2 text-xs border bg-transparent focus:outline-none"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)' }}>
          <option value="" style={{ background: 'var(--bg-overlay)' }}>All Types</option>
          <option value="application/pdf" style={{ background: 'var(--bg-overlay)' }}>PDF</option>
          <option value="image/" style={{ background: 'var(--bg-overlay)' }}>Images</option>
        </select>
        <span className="text-xs ml-auto"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {formatNumber(total)} files
        </span>
      </div>

      {/* File list */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_,i) => (
            <div key={i} className="h-14 animate-pulse"
              style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}/>
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="py-12 text-center">
          <File size={24} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }}/>
          <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            No files found
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {/* Header */}
          <div className="grid gap-3 px-3 py-2"
            style={{ gridTemplateColumns: '1fr 80px 80px 120px 100px', borderBottom: '1px solid var(--border)' }}>
            {['File', 'Type', 'Size', 'Uploaded', 'Actions'].map(h => (
              <span key={h} className="text-xs font-bold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                {h}
              </span>
            ))}
          </div>

          {files.map((f: any) => (
            <div key={f.id}
              className="grid gap-3 px-3 py-2.5 items-center hover:bg-(--bg-elevated) transition-colors"
              style={{ gridTemplateColumns: '1fr 80px 80px 120px 100px', borderRadius: 'var(--radius-sm)' }}>
              <div className="min-w-0">
                <div className="text-xs font-medium truncate"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {f.original_name}
                </div>
                <div className="text-xs truncate"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                  {f.storage_key.slice(0, 40)}…
                  {f.tenant_slug && ` · ${f.tenant_slug}`}
                </div>
              </div>
              <span className="text-xs"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {f.mime_type?.split('/')[1]?.toUpperCase() || '—'}
              </span>
              <span className="text-xs"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {prettyBytes(f.size_bytes)}
              </span>
              <span className="text-xs"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                {formatDateTime(f.created_at)}
              </span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm"
                  onClick={() => handleSign(f.storage_key)}
                  loading={signMutation.isPending}>
                  <Link2 size={11}/>
                </Button>
                {signedUrls[f.storage_key] && (
                  <a href={signedUrls[f.storage_key]} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm">
                      <Eye size={11}/>
                    </Button>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} total={total} limit={15} onChange={setPage}/>
      )}
    </div>
  )
}

// ── Lifecycle manager ─────────────────────────────────────────────────────────

function LifecycleManager() {
  const { data: rulesData }   = useLifecycleRules()
  const { data: previewData } = useLifecyclePreview()
  const createRule            = useCreateLifecycleRule()
  const deleteRule            = useDeleteLifecycleRule()
  const runLifecycle          = useRunLifecycle()
  const [showCreate, setShowCreate] = useState(false)
  const [newRule, setNewRule] = useState({
    deleteAfterDays: 90,
    storageMode:     'all',
    mimeTypePattern: '',
    tenantId:        '',
  })

  const rules   = rulesData?.data   || []
  const preview = previewData?.data || []

  const totalPreviewFiles = preview.reduce((sum: number, p: any) => sum + (p.wouldDelete?.count || 0), 0)
  const totalPreviewBytes = preview.reduce((sum: number, p: any) => sum + (p.wouldDelete?.totalBytes || 0), 0)

  return (
    <div className="space-y-5">

      {/* Preview banner */}
      {totalPreviewFiles > 0 && (
        <div
          className="flex items-center justify-between p-4"
          style={{
            background:   'rgba(234,179,8,0.06)',
            border:       '1px solid rgba(234,179,8,0.25)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} style={{ color: 'var(--yellow)' }}/>
            <div>
              <div className="text-sm font-semibold"
                style={{ color: 'var(--yellow)', fontFamily: 'var(--font-mono)' }}>
                {formatNumber(totalPreviewFiles)} files due for deletion
              </div>
              <div className="text-xs"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {prettyBytes(totalPreviewBytes)} will be freed when lifecycle runs
              </div>
            </div>
          </div>
          <Button variant="danger" size="md"
            loading={runLifecycle.isPending}
            onClick={() => runLifecycle.mutate()}>
            <Play size={13}/>
            Run Now
          </Button>
        </div>
      )}

      {/* Rules list */}
      <Card padding="md">
        <CardHeader
          title="Lifecycle Rules"
          subtitle="Files are deleted automatically based on age"
          action={
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm"
                loading={runLifecycle.isPending}
                onClick={() => runLifecycle.mutate()}>
                <Play size={12}/> Run
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowCreate(!showCreate)}>
                <Plus size={12}/> Add Rule
              </Button>
            </div>
          }
        />

        {/* Create form */}
        {showCreate && (
          <div
            className="mb-5 p-4 space-y-4 animate-fade-in-up"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest mb-1.5"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                  Delete After (days)
                </div>
                <input
                  type="number"
                  min="1"
                  value={newRule.deleteAfterDays}
                  onChange={e => setNewRule(p => ({ ...p, deleteAfterDays: parseInt(e.target.value) }))}
                  className="h-9 w-full px-3 text-xs border bg-transparent focus:outline-none focus:border-amber-500"
                  style={{ borderColor: 'var(--border)', color: 'var(--amber)', fontFamily: 'var(--font-mono)', borderRadius: 'var(--radius-md)' }}
                />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest mb-1.5"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                  Storage Mode
                </div>
                <select
                  value={newRule.storageMode}
                  onChange={e => setNewRule(p => ({ ...p, storageMode: e.target.value }))}
                  className="h-9 w-full px-3 text-xs border bg-transparent focus:outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)' }}>
                  <option value="all"   style={{ background: 'var(--bg-overlay)' }}>All Storage</option>
                  <option value="local" style={{ background: 'var(--bg-overlay)' }}>Local Only</option>
                  <option value="s3"    style={{ background: 'var(--bg-overlay)' }}>S3 Only</option>
                </select>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest mb-1.5"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                  MIME Pattern (optional)
                </div>
                <input
                  type="text"
                  placeholder="e.g. application/pdf or image/*"
                  value={newRule.mimeTypePattern}
                  onChange={e => setNewRule(p => ({ ...p, mimeTypePattern: e.target.value }))}
                  className="h-9 w-full px-3 text-xs border bg-transparent focus:outline-none focus:border-amber-500"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', borderRadius: 'var(--radius-md)' }}
                />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest mb-1.5"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                  Tenant ID (optional)
                </div>
                <input
                  type="text"
                  placeholder="Leave blank for all tenants"
                  value={newRule.tenantId}
                  onChange={e => setNewRule(p => ({ ...p, tenantId: e.target.value }))}
                  className="h-9 w-full px-3 text-xs border bg-transparent focus:outline-none focus:border-amber-500"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', borderRadius: 'var(--radius-md)' }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" size="md"
                loading={createRule.isPending}
                onClick={() => {
                  createRule.mutate({
                    deleteAfterDays:  newRule.deleteAfterDays,
                    storageMode:      newRule.storageMode,
                    mimeTypePattern:  newRule.mimeTypePattern || null,
                    tenantId:         newRule.tenantId || null,
                  })
                  setShowCreate(false)
                }}>
                Create Rule
              </Button>
              <Button variant="ghost" size="md" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Rules */}
        <div className="space-y-2">
          {rules.map((r: any) => {
            const p = preview.find((pv: any) => pv.ruleId === r.id)
            return (
              <div key={r.id}
                className="flex items-center gap-4 p-4"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <Layers size={14} style={{ color: 'var(--amber)', flexShrink: 0 }}/>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    Delete after <span style={{ color: 'var(--amber)' }}>{r.delete_after_days} days</span>
                    {r.mime_type_pattern && ` · ${r.mime_type_pattern}`}
                    {r.tenant_slug && ` · tenant: ${r.tenant_slug}`}
                    {!r.tenant_id && ' · all tenants'}
                  </div>
                  <div className="text-xs"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Storage: {r.storage_mode}
                    {p && ` · would delete ${formatNumber(p.wouldDelete.count)} files (${p.wouldDelete.totalMb}MB)`}
                  </div>
                </div>
                <Badge variant={r.is_active ? 'success' : 'neutral'}>
                  {r.is_active ? 'active' : 'disabled'}
                </Badge>
                <Button variant="ghost" size="sm"
                  onClick={() => deleteRule.mutate(r.id)}>
                  <Trash2 size={11}/>
                </Button>
              </div>
            )
          })}
          {rules.length === 0 && (
            <div className="py-8 text-center text-xs"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              No lifecycle rules — files are kept forever
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

// ── Main storage dashboard ────────────────────────────────────────────────────

export function StorageDashboard() {
  const [view, setView]   = useState<'overview' | 'files' | 'lifecycle'>('overview')
  const { data: healthData } = useStorageHealth()
  const { data: statsData }  = useStorageStats()

  const health = healthData?.data
  const stats  = statsData?.data

  const VIEWS = [
    { id: 'overview',   label: 'Overview',   icon: HardDrive },
    { id: 'files',      label: 'File Browser', icon: File    },
    { id: 'lifecycle',  label: 'Lifecycle',  icon: RefreshCw },
  ] as const

  return (
    <div className="space-y-5">

      {/* View tabs */}
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

      {/* Overview */}
      {view === 'overview' && (
        <div className="space-y-5 animate-fade-in-up">

          {/* Health card */}
          <div
            className="flex items-center justify-between p-4"
            style={{
              background:   health?.status === 'ok' ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)',
              border:       `1px solid ${health?.status === 'ok' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              borderRadius: 'var(--radius-lg)',
            }}>
            <div className="flex items-center gap-4">
              {health?.mode === 's3'
                ? <Cloud size={20} style={{ color: 'var(--amber)' }}/>
                : <HardDrive size={20} style={{ color: 'var(--amber)' }}/>
              }
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <StatusIndicator status={health?.status || 'unknown'} size="md"/>
                  <span className="text-sm font-bold"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                    {health?.mode?.toUpperCase() || 'Unknown'} Storage
                  </span>
                </div>
                <div className="text-xs"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {health?.message}
                  {health?.bucket && ` · Bucket: ${health.bucket}`}
                  {health?.uploadDir && ` · Dir: ${health.uploadDir}`}
                </div>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Files',
                value: formatNumber(stats?.overall?.total_files || 0),
                color: 'var(--text-primary)',
              },
              {
                label: 'Total Size',
                value: prettyBytes(stats?.overall?.total_bytes || 0),
                color: 'var(--amber)',
              },
              {
                label: 'PDFs',
                value: formatNumber(stats?.overall?.pdf_count || 0),
                color: 'var(--text-secondary)',
              },
              {
                label: 'Images',
                value: formatNumber(stats?.overall?.image_count || 0),
                color: 'var(--text-secondary)',
              },
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

          {/* Age breakdown */}
          {stats?.byAge && (
            <Card padding="md">
              <CardHeader title="File Age Distribution"/>
              <div className="space-y-3">
                {[
                  { label: 'Last 7 days',    value: stats.byAge.last_7_days,  color: 'var(--green)'  },
                  { label: 'Last 30 days',   value: stats.byAge.last_30_days, color: 'var(--amber)'  },
                  { label: 'Last 90 days',   value: stats.byAge.last_90_days, color: 'var(--yellow)' },
                  { label: 'Older than 90d', value: stats.byAge.older_than_90, color: 'var(--red)'   },
                ].map(({ label, value, color }) => {
                  const total = stats.overall.total_files || 1
                  const pct   = Math.round((parseInt(value || 0) / total) * 100)
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs"
                          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          {label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs"
                            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {formatNumber(parseInt(value || 0))}
                          </span>
                          <span className="text-xs font-bold"
                            style={{ color, fontFamily: 'var(--font-mono)' }}>
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 overflow-hidden"
                        style={{ background: 'var(--bg-elevated)', borderRadius: 1 }}>
                        <div className="h-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: color }}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {view === 'files'     && <FileBrowser />}
      {view === 'lifecycle' && <LifecycleManager />}
    </div>
  )
}