import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiDelete, apiGet, apiPost }              from '@/lib/api'
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
      apiPost(`/ingest/executions/${id}/process`, { reason, schemaId }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['execution', 'detail', vars.id] })
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
    }) => {
      if (action === 'stop') {
        return apiPost<{
          action: ExecutionTransitionAction
          executionId: string
          status: string
        }>(`/ingest/executions/${id}/stop`, { reason })
      }

      if (action === 'process' || action === 'retry' || action === 'requeue') {
        return apiPost<{
          action: ExecutionTransitionAction
          executionId: string
          status: string
          newExecutionId?: string
        }>(`/ingest/executions/${id}/process`, { reason, schemaId })
      }

      return apiPost<{
        action: ExecutionTransitionAction
        executionId: string
        status: string
      }>(`/ingest/executions/${id}/transition`, { action, reason, schemaId })
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['execution', 'detail', vars.id] })
      qc.invalidateQueries({ queryKey: ['executions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteExecution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete<{ id: string }>(`/ingest/executions/${id}`),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['execution', 'detail', id] })
      qc.invalidateQueries({ queryKey: ['executions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useBulkDeleteExecutions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) =>
      apiPost<{ deletedCount: number; deletedIds: string[]; missingIds: string[] }>(
        '/ingest/executions/bulk-delete',
        { ids }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['executions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
