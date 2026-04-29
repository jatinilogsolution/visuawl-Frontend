import { createFileRoute }          from '@tanstack/react-router'
import { useState }                  from 'react'
import { useForm }                   from 'react-hook-form'
import { zodResolver }               from '@hookform/resolvers/zod'
import { z }                         from 'zod'
import { toast }                     from 'react-hot-toast'
import {
  useWallet, useTransactions, useTopupHistory,
} from '@/hooks/useWallet'
import { Card, CardHeader }          from '@/components/ui/Card'
import { Button }                    from '@/components/ui/Button'
import { Input }                     from '@/components/ui/Input'
import { Badge }                     from '@/components/ui/Badge'
import { Pagination }                from '@/components/executions/Pagination'
import { formatDateTime, formatNumber } from '@/lib/utils'
import { formatCurrency, CURRENCY, CURRENCY_SYM } from '@/lib/currency'
import { api, extractError }         from '@/lib/api'
import { cn }                        from '@/lib/utils'
import {
  Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw,
  CreditCard, TrendingDown, CheckCircle, X, Clock,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/wallet')({
  component: WalletPage,
})

// ── Quick amounts in primary currency ─────────────────────────────────────────
const QUICK_AMOUNTS =
  CURRENCY === 'INR'
    ? [100, 250, 500, 1000, 2000, 5000]
    : [1,   5,   10,  25,   50,   100]

// ── Top-up schema ─────────────────────────────────────────────────────────────
const topupSchema = z.object({
  amount: z.number()
    .min(CURRENCY === 'INR' ? 10 : 1, `Minimum ${CURRENCY === 'INR' ? '₹10' : '$1'}`)
    .max(CURRENCY === 'INR' ? 500000 : 10000),
})

// ── Topup Modal ───────────────────────────────────────────────────────────────

function TopupModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep]     = useState<'amount' | 'pay' | 'done'>('amount')
  const [order, setOrder]   = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [verifyData, setVerifyData] = useState({ paymentId: '', signature: '' })

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(topupSchema),
    defaultValues: { amount: CURRENCY === 'INR' ? 500 : 10 },
  })

  const amount = watch('amount')

  const onCreateOrder = handleSubmit(async data => {
    setLoading(true)
    try {
      const res = await api.post('/wallet/topup/create', { amount: data.amount })
      setOrder(res.data.data)
      setStep('pay')
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setLoading(false)
    }
  })

  const onVerify = async () => {
    if (!verifyData.paymentId) {
      toast.error('Enter the payment ID from Razorpay')
      return
    }
    setLoading(true)
    try {
      await api.post('/wallet/topup/verify', {
        order_id:           order.orderId,
        gateway_order_id:   order.gatewayOrderId,
        gateway_payment_id: verifyData.paymentId,
        gateway_signature:  verifyData.signature,
      })
      setStep('done')
      onSuccess()
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-md animate-fade-in-up"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="text-xs uppercase tracking-widest"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              wallet · {CURRENCY}
            </div>
            <h2 className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Add Funds
            </h2>
          </div>
          <button onClick={onClose}
            className="transition-colors hover:text-amber-400"
            style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6">

          {/* STEP 1 — amount */}
          {step === 'amount' && (
            <div className="space-y-5">
              {/* Quick select */}
              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                  Quick Select ({CURRENCY})
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_AMOUNTS.map(a => (
                    <button key={a} type="button"
                      onClick={() => setValue('amount', a)}
                      className="py-2.5 text-sm font-bold border transition-all"
                      style={{
                        background:   amount === a ? 'var(--amber-glow)' : 'var(--bg-elevated)',
                        borderColor:  amount === a ? 'var(--amber)' : 'var(--border)',
                        color:        amount === a ? 'var(--amber)' : 'var(--text-secondary)',
                        borderRadius: 'var(--radius-md)',
                        fontFamily:   'var(--font-mono)',
                      }}>
                      {CURRENCY_SYM}{formatNumber(a)}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={onCreateOrder} className="space-y-4">
                <Input
                  label={`Custom Amount (${CURRENCY})`}
                  type="number"
                  step="1"
                  min={CURRENCY === 'INR' ? '10' : '1'}
                  error={errors.amount?.message}
                  {...register('amount', { valueAsNumber: true })}
                />

                {/* Summary */}
                <div className="p-4"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Wallet credit
                    </span>
                    <span style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px' }}>
                      {CURRENCY_SYM}{formatNumber(amount || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Payment via
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      Razorpay ({CURRENCY})
                    </span>
                  </div>
                  <div className="mt-2 pt-2 text-xs"
                    style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Amount will be credited to your wallet immediately after payment verification.
                  </div>
                </div>

                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                  <CreditCard size={14} />
                  Proceed to Pay {CURRENCY_SYM}{formatNumber(amount || 0)}
                </Button>
              </form>
            </div>
          )}

          {/* STEP 2 — payment */}
          {step === 'pay' && order && (
            <div className="space-y-4">
              <div className="p-4"
                style={{ background: 'var(--amber-glow)', border: '1px solid var(--amber-dim)', borderRadius: 'var(--radius-md)' }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: 'var(--amber)', fontFamily: 'var(--font-display)' }}>
                  Razorpay Order Ready
                </div>
                {[
                  { label: 'Amount',       value: order.amountDisplay },
                  { label: 'Currency',     value: order.currency       },
                  { label: 'Razorpay ID',  value: order.gatewayOrderId },
                  { label: 'Platform ID',  value: order.orderId?.slice(0,16) + '…' },
                ].map(({ label, value }) => (
                  <div key={label}
                    className="flex items-center justify-between py-1">
                    <span className="text-xs"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {label}
                    </span>
                    <span className="text-xs font-semibold"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* In production the Razorpay checkout opens here */}
              <div className="p-3 text-xs"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                💡 In production, Razorpay checkout widget opens automatically.
                After payment, enter your payment_id and signature below.
              </div>

              <div className="space-y-3">
                <input
                  placeholder="Razorpay Payment ID (pay_...)"
                  value={verifyData.paymentId}
                  onChange={e => setVerifyData(p => ({ ...p, paymentId: e.target.value }))}
                  className="w-full h-9 px-3 text-xs border bg-transparent focus:outline-none focus:border-amber-500"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)' }}
                />
                <input
                  placeholder="Razorpay Signature (HMAC)"
                  value={verifyData.signature}
                  onChange={e => setVerifyData(p => ({ ...p, signature: e.target.value }))}
                  className="w-full h-9 px-3 text-xs border bg-transparent focus:outline-none focus:border-amber-500"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="primary" size="lg" fullWidth
                  onClick={onVerify} loading={loading}>
                  Verify &amp; Credit Wallet
                </Button>
                <Button variant="ghost" size="lg" onClick={() => setStep('amount')}>
                  ← Back
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 — done */}
          {step === 'done' && (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 mx-auto flex items-center justify-center"
                style={{ background: 'var(--amber-glow)', border: '1px solid var(--amber)', borderRadius: 'var(--radius-lg)' }}>
                <CheckCircle size={32} style={{ color: 'var(--amber)' }} />
              </div>
              <div>
                <div className="text-2xl font-bold mb-1"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                  Wallet Credited!
                </div>
                <div className="text-xs"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Your balance has been updated · {CURRENCY}
                </div>
              </div>
              <Button variant="primary" size="lg" fullWidth onClick={onClose}>
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Transaction row ───────────────────────────────────────────────────────────

function TxRow({ tx }: { tx: any }) {
  const isCredit = tx.type === 'credit'
  // tx.amount is stored in USD, display in primary currency
  const amountDisplay = tx.amount_display || formatCurrency(
    isCredit
      ? parseFloat(tx.amount) * (tx.fx_rate || 83.5)
      : parseFloat(tx.amount) * (tx.fx_rate || 83.5)
  )

  return (
    <div className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-(--bg-elevated)"
      style={{ borderRadius: 'var(--radius-sm)' }}>
      <div className="w-8 h-8 flex items-center justify-center shrink-0"
        style={{
          background:   isCredit ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          borderRadius: 'var(--radius-sm)',
        }}>
        {isCredit
          ? <ArrowUpRight size={14} style={{ color: 'var(--green)' }} />
          : <ArrowDownLeft size={14} style={{ color: 'var(--red)' }} />
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
          {tx.referenceType || tx.reference_type}
          {(tx.referenceId || tx.reference_id) && (
            <span style={{ color: 'var(--text-muted)' }}>
              {' · '}{(tx.referenceId || tx.reference_id).slice(0,8)}…
            </span>
          )}
        </div>
        <div className="text-xs"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {tx.note || formatDateTime(tx.createdAt || tx.created_at)}
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-sm font-bold"
          style={{ color: isCredit ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>
          {isCredit ? '+' : '-'}{amountDisplay}
        </div>
        <div className="text-xs"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
          {formatDateTime(tx.createdAt || tx.created_at)}
        </div>
      </div>
    </div>
  )
}

// ── Wallet page ───────────────────────────────────────────────────────────────

function WalletPage() {
  const [showTopup, setShowTopup] = useState(false)
  const [txType, setTxType]       = useState('')
  const [txPage, setTxPage]       = useState(1)

  const { data: walletData, refetch, isFetching } = useWallet()
  const { data: txData, isLoading: txLoading }     = useTransactions({
    page: txPage, limit: 20, type: txType || undefined,
  })
  const { data: topupsData } = useTopupHistory()

  const wallet   = walletData?.data
  const txResult = txData?.data
  const txList   = (txResult as any)?.transactions || []
  const txPag    = (txResult as any)?.pagination
  const topups   = topupsData?.data || []

  // Display wallet balance in primary currency
  const balanceRaw     = parseFloat(wallet?.balance || 0)
  const balanceUsd     = balanceRaw
  const balanceDisplay = formatCurrency(balanceUsd * (wallet?.fxRate || 83.5))
  const isLow          = wallet?.isLow || false

  return (
    <div className="p-6 max-w-275 mx-auto">

      {showTopup && (
        <TopupModal
          onClose={() => setShowTopup(false)}
          onSuccess={() => { refetch(); setShowTopup(false) }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs tracking-widest uppercase mb-1"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            billing · {CURRENCY}
          </div>
          <h1 className="text-3xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Wallet
          </h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()} loading={isFetching}>
          <RefreshCw size={13} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-5">

        {/* Balance hero — 4 cols */}
        <div className="col-span-12 lg:col-span-4">
          <div
            className="relative p-6 overflow-hidden"
            style={{
              background:   'var(--bg-surface)',
              border:       `1px solid ${isLow ? 'rgba(239,68,68,0.3)' : 'var(--amber-dim)'}`,
              borderRadius: 'var(--radius-lg)',
            }}
          >
            {/* Glow */}
            <div className="absolute inset-0 opacity-5"
              style={{ background: `radial-gradient(ellipse at top right, ${isLow ? '#ef4444' : '#f59e0b'}, transparent 70%)` }} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Wallet size={16} style={{ color: isLow ? 'var(--red)' : 'var(--amber)' }} />
                  <span className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                    Wallet Balance
                  </span>
                </div>
                <span className="text-xs px-2 py-0.5"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderRadius: 'var(--radius-sm)' }}>
                  {CURRENCY}
                </span>
              </div>

              {/* Amount */}
              <div className="mb-6">
                <div className="text-5xl font-bold leading-none mb-2"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color:      isLow ? 'var(--red)' : 'var(--amber)',
                    letterSpacing: '-0.03em',
                  }}>
                  {balanceDisplay}
                </div>
                <div className="text-xs"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  live balance · deducted per page processed
                </div>
              </div>

              {/* Low balance warning */}
              {isLow && (
                <div className="mb-4 flex items-center gap-2 p-3 text-xs"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-md)', color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                  <TrendingDown size={12} className="shrink-0" />
                  Low balance — top up to continue processing
                </div>
              )}

              <Button variant="primary" size="lg" fullWidth onClick={() => setShowTopup(true)}>
                <ArrowUpRight size={15} />
                Add Funds ({CURRENCY})
              </Button>
            </div>
          </div>
        </div>

        {/* Stats cards — 8 cols */}
        <div className="col-span-12 lg:col-span-8">
          <div className="grid grid-cols-2 gap-4 mb-5">
            {[
              {
                label: 'This Month Spent',
                value: formatCurrency(parseFloat(wallet?.monthDebits || 0) * 83.5),
                color: 'var(--red)',
                icon:  <ArrowDownLeft size={14} />,
              },
              {
                label: 'Total Topped Up',
                value: formatCurrency(parseFloat(wallet?.monthCredits || 0) * 83.5),
                color: 'var(--green)',
                icon:  <ArrowUpRight size={14} />,
              },
            ].map(({ label, value, color, icon }) => (
              <div key={label} className="p-4"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-muted)' }}>
                  {icon}
                  <span className="text-xs uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-display)', fontSize: '10px' }}>
                    {label}
                  </span>
                </div>
                <div className="text-2xl font-bold"
                  style={{ color, fontFamily: 'var(--font-mono)' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Topup history */}
          <Card padding="md">
            <CardHeader title="Top-up History" />
            {topups.length === 0 ? (
              <div className="py-8 text-center">
                <CreditCard size={20} className="mx-auto mb-2"
                  style={{ color: 'var(--text-muted)' }} />
                <div className="text-xs"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  No top-ups yet
                </div>
                <Button variant="primary" size="sm" className="mt-3"
                  onClick={() => setShowTopup(true)}>
                  Add First Funds
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {topups.slice(0, 8).map((t: any) => (
                  <div key={t.id}
                    className="flex items-center justify-between py-2.5"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div className="text-xs font-semibold"
                        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(parseFloat(t.amount))} {CURRENCY}
                      </div>
                      <div className="text-xs"
                        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Razorpay · {formatDateTime(t.created_at || t.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {t.gateway_payment_id && (
                        <span className="text-xs"
                          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {t.gateway_payment_id.slice(0, 12)}…
                        </span>
                      )}
                      <Badge variant={
                        t.status === 'paid'   ? 'success' :
                        t.status === 'failed' ? 'error'   : 'warning'
                      }>
                        {t.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Transaction history — full width */}
        <div className="col-span-12">
          <Card padding="md">
            <CardHeader
              title="Transaction History"
              subtitle={`All transactions in ${CURRENCY}`}
              action={
                <div className="flex items-center gap-1">
                  {['', 'credit', 'debit'].map(t => (
                    <button key={t}
                      onClick={() => { setTxType(t); setTxPage(1) }}
                      className={cn(
                        'px-3 py-1 text-xs font-semibold uppercase tracking-wider border transition-all',
                        txType === t
                          ? 'border-amber-500 text-amber-400 bg-amber-500/8'
                          : 'border-(--border) text-(--text-muted) hover:border-(--border-light)'
                      )}
                      style={{ borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-display)' }}>
                      {t || 'All'}
                    </button>
                  ))}
                </div>
              }
            />

            {txLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 animate-pulse"
                    style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }} />
                ))}
              </div>
            ) : txList.length === 0 ? (
              <div className="py-12 text-center">
                <Clock size={20} className="mx-auto mb-2"
                  style={{ color: 'var(--text-muted)' }} />
                <div className="text-xs"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  No transactions yet
                </div>
              </div>
            ) : (
              <div>
                {/* Column headers */}
                <div className="flex items-center gap-4 px-4 py-2 mb-1"
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Type', 'Reference', 'Amount', 'Date'].map(h => (
                    <div key={h}
                      className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)',
                        flex: h === 'Reference' ? 1 : 'none',
                        minWidth: h === 'Amount' ? 100 : h === 'Date' ? 140 : 'auto',
                      }}>
                      {h}
                    </div>
                  ))}
                </div>
                {txList.map((tx: any) => <TxRow key={tx.id} tx={tx} />)}
              </div>
            )}

            {txPag && txPag.totalPages > 1 && (
              <Pagination
                page={txPage}
                totalPages={txPag.totalPages}
                total={txPag.total}
                limit={20}
                onChange={setTxPage}
              />
            )}
          </Card>
        </div>

      </div>
    </div>
  )
}