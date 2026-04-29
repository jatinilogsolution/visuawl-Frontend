import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPatch, apiDelete, apiPut }   from '@/lib/api'
import { toast }                                   from 'react-hot-toast'

// ─── System status

export function useSystemStatus(full = false) {
  return useQuery({
    queryKey: ['admin', 'status', full],
    queryFn:  () => apiGet<any>(full ? '/status/full' : '/status'),
    refetchInterval: 30_000,
  })
}

export function useCronHealth() {
  return useQuery({
    queryKey: ['admin', 'crons'],
    queryFn:  () => apiGet<any>('/status/crons'),
    refetchInterval: 60_000,
  })
}

export function useDbStats() {
  return useQuery({
    queryKey: ['admin', 'db'],
    queryFn:  () => apiGet<any>('/status/db'),
  })
}

export function useQueueStatus() {
  return useQuery({
    queryKey: ['admin', 'queues'],
    queryFn:  () => apiGet<any>('/status/queues'),
    refetchInterval: 15_000,
  })
}

export function useRunMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiPost('/status/cleanup', {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] })
      toast.success('Maintenance complete')
    },
    onError: () => toast.error('Maintenance failed'),
  })
}

// ─── Tenants ──────────────────────────────────────────────────────────────────

export function useAdminTenants(page = 1, limit = 20, status?: string) {
  return useQuery({
    queryKey: ['admin', 'tenants', page, limit, status],
    queryFn:  () => apiGet<any>('/tenant/admin/all', { page, limit, status }),
  })
}

export function useAdminTenant(id: string) {
  return useQuery({
    queryKey: ['admin', 'tenant', id],
    queryFn:  () => apiGet<any>(`/tenant/admin/${id}`),
    enabled:  !!id,
  })
}

export function useSetTenantStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch(`/tenant/admin/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      toast.success('Tenant status updated')
    },
  })
}

export function useAdminAssignPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ tenantId, planId }: { tenantId: string; planId: string }) =>
      apiPost(`/tenant/admin/${tenantId}/plan`, { planId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      toast.success('Plan assigned')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  })
}

export function useAdminManualTopup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ tenant_id, amount, note }: any) =>
      apiPost('/wallet/topup/manual', { tenant_id, amount, note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      toast.success('Wallet credited')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  })
}

export function useDeleteTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/tenant/admin/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      toast.success('Tenant deleted')
    },
  })
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export function useAdminPlans() {
  return useQuery({
    queryKey: ['admin', 'plans'],
    queryFn:  () => apiGet<any[]>('/plans'),
  })
}

export function usePlanUsageReport() {
  return useQuery({
    queryKey: ['admin', 'plan-usage'],
    queryFn:  () => apiGet<any[]>('/plans/admin/usage'),
  })
}

export function useResetAllQuotas() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiPost('/plans/admin/reset-quotas', {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] })
      toast.success('All quotas reset')
    },
  })
}


export function useTenantIntelligence(tenantId:string | null) {

  return useQuery({
    queryKey: ['admin', 'intelligence', tenantId],
    queryFn: ()=> apiGet(`/super/tenants/${tenantId}/intelligence`),
    enabled: !!tenantId
  })
}


export function useAdminErrorLogs(opts: any = {}){
  return useQuery({
    queryKey: ['admin', 'errors', opts],
    queryFn: ()=>apiGet('/super/errors', opts),
    refetchInterval: 30_000
  })
}

export function useErrorSummary(){
  return useQuery({
    queryKey: ['admin', 'errors', 'summary'],
    queryFn: ()=> apiGet('/super/errors/summary'),
    refetchInterval: 60_000
  })
}


export function useSuperAdminPlans() {
  return useQuery({
    queryKey: ['admin', 'plans', 'full'],
    queryFn:  () => apiGet<any[]>('/super/plans'),
  })
}

export function useCreatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => apiPost('/super/plans', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'plans'] })
      toast.success('Plan created')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  })
}

export function useUpdatePlanAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiPut(`/super/plans/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'plans'] })
      toast.success('Plan updated')
    },
  })
}

export function useRegisterTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => apiPost('/super/register/tenant', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      toast.success('Tenant registered successfully')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  })
}

export function useRegisterAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => apiPost('/super/register/admin', data),
    onSuccess: () => toast.success('Super admin registered'),
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  })
}

export function useSuperAdmins() {
  return useQuery({
    queryKey: ['admin', 'admins'],
    queryFn:  () => apiGet<any[]>('/super/admins'),
  })
}

export function useUpdateAdminPermissions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, permissions }: { userId: string; permissions: string[] }) =>
      apiPut(`/super/permissions/${userId}`, { permissions }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'admins'] })
      toast.success('Permissions updated')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  })
}

export function useMyPermissions() {
  return useQuery({
    queryKey: ['admin', 'permissions', 'me'],
    queryFn:  () => apiGet<any>('/super/permissions/me'),
  })
}