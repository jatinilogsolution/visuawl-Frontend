// import { createFileRoute, Link } from '@tanstack/react-router'
// import { useState }              from 'react'
// import {
//   useExecutions,
//   type ExecutionFilters,
// } from '@/hooks/useExecutions'
// import { ExecutionFilterBar } from '@/components/executions/ExecutionFilters'
// import { ExecutionTable }     from '@/components/executions/ExecutionTable'
// import { Pagination }         from '@/components/executions/Pagination'
// import { Card }               from '@/components/ui/Card'
// import { Button }             from '@/components/ui/Button'
// import { Upload, RefreshCw }  from 'lucide-react'

// export const Route = createFileRoute('/dashboard/executions/')({
//   component: ExecutionsPage,
// })

// function ExecutionsPage() {
//   const [filters, setFilters] = useState<ExecutionFilters>({ page: 1, limit: 20 })
//   const { data, isLoading, refetch, isFetching } = useExecutions(filters)

//   const rows       = (data?.data as any)?.data        || (data?.data as any) || []
//   const pagination = (data?.data as any)?.pagination  || null
//   const total      = pagination?.total                || rows.length
//   const totalPages = pagination?.totalPages           || 1

//   return (
//     <div className="p-6 max-w-[1200px] mx-auto">

//       {/* Header */}
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <div className="text-xs tracking-widest uppercase mb-1"
//             style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
//             extraction history
//           </div>
//           <h1 className="text-3xl font-bold"
//             style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
//             Executions
//           </h1>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => refetch()}
//             loading={isFetching}
//           >
//             <RefreshCw size={13} />
//             Refresh
//           </Button>
//           <Link to="/dashboard/upload">
//             <Button variant="primary" size="md">
//               <Upload size={13} />
//               New Upload
//             </Button>
//           </Link>
//         </div>
//       </div>

//       {/* Stats strip */}
//       <div className="grid grid-cols-4 gap-3 mb-6">
//         {[
//           { label: 'Total',    value: total,            color: 'var(--text-primary)' },
//           { label: 'Shown',    value: rows.length,      color: 'var(--text-secondary)' },
//           { label: 'Page',     value: `${filters.page || 1} / ${totalPages}`, color: 'var(--amber)' },
//           { label: 'Per page', value: filters.limit || 20, color: 'var(--text-muted)' },
//         ].map(({ label, value, color }) => (
//           <div
//             key={label}
//             className="p-3 flex items-center justify-between"
//             style={{
//               background:   'var(--bg-surface)',
//               border:       '1px solid var(--border)',
//               borderRadius: 'var(--radius-md)',
//             }}
//           >
//             <span className="text-xs uppercase tracking-widest"
//               style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
//               {label}
//             </span>
//             <span className="text-sm font-bold"
//               style={{ color, fontFamily: 'var(--font-mono)' }}>
//               {value}
//             </span>
//           </div>
//         ))}
//       </div>

//       {/* Filters */}
//       <div className="mb-5">
//         <ExecutionFilterBar filters={filters} onChange={setFilters} />
//       </div>

//       {/* Table */}
//       <Card padding="md">
//         <ExecutionTable executions={Array.isArray(rows) ? rows : []} loading={isLoading} />

//         {/* Pagination */}
//         {!isLoading && rows.length > 0 && (
//           <Pagination
//             page={filters.page || 1}
//             totalPages={totalPages}
//             total={total}
//             limit={filters.limit || 20}
//             onChange={(p) => setFilters(f => ({ ...f, page: p }))}
//           />
//         )}
//       </Card>
//     </div>
//   )
// }

import { createFileRoute }    from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast }               from 'react-hot-toast'
import {
  useExecutions,
  useRerunExecution,
  useDeleteExecution,
  useBulkDeleteExecutions,
  type ExecutionFilters,
} from '@/hooks/useExecutions'
import { ExecutionFilterBar } from '@/components/executions/ExecutionFilters'
import { ExecutionTable }     from '@/components/executions/ExecutionTable'
import { Pagination }         from '@/components/executions/Pagination'
import { CompareView }        from '@/components/executions/CompareView'
import { Card }               from '@/components/ui/Card'
import { Button }             from '@/components/ui/Button'
import { Link }               from '@tanstack/react-router'
import { cn }                 from '@/lib/utils'
import { Upload, RefreshCw, GitCompare, List } from 'lucide-react'

export const Route = createFileRoute('/dashboard/executions/')({
  component: ExecutionsPage,
})

type PageTab = 'list' | 'compare'

function ExecutionsPage() {
  const [filters, setFilters] = useState<ExecutionFilters>({ page: 1, limit: 20 })
  const [pageTab, setPageTab] = useState<PageTab>('list')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const { data, isLoading, refetch, isFetching } = useExecutions(filters)
  const rerunMutation = useRerunExecution()
  const deleteMutation = useDeleteExecution()
  const bulkDeleteMutation = useBulkDeleteExecutions()

  const rows       = (data?.data as any)?.data       || (data?.data as any) || []
  const pagination = (data?.data as any)?.pagination || null
  const total      = pagination?.total               || rows.length
  const totalPages = pagination?.totalPages          || 1
  const actionDisabled = rerunMutation.isPending || deleteMutation.isPending || bulkDeleteMutation.isPending

  useEffect(() => {
    const valid = new Set((Array.isArray(rows) ? rows : []).map((r: any) => r.id))
    setSelectedIds((prev) => prev.filter((id) => valid.has(id)))
  }, [rows])

  const handleToggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return [...next]
    })
  }

  const handleToggleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds([])
      return
    }
    setSelectedIds((Array.isArray(rows) ? rows : []).map((r: any) => r.id))
  }

  const handleRetry = async (id: string) => {
    try {
      setActionLoadingId(`retry:${id}`)
      await rerunMutation.mutateAsync({ id, reason: 'Manual retry from executions list' })
      toast.success('Retry started on the same execution')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Retry failed')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeleteOne = async (id: string) => {
    const yes = window.confirm('Delete this execution? This hides it from your history.')
    if (!yes) return
    try {
      setActionLoadingId(`delete:${id}`)
      await deleteMutation.mutateAsync(id)
      setSelectedIds((prev) => prev.filter((x) => x !== id))
      toast.success('Execution deleted')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    const yes = window.confirm(`Delete ${selectedIds.length} selected execution(s)?`)
    if (!yes) return

    try {
      setActionLoadingId('bulk-delete')
      const result = await bulkDeleteMutation.mutateAsync(selectedIds)
      const deletedCount = Number(result?.data?.deletedCount || 0)
      toast.success(`Deleted ${deletedCount} execution(s)`)
      setSelectedIds([])
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Bulk delete failed')
    } finally {
      setActionLoadingId(null)
    }
  }

  const PAGE_TABS = [
    { id: 'list',    label: 'History',  icon: List       },
    { id: 'compare', label: 'Compare',  icon: GitCompare },
  ] as const

  return (
    <div className="p-6 max-w-300 mx-auto">

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
          {pageTab === 'list' && (
            <Button variant="ghost" size="sm" onClick={() => refetch()} loading={isFetching}>
              <RefreshCw size={13} /> Refresh
            </Button>
          )}
          <Link to="/dashboard/upload">
            <Button variant="primary" size="md">
              <Upload size={13} /> New Upload
            </Button>
          </Link>
        </div>
      </div>

      {/* Page tabs */}
      <div className="flex gap-0 mb-6"
        style={{ borderBottom: '1px solid var(--border)' }}>
        {PAGE_TABS.map(({ id, label, icon: Icon }) => (
          <button key={id}
            onClick={() => setPageTab(id)}
            className={cn(
              'flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-widest',
              'border-b-2 transition-colors -mb-px',
              pageTab === id
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-(--text-muted) hover:text-(--text-secondary)'
            )}
            style={{ fontFamily: 'var(--font-display)' }}>
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* List tab */}
      {pageTab === 'list' && (
        <div>
          {/* Stats strip */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total',    value: total,              color: 'var(--text-primary)' },
              { label: 'Shown',    value: rows.length,        color: 'var(--text-secondary)' },
              { label: 'Page',     value: `${filters.page || 1} / ${totalPages}`, color: 'var(--amber)' },
              { label: 'Per page', value: filters.limit || 20, color: 'var(--text-muted)' },
            ].map(({ label, value, color }) => (
              <div key={label}
                className="p-3 flex items-center justify-between"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
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
            {selectedIds.length > 0 && (
              <div className="flex items-center justify-between mb-3 p-2.5"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <span className="text-xs"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {selectedIds.length} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIds([])}
                    disabled={actionDisabled}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDeleteSelected}
                    loading={actionLoadingId === 'bulk-delete'}
                    disabled={actionDisabled}
                  >
                    Delete Selected
                  </Button>
                </div>
              </div>
            )}

            <ExecutionTable
              executions={Array.isArray(rows) ? rows : []}
              loading={isLoading}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onRetry={handleRetry}
              onDelete={handleDeleteOne}
              actionLoadingId={actionLoadingId}
              actionDisabled={actionDisabled}
            />
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
      )}

      {/* Compare tab */}
      {pageTab === 'compare' && <CompareView />}
    </div>
  )
}
