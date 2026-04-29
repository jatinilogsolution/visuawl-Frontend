import { useState }  from 'react'
import {
  useDeletionRules, useCreateDeletionRule,
  useUpdateDeletionRule, useDeleteDeletionRule,
} from '@/hooks/useSettings'
import { SettingSection } from '../SettingSection'
import { Button }         from '@/components/ui/Button'
import { Badge }          from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils'
import { Trash2, Plus }   from 'lucide-react'

const ENTITY_META: Record<string, { label: string; desc: string; color: string }> = {
  raw_files:       { label: 'Raw Files',       desc: 'Uploaded file data deleted from disk',          color: 'var(--yellow)' },
  execution_data:  { label: 'Execution Data',  desc: 'Extracted JSON and metadata soft-deleted',      color: 'var(--amber)'  },
  error_logs:      { label: 'Error Logs',      desc: 'Error log records permanently deleted',         color: 'var(--red)'    },
}

const EXISTING_TYPES = ['raw_files', 'execution_data', 'error_logs'] as const

export function DeletionSection() {
  const { data }          = useDeletionRules()
  const createMutation    = useCreateDeletionRule()
  const updateMutation    = useUpdateDeletionRule()
  const deleteMutation    = useDeleteDeletionRule()
  const [adding, setAdding] = useState<string | null>(null)
  const [days, setDays]     = useState<Record<string, number>>({})

  const rules         = data?.data || []
  const existingTypes = rules.map((r: any) => r.entity_type)
  const availableTypes = EXISTING_TYPES.filter(t => !existingTypes.includes(t))

  const handleCreate = async (entityType: string) => {
    const d = days[entityType] || 30
    await createMutation.mutateAsync({ entity_type: entityType, delete_after_days: d })
    setAdding(null)
  }

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs tracking-widest uppercase mb-1"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>privacy</div>
        <h1 className="text-3xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Data Retention
        </h1>
      </div>

      <SettingSection title="Auto-Deletion Rules"
        subtitle="Automatically delete data after a configured number of days. Cron runs at 2 AM nightly."
      >
        <div className="space-y-3 mb-5">
          {rules.map((r: any) => {
            const meta = ENTITY_META[r.entity_type]
            return (
              <div key={r.id}
                className="flex items-center gap-4 p-4"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: meta?.color || 'var(--amber)' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {meta?.label || r.entity_type}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {meta?.desc}
                    {r.lastRanAt && ` · last run ${formatDateTime(r.lastRanAt)}`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={r.deleteAfterDays || r.delete_after_days}
                    min={1}
                    onBlur={e => updateMutation.mutate({ id: r.id, delete_after_days: parseInt(e.target.value) })}
                    className="w-16 h-7 px-2 text-xs text-center border bg-transparent focus:outline-none focus:border-amber-500"
                    style={{ borderColor: 'var(--border)', color: 'var(--amber)', fontFamily: 'var(--font-mono)', borderRadius: 'var(--radius-sm)' }}
                  />
                  <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>days</span>
                </div>
                <Badge variant={r.isActive || r.is_active ? 'success' : 'neutral'}>
                  {r.isActive || r.is_active ? 'active' : 'disabled'}
                </Badge>
                <Button variant="ghost" size="sm"
                  onClick={() => updateMutation.mutate({ id: r.id, is_active: !(r.isActive || r.is_active) })}>
                  {r.isActive || r.is_active ? 'Pause' : 'Resume'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(r.id)}>
                  <Trash2 size={11} />
                </Button>
              </div>
            )
          })}
        </div>

        {/* Add new rules */}
        {availableTypes.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
              Add Rule
            </div>
            <div className="space-y-2">
              {availableTypes.map(type => {
                const meta = ENTITY_META[type]
                return adding === type ? (
                  <div key={type}
                    className="flex items-center gap-3 p-3 animate-fade-in-up"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--amber-dim)', borderRadius: 'var(--radius-md)' }}>
                    <div className="flex-1 text-xs" style={{ color: 'var(--text-primary)' }}>
                      {meta.label}: delete after
                    </div>
                    <input
                      type="number"
                      min={1}
                      defaultValue={30}
                      onChange={e => setDays(prev => ({ ...prev, [type]: parseInt(e.target.value) }))}
                      className="w-16 h-7 px-2 text-xs text-center border bg-transparent focus:outline-none focus:border-amber-500"
                      style={{ borderColor: 'var(--amber)', color: 'var(--amber)', fontFamily: 'var(--font-mono)', borderRadius: 'var(--radius-sm)' }}
                    />
                    <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>days</span>
                    <Button variant="primary" size="sm" loading={createMutation.isPending}
                      onClick={() => handleCreate(type)}>Create</Button>
                    <Button variant="ghost" size="sm" onClick={() => setAdding(null)}>Cancel</Button>
                  </div>
                ) : (
                  <button key={type} type="button"
                    onClick={() => setAdding(type)}
                    className="w-full flex items-center gap-3 p-3 text-left transition-all hover:border-[var(--border-light)]"
                    style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <Plus size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <div>
                      <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{meta.label}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{meta.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="mt-5 p-3 text-xs"
          style={{
            background:   'rgba(239,68,68,0.04)',
            border:       '1px solid rgba(239,68,68,0.15)',
            borderRadius: 'var(--radius-md)',
            color:        'var(--text-muted)',
            fontFamily:   'var(--font-mono)',
          }}>
          ⚠ Deletion is irreversible. Soft-deleted executions are excluded from history
          but the raw extracted data is permanently removed.
        </div>
      </SettingSection>
    </div>
  )
}