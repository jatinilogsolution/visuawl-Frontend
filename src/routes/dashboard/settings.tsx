import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Key, Globe, Mail, Bell, Users,
  Trash2, Building2, User,
} from 'lucide-react'
import { ProfileSection } from '@/components/settings/sections/ProfileSection'
import { CompanySection } from '@/components/settings/sections/CompanySection'
import { TeamSection } from '@/components/settings/sections/TeamSection'
import { ApiKeysSection } from '@/components/settings/sections/ApiKeysSection'
import { SourcesSection } from '@/components/settings/sections/SourcesSection'
import { DestinationsSection } from '@/components/settings/sections/DestinationsSection'
import { EmailConfigSection } from '@/components/settings/sections/EmailConfigSection'
import { AlertsSection } from '@/components/settings/sections/AlertsSection'
import { DeletionSection } from '@/components/settings/sections/DeletionSection'


export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsPage,
})

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User, component: ProfileSection },
  { id: 'company', label: 'Company', icon: Building2, component: CompanySection },
  { id: 'team', label: 'Team', icon: Users, component: TeamSection },
  { id: 'apikeys', label: 'API Keys', icon: Key, component: ApiKeysSection },
  { id: 'sources', label: 'Input Sources', icon: Globe, component: SourcesSection },
  { id: 'destinations', label: 'Destinations', icon: Globe, component: DestinationsSection },
  { id: 'email', label: 'Email Sources', icon: Mail, component: EmailConfigSection },
  { id: 'alerts', label: 'Alert Rules', icon: Bell, component: AlertsSection },
  { id: 'deletion', label: 'Data Retention', icon: Trash2, component: DeletionSection },
] as const

type SectionId = typeof SECTIONS[number]['id']

function SettingsPage() {
  const [active, setActive] = useState<SectionId>('profile')
  const Section = SECTIONS.find(s => s.id === active)?.component || ProfileSection

  return (
    <div className="flex h-full">
      {/* ── Sidebar nav ───────────────────────────────────────────── */}
      <div
        className="w-48 shrink-0 border-r py-6 px-3"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="text-xs font-bold uppercase tracking-widest mb-4 px-2"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
          Settings
        </div>
        <nav className="space-y-0.5">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-2 py-2 text-xs transition-all',
                'font-semibold uppercase tracking-wider text-left',
                active === id
                  ? 'text-amber-400 bg-amber-500/8 border-l-2 border-amber-500'
                  : 'text-(--text-muted) hover:text-(--text-secondary) hover:bg-(--bg-elevated)'
              )}
              style={{ borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}
            >
              <Icon size={13} className="shrink-0" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto">
          <Section />
        </div>
      </div>
    </div>
  )
}
