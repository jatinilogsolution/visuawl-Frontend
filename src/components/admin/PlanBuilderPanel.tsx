import { useState }            from 'react'
import { useForm }             from 'react-hook-form'
import { useSuperAdminPlans, useCreatePlan, useUpdatePlanAdmin } from '@/hooks/useAdmin'
import { Card, CardHeader }    from '@/components/ui/Card'
import { Button }              from '@/components/ui/Button'
import { Input }               from '@/components/ui/Input'
import { Badge }               from '@/components/ui/Badge'
import { formatNumber }        from '@/lib/utils'
import { Plus, Edit2, X, Check } from 'lucide-react'

export function PlanBuilderPanel() {
  const { data }           = useSuperAdminPlans()
  const createMutation     = useCreatePlan()
  const updateMutation     = useUpdatePlanAdmin()
  const [editing, setEditing] = useState<any>(null)
  const [showCreate, setShowCreate] = useState(false)

  const plans = data?.data || []

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      name: '', code: '', billing_type: 'execution', execution_limit: null,
      is_payg: false, price_per_execution: 0, cost_per_page: 0,
      pages_per_month: null, max_pages_per_doc: 50,
      monthly_price: 0, description: '',
    },
  })

  const billingType = watch('billing_type')
  const isPayg      = watch('is_payg')

  const startEdit = (plan: any) => {
    setEditing(plan)
    setShowCreate(false)
    Object.keys(plan).forEach(k => setValue(k as any, plan[k]))
  }

  const onSubmit = handleSubmit(async data => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, ...data })
    } else {
      await createMutation.mutateAsync(data)
    }
    setEditing(null)
    setShowCreate(false)
    reset()
  })

  const BILLING_TYPES = [
    { value: 'execution', label: 'Per Execution', desc: 'Charge per job regardless of page count' },
    { value: 'page',      label: 'Per Page',      desc: 'Charge per page processed in document' },
  ]

  return (
    <div className="space-y-5">

      {/* Plan form */}
      {(showCreate || editing) && (
        <Card padding="md" className="animate-fade-in-up" glow>
          <CardHeader
            title={editing ? `Edit: ${editing.name}` : 'Create New Plan'}
            action={
              <button onClick={() => { setEditing(null); setShowCreate(false); reset() }}
                style={{ color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            }
          />
          <form onSubmit={onSubmit} className="space-y-5">

            {/* Basic info */}
            <div className="grid grid-cols-3 gap-3">
              <Input label="Plan Name" placeholder="Professional" {...register('name', { required: true })} />
              <Input label="Code" placeholder="PLAN_PRO" {...register('code', { required: true })} />
              <Input label="Monthly Price (USD)" type="number" step="0.01" {...register('monthly_price', { valueAsNumber: true })} />
            </div>
            <Input label="Description" placeholder="For growing businesses..." {...register('description')} />

            {/* Billing type */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                Billing Type
              </div>
              <div className="grid grid-cols-2 gap-3">
                {BILLING_TYPES.map(bt => (
                  <button key={bt.value} type="button"
                    onClick={() => setValue('billing_type', bt.value)}
                    className="p-4 text-left border transition-all"
                    style={{
                      background:   billingType === bt.value ? 'var(--amber-glow)' : 'var(--bg-elevated)',
                      borderColor:  billingType === bt.value ? 'var(--amber)' : 'var(--border)',
                      borderRadius: 'var(--radius-md)',
                    }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: billingType === bt.value ? 'var(--amber)' : 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                        {bt.label}
                      </span>
                      {billingType === bt.value && <Check size={12} style={{ color: 'var(--amber)' }} />}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {bt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Execution-based fields */}
            {billingType === 'execution' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="is_payg" {...register('is_payg')}
                    className="w-4 h-4 accent-amber-500" />
                  <label htmlFor="is_payg" className="text-xs cursor-pointer"
                    style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    Pay as you go (wallet-based, no monthly quota)
                  </label>
                </div>
                {isPayg ? (
                  <Input label="Price per Execution (USD)" type="number" step="0.000001"
                    placeholder="0.020000"
                    {...register('price_per_execution', { valueAsNumber: true })} />
                ) : (
                  <Input label="Execution Limit (per month)" type="number"
                    placeholder="1000 — leave blank for unlimited"
                    {...register('execution_limit', { valueAsNumber: true, setValueAs: v => v === '' ? null : Number(v) })} />
                )}
              </div>
            )}

            {/* Page-based fields */}
            {billingType === 'page' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 col-span-2">
                  <input type="checkbox" id="is_payg_page" {...register('is_payg')}
                    className="w-4 h-4 accent-amber-500" />
                  <label htmlFor="is_payg_page" className="text-xs cursor-pointer"
                    style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    Pay as you go (deduct from wallet per page)
                  </label>
                </div>
                <Input label="Cost per Page (USD)" type="number" step="0.000001"
                  placeholder="0.005000"
                  {...register('cost_per_page', { valueAsNumber: true })} />
                <Input label="Pages per Month (quota)" type="number"
                  placeholder="10000 — blank for PAYG unlimited"
                  {...register('pages_per_month', { valueAsNumber: true, setValueAs: v => v === '' ? null : Number(v) })} />
                <Input label="Max Pages per Document" type="number"
                  placeholder="50"
                  {...register('max_pages_per_doc', { valueAsNumber: true })} />
              </div>
            )}

            {/* Preview */}
            <div className="p-4"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div className="text-xs uppercase tracking-widest mb-3"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                Pricing Preview
              </div>
              <div className="text-xs space-y-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                <div>Billing: <span style={{ color: 'var(--amber)' }}>{billingType}</span></div>
                <div>Model: <span style={{ color: 'var(--amber)' }}>{isPayg ? 'Pay as you go' : 'Monthly subscription'}</span></div>
                {billingType === 'page' && (
                  <>
                    <div>Rate: <span style={{ color: 'var(--amber)' }}>${watch('cost_per_page')}/page</span></div>
                    <div>Example (100 pages): <span style={{ color: 'var(--green)' }}>
                      ${((watch('cost_per_page') || 0) * 100).toFixed(4)}
                    </span></div>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" size="md"
                loading={createMutation.isPending || updateMutation.isPending}>
                {editing ? 'Save Changes' : 'Create Plan'}
              </Button>
              <Button type="button" variant="ghost" size="md"
                onClick={() => { setEditing(null); setShowCreate(false); reset() }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Plans grid */}
      <Card padding="md">
        <CardHeader
          title="Plan Catalogue"
          action={
            <Button variant="primary" size="sm" onClick={() => { setShowCreate(true); setEditing(null) }}>
              <Plus size={12} /> New Plan
            </Button>
          }
        />
        <div className="space-y-2">
          {plans.map((p: any) => (
            <div key={p.id}
              className="flex items-start gap-4 p-4 transition-all hover:border-[var(--border-light)]"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold"
                    style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                  <span className="text-xs" style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                    {p.code}
                  </span>
                  <Badge variant={p.billing_type === 'page' ? 'amber' : 'neutral'}>
                    {p.billing_type}
                  </Badge>
                  {!p.is_active && <Badge variant="error">inactive</Badge>}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {p.billing_type === 'page' ? (
                    <>
                      ${p.cost_per_page}/page ·
                      {p.pages_per_month ? ` ${formatNumber(p.pages_per_month)} pages/mo ·` : ' PAYG ·'}
                      max {p.max_pages_per_doc} pages/doc
                    </>
                  ) : (
                    <>
                      {p.is_payg ? `$${p.price_per_execution}/exec PAYG` : `${formatNumber(p.execution_limit || 0)} exec/mo`}
                    </>
                  )}
                  {p.monthly_price > 0 && ` · $${p.monthly_price}/mo`}
                </div>
                {p.description && (
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {p.description}
                  </div>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => startEdit(p)}>
                <Edit2 size={11} />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}