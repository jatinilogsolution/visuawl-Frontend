import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost }   from '@/lib/api'
import { toast }             from 'react-hot-toast'

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn:  () => apiGet<any>('/wallet'),
    refetchInterval: 30_000,
  })
}

export function useTransactions(opts: {
  page?:  number
  limit?: number
  type?:  string
  from?:  string
  to?:    string
} = {}) {
  return useQuery({
    queryKey: ['wallet', 'transactions', opts],
    queryFn:  () => apiGet<any>('/wallet/transactions', opts),
  })
}

export function useWalletSummary(from?: string, to?: string) {
  return useQuery({
    queryKey: ['wallet', 'summary', from, to],
    queryFn:  () => apiGet<any>('/wallet/summary', { from, to }),
  })
}

export function useTopupHistory() {
  return useQuery({
    queryKey: ['wallet', 'topups'],
    queryFn:  () => apiGet<any[]>('/wallet/topups'),
  })
}

export function useCreateTopupOrder() {
  return useMutation({
    mutationFn: (data: { amount: number; currency: string }) =>
      apiPost<any>('/wallet/topup/create', data),
  })
}

export function useVerifyTopup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      order_id:           string
      gateway_order_id:   string
      gateway_payment_id: string
      gateway_signature:  string
    }) => apiPost('/wallet/topup/verify', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] })
      toast.success('Wallet credited successfully')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Payment verification failed'),
  })
}