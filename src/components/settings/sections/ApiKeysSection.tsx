import { useState }        from 'react'
import { useForm }         from 'react-hook-form'
import { toast }           from 'react-hot-toast'
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '@/hooks/useSettings'
import { SettingSection }  from '../SettingSection'
import { Button }          from '@/components/ui/Button'
import { Input }           from '@/components/ui/Input'
import { Badge }           from '@/components/ui/Badge'
import { formatDateTime }  from '@/lib/utils'
import { Key, Copy, Trash2, Plus, Eye, EyeOff } from 'lucide-react'

export function ApiKeysSection() {
  const { data, isLoading }   = useApiKeys()
  const createMutation        = useCreateApiKey()
  const revokeMutation        = useRevokeApiKey()
  const [showCreate, setShowCreate] = useState(false)
  const [newKey, setNewKey]   = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)

  const { register, handleSubmit, reset } = useForm<{
    name: string; expires_at?: string
  }>()

  const keys = data?.data || []

  const onCreate = handleSubmit(async data => {
    const res = await createMutation.mutateAsync(data)
    const raw = (res.data as any).key
    setNewKey(raw)
    reset()
    setShowCreate(false)
  })

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success('Key copied')
  }

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs tracking-widest uppercase mb-1"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>security</div>
        <h1 className="text-3xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          API Keys
        </h1>
      </div>

      {/* New key reveal */}
      {newKey && (
        <div className="mb-6 p-4 animate-fade-in-up"
          style={{
            background:   'var(--amber-glow)',
            border:       '1px solid var(--amber)',
            borderRadius: 'var(--radius-lg)',
          }}>
          <div className="flex items-center gap-2 mb-3">
            <Key size={14} style={{ color: 'var(--amber)' }} />
            <span className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--amber)', fontFamily: 'var(--font-display)' }}>
              ⚠ Copy this key — it won't be shown again
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex-1 px-3 py-2 text-xs overflow-x-auto"
              style={{
                background:   'var(--bg-base)',
                border:       '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontFamily:   'var(--font-mono)',
                color:        showKey ? 'var(--amber)' : 'transparent',
                textShadow:   showKey ? 'none' : '0 0 8px var(--amber)',
                userSelect:   'all',
              }}
            >
              {newKey}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowKey(!showKey)}>
              {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
            </Button>
            <Button variant="primary" size="sm" onClick={() => copyKey(newKey)}>
              <Copy size={13} /> Copy
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setNewKey(null)}>×</Button>
          </div>
        </div>
      )}

      <SettingSection title="API Keys"
        subtitle="Use these keys for n8n workflows and direct API automation"
        action={
          <Button variant="primary" size="sm" onClick={() => setShowCreate(!showCreate)}>
            <Plus size={12} /> New Key
          </Button>
        }
      >
        {/* Create form */}
        {showCreate && (
          <form onSubmit={onCreate}
            className="flex items-end gap-3 mb-5 p-4 animate-fade-in-up"
            style={{
              background:   'var(--bg-elevated)',
              border:       '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}>
            <div className="flex-1">
              <Input label="Key Name" placeholder="n8n Production"
                {...register('name', { required: true })} />
            </div>
            <div className="w-44">
              <Input label="Expires (optional)" type="date"
                {...register('expires_at')} />
            </div>
            <Button type="submit" variant="primary" size="md" loading={createMutation.isPending}>
              Create
            </Button>
            <Button type="button" variant="ghost" size="md" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
          </form>
        )}

        {/* Keys list */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse"
                style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }} />
            ))}
          </div>
        ) : keys.length === 0 ? (
          <div className="py-10 text-center">
            <Key size={24} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              No API keys yet — create one to start automating
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {keys.map((k: any) => (
              <div key={k.id}
                className="flex items-center gap-4 px-4 py-3"
                style={{
                  background:   'var(--bg-elevated)',
                  border:       '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}>
                <Key size={14} style={{ color: k.isActive ? 'var(--amber)' : 'var(--text-muted)', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    {k.name}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {k.prefix ? (k.prefix.endsWith('...') ? k.prefix : `${k.prefix}...`) : '—'} · last used {k.lastUsedAt ? formatDateTime(k.lastUsedAt) : 'never'}
                    {k.expiresAt && ` · expires ${formatDateTime(k.expiresAt)}`}
                  </div>
                </div>
                <Badge variant={k.isActive ? 'success' : 'neutral'}>
                  {k.isActive ? 'active' : 'revoked'}
                </Badge>
                {k.isActive && (
                  confirmId === k.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                        Revoke?
                      </span>
                      <Button variant="danger" size="sm"
                        loading={revokeMutation.isPending}
                        onClick={() => { revokeMutation.mutate(k.id); setConfirmId(null) }}>
                        Yes
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmId(null)}>No</Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setConfirmId(k.id)}>
                      <Trash2 size={12} />
                    </Button>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </SettingSection>
    </div>
  )
}
