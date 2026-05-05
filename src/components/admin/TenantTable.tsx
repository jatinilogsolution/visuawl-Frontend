import { useState } from 'react'
import { useAdminTenants, useSetTenantStatus, useAdminAssignPlan, useAdminManualTopup, useDeleteTenant } from '@/hooks/useAdmin'
import { useAdminPlans } from '@/hooks/useAdmin'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/executions/Pagination'
import { formatDateTime, formatNumber } from '@/lib/utils'
import { CURRENCY, CURRENCY_SYM, formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'
import { Building2, Ban, CheckCircle, CreditCard, Layers, Trash2, ChevronDown, BarChart2, Lock } from 'lucide-react'

interface TenantTableProps {
  onViewIntelligence?: (id: string, slug: string) => void
  onViewDecrypt?: (id: string, slug: string) => void
}

export function TenantTable({ onViewIntelligence, onViewDecrypt }: TenantTableProps) {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [topupAmount, setTopupAmount] = useState<Record<string, number>>({})
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const { data, isLoading, refetch } = useAdminTenants(page, 15, statusFilter || undefined)
  const { data: plansData } = useAdminPlans()
  const setStatusMutation = useSetTenantStatus()
  const assignPlanMutation = useAdminAssignPlan()
  const topupMutation = useAdminManualTopup()
  const deleteMutation = useDeleteTenant()

  const tenants = Array.isArray((data as any)?.data) ? (data as any).data : []
  const pagination = (data as any)?.pagination
  const plans = plansData?.data || []

  const getPlanMonthlyLimit = (plan: any) =>
    plan.pagesPerMonth ?? plan.pages_per_month ?? plan.execution_limit ?? plan.executionLimit ?? null

  const getPlanCode = (item: any) => String(item.plan_code ?? item.planCode ?? item.code ?? '').trim()
  const getPlanName = (item: any) => String(item.plan_name ?? item.planName ?? item.name ?? '').trim()

  const getSelectedPlanId = (tenant: any) => {
    const tenantPlanId = tenant.plan_id ?? tenant.planId
    if (tenantPlanId) return tenantPlanId

    const tenantCode = getPlanCode(tenant)
    if (tenantCode) {
      const byCode = plans.find((p: any) => getPlanCode(p) === tenantCode)
      if (byCode?.id) return byCode.id
    }

    const tenantName = getPlanName(tenant)
    if (tenantName) {
      const byName = plans.find((p: any) => getPlanName(p) === tenantName)
      if (byName?.id) return byName.id
    }

    return ''
  }

  const getUsage = (tenant: any) => {
    const used = Number(tenant.pages_used ?? tenant.pagesUsed ?? tenant.executions_used ?? tenant.executionsUsed ?? 0)
    const limit = tenant.pages_per_month ?? tenant.pagesPerMonth ?? tenant.execution_limit ?? tenant.executionLimit ?? null
    return {
      used,
      limit: limit == null ? null : Number(limit),
      label: (tenant.pages_per_month ?? tenant.pagesPerMonth) != null ? 'pages' : 'usage',
    }
  }

  return (
    <Card padding="md">
      <CardHeader
        title="All Tenants"
        subtitle={`${pagination?.total || 0} total workspaces`}
        action={
          <div className="flex items-center gap-2">
            {['', 'active', 'suspended'].map(s => (
              <button key={s}
                onClick={() => { setStatusFilter(s); setPage(1) }}
                className={cn(
                  'px-3 py-1 text-xs font-semibold uppercase tracking-wider border transition-all',
                  statusFilter === s
                    ? 'border-amber-500 text-amber-400 bg-amber-500/8'
                    : 'border-(--border) text-(--text-muted) hover:border-(--border-light)'
                )}
                style={{ borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-display)' }}>
                {s || 'All'}
              </button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => refetch()}>↻</Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse"
              style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {tenants.map((t: any) => {
            const usage = getUsage(t)
            const selectedPlanId = getSelectedPlanId(t)

            return (
              <div key={t.id}
                style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                {/* Row */}
                <div
                  className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-(--bg-elevated) transition-colors"
                  onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                >
                  <Building2 size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {t.slug}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {t.id.slice(0, 16)}… · {formatDateTime(t.created_at)}
                    </div>
                  </div>

                  {/* Plan badge */}
                  <Badge variant={getPlanCode(t) ? 'amber' : 'neutral'}>
                    {getPlanName(t) || 'No Plan'}
                  </Badge>

                  {/* Usage */}
                  {usage.limit !== null && (
                    <div className="text-xs text-right" style={{ fontFamily: 'var(--font-mono)', minWidth: 80 }}>
                      <div style={{ color: 'var(--text-primary)' }}>
                        {formatNumber(usage.used)}/{formatNumber(usage.limit)}
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>{usage.label}</div>
                    </div>
                  )}

                  {/* Wallet */}
                  <div className="text-xs text-right" style={{ fontFamily: 'var(--font-mono)', minWidth: 70 }}>
                    <div style={{ color: 'var(--amber)' }}>{formatCurrency(Number(t.wallet_balance || 0))}</div>
                    <div style={{ color: 'var(--text-muted)' }}>wallet</div>
                  </div>

                  {/* Status */}
                  <Badge variant={t.status === 'active' ? 'success' : t.status === 'suspended' ? 'warning' : 'error'}>
                    {t.status}
                  </Badge>

                  <ChevronDown
                    size={14}
                    className={cn('transition-transform shrink-0', expandedId === t.id && 'rotate-180')}
                    style={{ color: 'var(--text-muted)' }}
                  />
                </div>

                {/* Expanded panel */}
                {expandedId === t.id && (
                  <div
                    className="px-4 py-4 space-y-4 animate-fade-in-up"
                    style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)' }}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      {/* Assign plan */}
                      <div>
                        <div className="text-xs uppercase tracking-widest mb-2"
                          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                          Assign Plan
                        </div>
                        <div className="flex gap-2">
                          <select
                            className="flex-1 h-8 px-2 text-xs border bg-transparent focus:outline-none"
                            defaultValue={selectedPlanId}
                            id={`plan-${t.id}`}
                            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}
                          >
                            {plans.map((p: any) => {
                              const monthlyLimit = getPlanMonthlyLimit(p)
                              const planIsPayg = Boolean(p.isPayg ?? p.is_payg)
                              return (
                                <option key={p.id} value={p.id}
                                  style={{ background: 'var(--bg-overlay)' }}>
                                  {p.name} ({planIsPayg ? 'PAYG' : `${formatNumber(Number(monthlyLimit || 0))}/mo`})
                                </option>
                              )
                            })}
                          </select>
                          <Button variant="secondary" size="sm"
                            loading={assignPlanMutation.isPending}
                            onClick={() => {
                              const sel = document.getElementById(`plan-${t.id}`) as HTMLSelectElement
                              assignPlanMutation.mutate({ tenantId: t.id, planId: sel.value })
                            }}>
                            <Layers size={11} /> Assign
                          </Button>
                          <Button variant="outline" size="sm"
                            onClick={() => onViewIntelligence?.(t.id, t.slug)}>
                            <BarChart2 size={11} /> Intelligence
                          </Button>
                        </div>
                      </div>

                      {/* Manual topup */}
                      <div>
                        <div className="text-xs uppercase tracking-widest mb-2"
                          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                          Manual Wallet Topup ({CURRENCY})
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder={`${CURRENCY_SYM}0.00`}
                            value={topupAmount[t.id] || ''}
                            onChange={e => {
                              const parsed = Number(e.target.value)
                              setTopupAmount(prev => ({ ...prev, [t.id]: Number.isFinite(parsed) ? parsed : 0 }))
                            }}
                            className="flex-1 h-8 px-2 text-xs border bg-transparent focus:outline-none focus:border-amber-500"
                            style={{ borderColor: 'var(--border)', color: 'var(--amber)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}
                          />
                          <Button variant="secondary" size="sm"
                            loading={topupMutation.isPending}
                            onClick={() => {
                              if (!topupAmount[t.id] || topupAmount[t.id] <= 0) return
                              topupMutation.mutate({
                                tenant_id: t.id,
                                amount: topupAmount[t.id],
                                note: 'Admin manual topup',
                              })
                            }}>
                            <CreditCard size={11} /> Credit
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2"
                      style={{ borderTop: '1px solid var(--border)' }}>
                      {t.status === 'active' ? (
                        <Button variant="danger" size="sm"
                          loading={setStatusMutation.isPending}
                          onClick={() => setStatusMutation.mutate({ id: t.id, status: 'suspended' })}>
                          <Ban size={11} /> Suspend
                        </Button>
                      ) : (
                        <Button variant="secondary" size="sm"
                          loading={setStatusMutation.isPending}
                          onClick={() => setStatusMutation.mutate({ id: t.id, status: 'active' })}>
                          <CheckCircle size={11} /> Reactivate
                        </Button>
                      )}
                      <Button variant="ghost" size="sm"
                        onClick={() => {
                          onViewDecrypt?.(t.id, t.slug)
                        }}>
                        <Lock size={11} /> Decrypt Fields
                      </Button>
                      {confirmDelete === t.id ? (
                        <div className="flex items-center gap-2 ml-auto">
                          <span className="text-xs" style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                            Delete tenant permanently?
                          </span>
                          <Button variant="danger" size="sm"
                            loading={deleteMutation.isPending}
                            onClick={() => { deleteMutation.mutate(t.id); setConfirmDelete(null) }}>
                            Confirm
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" className="ml-auto"
                          onClick={() => setConfirmDelete(t.id)}>
                          <Trash2 size={11} />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={15}
          onChange={setPage}
        />
      )}
    </Card>
  )
}
