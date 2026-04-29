import { Link, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import {
  LayoutDashboard, Upload, FileJson, Settings,
  Wallet, LogOut, ChevronRight, Menu,
  Activity,
  Shield,
  ScanBarcode,
  Sun,
  Moon,
  MonitorCog,
} from 'lucide-react'
import { useTheme } from '../theme-provider'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/upload', icon: Upload, label: 'Upload' },
  { to: '/dashboard/executions', icon: Activity, label: 'Executions' },
  { to: '/dashboard/schemas', icon: FileJson, label: 'Schemas' },
  { to: '/dashboard/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

// const BOTTOM_NAV = [
//   { to: '/dashboard/settings/api-keys', icon: Key, label: 'API Keys' },
//   { to: '/dashboard/settings/email', icon: Mail, label: 'Email Sources' },
//   { to: '/dashboard/settings/team', icon: Users, label: 'Team' },
//   { to: '/dashboard/settings/alerts', icon: Bell, label: 'Alerts' },
// ]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, tenant, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const { theme, setTheme } = useTheme()
  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
      return
    }
    if (theme === 'dark') {
      setTheme('system')
      return
    }
    setTheme('light')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={cn(
          'flex flex-col shrink-0 transition-all duration-200',
          'border-r border-(--border)',
          collapsed ? 'w-14' : 'w-56'
        )}
        style={{ background: 'var(--bg-surface)' }}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center gap-3 border-b border-(--border)',
          collapsed ? 'p-3 justify-center' : 'px-4 py-3'
        )}>
          <div className="w-7 h-7 flex items-center justify-center shrink-0"
            style={{ background: 'var(--amber)', borderRadius: 'var(--radius-sm)' }}>
            <ScanBarcode size={14} className="text-black" />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold tracking-widest uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              VISUAWL
            </span>
          )}
        </div>

        {/* Tenant name */}
        {!collapsed && tenant && (
          <div className="px-4 py-2 border-b border-(--border)">
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {tenant.slug}
            </p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
          {NAV.map(({ to, icon: Icon, label }) => {
            const active = currentPath === to || (to !== '/dashboard' && currentPath.startsWith(to))
            return (
              <Link key={to} to={to}
                className={cn(
                  'flex items-center gap-3 px-2 py-2 text-xs transition-all duration-100',
                  'hover:text-(--text-primary)',
                  active
                    ? 'text-amber-400 bg-amber-500/8 border-r-2 border-amber-500'
                    : 'text-(--text-secondary)',
                  collapsed && 'justify-center px-2'
                )}
                style={{ borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}
              >
                <Icon size={16} className="shrink-0" />
                {!collapsed && <span className="uppercase font-semibold tracking-wider">{label}</span>}
              </Link>
            )
          })}

          {/* Divider */}
          {/* <div className="h-px my-3 mx-1" style={{ background: 'var(--border)' }} />

          {!collapsed && (
            <p className="px-2 pb-1 text-xs tracking-widest uppercase"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Integrations
            </p>
          )}

          {BOTTOM_NAV.map(({ to, icon: Icon, label }) => {
            const active = currentPath.startsWith(to)
            return (
              <Link key={to} to={to}
                className={cn(
                  'flex items-center gap-3 px-2 py-1.5 text-xs transition-all',
                  'hover:text-(--text-primary)',
                  active ? 'text-amber-400' : 'text-(--text-muted)',
                  collapsed && 'justify-center'
                )}
                style={{ borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}
              >
                <Icon size={14} className="shrink-0" />
                {!collapsed && <span className="uppercase font-medium">{label}</span>}
              </Link>
            )
          })} */}
        </nav>

 

          {profile?.role === 'super_admin' && (
            <div className="border-t border-(--border) pt-2 mt-2">
              <Link
                to="/dashboard/admin"
                className={cn(
                  'flex items-center gap-3 px-2 py-2 text-xs transition-all',
                  'hover:text-(--text-primary)',
                  currentPath.startsWith('/dashboard/admin')
                    ? 'text-red-400'
                    : 'text-(--text-muted)',
                  collapsed && 'justify-center'
                )}
                style={{ borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}
              >
                <Shield size={14} className="shrink-0" />
                {!collapsed && <span className="uppercase font-semibold tracking-wider">Admin</span>}
              </Link>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-(--border) p-2 space-y-1">
            {/* User */}
            <div className={cn(
              'flex items-center gap-2 px-2 py-1.5',
              collapsed && 'justify-center'
            )}>
              <div className="w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: 'var(--amber-dim)',
                  color: 'var(--amber)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-mono)',
                }}>
                {getInitials(profile?.firstName, profile?.lastName)}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate" style={{ color: 'var(--text-primary)' }}>
                    {profile?.firstName} {profile?.lastName}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                    {profile?.role?.replace('tenant_', '')}
                  </p>
                </div>
              )}
            </div>

            {/* Collapse toggle */}
            {!collapsed ? (
              <div className="px-2 py-1.5">
                <div className="mb-1 text-[10px] uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Theme
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'light', icon: Sun, label: 'Light' },
                    { id: 'dark', icon: Moon, label: 'Dark' },
                    { id: 'system', icon: MonitorCog, label: 'System' },
                  ].map(({ id, icon: Icon, label }) => {
                    const active = theme === id
                    return (
                      <button
                        key={id}
                        onClick={() => setTheme(id as 'light' | 'dark' | 'system')}
                        className="h-7 px-2 text-[10px] flex items-center justify-center gap-1 transition-colors"
                        style={{
                          borderRadius: 'var(--radius-sm)',
                          border: `1px solid ${active ? 'var(--amber)' : 'var(--border)'}`,
                          color: active ? 'var(--amber)' : 'var(--text-muted)',
                          background: active ? 'var(--amber-glow)' : 'transparent',
                          fontFamily: 'var(--font-mono)',
                        }}
                        title={`Switch to ${label.toLowerCase()} theme`}
                      >
                        <Icon size={12} />
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <button
                onClick={cycleTheme}
                className="w-full flex items-center justify-center px-2 py-1.5 text-xs transition-all"
                style={{ color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)' }}
                title={`Theme: ${theme}. Click to cycle`}
              >
                {theme === 'light' && <Sun size={14} />}
                {theme === 'dark' && <Moon size={14} />}
                {theme === 'system' && <MonitorCog size={14} />}
              </button>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 text-xs transition-all',
                'hover:text-(--text-primary)',
                collapsed && 'justify-center'
              )}
              style={{ color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)' }}
            >
              {collapsed ? <ChevronRight size={14} /> : <><Menu size={14} /><span>Collapse</span></>}
            </button>

            {/* Logout */}
            <button
              onClick={() => logout()}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 text-xs transition-all',
                'hover:text-red-400 text-(--text-muted)',
                collapsed && 'justify-center'
              )}
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <LogOut size={14} />
              {!collapsed && 'Logout'}
            </button>
          </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
