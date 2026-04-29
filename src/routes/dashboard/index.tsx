// import { createFileRoute, Link } from '@tanstack/react-router'
// import { useAuthStore }          from '@/store/authStore'
// import {
//   useDashboard,
//   useExecutionStats,
//   useTokenAnalytics,
//   useRecentExecutions,
// } from '@/hooks/useDashboard'
// import { StatCard }              from '@/components/dashboard/StatCard'
// import { QuotaWidget }           from '@/components/dashboard/QuotaWidget'
// import { ActivityFeed }          from '@/components/dashboard/ActivityFeed'
// import { ExecutionChart }        from '@/components/dashboard/ExecutionChart'
// import { TokenCostChart }        from '@/components/dashboard/TokenCostChart'
// import { ProviderBreakdown }     from '@/components/dashboard/ProviderBreakdown'
// import { Button }                from '@/components/ui/Button'
// import { Card, CardHeader }      from '@/components/ui/Card'
// // import { Spinner }               from '@/components/ui/Spinner'
// import {
//   formatNumber, formatMs,
// } from '@/lib/utils'
// import {
//   Upload, Activity, Zap, DollarSign,
//   CheckCircle,
// } from 'lucide-react'

// export const Route = createFileRoute('/dashboard/')({
//   component: DashboardPage,
// })

// function DashboardPage() {
//   const { tenant }          = useAuthStore()
//   const { data: dash }   = useDashboard()
//   const { data: stats, isLoading: statsLoading }  = useExecutionStats()
//   const { data: tokens,isLoading: tokensLoading } = useTokenAnalytics()
//   const { data: recent,isLoading: recentLoading } = useRecentExecutions()

//   const d  = dash?.data
//   const s  = stats?.data
//   const t  = tokens?.data
//   const r  = (recent?.data as any) || []
//   const monthSuccessRate = d?.thisMonth?.executions
//     ? Number(((d.thisMonth.success / d.thisMonth.executions) * 100).toFixed(2))
//     : (s?.successRate ?? 0)

//   const now = new Date()
//   const hourStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

//   return (
//     <div className="p-6 max-w-[1400px] mx-auto">

//       {/* ── Top bar ─────────────────────────────────────────────────────── */}
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <div
//             className="text-xs tracking-widest uppercase mb-1"
//             style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
//           >
//             {tenant?.slug || 'workspace'} · {hourStr}
//           </div>
//           <h1
//             className="text-3xl font-bold"
//             style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
//           >
//             Dashboard
//           </h1>
//         </div>
//         <div className="flex items-center gap-2">
//           <Link to="/dashboard/upload">
//             <Button variant="primary" size="md">
//               <Upload size={14} />
//               Upload
//             </Button>
//           </Link>
//           <Link to="/dashboard/executions">
//             <Button variant="secondary" size="md">
//               <Activity size={14} />
//               Executions
//             </Button>
//           </Link>
//         </div>
//       </div>

//       {/* ── Stat cards row ───────────────────────────────────────────────── */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
//         <StatCard
//           label="Today's Executions"
//           value={formatNumber(d?.today.executions || 0)}
//           sub={`${d?.today.success || 0} success · ${d?.today.failed || 0} failed`}
//           accent
//           icon={<Activity size={14} />}
//         />
//         <StatCard
//           label="This Month"
//           value={formatNumber(d?.thisMonth.executions || 0)}
//           sub={`${monthSuccessRate}% success rate`}
//           icon={<CheckCircle size={14} />}
//         />
//         <StatCard
//           label="Tokens Today"
//           value={formatNumber(d?.today.tokensUsed || 0)}
//           sub={`$${(d?.today.costUsd || 0).toFixed(4)} cost`}
//           mono
//           icon={<Zap size={14} />}
//         />
//         <StatCard
//           label="Month Cost"
//           value={`$${(d?.thisMonth.costUsd || 0).toFixed(4)}`}
//           sub={`${formatNumber(d?.thisMonth.tokensUsed || 0)} tokens`}
//           mono
//           icon={<DollarSign size={14} />}
//         />
//       </div>

//       {/* ── Main grid ────────────────────────────────────────────────────── */}
//       <div className="grid grid-cols-12 gap-4">

//         {/* Execution chart — 8 cols */}
//         <div className="col-span-12 lg:col-span-8">
//           <Card padding="md">
//             <CardHeader
//               title="Execution Volume"
//               subtitle="Success vs failed — last 30 days"
//               action={
//                 <div className="flex items-center gap-3">
//                   <div className="flex items-center gap-1.5">
//                     <div className="w-2 h-2 rounded-full bg-green-400" />
//                     <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>success</span>
//                   </div>
//                   <div className="flex items-center gap-1.5">
//                     <div className="w-2 h-2 rounded-full bg-red-400" />
//                     <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>failed</span>
//                   </div>
//                 </div>
//               }
//             />
//             <ExecutionChart data={s?.byDay || []} loading={statsLoading} />
//           </Card>
//         </div>

//         {/* Quota widget — 4 cols */}
//         <div className="col-span-12 lg:col-span-4">
//           <QuotaWidget
//             used={d?.quota.used || 0}
//             limit={d?.quota.limit ?? null}
//             remaining={d?.quota.remaining ?? null}
//             isPayg={d?.quota.isPayg || false}
//             balance={d?.wallet.balance}
//             isLow={d?.wallet.isLow}
//           />
//         </div>

//         {/* AI Cost chart — 4 cols */}
//         <div className="col-span-12 lg:col-span-4">
//           <Card padding="md">
//             <CardHeader title="Daily AI Cost" subtitle="USD per day" />
//             <TokenCostChart analytics={t} loading={tokensLoading} />
//           </Card>
//         </div>

//         {/* Provider breakdown — 4 cols */}
//         <div className="col-span-12 lg:col-span-4">
//           <Card padding="md">
//             <CardHeader title="Provider Split" subtitle="Token usage by AI provider" />
//             <ProviderBreakdown analytics={t} />
//           </Card>
//         </div>

//         {/* Source breakdown — 4 cols */}
//         <div className="col-span-12 lg:col-span-4">
//           <Card padding="md">
//             <CardHeader title="Input Sources" />
//             {s?.bySource ? (
//               <div className="space-y-2">
//                 {Object.entries(s.bySource).map(([src, count]) => (
//                   <div key={src} className="flex items-center justify-between">
//                     <span
//                       className="text-xs uppercase font-semibold"
//                       style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
//                     >
//                       {src}
//                     </span>
//                     <div className="flex items-center gap-2">
//                       <div
//                         className="h-1"
//                         style={{
//                           width: `${Math.round((count / (s.total || 1)) * 80)}px`,
//                           background: 'var(--border-light)',
//                           borderRadius: 1,
//                         }}
//                       />
//                       <span className="text-xs" style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
//                         {count}
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="py-6 text-center">
//                 <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
//                   NO DATA
//                 </span>
//               </div>
//             )}

//             {/* Processing speed */}
//             {s?.avgProcessingMs ? (
//               <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--border)' }}>
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
//                     Avg Speed
//                   </span>
//                   <span className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
//                     {formatMs(s.avgProcessingMs)}
//                   </span>
//                 </div>
//               </div>
//             ) : null}
//           </Card>
//         </div>

//         {/* Recent activity — 8 cols */}
//         <div className="col-span-12 lg:col-span-8">
//           <Card padding="md">
//             <CardHeader
//               title="Recent Executions"
//               subtitle="Last 8 jobs"
//               action={
//                 <Link to="/dashboard/executions">
//                   <Button variant="ghost" size="sm">
//                     View all →
//                   </Button>
//                 </Link>
//               }
//             />
//             <ActivityFeed
//               executions={r?.data || r || []}
//               loading={recentLoading}
//             />
//           </Card>
//         </div>

//         {/* Month summary — 4 cols */}
//         <div className="col-span-12 lg:col-span-4">
//           <Card padding="md">
//             <CardHeader title="Month Summary" />
//             <div className="space-y-3">
//               {[
//                 {
//                   label: 'Total Executions',
//                   value: formatNumber(d?.thisMonth.executions || 0),
//                   color: 'var(--text-primary)',
//                 },
//                 {
//                   label: 'Successful',
//                   value: formatNumber(d?.thisMonth.success || 0),
//                   color: 'var(--green)',
//                 },
//                 {
//                   label: 'Failed',
//                   value: formatNumber(d?.thisMonth.failed || 0),
//                   color: 'var(--red)',
//                 },
//                 {
//                   label: 'Token Cost',
//                   value: `$${(d?.thisMonth.costUsd || 0).toFixed(4)}`,
//                   color: 'var(--amber)',
//                 },
//                 {
//                   label: 'Tokens Used',
//                   value: formatNumber(d?.thisMonth.tokensUsed || 0),
//                   color: 'var(--text-secondary)',
//                 },
//               ].map(({ label, value, color }) => (
//                 <div
//                   key={label}
//                   className="flex items-center justify-between py-2"
//                   style={{ borderBottom: '1px solid var(--border)' }}
//                 >
//                   <span
//                     className="text-xs uppercase tracking-wider"
//                     style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
//                   >
//                     {label}
//                   </span>
//                   <span
//                     className="text-sm font-bold"
//                     style={{ color, fontFamily: 'var(--font-mono)' }}
//                   >
//                     {value}
//                   </span>
//                 </div>
//               ))}
//             </div>

//             {/* Quick actions */}
//             <div className="mt-5 pt-4 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
//               <div
//                 className="text-xs tracking-widest uppercase mb-3"
//                 style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
//               >
//                 Quick Actions
//               </div>
//               <Link to="/dashboard/upload" className="block">
//                 <Button variant="primary" size="sm" fullWidth>
//                   <Upload size={12} />
//                   New Upload
//                 </Button>
//               </Link>
//               <Link to="/dashboard/executions" className="block">
//                 <Button variant="secondary" size="sm" fullWidth>
//                   <Activity size={12} />
//                   View Executions
//                 </Button>
//               </Link>
//             </div>
//           </Card>
//         </div>

//       </div>
//     </div>
//   )
// }

import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuthStore }          from '@/store/authStore'
import {
  useDashboard,
  useExecutionStats,
  usePageStats,
  useRecentExecutions,
} from '@/hooks/useDashboard'
import { Card, CardHeader }      from '@/components/ui/Card'
import { Button }                from '@/components/ui/Button'
import { Spinner }               from '@/components/ui/Spinner'
// import { formatCurrency, CURRENCY_SYM } from '@/lib/currency'
import { formatNumber, formatDateTime } from '@/lib/utils'
import { ExecutionChart }        from '@/components/dashboard/ExecutionChart'
import { ActivityFeed }          from '@/components/dashboard/ActivityFeed'
import {
  Upload, Activity, FileText,
  AlertTriangle, Wallet,
  BarChart2,
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, Cell,
} from 'recharts'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

// ── Compact stat card ─────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, accent, icon, warning,
}: {
  label:    string
  value:    string | number
  sub?:     string
  accent?:  boolean
  icon:     React.ReactNode
  warning?: boolean
}) {
  return (
    <div
      className="relative p-5 overflow-hidden transition-all hover:border-(--border-light)"
      style={{
        background:   warning
          ? 'rgba(239,68,68,0.05)'
          : accent
          ? 'var(--amber-glow)'
          : 'var(--bg-surface)',
        border: `1px solid ${warning ? 'rgba(239,68,68,0.25)' : accent ? 'var(--amber-dim)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
          {label}
        </span>
        <div style={{ color: warning ? 'var(--red)' : accent ? 'var(--amber)' : 'var(--text-muted)' }}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold leading-none mb-2"
        style={{
          fontFamily: 'var(--font-display)',
          color: warning ? 'var(--red)' : accent ? 'var(--amber)' : 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>
        {value}
      </div>
      {sub && (
        <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {sub}
        </div>
      )}
    </div>
  )
}

// ── Quota bar ─────────────────────────────────────────────────────────────────

function QuotaBar({
  label, used, limit, unit, costDisplay, isPayg, walletDisplay, isLow,
}: any) {
  const pct   = limit ? Math.min(100, Math.round((used / limit) * 100)) : null
  const color =
    pct === null        ? 'var(--amber)' :
    pct >= 90           ? 'var(--red)'   :
    pct >= 70           ? 'var(--yellow)': 'var(--green)'

  return (
    <div className="p-5"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>
            {label}
          </div>
          {costDisplay && (
            <div className="text-xs mt-0.5"
              style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
              {costDisplay} per {unit}
            </div>
          )}
        </div>
        <div className="px-2 py-0.5 text-xs font-bold"
          style={{
            background:   isPayg ? 'var(--amber-glow)' : 'var(--bg-elevated)',
            border:       `1px solid ${isPayg ? 'var(--amber-dim)' : 'var(--border)'}`,
            color:        isPayg ? 'var(--amber)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            fontFamily:   'var(--font-mono)',
          }}>
          {isPayg ? 'PAYG' : 'FIXED'}
        </div>
      </div>

      {isPayg ? (
        <div>
          <div className="text-4xl font-bold mb-1"
            style={{
              fontFamily: 'var(--font-display)',
              color:      isLow ? 'var(--red)' : 'var(--amber)',
            }}>
            {walletDisplay}
          </div>
          <div className="text-xs mb-3"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            wallet balance · deducted per {unit}
          </div>
          {isLow && (
            <div className="flex items-center gap-2 p-2.5 text-xs"
              style={{
                background:   'rgba(239,68,68,0.08)',
                border:       '1px solid rgba(239,68,68,0.25)',
                borderRadius: 'var(--radius-sm)',
                color:        'var(--red)',
                fontFamily:   'var(--font-mono)',
              }}>
              <AlertTriangle size={11} />
              Low balance — top up to continue
            </div>
          )}
          <div className="mt-3 pt-3 flex items-center justify-between"
            style={{ borderTop: '1px solid var(--border)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {formatNumber(used)} {unit}s this month
            </span>
            <Link to="/dashboard/wallet">
              <Button variant="outline" size="sm">
                <Wallet size={11} /> Top Up
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-end justify-between mb-2">
            <div>
              <div className="text-3xl font-bold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                {formatNumber(used)}
                <span className="text-lg font-normal mx-1" style={{ color: 'var(--text-muted)' }}>/</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {formatNumber(limit || 0)}
                </span>
              </div>
              <div className="text-xs mt-0.5"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {unit}s used this month
              </div>
            </div>
            <div className="text-2xl font-bold"
              style={{ fontFamily: 'var(--font-mono)', color }}>
              {pct}%
            </div>
          </div>
          <div className="h-1.5 overflow-hidden my-3"
            style={{ background: 'var(--bg-elevated)', borderRadius: 1 }}>
            <div className="h-full transition-all duration-500"
              style={{ width: `${pct}%`, background: color }} />
          </div>
          <div className="text-xs"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {formatNumber((limit || 0) - used)} {unit}s remaining
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page cost chart ───────────────────────────────────────────────────────────

function PageCostChart({ data }: { data: any[] }) {
  if (!data?.length) return (
    <div className="h-32 flex items-center justify-center">
      <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        NO DATA YET
      </span>
    </div>
  )

  return (
    <ResponsiveContainer width="100%" height={130}>
      <BarChart data={data.map(d => ({ date: d.date.slice(5), pages: d.pages, cost: d.cost }))}
        margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
        <XAxis dataKey="date"
          tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-overlay)', border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: 11,
          }}
          formatter={(val: any, name?: string | number) => [
            name === 'pages' ? `${val} pages` : val,
            name === 'pages' ? 'Pages' : 'Cost',
          ]}
        />
        <Bar dataKey="pages" maxBarSize={20} radius={[2,2,0,0]}>
          {data.map((_: any, i: number) => (
            <Cell key={i}
              fill={i === data.length - 1 ? 'var(--amber)' : 'var(--border-light)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Main dashboard ────────────────────────────────────────────────────────────

function DashboardPage() {
  const { profile, tenant }                    = useAuthStore()
  const { data: dash,  isLoading: dashLoading } = useDashboard()
  const { data: stats, isLoading: statsLoading } = useExecutionStats()
  const { data: pages }                         = usePageStats()
  const { data: recent, isLoading: recentLoading } = useRecentExecutions()

  const d  = dash?.data
  const s  = stats?.data
  const pg = pages?.data
  const r  = (recent?.data as any)?.data || (recent?.data as any) || []

  const now     = new Date()
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

  if (dashLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner size="lg" />
      </div>
    )
  }

  const plan        = d?.plan
  const wallet      = d?.wallet
  const isPageBilling = plan?.billingType === 'page'

  return (
    <div className="p-6 max-w-350 mx-auto">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs tracking-widest uppercase mb-1"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {tenant?.slug || 'workspace'} · {timeStr}
            {d?.currency && (
              <span className="ml-3 px-2 py-0.5 text-xs"
                style={{ background: 'var(--amber-glow)', border: '1px solid var(--amber-dim)', color: 'var(--amber)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}>
                {d.currency.code}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/dashboard/upload">
            <Button variant="primary" size="md">
              <Upload size={14} /> Upload
            </Button>
          </Link>
          <Link to="/dashboard/executions">
            <Button variant="secondary" size="md">
              <Activity size={14} /> Executions
            </Button>
          </Link>
        </div>
      </div>

      {/* ── KPI row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
        <KpiCard
          label="Today's Jobs"
          value={formatNumber(d?.today.executions || 0)}
          sub={`${d?.today.success || 0} success · ${d?.today.failed || 0} failed`}
          accent
          icon={<Activity size={14} />}
        />
        <KpiCard
          label="This Month"
          value={formatNumber(d?.thisMonth.executions || 0)}
          sub={`${formatNumber(d?.thisMonth.pagesProcessed || 0)} pages processed`}
          icon={<FileText size={14} />}
        />
        <KpiCard
          label="Month Cost"
          value={d?.thisMonth.costDisplay || '—'}
          sub="page processing cost"
          icon={<BarChart2 size={14} />}
        />
        <KpiCard
          label="Wallet Balance"
          value={wallet?.balanceDisplay || '—'}
          sub={wallet?.isLow ? 'Low — top up now' : 'available balance'}
          warning={wallet?.isLow}
          icon={<Wallet size={14} />}
        />
      </div>

      {/* ── Main grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-5">

        {/* Execution chart — 8 cols */}
        <div className="col-span-12 lg:col-span-8">
          <Card padding="md">
            <CardHeader title="Execution Volume"
              subtitle="Success vs failed — last 30 days"
              action={
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>success</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>failed</span>
                  </div>
                </div>
              }
            />
            <ExecutionChart data={s?.byDay || []} loading={statsLoading} />
          </Card>
        </div>

        {/* Quota widget — 4 cols */}
        <div className="col-span-12 lg:col-span-4">
          {plan ? (
            <QuotaBar
              label={isPageBilling ? 'Page Quota' : 'Execution Quota'}
              used={isPageBilling ? (plan.pagesUsed || 0) : (plan.executionsUsed || 0)}
              limit={isPageBilling ? plan.pagesPerMonth : plan.executionLimit}
              unit={isPageBilling ? 'page' : 'execution'}
              costDisplay={isPageBilling ? plan.costPerPageDisplay : null}
              isPayg={plan.isPayg}
              walletDisplay={wallet?.balanceDisplay}
              isLow={wallet?.isLow}
            />
          ) : (
            <div className="p-5"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>
                No Plan Active
              </div>
              <div className="text-xs mb-4"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Contact your administrator to assign a plan
              </div>
            </div>
          )}
        </div>

        {/* Page usage chart — 5 cols */}
        <div className="col-span-12 lg:col-span-5">
          <Card padding="md">
            <CardHeader title="Daily Pages Processed"
              subtitle={`Billed in ${d?.currency?.code || 'INR'}`} />
            <PageCostChart data={pg?.byDay || []} />
          </Card>
        </div>

        {/* Month summary — 3 cols */}
        <div className="col-span-12 lg:col-span-3">
          <Card padding="md">
            <CardHeader title="Month Summary" />
            <div className="space-y-3">
              {[
                {
                  label: 'Executions',
                  value: formatNumber(d?.thisMonth.executions || 0),
                  color: 'var(--text-primary)',
                },
                {
                  label: 'Success',
                  value: formatNumber(d?.thisMonth.success || 0),
                  color: 'var(--green)',
                },
                {
                  label: 'Failed',
                  value: formatNumber(d?.thisMonth.failed || 0),
                  color: 'var(--red)',
                },
                {
                  label: 'Pages Processed',
                  value: formatNumber(d?.thisMonth.pagesProcessed || 0),
                  color: 'var(--amber)',
                },
                {
                  label: 'Processing Cost',
                  value: d?.thisMonth.costDisplay || '—',
                  color: 'var(--amber)',
                },
              ].map(({ label, value, color }) => (
                <div key={label}
                  className="flex items-center justify-between py-2"
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-xs uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {label}
                  </span>
                  <span className="text-sm font-bold"
                    style={{ color, fontFamily: 'var(--font-mono)' }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Plan info */}
            {plan && (
              <div className="mt-4 p-3"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div className="text-xs font-bold mb-1"
                  style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                  {plan.name}
                </div>
                <div className="text-xs"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {plan.billingType === 'page'
                    ? `${plan.costPerPageDisplay}/page`
                    : plan.isPayg ? 'Pay as you go' : 'Fixed monthly quota'
                  }
                </div>
                {plan.periodEnd && (
                  <div className="text-xs mt-0.5"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Resets: {formatDateTime(plan.periodEnd)}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Recent activity — 4 cols */}
        <div className="col-span-12 lg:col-span-4">
          <Card padding="md">
            <CardHeader title="Recent Executions"
              action={
                <Link to="/dashboard/executions">
                  <Button variant="ghost" size="sm">View all →</Button>
                </Link>
              }
            />
            <ActivityFeed
              executions={Array.isArray(r) ? r : []}
              loading={recentLoading}
            />
          </Card>
        </div>

        {/* Quick actions */}
        <div className="col-span-12 lg:col-span-4">
          <Card padding="md">
            <CardHeader title="Quick Actions" />
            <div className="space-y-2">
              <Link to="/dashboard/upload" className="block">
                <Button variant="primary" size="md" fullWidth>
                  <Upload size={13} /> Upload Document
                </Button>
              </Link>
              <Link to="/dashboard/executions" className="block">
                <Button variant="secondary" size="md" fullWidth>
                  <Activity size={13} /> View Executions
                </Button>
              </Link>
              <Link to="/dashboard/wallet" className="block">
                <Button variant="secondary" size="md" fullWidth>
                  <Wallet size={13} /> Wallet &amp; Billing
                </Button>
              </Link>
              <Link to="/dashboard/schemas" className="block">
                <Button variant="ghost" size="md" fullWidth>
                  <FileText size={13} /> Manage Schemas
                </Button>
              </Link>
            </div>

            {/* Source breakdown */}
            {s?.bySource && Object.keys(s.bySource).length > 0 && (
              <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                  By Source
                </div>
                {Object.entries(s.bySource).map(([src, count]) => (
                  <div key={src}
                    className="flex items-center justify-between py-1.5"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="text-xs uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {src}
                    </span>
                    <span className="text-xs font-bold"
                      style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                      {count as number}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  )
}
