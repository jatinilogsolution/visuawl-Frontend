import { useAdminPlans, usePlanUsageReport, useResetAllQuotas } from '@/hooks/useAdmin'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button }           from '@/components/ui/Button'
import { formatNumber }     from '@/lib/utils'
import { formatCurrency }   from '@/lib/currency'
import { RotateCcw }        from 'lucide-react'

export function PlanUsagePanel() {
  const { data: usageData }  = usePlanUsageReport()
  const { data: plansData }  = useAdminPlans()
  const resetMutation        = useResetAllQuotas()

  const usage  = usageData?.data || []
  const plans  = plansData?.data || []

  return (
    <div className="grid grid-cols-12 gap-5">

      {/* Plan catalogue */}
      <div className="col-span-12 lg:col-span-5">
        <Card padding="md">
          <CardHeader title="Plan Catalogue" />
          <div className="space-y-2">
            {plans.map((p: any) => {
              const isPayg = Boolean(p.isPayg ?? p.is_payg)
              const pagesPerMonth = p.pagesPerMonth ?? p.pages_per_month ?? null
              const monthlyPrice = Number(p.monthlyPriceRaw ?? p.monthly_price ?? p.monthlyPrice ?? 0)
              const costPerPage = Number(p.costPerPageRaw ?? p.cost_per_page ?? p.costPerPage ?? 0)

              return (
                <div key={p.id}
                  className="flex items-center justify-between p-3"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div className="text-xs font-bold"
                      style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                      {p.name} ({p.code})
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {isPayg
                        ? `PAYG · ${formatCurrency(costPerPage)}/page`
                        : `${formatNumber(Number(pagesPerMonth || 0))}/mo · ${formatCurrency(monthlyPrice)}/mo`
                      }
                    </div>
                  </div>
                  {Boolean(p.isActive ?? p.is_active) ? (
                    <div className="w-2 h-2 rounded-full" style={{ background: 'var(--green)' }} />
                  ) : (
                    <div className="w-2 h-2 rounded-full" style={{ background: 'var(--text-muted)' }} />
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Usage report */}
      <div className="col-span-12 lg:col-span-7">
        <Card padding="md">
          <CardHeader
            title="Usage Report"
            subtitle="Pages per plan across all tenants"
            action={
              <Button variant="secondary" size="sm"
                loading={resetMutation.isPending}
                onClick={() => resetMutation.mutate()}>
                <RotateCcw size={12} /> Reset All Quotas
              </Button>
            }
          />
          {usage.length === 0 ? (
            <div className="py-8 text-center text-xs"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              No usage data
            </div>
          ) : (
            <div className="space-y-4">
              {usage.map((u: any) => {
                const avgUsed = Number(u.avgPagesUsed ?? u.avgUsed ?? 0)
                const limit = u.pagesPerMonth ?? u.limit ?? null
                const pct = limit ? Number(u.avgUtilPct ?? Math.round((avgUsed / Number(limit)) * 100)) : null
                const safePct = pct == null ? null : Math.max(0, Math.min(100, pct))
                const barColor =
                  safePct === null     ? 'var(--amber)'  :
                  safePct >= 90        ? 'var(--red)'    :
                  safePct >= 70        ? 'var(--yellow)' : 'var(--green)'

                return (
                  <div key={u.code}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold"
                          style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                          {u.code}
                        </span>
                        <span className="text-xs"
                          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {u.tenantCount} tenant{u.tenantCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs"
                        style={{ fontFamily: 'var(--font-mono)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          avg {formatNumber(avgUsed)}
                          {limit ? `/${formatNumber(Number(limit))}` : ''}
                        </span>
                        {safePct !== null && (
                          <span style={{ color: barColor, fontWeight: 700 }}>
                            {safePct.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                    {safePct !== null && (
                      <div className="h-1.5 overflow-hidden"
                        style={{ background: 'var(--bg-elevated)', borderRadius: 1 }}>
                        <div
                          className="h-full transition-all duration-500"
                          style={{ width: `${safePct}%`, background: barColor }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
