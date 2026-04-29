import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import type { ExecutionStats } from '@/hooks/useDashboard'

interface ExecutionChartProps {
  data:     ExecutionStats['byDay']
  loading?: boolean
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="p-3 text-xs space-y-1"
      style={{
        background:   'var(--bg-overlay)',
        border:       '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        fontFamily:   'var(--font-mono)',
        color:        'var(--text-primary)',
        boxShadow:    '0 8px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span style={{ color: 'var(--text-secondary)' }}>{p.dataKey}</span>
          </div>
          <span style={{ color: 'var(--text-primary)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export function ExecutionChart({ data, loading }: ExecutionChartProps) {
  if (loading) {
    return (
      <div
        className="h-48 animate-pulse"
        style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}
      />
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <span className="text-xs tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          NO DATA YET
        </span>
      </div>
    )
  }

  const formatted = data.map(d => ({
    date:    d.date.slice(5),   // MM-DD
    total:   d.total,
    success: d.success,
    failed:  d.failed,
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />

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
          allowDecimals={false}
        />

        <Tooltip content={<CustomTooltip />} />

        <Area
          type="monotone"
          dataKey="success"
          stroke="#22c55e"
          strokeWidth={1.5}
          fill="url(#successGrad)"
          dot={false}
          activeDot={{ r: 3, fill: '#22c55e' }}
        />

        <Area
          type="monotone"
          dataKey="failed"
          stroke="#ef4444"
          strokeWidth={1.5}
          fill="url(#failGrad)"
          dot={false}
          activeDot={{ r: 3, fill: '#ef4444' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}