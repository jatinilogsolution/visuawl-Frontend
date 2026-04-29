import { formatNumber } from '@/lib/utils'

interface QuotaWidgetProps {
  used:      number
  limit:     number | null
  remaining: number | null
  isPayg:    boolean
  balance?:  number
  isLow?:    boolean
}

export function QuotaWidget({
  used, limit, remaining, isPayg, balance, isLow,
}: QuotaWidgetProps) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : null

  const barColor =
    pct === null     ? 'var(--amber)' :
    pct >= 90        ? 'var(--red)'   :
    pct >= 70        ? 'var(--yellow)': 'var(--green)'

  return (
    <div
      className="p-5 border"
      style={{
        background:   'var(--bg-surface)',
        border:       '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}
        >
          Execution Quota
        </span>
        <span
          className="text-xs px-2 py-0.5"
          style={{
            color:        isPayg ? 'var(--amber)' : 'var(--text-secondary)',
            fontFamily:   'var(--font-mono)',
            background:   isPayg ? 'var(--amber-glow)' : 'var(--bg-elevated)',
            border:       `1px solid ${isPayg ? 'var(--amber-dim)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {isPayg ? 'PAYG' : 'FIXED'}
        </span>
      </div>

      {isPayg ? (
        /* PAYG — show wallet */
        <div>
          <div
            className="text-3xl font-bold mb-1"
            style={{
              fontFamily: 'var(--font-mono)',
              color: isLow ? 'var(--red)' : 'var(--amber)',
            }}
          >
            ${(balance || 0).toFixed(4)}
          </div>
          <div className="text-xs mb-4" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            wallet balance
          </div>
          {isLow && (
            <div
              className="text-xs p-2 flex items-center gap-2"
              style={{
                color:        'var(--red)',
                background:   'rgba(239,68,68,0.05)',
                border:       '1px solid rgba(239,68,68,0.2)',
                borderRadius: 'var(--radius-sm)',
                fontFamily:   'var(--font-mono)',
              }}
            >
              ⚠ Low balance — top up to continue
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div>
              <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                {formatNumber(used)}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>executions this month</div>
            </div>
          </div>
        </div>
      ) : (
        /* Fixed plan */
        <div>
          <div className="flex items-end justify-between mb-2">
            <div>
              <div
                className="text-3xl font-bold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                {formatNumber(used)}
                <span className="text-lg font-normal mx-1" style={{ color: 'var(--text-muted)' }}>/</span>
                <span style={{ color: 'var(--text-secondary)' }}>{formatNumber(limit || 0)}</span>
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                executions used this month
              </div>
            </div>
            <div
              className="text-2xl font-bold"
              style={{ fontFamily: 'var(--font-mono)', color: barColor }}
            >
              {pct}%
            </div>
          </div>

          {/* Progress bar */}
          <div
            className="relative h-1.5 overflow-hidden my-4"
            style={{ background: 'var(--bg-elevated)', borderRadius: 1 }}
          >
            <div
              className="absolute inset-y-0 left-0 transition-all duration-500"
              style={{ width: `${pct}%`, background: barColor }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {formatNumber(remaining || 0)} remaining
            </div>
            {(pct || 0) >= 80 && (
              <div className="text-xs" style={{ color: barColor, fontFamily: 'var(--font-mono)' }}>
                {pct}% used
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}