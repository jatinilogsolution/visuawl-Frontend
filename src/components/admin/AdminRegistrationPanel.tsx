import { useState }          from 'react'
import { useForm }           from 'react-hook-form'
import { zodResolver }       from '@hookform/resolvers/zod'
import { z }                 from 'zod'
import { useRegisterTenant, useRegisterAdmin, useAdminPlans, useSuperAdmins, useUpdateAdminPermissions } from '@/hooks/useAdmin'
import { Card, CardHeader }  from '@/components/ui/Card'
import { Button }            from '@/components/ui/Button'
import { Input }             from '@/components/ui/Input'
import { Badge }             from '@/components/ui/Badge'
import { cn }                from '@/lib/utils'
import { Building2, Shield, UserPlus, Check } from 'lucide-react'

const SA_PERMS = [
  { value: 'tenants.view',       label: 'View Tenants',       desc: 'See tenant list and stats' },
  { value: 'tenants.manage',     label: 'Manage Tenants',     desc: 'Suspend, reactivate, delete' },
  { value: 'tenants.create',     label: 'Create Tenants',     desc: 'Register new client tenants' },
  { value: 'plans.view',         label: 'View Plans',         desc: 'See plan catalogue' },
  { value: 'plans.manage',       label: 'Manage Plans',       desc: 'Create, edit, and delete plans' },
  { value: 'plans.assign',       label: 'Assign Plans',       desc: 'Assign plans to tenants' },
  { value: 'wallet.topup',       label: 'Wallet Topup',       desc: 'Credit tenant wallets' },
  { value: 'errors.view',        label: 'View Error Logs',    desc: 'Access full error details' },
  { value: 'system.status',      label: 'System Status',      desc: 'View crons and DB stats' },
  { value: 'users.create_admin', label: 'Create Admins',      desc: 'Register other super admins' },
]

const tenantSchema = z.object({
  companyName:  z.string().min(2),
  email:        z.string().email(),
  firstName:    z.string().min(1),
  lastName:     z.string().min(1),
  password:     z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  planId:       z.string().optional(),
  walletCredit: z.number().optional(),
})

const adminSchema = z.object({
  email:     z.string().email(),
  firstName: z.string().min(1),
  lastName:  z.string().min(1),
  password:  z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
})

export function AdminRegistrationPanel() {
  const [tab, setTab]                = useState<'tenant' | 'admin' | 'permissions'>('tenant')
  const [selectedPerms, setSelectedPerms] = useState<string[]>([])
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null)

  const registerTenant  = useRegisterTenant()
  const registerAdmin   = useRegisterAdmin()
  const updatePerms     = useUpdateAdminPermissions()
  const { data: plansData } = useAdminPlans()
  const { data: adminsData } = useSuperAdmins()

  const plans  = plansData?.data || []
  const admins = adminsData?.data || []

  const tenantForm = useForm({ resolver: zodResolver(tenantSchema) })
  const adminForm  = useForm({ resolver: zodResolver(adminSchema) })

  const onRegisterTenant = tenantForm.handleSubmit(async data => {
    await registerTenant.mutateAsync(data as any)
    tenantForm.reset()
  })

  const onRegisterAdmin = adminForm.handleSubmit(async data => {
    await registerAdmin.mutateAsync({ ...data, permissions: selectedPerms })
    adminForm.reset()
    setSelectedPerms([])
  })

  const togglePerm = (perm: string) => {
    setSelectedPerms(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    )
  }

  const startEditPerms = (admin: any) => {
    setEditingAdminId(admin.id)
    setSelectedPerms(admin.permissions || [])
    setTab('permissions')
  }

  const savePerms = async () => {
    if (!editingAdminId) return
    await updatePerms.mutateAsync({ userId: editingAdminId, permissions: selectedPerms })
    setEditingAdminId(null)
  }

  const TABS = [
    { id: 'tenant',      label: 'Register Client', icon: Building2 },
    { id: 'admin',       label: 'Add Admin',        icon: Shield    },
    { id: 'permissions', label: 'Permissions',      icon: UserPlus  },
  ] as const

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-0" style={{ borderBottom: '1px solid var(--border)' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest',
              'border-b-2 transition-colors -mb-px',
              tab === id
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-(--text-muted) hover:text-(--text-secondary)'
            )}
            style={{ fontFamily: 'var(--font-display)' }}>
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Register tenant */}
      {tab === 'tenant' && (
        <Card padding="md" className="animate-fade-in-up">
          <CardHeader title="Register New Client Tenant"
            subtitle="Creates workspace + admin user + optional plan assignment" />
          <form onSubmit={onRegisterTenant} className="space-y-4">
            <Input label="Company Name"
              error={tenantForm.formState.errors.companyName?.message}
              {...tenantForm.register('companyName')} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name"
                error={tenantForm.formState.errors.firstName?.message}
                {...tenantForm.register('firstName')} />
              <Input label="Last Name"
                error={tenantForm.formState.errors.lastName?.message}
                {...tenantForm.register('lastName')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Admin Email" type="email"
                error={tenantForm.formState.errors.email?.message}
                {...tenantForm.register('email')} />
              <Input label="Admin Password" type="password"
                hint="8+ chars, 1 uppercase, 1 number"
                error={tenantForm.formState.errors.password?.message}
                {...tenantForm.register('password')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest mb-1.5"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                  Assign Plan (optional)
                </div>
                <select
                  {...tenantForm.register('planId')}
                  className="h-10 w-full px-3 text-xs border bg-transparent focus:outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)' }}>
                  <option value="" style={{ background: 'var(--bg-overlay)' }}>No plan (assign later)</option>
                  {plans.map((p: any) => (
                    <option key={p.id} value={p.id} style={{ background: 'var(--bg-overlay)' }}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>
              <Input label="Welcome Wallet Credit (USD)" type="number" step="0.01"
                placeholder="0.00 — optional"
                {...tenantForm.register('walletCredit', { valueAsNumber: true })} />
            </div>
            <Button type="submit" variant="primary" size="md"
              loading={registerTenant.isPending}>
              <Building2 size={13} /> Register Tenant
            </Button>
          </form>
        </Card>
      )}

      {/* Register admin */}
      {tab === 'admin' && (
        <div className="space-y-5 animate-fade-in-up">
          <Card padding="md">
            <CardHeader title="Register Super Admin"
              subtitle="New admin will have only the permissions you select below" />
            <form onSubmit={onRegisterAdmin} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name"
                  error={adminForm.formState.errors.firstName?.message}
                  {...adminForm.register('firstName')} />
                <Input label="Last Name"
                  error={adminForm.formState.errors.lastName?.message}
                  {...adminForm.register('lastName')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Email" type="email"
                  error={adminForm.formState.errors.email?.message}
                  {...adminForm.register('email')} />
                <Input label="Password" type="password"
                  hint="8+ chars, 1 uppercase, 1 number"
                  error={adminForm.formState.errors.password?.message}
                  {...adminForm.register('password')} />
              </div>

              {/* Permission picker */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                  Permissions for new admin ({selectedPerms.length} selected)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SA_PERMS.map(p => (
                    <button key={p.value} type="button"
                      onClick={() => togglePerm(p.value)}
                      className="flex items-start gap-2 p-2.5 text-left border transition-all"
                      style={{
                        background:   selectedPerms.includes(p.value) ? 'var(--amber-glow)' : 'var(--bg-elevated)',
                        borderColor:  selectedPerms.includes(p.value) ? 'var(--amber)' : 'var(--border)',
                        borderRadius: 'var(--radius-sm)',
                      }}>
                      <div
                        className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background:   selectedPerms.includes(p.value) ? 'var(--amber)' : 'var(--bg-overlay)',
                          borderRadius: 'var(--radius-sm)',
                        }}>
                        {selectedPerms.includes(p.value) && <Check size={10} className="text-black" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold"
                          style={{ color: selectedPerms.includes(p.value) ? 'var(--amber)' : 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                          {p.label}
                        </div>
                        <div className="text-xs"
                          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {p.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" variant="primary" size="md"
                loading={registerAdmin.isPending}>
                <Shield size={13} /> Register Admin
              </Button>
            </form>
          </Card>

          {/* Existing admins */}
          {admins.length > 0 && (
            <Card padding="md">
              <CardHeader title="Super Admins" />
              <div className="space-y-2">
                {admins.map((a: any) => (
                  <div key={a.id}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <Shield size={14} style={{ color: a.isMainAdmin ? 'var(--amber)' : 'var(--text-muted)', flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                        {a.isMainAdmin ? 'Main Super Admin' : `Admin ${a.id.slice(0,8)}`}
                        {a.isMainAdmin && (
                          <span className="ml-2 text-xs" style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                            ALL PERMISSIONS
                          </span>
                        )}
                      </div>
                      {!a.isMainAdmin && (
                        <div className="text-xs mt-0.5 flex flex-wrap gap-1">
                          {(a.permissions || []).slice(0, 3).map((p: string) => (
                            <span key={p} className="px-1.5 py-0.5"
                              style={{ background: 'var(--bg-overlay)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                              {p}
                            </span>
                          ))}
                          {(a.permissions || []).length > 3 && (
                            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                              +{a.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <Badge variant={a.isActive ? 'success' : 'error'}>
                      {a.isActive ? 'active' : 'inactive'}
                    </Badge>
                    {!a.isMainAdmin && (
                      <Button variant="ghost" size="sm" onClick={() => startEditPerms(a)}>
                        Edit Perms
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Edit permissions */}
      {tab === 'permissions' && (
        <Card padding="md" className="animate-fade-in-up">
          <CardHeader
            title={editingAdminId ? `Edit Permissions` : 'Select Admin First'}
            subtitle="Click an admin in the Admin tab to edit their permissions"
          />
          {editingAdminId ? (
            <div className="space-y-4">
              <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Admin ID: {editingAdminId.slice(0,16)}… · {selectedPerms.length} permissions selected
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SA_PERMS.map(p => (
                  <button key={p.value} type="button"
                    onClick={() => togglePerm(p.value)}
                    className="flex items-start gap-2 p-2.5 text-left border transition-all"
                    style={{
                      background:   selectedPerms.includes(p.value) ? 'var(--amber-glow)' : 'var(--bg-elevated)',
                      borderColor:  selectedPerms.includes(p.value) ? 'var(--amber)' : 'var(--border)',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                    <div
                      className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background:   selectedPerms.includes(p.value) ? 'var(--amber)' : 'var(--bg-overlay)',
                        borderRadius: 'var(--radius-sm)',
                      }}>
                      {selectedPerms.includes(p.value) && <Check size={10} className="text-black" />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold"
                        style={{ color: selectedPerms.includes(p.value) ? 'var(--amber)' : 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                        {p.label}
                      </div>
                      <div className="text-xs"
                        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {p.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="primary" size="md" loading={updatePerms.isPending} onClick={savePerms}>
                  <Check size={13} /> Save Permissions
                </Button>
                <Button variant="ghost" size="md" onClick={() => { setEditingAdminId(null); setSelectedPerms([]) }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Go to the "Add Admin" tab → click "Edit Perms" on an admin
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
