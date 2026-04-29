import { useState }   from 'react'
import { useForm }    from 'react-hook-form'
import { toast }      from 'react-hot-toast'
import {
  useEmailConfigs, useCreateEmailConfig,
  useDeleteEmailConfig, useToggleEmailConfig, useTestEmailConfig,
} from '@/hooks/useSettings'
import { SettingSection } from '../SettingSection'
import { StatusDot }      from '../StatusDot'
import { Button }         from '@/components/ui/Button'
import { Input }          from '@/components/ui/Input'
import { formatDateTime } from '@/lib/utils'
import { Mail, Plus, Trash2, Plug } from 'lucide-react'

type EmailConfigForm = {
  label: string
  emailAddress: string
  imapHost: string
  password: string
  imapPort: number
  imapTls: boolean
  folderName: string
  pollIntervalMinutes: number
  senderFilter?: string
  subjectFilter?: string
}

export function EmailConfigSection() {
  const { data, isLoading }     = useEmailConfigs()
  const createMutation          = useCreateEmailConfig()
  const deleteMutation          = useDeleteEmailConfig()
  const toggleMutation          = useToggleEmailConfig()
  const testMutation            = useTestEmailConfig()
  const [showCreate, setShowCreate] = useState(false)
  const [confirmId, setConfirmId]   = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  const { register, handleSubmit, reset } = useForm<EmailConfigForm>({
    defaultValues: { imapPort: 993, imapTls: true, folderName: 'INBOX', pollIntervalMinutes: 5 },
  })

  const configs = data?.data || []

  const onSubmit = handleSubmit(async data => {
    await createMutation.mutateAsync(data)
    reset()
    setShowCreate(false)
  })

  const handleTest = async (id: string) => {
    try {
      const res = await testMutation.mutateAsync(id)
      const info = (res.data as any)?.folderInfo
      setTestResults(prev => ({ ...prev, [id]: {
        ok: true,
        message: `${info?.total || 0} messages, ${info?.unseen || 0} unread`,
      }}))
      toast.success('IMAP connected')
    } catch (err: any) {
      setTestResults(prev => ({ ...prev, [id]: { ok: false, message: err?.response?.data?.message } }))
      toast.error('Connection failed')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs tracking-widest uppercase mb-1"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>email</div>
        <h1 className="text-3xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Email Sources
        </h1>
      </div>

      <SettingSection title="IMAP Mailboxes"
        subtitle="Platform polls these inboxes and processes attachments automatically"
        action={
          <Button variant="primary" size="sm" onClick={() => setShowCreate(!showCreate)}>
            <Plus size={12} /> Add Mailbox
          </Button>
        }
      >
        {showCreate && (
          <form onSubmit={onSubmit}
            className="mb-5 p-4 space-y-4 animate-fade-in-up"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Label" placeholder="Gmail Invoices" {...register('label', { required: true })} />
              <Input label="Email Address" placeholder="invoices@co.com" {...register('emailAddress', { required: true })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="IMAP Host" placeholder="imap.gmail.com" {...register('imapHost', { required: true })} />
              <Input label="Password" type="password" {...register('password', { required: true })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Port" type="number" {...register('imapPort', { valueAsNumber: true })} />
              <Input label="Folder" {...register('folderName')} />
              <Input label="Poll (min)" type="number" {...register('pollIntervalMinutes', { valueAsNumber: true })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Sender Filter (optional)" placeholder="billing@supplier.com" {...register('senderFilter')} />
              <Input label="Subject Filter (optional)" placeholder="Invoice" {...register('subjectFilter')} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="md" loading={createMutation.isPending}>Add Mailbox</Button>
              <Button type="button" variant="ghost" size="md" onClick={() => { setShowCreate(false); reset() }}>Cancel</Button>
            </div>
          </form>
        )}

        {configs.length === 0 && !isLoading ? (
          <div className="py-10 text-center">
            <Mail size={24} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              No email sources — add a mailbox to start ingesting attachments
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {configs.map((c: any) => {
              const tr = testResults[c.id]
              return (
                <div key={c.id}
                  className="p-4"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex items-center gap-3 mb-1">
                    <Mail size={14} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{c.label}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {c.emailAddress} · {c.imapHost} · {c.folderName} · every {c.pollIntervalMinutes}m
                        {c.senderFilter && ` · from: ${c.senderFilter}`}
                        {c.lastPolledAt && ` · last: ${formatDateTime(c.lastPolledAt)}`}
                      </div>
                    </div>
                    <StatusDot active={Boolean(c.isActive)} pulse />
                    <Button variant="ghost" size="sm" onClick={() => handleTest(c.id)} loading={testMutation.isPending}>
                      <Plug size={11} /> Test
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleMutation.mutate(c.id)}>
                      {c.isActive ? 'Pause' : 'Resume'}
                    </Button>
                    {confirmId === c.id ? (
                      <>
                        <Button variant="danger" size="sm" onClick={() => { deleteMutation.mutate(c.id); setConfirmId(null) }}>Delete</Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmId(null)}>Cancel</Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setConfirmId(c.id)}><Trash2 size={11} /></Button>
                    )}
                  </div>
                  {tr && (
                    <div className="text-xs mt-2 px-2 py-1.5"
                      style={{
                        background:   tr.ok ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)',
                        border:       `1px solid ${tr.ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        borderRadius: 'var(--radius-sm)',
                        color:        tr.ok ? 'var(--green)' : 'var(--red)',
                        fontFamily:   'var(--font-mono)',
                      }}>
                      {tr.ok ? '✓' : '✗'} {tr.message}
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
