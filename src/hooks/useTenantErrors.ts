import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPatch }                       from '@/lib/api'
import { toast }                                  from 'react-hot-toast'

export function useTenantErrorFeed(opts: {
  page?:     number
  limit?:    number
  severity?: string
  resolved?: boolean
} = {}) {
  return useQuery({
    queryKey: ['tenant-errors', opts],
    queryFn:  () => apiGet<any>('/my-errors', {
      page:     opts.page,
      limit:    opts.limit,
      severity: opts.severity,
      resolved: opts.resolved !== undefined ? String(opts.resolved) : undefined,
    }),
    refetchInterval: 30_000,
  })
}

export function useUnresolvedErrorCount() {
  return useQuery({
    queryKey: ['tenant-errors', 'count'],
    queryFn:  () => apiGet<{ unresolved: number }>('/my-errors/count'),
    refetchInterval: 60_000,
  })
}

export function useResolveError() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiPatch(`/my-errors/${id}/resolve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant-errors'] })
      toast.success('Marked as resolved')
    },
  })
}