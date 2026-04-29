import { useState }   from 'react'
import { useForm }    from 'react-hook-form'
import { toast }      from 'react-hot-toast'
import {
  useInputSources, useCreateSource,
  useToggleSource, useDeleteSource, useTestSource,
} from '@/hooks/useSettings'
import { SettingSection } from '../SettingSection'
import { StatusDot }      from '../StatusDot'
import { Button }         from '@/components/ui/Button'
import { Input }          from '@/components/ui/Input'
import { formatDateTime } from '@/lib/utils'
import { Globe, Mail, Upload, HardDrive, Zap, Plus, Trash2, Plug } from 'lucide-react'

const TYPE_META: Record<string, { label: string; icon: any; color: string }> = {
  upload:  { label: 'Upload',  icon: Upload,    color: 'var(--amber)'  },
  webhook: { label: 'Webhook', icon: Globe,     color: 'var(--blue)'   },
  email:   { label: 'Email',   icon: Mail,      color: 'var(--green)'  },
  sftp:    { label: 'SFTP',    icon: HardDrive, color: '#c084fc'       },
  api:     { label: 'API',     icon: Zap,       color: '#fb923c'       },
}

const SOURCE_FORMS: Record<string, React.FC<{ register: any }>> = {
  webhook: ({ register }) => (
    <div className="space-y-3">
      <Input label="Description" placeholder="n8n incoming webhook"
        {...register('config.description')} />
    </div>
  ),
  email: ({ register }) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Email Address" placeholder="inbox@company.com"
          {...register('config.emailAddress', { required: true })} />
        <Input label="IMAP Host" placeholder="imap.gmail.com"
          {...register('config.imapHost', { required: true })} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input label="Port" type="number" placeholder="993"
          {...register('config.imapPort', { valueAsNumber: true })} />
        <Input label="Password" type="password"
          {...register('config.password', { required: true })} />
        <Input label="Folder" placeholder="INBOX"
          {...register('config.folderName')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Sender Filter (optional)" placeholder="billing@vendor.com"
          {...register('config.senderFilter')} />
        <Input label="Poll Interval (min)" type="number" placeholder="5"
          {...register('config.pollIntervalMin', { valueAsNumber: true })} />
      </div>
    </div>
  ),
  sftp: ({ register }) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Host" placeholder="sftp.server.com"
          {...register('config.host', { required: true })} />
        <Input label="Username" {...register('config.username', { required: true })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Password" type="password" {...register('config.password')} />
        <Input label="Watch Directory" placeholder="/invoices/incoming"
          {...register('config.watchDirectory', { required: true })} />
      </div>
      <Input label="File Pattern (optional)" placeholder="*.pdf"
        {...register('config.filePattern')} />
    </div>
  ),
  api: ({ register }) => (
    <Input label="Description" placeholder="Direct API access"
      {...register('config.description')} />
  ),
}

export function SourcesSection() {
  const { data, isLoading }     = useInputSources()
  const createMutation          = useCreateSource()
  const toggleMutation          = useToggleSource()
  const deleteMutation          = useDeleteSource()
  const testMutation            = useTestSource()
  const [showCreate, setShowCreate] = useState(false)
  const [createType, setCreateType] = useState('webhook')
  const [confirmId, setConfirmId]   = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  const { register, handleSubmit, reset } = useForm()
  const sources = data?.data || []

  const FormComp = SOURCE_FORMS[createType]

  const onSubmit = handleSubmit(async data => {
    await createMutation.mutateAsync({ ...data, type: createType })
    reset()
    setShowCreate(false)
  })

  const handleTest = async (id: string) => {
    try {
      const res = await testMutation.mutateAsync(id)
      setTestResults(prev => ({ ...prev, [id]: { ok: true, message: (res.data as any)?.message } }))
      toast.success('Connection successful')
    } catch (err: any) {
      setTestResults(prev => ({ ...prev, [id]: { ok: false, message: err?.response?.data?.message || 'Failed' } }))
      toast.error('Connection failed')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs tracking-widest uppercase mb-1"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>integrations</div>
        <h1 className="text-3xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Input Sources
        </h1>
      </div>

      <SettingSection title="Input Sources"
        subtitle="Configure where OCR Platform receives documents from"
        action={
          <Button variant="primary" size="sm" onClick={() => setShowCreate(!showCreate)}>
            <Plus size={12} /> Add Source
          </Button>
        }
      >
        {/* Create form */}
        {showCreate && (
          <form onSubmit={onSubmit}
            className="mb-5 p-4 space-y-4 animate-fade-in-up"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Name" placeholder="Gmail Invoices" {...register('name', { required: true })} />
              <div>
                <div className="text-xs font-semibold tracking-widest uppercase mb-1.5"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                  Type
                </div>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(TYPE_META).map(([type, meta]) => (
                    <button key={type} type="button"
                      onClick={() => setCreateType(type)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase border transition-all"
                      style={{
                        background:   createType === type ? `${meta.color}15` : 'transparent',
                        borderColor:  createType === type ? meta.color : 'var(--border)',
                        color:        createType === type ? meta.color : 'var(--text-muted)',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily:   'var(--font-display)',
                      }}>
                      <meta.icon size={11} />{meta.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {FormComp && <FormComp register={register} />}
            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="md" loading={createMutation.isPending}>
                Create Source
              </Button>
              <Button type="button" variant="ghost" size="md" onClick={() => { setShowCreate(false); reset() }}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Sources list */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse"
                style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }} />
            ))}
          </div>
        ) : sources.length === 0 ? (
          <div className="py-10 text-center">
            <Globe size={24} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              No input sources — add one to enable automated document ingestion
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {sources.map((s: any) => {
              const meta   = TYPE_META[s.type] || TYPE_META.api
              const Icon   = meta.icon
              const tResult = testResults[s.id]
              return (
                <div key={s.id}
                  className="p-4"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon size={14} style={{ color: meta.color, flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {meta.label}
                        {s.lastUsedAt ? ` · last used ${formatDateTime(s.lastUsedAt)}` : ' · never used'}
                      </div>
                    </div>
                    <StatusDot active={Boolean(s.isActive)} pulse />
                    <Button variant="ghost" size="sm" onClick={() => handleTest(s.id)} loading={testMutation.isPending}>
                      <Plug size={11} /> Test
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleMutation.mutate(s.id)}>
                      {s.isActive ? 'Disable' : 'Enable'}
                    </Button>
                    {confirmId === s.id ? (
                      <>
                        <Button variant="danger" size="sm" onClick={() => { deleteMutation.mutate(s.id); setConfirmId(null) }}>
                          Delete
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmId(null)}>Cancel</Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setConfirmId(s.id)}>
                        <Trash2 size={11} />
                      </Button>
                    )}
                  </div>
                  {tResult && (
                    <div className="text-xs mt-2 px-2 py-1.5"
                      style={{
                        background:   tResult.ok ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)',
                        border:       `1px solid ${tResult.ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        borderRadius: 'var(--radius-sm)',
                        color:        tResult.ok ? 'var(--green)' : 'var(--red)',
                        fontFamily:   'var(--font-mono)',
                      }}>
                      {tResult.ok ? '✓' : '✗'} {tResult.message}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </SettingSection>
    </div>
  )
}
