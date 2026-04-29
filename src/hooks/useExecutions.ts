import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost }                         from '@/lib/api'
import type { ExecutionDetail }                   from './useExecution'

export interface ExecutionListItem {
  id:                string
  status:            string
  source_type:       string
  original_filename: string | null
  file_mime_type:    string | null
  file_size_bytes:   number | null
  processing_time_ms: number | null
  error_message:     string | null
  retry_count:       number
  created_at:        string
  completed_at:      string | null
}

export interface ExecutionFilters {
  page?:       number
  limit?:      number
  status?:     string
  sourceType?: string
  from?:       string
  to?:         string
}

export function useExecutions(filters: ExecutionFilters = {}) {
  return useQuery({
    queryKey: ['executions', 'list', filters],
    queryFn:  () => apiGet<ExecutionListItem[]>('/ingest/executions', {
      page:       filters.page       || 1,
      limit:      filters.limit      || 20,
      status:     filters.status     || undefined,
      sourceType: filters.sourceType || undefined,
      from:       filters.from       || undefined,
      to:         filters.to         || undefined,
    }),
    refetchInterval: 15_000,
  })
}

export function useExecutionDetail(id: string) {
  return useQuery({
    queryKey:        ['execution', 'detail', id],
    queryFn:         () => apiGet<ExecutionDetail>(`/ingest/executions/${id}`),
    enabled:         !!id,
    refetchInterval: (query) => {
      const s = (query.state.data?.data as ExecutionDetail)?.status
      return (s === 'queued' || s === 'processing') ? 2000 : false
    },
  })
}

export function useExecutionTokens(id: string) {
  return useQuery({
    queryKey: ['execution', 'tokens', id],
    queryFn:  () => apiGet<any>(`/analytics/executions/${id}/tokens`),
    enabled:  !!id,
  })
}

export function useDeliveryLogs(id: string) {
  return useQuery({
    queryKey: ['execution', 'delivery', id],
    queryFn:  () => apiGet<any>(`/delivery/logs/${id}`),
    enabled:  !!id,
  })
}

export function useRerunExecution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason, schemaId }: { id: string; reason?: string; schemaId?: string }) =>
      apiPost(`/delivery/rerun/${id}`, { reason, schemaId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['executions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export type ExecutionTransitionAction = 'requeue' | 'process' | 'retry' | 'stop' | 'fail'

export function useExecutionTransition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      action,
      reason,
      schemaId,
    }: {
      id: string
      action: ExecutionTransitionAction
      reason?: string
      schemaId?: string
    }) => apiPost<{
      action: ExecutionTransitionAction
      executionId: string
      status: string
      newExecutionId?: string
    }>(`/ingest/executions/${id}/transition`, { action, reason, schemaId }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['execution', 'detail', vars.id] })
      qc.invalidateQueries({ queryKey: ['executions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
