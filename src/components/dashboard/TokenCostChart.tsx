import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, Cell,
} from 'recharts'
import type { TokenAnalytics } from '@/hooks/useDashboard'

interface TokenCostChartProps {
  analytics?: TokenAnalytics
  loading?:   boolean
}

function CostTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="p-3 text-xs"
      style={{
        background:   'var(--bg-overlay)',
        border:       '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        fontFamily:   'var(--font-mono)',
        color:        'var(--text-primary)',
      }}
    >
      <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      <div>${parseFloat(payload[0]?.value || 0).toFixed(6)}</div>
    </div>
  )
}

export function TokenCostChart({ analytics, loading }: TokenCostChartProps) {
  if (loading) {
    return (
      <div
        className="h-32 animate-pulse"
        style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}
      />
    )
  }

  const data = analytics?.byDay?.map(d => ({
    date:    d.date.slice(5),
    cost:    parseFloat(d.costUsd),
    tokens:  d.tokens,
  })) || []

  if (data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center">
        <span className="text-xs tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          NO TOKEN DATA YET
        </span>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={130}>
      <BarChart data={data} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `$${v.toFixed(3)}`}
        />
        <Tooltip content={<CostTooltip />} cursor={{ fill: 'var(--bg-elevated)' }} />
        <Bar dataKey="cost" maxBarSize={24} radius={[2, 2, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === data.length - 1 ? 'var(--amber)' : 'var(--border-light)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}