import { useState }   from 'react'
import { useForm }    from 'react-hook-form'
import {
  useAlertRules, useCreateAlertRule,
  useDeleteAlertRule, useSendTestAlert,
} from '@/hooks/useSettings'
import { SettingSection } from '../SettingSection'
import { Button }         from '@/components/ui/Button'
import { Input }          from '@/components/ui/Input'
import { Badge }          from '@/components/ui/Badge'
import { Bell, Plus, Trash2, Send } from 'lucide-react'

const ERROR_TYPES = [
  { value: 'AI_FAILURE',       label: 'AI Failure',       color: 'var(--red)'    },
  { value: 'DELIVERY_FAILURE', label: 'Delivery Failure', color: '#fb923c'       },
  { value: 'SCHEMA_ERROR',     label: 'Schema Error',     color: 'var(--yellow)' },
  { value: 'QUOTA_EXCEEDED',   label: 'Quota Exceeded',   color: 'var(--amber)'  },
  { value: 'ALL',              label: 'All Errors',       color: 'var(--green)'  },
]

export function AlertsSection() {
  const { data }           = useAlertRules()
  const createMutation     = useCreateAlertRule()
  const deleteMutation     = useDeleteAlertRule()
  const testMutation       = useSendTestAlert()
  const [showCreate, setShowCreate] = useState(false)
  const [errorType, setErrorType]   = useState('AI_FAILURE')

  const { register, handleSubmit, reset } = useForm<{ alert_email: string }>()
  const rules = data?.data || []

  const onSubmit = handleSubmit(async data => {
    await createMutation.mutateAsync({ error_type: errorType, alert_email: data.alert_email })
    reset()
    setShowCreate(false)
  })

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs tracking-widest uppercase mb-1"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>monitoring</div>
        <h1 className="text-3xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Alert Rules
        </h1>
      </div>

      <SettingSection title="Email Alerts"
        subtitle="Get notified when specific error types occur"
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => testMutation.mutate()} loading={testMutation.isPending}>
              <Send size={12} /> Send Test
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowCreate(!showCreate)}>
              <Plus size={12} /> Add Rule
            </Button>
          </div>
        }
      >
        {showCreate && (
          <form onSubmit={onSubmit}
            className="mb-5 p-4 space-y-4 animate-fade-in-up"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <Input label="Alert Email" type="email" placeholder="admin@company.com"
              {...register('alert_email', { required: true })} />
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>Error Type</div>
              <div className="flex flex-wrap gap-2">
                {ERROR_TYPES.map(et => (
                  <button key={et.value} type="button"
                    onClick={() => setErrorType(et.value)}
                    className="px-3 py-1.5 text-xs font-semibold uppercase border transition-all"
                    style={{
                      background:   errorType === et.value ? `${et.color}15` : 'transparent',
                      borderColor:  errorType === et.value ? et.color : 'var(--border)',
                      color:        errorType === et.value ? et.color : 'var(--text-muted)',
                      borderRadius: 'var(--radius-sm)',
                      fontFamily:   'var(--font-display)',
                    }}>
                    {et.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="md" loading={createMutation.isPending}>Create Rule</Button>
              <Button type="button" variant="ghost" size="md" onClick={() => { setShowCreate(false); reset() }}>Cancel</Button>
            </div>
          </form>
        )}

        {rules.length === 0 ? (
          <div className="py-10 text-center">
            <Bell size={24} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              No alert rules — errors will be logged but not emailed
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {rules.map((r: any) => {
              const et = ERROR_TYPES.find(e => e.value === r.error_type)
              return (
                <div key={r.id}
                  className="flex items-center gap-4 px-4 py-3"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: et?.color || 'var(--amber)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {r.alert_email}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      triggers on: {et?.label || r.error_type}
                    </div>
                  </div>
                  <Badge variant="neutral">{r.error_type}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(r.id)}>
                    <Trash2 size={11} />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </SettingSection>
    </div>
  )
}