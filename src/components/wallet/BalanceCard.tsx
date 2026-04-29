import { cn }           from '@/lib/utils'
import { Wallet, TrendingDown } from 'lucide-react'

interface BalanceCardProps {
  balance:             string | number
  isPayg:              boolean
  planName:            string | null
  pricePerExecution:   number | null
  estimatedExecutions: number | null
  isLowBalance:        boolean
  onTopup?:             () => void
}

export function BalanceCard({
  balance, isPayg, planName, pricePerExecution,
  estimatedExecutions, isLowBalance,
}: BalanceCardProps) {
  const bal = typeof balance === 'string' ? parseFloat(balance) : balance

  return (
    <div
      className={cn(
        'relative p-6 overflow-hidden',
        'border transition-all',
        isLowBalance ? 'border-red-500/30' : 'border-amber-500/20'
      )}
      style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)' }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `radial-gradient(ellipse at top right, ${isLowBalance ? '#ef4444' : '#f59e0b'}, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Wallet size={16} style={{ color: isLowBalance ? 'var(--red)' : 'var(--amber)' }} />
            <span className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
              Wallet Balance
            </span>
          </div>
          {planName && (
            <span className="text-xs px-2 py-0.5"
              style={{
                background:   'var(--amber-glow)',
                border:       '1px solid var(--amber-dim)',
                color:        'var(--amber)',
                fontFamily:   'var(--font-mono)',
                borderRadius: 'var(--radius-sm)',
              }}>
              {planName}
              {isPayg ? ' · PAYG' : ''}
            </span>
          )}
        </div>

        {/* Balance */}
        <div className="mb-6">
          <div
            className="text-6xl font-bold leading-none mb-2"
            style={{
              fontFamily: 'var(--font-display)',
              color:      isLowBalance ? 'var(--red)' : 'var(--amber)',
              letterSpacing: '-0.03em',
            }}
          >
            ${bal.toFixed(4)}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            USD · live balance
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 pt-4"
          style={{ borderTop: '1px solid var(--border)' }}>
          {pricePerExecution != null && (
            <div>
              <div className="text-xs uppercase tracking-widest mb-1"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                Cost / Execution
              </div>
              <div className="text-lg font-bold"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                ${pricePerExecution.toFixed(4)}
              </div>
            </div>
          )}
          {estimatedExecutions != null && (
            <div>
              <div className="text-xs uppercase tracking-widest mb-1"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                Est. Remaining
              </div>
              <div className="text-lg font-bold"
                style={{
                  color:      isLowBalance ? 'var(--red)' : 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}>
                ~{estimatedExecutions.toLocaleString()} exec
              </div>
            </div>
          )}
        </div>

        {/* Low balance warning */}
        {isLowBalance && (
          <div className="mb-4 p-3 text-xs flex items-center gap-2"
            style={{
              background:   'rgba(239,68,68,0.08)',
              border:       '1px solid rgba(239,68,68,0.25)',
              borderRadius: 'var(--radius-md)',
              color:        'var(--red)',
              fontFamily:   'var(--font-mono)',
            }}>
            <TrendingDown size={12} className="shrink-0" />
            Low balance — top up to continue processing documents
          </div>
        )}

        {/* CTA */}
        {/* <Button variant="primary" size="lg" fullWidth onClick={onTopup}>
          <ArrowUpRight size={15} />
          Add Funds
        </Button> */}
      </div>
    </div>
  )
}
