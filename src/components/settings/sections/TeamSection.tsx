import { useState }   from 'react'
import { useForm }    from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z }          from 'zod'
import { useAuthStore } from '@/store/authStore'
import {
  useTeamMembers, useInvitations,
  useInviteUser, useRevokeInvitation,
  useUpdateUser, useRemoveUser,
} from '@/hooks/useSettings'
import { SettingSection } from '../SettingSection'
import { Button }         from '@/components/ui/Button'
import { Input }          from '@/components/ui/Input'
import { Badge }          from '@/components/ui/Badge'
import { formatDateTime, getInitials } from '@/lib/utils'
import { UserPlus, Trash2, Shield } from 'lucide-react'

const inviteSchema = z.object({
  email: z.string().email('Valid email required'),
  role:  z.enum(['tenant_admin', 'tenant_user']),
})

export function TeamSection() {
  const { profile }             = useAuthStore()
  const { data: usersData }     = useTeamMembers()
  const { data: inviteData }    = useInvitations()
  const inviteMutation          = useInviteUser()
  const revokeMutation          = useRevokeInvitation()
  const updateUserMutation      = useUpdateUser()
  const removeUserMutation      = useRemoveUser()
  const [showInvite, setShowInvite] = useState(false)
  const [confirmId, setConfirmId]   = useState<string | null>(null)

  const users       = usersData?.data || []
  const invitations = inviteData?.data || []

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'tenant_user' },
  })

  const onInvite = handleSubmit(async data => {
    await inviteMutation.mutateAsync(data as any)
    reset()
    setShowInvite(false)
  })

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs tracking-widest uppercase mb-1"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>team</div>
        <h1 className="text-3xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Team
        </h1>
      </div>

      {/* Invite */}
      <SettingSection title="Team Members"
        action={
          <Button variant="primary" size="sm" onClick={() => setShowInvite(!showInvite)}>
            <UserPlus size={12} /> Invite
          </Button>
        }
      >
        {showInvite && (
          <form onSubmit={onInvite}
            className="flex items-end gap-3 mb-5 p-4 animate-fade-in-up"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex-1">
              <Input label="Email Address" placeholder="colleague@company.com"
                error={errors.email?.message}
                {...register('email')} />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>Role</div>
              <select {...register('role')}
                className="h-10 px-3 text-xs border bg-transparent focus:outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)' }}>
                <option value="tenant_user"  style={{ background: 'var(--bg-overlay)' }}>User</option>
                <option value="tenant_admin" style={{ background: 'var(--bg-overlay)' }}>Admin</option>
              </select>
            </div>
            <Button type="submit" variant="primary" size="md" loading={inviteMutation.isPending}>
              Send Invite
            </Button>
            <Button type="button" variant="ghost" size="md" onClick={() => setShowInvite(false)}>
              Cancel
            </Button>
          </form>
        )}

        {/* Members list */}
        <div className="space-y-2 mb-6">
          {users.map((u: any) => (
            <div key={u.id}
              className="flex items-center gap-3 px-4 py-3"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div
                className="w-8 h-8 flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: 'var(--amber-dim)', color: 'var(--amber)', fontFamily: 'var(--font-mono)', borderRadius: 'var(--radius-sm)' }}>
                {getInitials(u.firstName, u.lastName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                  {u.firstName} {u.lastName}
                  {u.id === profile?.id && (
                    <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>(you)</span>
                  )}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {u.email} · last login {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'never'}
                </div>
              </div>
              <Badge variant={u.role === 'tenant_admin' ? 'amber' : 'neutral'}>
                <Shield size={9} className="mr-1" />
                {u.role.replace('tenant_', '')}
              </Badge>
              <Badge variant={u.isActive ? 'success' : 'error'}>
                {u.isActive ? 'active' : 'inactive'}
              </Badge>
              {u.id !== profile?.id && (
                <>
                  <select
                    value={u.role}
                    onChange={e => updateUserMutation.mutate({ id: u.id, role: e.target.value })}
                    className="h-7 px-2 text-xs border bg-transparent"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}>
                    <option value="tenant_user"  style={{ background: 'var(--bg-overlay)' }}>User</option>
                    <option value="tenant_admin" style={{ background: 'var(--bg-overlay)' }}>Admin</option>
                  </select>
                  {confirmId === u.id ? (
                    <>
                      <Button variant="danger" size="sm" onClick={() => { removeUserMutation.mutate(u.id); setConfirmId(null) }}>Remove</Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmId(null)}>Cancel</Button>
                    </>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setConfirmId(u.id)}>
                      <Trash2 size={11} />
                    </Button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Pending invitations */}
        {invitations.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
              Pending Invitations ({invitations.length})
            </div>
            <div className="space-y-2">
              {invitations.map((inv: any) => (
                <div key={inv.id}
                  className="flex items-center gap-3 px-4 py-2.5"
                  style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {inv.email}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {inv.role.replace('tenant_', '')} · expires {formatDateTime(inv.expiresAt)}
                    </div>
                  </div>
                  <Badge variant="warning">pending</Badge>
                  <Button variant="ghost" size="sm" onClick={() => revokeMutation.mutate(inv.id)}>
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </SettingSection>
    </div>
  )
}