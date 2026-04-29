import { formatNumber } from '@/lib/utils'
import type { TokenAnalytics } from '@/hooks/useDashboard'

interface ProviderBreakdownProps {
  analytics?: TokenAnalytics
}

const PROVIDER_COLORS: Record<string, string> = {
  groq:    'var(--amber)',
  mistral: 'var(--blue)',
  openai:  'var(--green)',
}

export function ProviderBreakdown({ analytics }: ProviderBreakdownProps) {
  const providers = analytics?.byProvider || []
  const total = providers.reduce((sum, p) => sum + p.tokens, 0)

  if (providers.length === 0) {
    return (
      <div className="py-6 text-center">
        <span className="text-xs tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          NO CALLS YET
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {providers.map(p => {
        const pct    = total > 0 ? Math.round((p.tokens / total) * 100) : 0
        const color  = PROVIDER_COLORS[p.provider] || 'var(--text-secondary)'
        return (
          <div key={p.provider}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span
                  className="text-xs font-semibold uppercase"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
                >
                  {p.provider}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {formatNumber(p.tokens)} tok
                </span>
                <span className="text-xs" style={{ color, fontFamily: 'var(--font-mono)' }}>
                  ${parseFloat(p.costUsd as string).toFixed(4)}
                </span>
              </div>
            </div>
            <div
              className="h-1 overflow-hidden"
              style={{ background: 'var(--bg-elevated)', borderRadius: 1 }}
            >
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        )
      })}

      {/* Grand total */}
      <div
        className="flex items-center justify-between pt-3 mt-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Total
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {formatNumber(total)} tokens
          </span>
          <span className="text-xs font-semibold" style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
            ${(analytics?.grandTotal.totalCostUsd || 0).toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  )
}