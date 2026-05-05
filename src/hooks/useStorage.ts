import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiDelete }              from '@/lib/api'
import { toast }                                   from 'react-hot-toast'

export function useStorageHealth() {
  return useQuery({
    queryKey: ['storage', 'health'],
    queryFn:  () => apiGet<any>('/storage/health'),
    refetchInterval: 60_000,
  })
}

export function useStorageStats(tenantId?: string) {
  return useQuery({
    queryKey: ['storage', 'stats', tenantId],
    queryFn:  () => apiGet<any>('/storage/stats', tenantId ? { tenantId } : {}),
    refetchInterval: 60_000,
  })
}

export function useStorageFiles(opts: {
  tenantId?: string
  page?:     number
  limit?:    number
  mime?:     string
} = {}) {
  return useQuery({
    queryKey: ['storage', 'files', opts],
    queryFn:  () => apiGet<any>('/storage/files', opts),
  })
}

export function useSignFile() {
  return useMutation({
    mutationFn: ({ storageKey, expirySeconds }: { storageKey: string; expirySeconds?: number }) =>
      apiPost<any>('/storage/files/sign', { storageKey, expirySeconds }),
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Signing failed'),
  })
}

export function useDeleteStorageFile() {
  const qc = useQueryClient()
  return useMutation({
    // mutationFn: ({ storageKey, reason }: { storageKey: string; reason?: string }) =>
    mutationFn: () =>
        apiDelete('/storage/files'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storage'] })
      toast.success('File deleted')
    },
  })
}

export function useLifecycleRules() {
  return useQuery({
    queryKey: ['storage', 'lifecycle'],
    queryFn:  () => apiGet<any[]>('/storage/lifecycle'),
  })
}

export function useLifecyclePreview() {
  return useQuery({
    queryKey: ['storage', 'lifecycle', 'preview'],
    queryFn:  () => apiGet<any[]>('/storage/lifecycle/preview'),
  })
}

export function useCreateLifecycleRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => apiPost('/storage/lifecycle', data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['storage', 'lifecycle'] })
      toast.success('Lifecycle rule created')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  })
}

export function useDeleteLifecycleRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/storage/lifecycle/${id}`),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['storage', 'lifecycle'] })
      toast.success('Rule deleted')
    },
  })
}

export function useRunLifecycle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiPost('/storage/lifecycle/run', {}),
    onSuccess:  (res) => {
      qc.invalidateQueries({ queryKey: ['storage'] })
      toast.success((res.data as any)?.message || 'Lifecycle complete')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  })
}