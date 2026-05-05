
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getAccessToken } from '@/lib/api'
import { SystemStatusPanel } from '@/components/admin/SystemStatusPanel'
import { TenantTable } from '@/components/admin/TenantTable'
import { PlanUsagePanel } from '@/components/admin/PlanUsagePanel'
import { PlanBuilderPanel } from '@/components/admin/PlanBuilderPanel'
import { ErrorLogPanel } from '@/components/admin/ErrorLogPanel'
import { AdminRegistrationPanel } from '@/components/admin/AdminRegistrationPanel'
import { TenantIntelligencePanel } from '@/components/admin/TenantIntelligencePanel'
import { useMyPermissions } from '@/hooks/useAdmin'
import { cn } from '@/lib/utils'
import {
  Monitor, Building2, Layers, AlertTriangle,
  UserPlus, BarChart2,
  Lock,
  HardDrive,
} from 'lucide-react'
import { DecryptDashboard } from '@/components/admin/DecryptDashboard'
import { StorageDashboard } from '@/components/admin/StorageDashboard'

export const Route = createFileRoute('/dashboard/admin')({
  beforeLoad: () => {
    if (!getAccessToken()) throw redirect({ to: '/login' })
  },
  component: AdminPage,
})
 
const ALL_TABS = [
  { id: 'status',    label: 'System',       icon: Monitor,       perm: 'system.status'  },
  { id: 'tenants',   label: 'Tenants',      icon: Building2,     perm: 'tenants.view'   },
  { id: 'plans',     label: 'Plan Builder', icon: Layers,        perm: 'plans.manage'   },
  { id: 'plan_usage',label: 'Usage Report', icon: BarChart2,     perm: 'plans.view'     },
  { id: 'errors',    label: 'Error Logs',   icon: AlertTriangle, perm: 'errors.view'    },
  { id: 'decrypt',   label: 'Decrypt',      icon: Lock,          perm: 'tenants.view'   },
  { id: 'storage',   label: 'Storage',      icon: HardDrive,     perm: 'system.status'  },
  { id: 'register',  label: 'Register',     icon: UserPlus,      perm: 'tenants.create' },
] as const


type TabId = typeof ALL_TABS[number]['id']

function AdminPage() {
  const { profile } = useAuthStore()
  const [tab, setTab] = useState<TabId>('status')
  const [viewingTenant, setViewingTenant] = useState<{ id: string; slug: string } | null>(null)
  const { data: permsData } = useMyPermissions()
  const myPerms: string[] = permsData?.data?.permissions || []
  // const isMainAdmin             = profile?.role === 'super_admin'
  const [decryptTenant, setDecryptTenant] = useState<{ id: string; slug: string } | null>(null)

  if (profile?.role !== 'super_admin') {
    return (
      <div className="p-8 text-center">
        <div className="text-sm" style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
          ⛔ Super admin access required
        </div>
      </div>
    )
  }

  const visibleTabs = ALL_TABS.filter(t =>
    // Main admin (no perm row) sees everything
    myPerms.length === 0 ||
    myPerms.includes('*') ||
    myPerms.includes(t.perm)
  )

  return (
    <div className="p-6 max-w-350 mx-auto">

      {/* Tenant intelligence panel (slide-over) */}
      {viewingTenant && (
        <TenantIntelligencePanel
          tenantId={viewingTenant.id}
          tenantSlug={viewingTenant.slug}
          onClose={() => setViewingTenant(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs tracking-widest uppercase mb-1"
            style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
            super admin
          </div>
          <h1 className="text-3xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Admin Panel
          </h1>
        </div>
        <div
          className="px-3 py-1 text-xs font-bold uppercase tracking-widest"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: 'var(--red)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {myPerms.length === 0 ? 'FULL ACCESS' : `${myPerms.length} PERMISSIONS`}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 
       mb-6 overflow-x-auto overflow-y-hidden
      "
        style={{ borderBottom: '1px solid var(--border)' }}>
        {visibleTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-widest whitespace-nowrap',
              'border-b-2 transition-colors -mb-px',
              tab === id
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-(--text-muted) hover:text-(--text-secondary)'
            )}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="animate-fade-in-up">
        {tab === 'status' && <SystemStatusPanel />}
        {tab === 'tenants' && (
          <TenantTable
            onViewIntelligence={(id, slug) => setViewingTenant({ id, slug })}
            onViewDecrypt={(id, slug) => {
              setDecryptTenant({ id, slug })
              setTab('decrypt')
            }}
          />
        )}
        {tab === 'plans' && <PlanBuilderPanel />}
        {tab === 'plan_usage' && <PlanUsagePanel />}
        {tab === 'errors' && <ErrorLogPanel />}
        {tab === 'register' && <AdminRegistrationPanel />}
        {tab === 'decrypt' && (
          <DecryptDashboard
            tenantId={decryptTenant?.id}
            tenantSlug={decryptTenant?.slug}
          />
        )}
        {tab === 'storage' && <StorageDashboard />
        
        
        }
      </div>
    </div>
  )
}
