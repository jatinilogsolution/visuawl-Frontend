import { formatDateTime } from '@/lib/utils'
import { formatCurrency } from '@/lib/currency'
import { ArrowUpRight, ArrowDownLeft, RotateCcw, Zap } from 'lucide-react'

interface TransactionListProps {
  transactions: any[]
  loading?:     boolean
}

const REF_ICONS: Record<string, any> = {
  topup:       ArrowUpRight,
  execution:   Zap,
  refund:      RotateCcw,
  adjustment:  ArrowUpRight,
}

export function TransactionList({ transactions, loading }: TransactionListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 animate-pulse"
            style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }} />
        ))}
      </div>
    )
  }

  if (!transactions.length) {
    return (
      <div className="py-12 text-center">
        <div className="text-xs tracking-widest uppercase"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          No transactions yet
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {transactions.map((tx: any) => {
        const isCredit = tx.type === 'credit'
        const Icon     = REF_ICONS[tx.referenceType] || (isCredit ? ArrowUpRight : ArrowDownLeft)
        return (
          <div key={tx.id}
            className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-[var(--bg-elevated)]"
            style={{ borderRadius: 'var(--radius-sm)' }}>
            {/* Icon */}
            <div
              className="w-8 h-8 flex items-center justify-center flex-shrink-0"
              style={{
                background:   isCredit ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <Icon size={14} style={{ color: isCredit ? 'var(--green)' : 'var(--red)' }} />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {tx.referenceType}
                {tx.referenceId && (
                  <span style={{ color: 'var(--text-muted)' }}> · {tx.referenceId.slice(0, 8)}…</span>
                )}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {tx.note || formatDateTime(tx.createdAt)}
              </div>
            </div>

            {/* Amount */}
            <div className="text-right flex-shrink-0">
              <div
                className="text-sm font-bold"
                style={{
                  color:      isCredit ? 'var(--green)' : 'var(--red)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {isCredit ? '+' : '-'}{formatCurrency(parseFloat(tx.amount))}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                bal: {formatCurrency(parseFloat(tx.balanceAfter))}
              </div>
            </div>

            {/* Date */}
            <div className="text-xs shrink-0"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: 110 }}>
              {formatDateTime(tx.createdAt)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
