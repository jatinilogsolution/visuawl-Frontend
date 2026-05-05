import { useState }    from 'react'
import { useForm }     from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z }           from 'zod'
import { toast }       from 'react-hot-toast'
import { useCreateTopupOrder, useVerifyTopup, useWallet } from '@/hooks/useWallet'
import { Button }      from '@/components/ui/Button'
import { Input }       from '@/components/ui/Input'
import { CURRENCY, CURRENCY_SYM } from '@/lib/currency'
import { formatNumber } from '@/lib/utils'
import { X, CheckCircle, CreditCard } from 'lucide-react'

// Quick amounts in INR (shown when CURRENCY === 'INR')
const QUICK_AMOUNTS_INR = [100, 250, 500, 1000, 2000, 5000]
const QUICK_AMOUNTS_USD = [1, 5, 10, 25, 50, 100]
const QUICK_AMOUNTS = CURRENCY === 'INR' ? QUICK_AMOUNTS_INR : QUICK_AMOUNTS_USD

// Min amount
const MIN_AMOUNT = CURRENCY === 'INR' ? 10 : 1

const schema = z.object({
  amount: z.number()
    .min(MIN_AMOUNT, `Minimum ${CURRENCY_SYM}${formatNumber(MIN_AMOUNT)}`)
    .max(CURRENCY === 'INR' ? 500000 : 10000, `Maximum ${CURRENCY === 'INR' ? '₹5,00,000' : '$10,000'}`),
})

type FormData = z.infer<typeof schema>

interface TopupModalProps {
  onClose: () => void
}

export function TopupModal({ onClose }: TopupModalProps) {
  const createOrder    = useCreateTopupOrder()
  const verifyMutation = useVerifyTopup()
  const { data: walletData } = useWallet()
  const [step, setStep] = useState<'amount' | 'gateway' | 'verify' | 'done'>('amount')
  const [order, setOrder] = useState<any>(null)
  const [verifyData, setVerifyData] = useState({ paymentId: '', signature: '' })

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: QUICK_AMOUNTS[2] || MIN_AMOUNT },
  })

  const amount = watch('amount')
  const isPayg = Boolean((walletData as any)?.data?.isPayg)
  const estPages = Math.floor((amount || 0) / (CURRENCY === 'INR' ? 2 : 0.024))

  const onCreateOrder = handleSubmit(async data => {
    try {
      const res = await createOrder.mutateAsync({
        amount: Number(data.amount),
        currency: CURRENCY,
      })
      setOrder(res.data)
      setStep('gateway')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create top-up order')
    }
  })

  const onVerify = async () => {
    if (!verifyData.paymentId || !verifyData.signature) {
      toast.error('Enter payment ID and signature from Razorpay')
      return
    }
    await verifyMutation.mutateAsync({
      order_id:           order.orderId,
      gateway_order_id:   order.gatewayOrderId,
      gateway_payment_id: verifyData.paymentId,
      gateway_signature:  verifyData.signature,
    })
    setStep('done')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full max-w-md animate-fade-in-up"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="text-xs tracking-widest uppercase"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>wallet</div>
            <h2 className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Add Funds
            </h2>
          </div>
          <button onClick={onClose} className="transition-colors hover:text-amber-400"
            style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6">

          {/* STEP 1 — Amount */}
          {step === 'amount' && (
            <div className="space-y-5">
              {/* Quick amounts */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                  Quick Select ({CURRENCY})
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_AMOUNTS.map(a => (
                    <button key={a} type="button"
                      onClick={() => setValue('amount', a)}
                      className="py-2 text-sm font-bold transition-all border"
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
                <div>
                  <Input
                    label={`Amount (${CURRENCY})`}
                    type="number"
                    step="1"
                    min={String(MIN_AMOUNT)}
                    error={errors.amount?.message}
                    {...register('amount', { valueAsNumber: true })}
                  />
                </div>

                {/* Summary */}
                <div className="p-3"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Wallet credit
                    </span>
                    <span style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {CURRENCY_SYM}{formatNumber(amount || 0)} {CURRENCY}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Estimated pages
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {isPayg ? `~${formatNumber(estPages)} pages` : 'included in plan'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" variant="primary" size="lg" fullWidth
                    loading={createOrder.isPending}>
                    <CreditCard size={14} />
                    Proceed to Payment
                  </Button>
                  <Button type="button" variant="ghost" size="lg" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2 — Gateway info */}
          {step === 'gateway' && order && (
            <div className="space-y-4">
              <div
                className="p-4"
                style={{ background: 'var(--amber-glow)', border: '1px solid var(--amber-dim)', borderRadius: 'var(--radius-md)' }}
              >
                <div className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: 'var(--amber)', fontFamily: 'var(--font-display)' }}>
                  Razorpay Order Created
                </div>
                {[
                  { label: 'Order ID',    value: order.gatewayOrderId },
                  { label: 'Amount',      value: `${order.amount / 100} ${order.currency}` },
                  { label: 'Platform ID', value: order.orderId },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-1">
                    <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{label}</span>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all', maxWidth: '60%', textAlign: 'right' }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 text-xs"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                In production: the Razorpay checkout widget opens automatically here.
                After payment, Razorpay provides a payment_id and signature.
                Enter them below to verify and credit your wallet.
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
                  onClick={onVerify}
                  loading={verifyMutation.isPending}>
                  Verify & Credit Wallet
                </Button>
                <Button variant="ghost" size="lg" onClick={() => setStep('amount')}>
                  ← Back
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 — Done */}
          {step === 'done' && (
            <div className="text-center space-y-4 py-4">
              <div
                className="w-16 h-16 mx-auto flex items-center justify-center"
                style={{ background: 'var(--amber-glow)', border: '1px solid var(--amber)', borderRadius: 'var(--radius-lg)' }}
              >
                <CheckCircle size={32} style={{ color: 'var(--amber)' }} />
              </div>
              <div>
                <div className="text-2xl font-bold mb-1"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                  Wallet Credited!
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Your balance has been updated
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
