// import { useQuery } from '@tanstack/react-query'
// import { apiGet }   from '@/lib/api'

// export interface DashboardSummary {
//   today: {
//     executions: number
//     success:    number
//     failed:     number
//     tokensUsed: number
//     costUsd:    number
//   }
//   thisMonth: {
//     executions: number
//     success:    number
//     failed:     number
//     tokensUsed: number
//     costUsd:    number
//   }
//   wallet: {
//     balance: number
//     isLow:   boolean
//   }
//   quota: {
//     used:      number
//     limit:     number | null
//     remaining: number | null
//     isPayg:    boolean
//   }
// }

// export interface ExecutionStats {
//   total:             number
//   success:           number
//   failed:            number
//   successRate:       number
//   avgProcessingMs:   number
//   byDay:             { date: string; total: number; success: number; failed: number }[]
//   bySource:          Record<string, number>
// }

export interface TokenAnalytics {
  grandTotal: {
    totalCalls:   number
    totalTokens:  number
    totalCostUsd: number
    avgLatencyMs: number
  }
  byDay: { date: string; tokens: number; costUsd: string }[]
  byProvider: { provider: string; tokens: number; costUsd: string; calls: number }[]
}

export interface RecentExecution {
  id:               string
  status:           string
  source_type:      string
  original_filename: string
  processing_time_ms: number | null
  created_at:       string
  completed_at:     string | null
}

// export function useDashboard() {
//   return useQuery({
//     queryKey: ['dashboard'],
//     queryFn:  () => apiGet<DashboardSummary>('/analytics/dashboard'),
//     refetchInterval: 30_000,
//   })
// }

// export function useExecutionStats(from?: string, to?: string) {
//   return useQuery({
//     queryKey: ['analytics', 'executions', from, to],
//     queryFn:  () => apiGet<ExecutionStats>('/analytics/executions', { from, to }),
//   })
// }

// export function useTokenAnalytics(from?: string, to?: string) {
//   return useQuery({
//     queryKey: ['analytics', 'tokens', from, to],
//     queryFn:  () => apiGet<TokenAnalytics>('/analytics/tokens', { from, to }),
//   })
// }

// export function useRecentExecutions() {
//   return useQuery({
//     queryKey: ['executions', 'recent'],
//     queryFn:  () => apiGet<RecentExecution[]>('/ingest/executions', { limit: 8, page: 1 }),
//     refetchInterval: 15_000,
//   })
// }

import { useQuery }      from '@tanstack/react-query'
import { apiGet }        from '@/lib/api'

export interface DashboardSummary {
  today: {
    executions: number
    success:    number
    failed:     number
  }
  thisMonth: {
    executions:     number
    success:        number
    failed:         number
    pagesProcessed: number
    costDisplay:    string   // formatted in primary currency
    costRaw:        number
  }
  wallet: {
    balanceUsd:     number
    balanceDisplay: string   // formatted in primary currency
    balanceRaw:     number
    isLow:          boolean
    currency:       string
    currencySymbol: string
  }
  plan: {
    name:               string
    code:               string
    billingType:        'execution' | 'page'
    isPayg:             boolean
    executionsUsed:     number
    executionLimit:     number | null
    pagesUsed:          number
    pagesPerMonth:      number | null
    periodEnd:          string | null
    costPerPageDisplay: string | null
    costPerPageRaw:     number | null
  } | null
  currency: {
    code:   string
    symbol: string
  }
}
// export interface TokenAnalytics {
//   grandTotal: {
//     totalCalls:   number
//     totalTokens:  number
//     totalCostUsd: number
//     avgLatencyMs: number
//   }
//   byDay: { date: string; tokens: number; costUsd: string }[]
//   byProvider: { provider: string; tokens: number; costUsd: string; calls: number }[]
// }
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn:  () => apiGet<DashboardSummary>('/analytics/dashboard'),
    refetchInterval: 30_000,
  })
}

// Keep other hooks but update ExecutionStats — remove token data for tenants
export interface ExecutionStats {
  total:           number
  success:         number
  failed:          number
  successRate:     number
  avgProcessingMs: number
  byDay:           { date: string; total: number; success: number; failed: number }[]
  bySource:        Record<string, number>
  // NO token/cost/AI data here
}

export interface PageStats {
  byDay:  { date: string; pages: number; cost: string }[]
  totals: { totalPages: number; totalCost: string }
}

export function usePageStats(from?: string, to?: string) {
  return useQuery({
    queryKey: ['analytics', 'pages', from, to],
    queryFn:  () => apiGet<PageStats>('/analytics/pages', { from, to }),
  })
}

export function useExecutionStats(from?: string, to?: string) {
  return useQuery({
    queryKey: ['analytics', 'executions', from, to],
    queryFn:  () => apiGet<ExecutionStats>('/analytics/executions', { from, to }),
  })
}

export function useRecentExecutions() {
  return useQuery({
    queryKey: ['executions', 'recent'],
    queryFn:  () => apiGet<any[]>('/ingest/executions', { limit: 8, page: 1 }),
    refetchInterval: 15_000,
  })
}