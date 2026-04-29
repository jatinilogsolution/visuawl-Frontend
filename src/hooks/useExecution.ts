import { useQuery }    from '@tanstack/react-query'
import { apiGet }      from '@/lib/api'

export interface ExecutionDetail {
  id:               string
  status:           string
  sourceType:       string
  originalFilename: string
  mimeType:         string | null
  fileSizeBytes:    number | null
  processingTimeMs: number | null
  errorMessage:     string | null
  retryCount:       number
  extractedData:    any | null
  createdAt:        string
  completedAt:      string | null
  stages:           {
    stage:      string
    status:     string
    order:      number
    startedAt:  string | null
    endedAt:    string | null
    durationMs: number | null
    error:      string | null
  }[]
}

export function useExecution(id: string, enabled = true) {
  return useQuery({
    queryKey:        ['execution', id],
    queryFn:         () => apiGet<ExecutionDetail>(`/ingest/executions/${id}`),
    enabled:         enabled && !!id,
    refetchInterval: (query) => {
      const status = (query.state.data?.data as ExecutionDetail)?.status
      if (status === 'processing' || status === 'queued') return 2000
      return false
    },
  })
}