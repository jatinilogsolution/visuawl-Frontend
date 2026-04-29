import { useAdminPlans, usePlanUsageReport, useResetAllQuotas } from '@/hooks/useAdmin'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button }           from '@/components/ui/Button'
import { formatNumber }     from '@/lib/utils'
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
            {plans.map((p: any) => (
              <div key={p.id}
                className="flex items-center justify-between p-3"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div className="text-xs font-bold"
                    style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                    {p.name} ({p.code})
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {p.is_payg
                      ? `PAYG · $${p.price_per_execution}/exec`
                      : `${formatNumber(p.execution_limit)}/mo · $${p.monthly_price}/mo`
                    }
                  </div>
                </div>
                {p.is_active ? (
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--green)' }} />
                ) : (
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--text-muted)' }} />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Usage report */}
      <div className="col-span-12 lg:col-span-7">
        <Card padding="md">
          <CardHeader
            title="Usage Report"
            subtitle="Executions per plan across all tenants"
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
                const pct    = u.limit ? Math.round((u.avgUsed / u.limit) * 100) : null
                const barColor =
                  pct === null        ? 'var(--amber)'  :
                  pct >= 90           ? 'var(--red)'    :
                  pct >= 70           ? 'var(--yellow)' : 'var(--green)'

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
                          avg {formatNumber(u.avgUsed)}
                          {u.limit ? `/${formatNumber(u.limit)}` : ''}
                        </span>
                        {pct !== null && (
                          <span style={{ color: barColor, fontWeight: 700 }}>
                            {u.avgUtilPct}%
                          </span>
                        )}
                      </div>
                    </div>
                    {pct !== null && (
                      <div className="h-1.5 overflow-hidden"
                        style={{ background: 'var(--bg-elevated)', borderRadius: 1 }}>
                        <div
                          className="h-full transition-all duration-500"
                          style={{ width: `${u.avgUtilPct}%`, background: barColor }}
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