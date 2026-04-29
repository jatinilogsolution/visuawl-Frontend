import { createFileRoute, Link } from '@tanstack/react-router'
import { useState }              from 'react'
import {
  useExecutions,
  type ExecutionFilters,
} from '@/hooks/useExecutions'
import { ExecutionFilterBar } from '@/components/executions/ExecutionFilters'
import { ExecutionTable }     from '@/components/executions/ExecutionTable'
import { Pagination }         from '@/components/executions/Pagination'
import { Card }               from '@/components/ui/Card'
import { Button }             from '@/components/ui/Button'
import { Upload, RefreshCw }  from 'lucide-react'

export const Route = createFileRoute('/dashboard/executions/')({
  component: ExecutionsPage,
})

function ExecutionsPage() {
  const [filters, setFilters] = useState<ExecutionFilters>({ page: 1, limit: 20 })
  const { data, isLoading, refetch, isFetching } = useExecutions(filters)

  const rows       = (data?.data as any)?.data        || (data?.data as any) || []
  const pagination = (data?.data as any)?.pagination  || null
  const total      = pagination?.total                || rows.length
  const totalPages = pagination?.totalPages           || 1

  return (
    <div className="p-6 max-w-[1200px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs tracking-widest uppercase mb-1"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            extraction history
          </div>
          <h1 className="text-3xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Executions
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            loading={isFetching}
          >
            <RefreshCw size={13} />
            Refresh
          </Button>
          <Link to="/dashboard/upload">
            <Button variant="primary" size="md">
              <Upload size={13} />
              New Upload
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',    value: total,            color: 'var(--text-primary)' },
          { label: 'Shown',    value: rows.length,      color: 'var(--text-secondary)' },
          { label: 'Page',     value: `${filters.page || 1} / ${totalPages}`, color: 'var(--amber)' },
          { label: 'Per page', value: filters.limit || 20, color: 'var(--text-muted)' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="p-3 flex items-center justify-between"
            style={{
              background:   'var(--bg-surface)',
              border:       '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <span className="text-xs uppercase tracking-widest"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
              {label}
            </span>
            <span className="text-sm font-bold"
              style={{ color, fontFamily: 'var(--font-mono)' }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-5">
        <ExecutionFilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* Table */}
      <Card padding="md">
        <ExecutionTable executions={Array.isArray(rows) ? rows : []} loading={isLoading} />

        {/* Pagination */}
        {!isLoading && rows.length > 0 && (
          <Pagination
            page={filters.page || 1}
            totalPages={totalPages}
            total={total}
            limit={filters.limit || 20}
            onChange={(p) => setFilters(f => ({ ...f, page: p }))}
          />
        )}
      </Card>
    </div>
  )
}
