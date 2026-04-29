import { useState }   from 'react'
import { useForm }    from 'react-hook-form'
import { toast }      from 'react-hot-toast'
import {
  useDestinations, useCreateDestination,
  useToggleDestination, useDeleteDestination,
  useTestDestination, useDestinationHealth,
} from '@/hooks/useSettings'
import { SettingSection } from '../SettingSection'
import { StatusDot }      from '../StatusDot'
import { Button }         from '@/components/ui/Button'
import { Input }          from '@/components/ui/Input'
import { formatMs }       from '@/lib/utils'
import { Globe, Mail, Cloud, HardDrive, Plus, Trash2, Plug, BarChart2 } from 'lucide-react'

const DEST_ICONS: Record<string, any> = {
  webhook:  Globe,
  email:    Mail,
  s3:       Cloud,
  sftp:     HardDrive,
  api_pull: BarChart2,
}

const DEST_FORMS: Record<string, React.FC<{ register: any }>> = {
  webhook: ({ register }) => (
    <div className="space-y-3">
      <Input label="URL" placeholder="https://n8n.company.com/webhook/result"
        {...register('config.url', { required: true })} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest mb-1.5"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>Format</div>
          <select {...register('config.format')}
            className="h-9 w-full px-2 text-xs border bg-transparent focus:outline-none focus:border-amber-500"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)' }}>
            <option value="json" style={{ background: 'var(--bg-overlay)' }}>Plain JSON</option>
            <option value="wrapped" style={{ background: 'var(--bg-overlay)' }}>Wrapped (with metadata)</option>
          </select>
        </div>
        <Input label="Retry Count" type="number" placeholder="3"
          {...register('retry_count', { valueAsNumber: true })} />
      </div>
    </div>
  ),
  email: ({ register }) => (
    <div className="space-y-3">
      <Input label="To (comma separated)" placeholder="finance@co.com, accounts@co.com"
        {...register('config.toRaw', { required: true })} />
      <Input label="Subject Template" placeholder="Invoice Extracted — {filename}"
        {...register('config.subject')} />
    </div>
  ),
  s3: ({ register }) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Bucket" {...register('config.bucket', { required: true })} />
        <Input label="Prefix" placeholder="extracted/" {...register('config.prefix')} />
      </div>
      <Input label="Region" placeholder="ap-south-1" {...register('config.region')} />
      <Input label="Custom Endpoint (MinIO/R2)" placeholder="https://..." {...register('config.endpoint')} />
    </div>
  ),
  sftp: ({ register }) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Host" {...register('config.host', { required: true })} />
        <Input label="Username" {...register('config.username', { required: true })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Password" type="password" {...register('config.password')} />
        <Input label="Directory" placeholder="/outputs" {...register('config.directory', { required: true })} />
      </div>
    </div>
  ),
  api_pull: ({ register }) => (
    <Input label="Description" placeholder="Client fetches results via API"
      {...register('config.description')} />
  ),
}

export function DestinationsSection() {
  const { data, isLoading }     = useDestinations()
  const { data: healthData }    = useDestinationHealth()
  const createMutation          = useCreateDestination()
  const toggleMutation          = useToggleDestination()
  const deleteMutation          = useDeleteDestination()
  const testMutation            = useTestDestination()
  const [showCreate, setShowCreate] = useState(false)
  const [createType, setCreateType] = useState('webhook')
  const [confirmId, setConfirmId]   = useState<string | null>(null)

  const { register, handleSubmit, reset } = useForm()
  const destinations = data?.data || []
  const health       = healthData?.data || []
  const FormComp     = DEST_FORMS[createType]

  const onSubmit = handleSubmit(async data => {
    // Fix email to[] from comma string
    if (createType === 'email' && data.config?.toRaw) {
      data.config.to = data.config.toRaw.split(',').map((s: string) => s.trim())
      delete data.config.toRaw
    }
    await createMutation.mutateAsync({ ...data, type: createType })
    reset()
    setShowCreate(false)
  })

  const handleTest = async (id: string) => {
    try {
      const res = await testMutation.mutateAsync(id)
      toast.success((res.data as any)?.message || 'Test delivered')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Test failed')
    }
  }

  const getHealth = (id: string) => health.find((h: any) => h.destinationId === id)

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs tracking-widest uppercase mb-1"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>delivery</div>
        <h1 className="text-3xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Output Destinations
        </h1>
      </div>

      <SettingSection title="Destinations"
        subtitle="Where extracted JSON gets delivered after each successful extraction"
        action={
          <Button variant="primary" size="sm" onClick={() => setShowCreate(!showCreate)}>
            <Plus size={12} /> Add Destination
          </Button>
        }
      >
        {showCreate && (
          <form onSubmit={onSubmit}
            className="mb-5 p-4 space-y-4 animate-fade-in-up"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Name" placeholder="Finance Webhook" {...register('name', { required: true })} />
              <div>
                <div className="text-xs font-semibold tracking-widest uppercase mb-1.5"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>Type</div>
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(DEST_FORMS).map(type => {
                    const Icon = DEST_ICONS[type] || Globe
                    return (
                      <button key={type} type="button" onClick={() => setCreateType(type)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase border transition-all"
                        style={{
                          background:   createType === type ? 'var(--amber-glow)' : 'transparent',
                          borderColor:  createType === type ? 'var(--amber)' : 'var(--border)',
                          color:        createType === type ? 'var(--amber)' : 'var(--text-muted)',
                          borderRadius: 'var(--radius-sm)',
                          fontFamily:   'var(--font-display)',
                        }}>
                        <Icon size={11} />
                        {type}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            {FormComp && <FormComp register={register} />}
            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="md" loading={createMutation.isPending}>
                Create
              </Button>
              <Button type="button" variant="ghost" size="md" onClick={() => { setShowCreate(false); reset() }}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {destinations.length === 0 && !isLoading ? (
          <div className="py-10 text-center">
            <Globe size={24} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              No destinations — extracted data stays in the platform until you add one
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {destinations.map((d: any) => {
              const Icon  = DEST_ICONS[d.type] || Globe
              const h     = getHealth(d.id)
              return (
                <div key={d.id}
                  className="p-4"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex items-center gap-3">
                    <Icon size={14} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{d.name}</span>
                        <span className="text-xs uppercase" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {d.type}
                        </span>
                      </div>
                      {h && (
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs" style={{ color: h.successRate >= 90 ? 'var(--green)' : 'var(--yellow)', fontFamily: 'var(--font-mono)' }}>
                            {h.successRate}% success
                          </span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {h.totalDeliveries} deliveries · avg {formatMs(h.avgLatencyMs)}
                          </span>
                        </div>
                      )}
                    </div>
                    <StatusDot active={Boolean(d.isActive)} pulse />
                    <Button variant="ghost" size="sm" onClick={() => handleTest(d.id)}>
                      <Plug size={11} /> Test
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleMutation.mutate(d.id)}>
                      {d.isActive ? 'Disable' : 'Enable'}
                    </Button>
                    {confirmId === d.id ? (
                      <>
                        <Button variant="danger" size="sm" onClick={() => { deleteMutation.mutate(d.id); setConfirmId(null) }}>Delete</Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmId(null)}>Cancel</Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setConfirmId(d.id)}>
                        <Trash2 size={11} />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SettingSection>
    </div>
  )
}