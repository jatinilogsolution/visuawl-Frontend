import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api'
import { toast } from 'react-hot-toast'

// ─── API Keys ─────────────────────────────────────────────────────────────────

export function useApiKeys() {
  return useQuery({
    queryKey: ['apikeys'],
    queryFn:  () => apiGet<any[]>('/apikeys'),
  })
}

export function useCreateApiKey() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; expires_at?: string }) =>
      apiPost<any>('/apikeys', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['apikeys'] }),
  })
}

export function useRevokeApiKey() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/apikeys/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['apikeys'] })
      toast.success('API key revoked')
    },
  })
}

// ─── Input Sources ────────────────────────────────────────────────────────────

export function useInputSources(type?: string) {
  return useQuery({
    queryKey: ['sources', type],
    queryFn:  () => apiGet<any[]>('/sources', type ? { type } : {}),
  })
}

export function useCreateSource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => apiPost('/sources', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sources'] })
      toast.success('Source created')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  })
}

export function useUpdateSource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiPut(`/sources/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sources'] })
      toast.success('Source updated')
    },
  })
}

export function useToggleSource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiPatch(`/sources/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sources'] }),
  })
}

export function useDeleteSource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/sources/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sources'] })
      toast.success('Source deleted')
    },
  })
}

export function useTestSource() {
  return useMutation({
    mutationFn: (id: string) => apiPost(`/sources/${id}/test`, {}),
  })
}

// ─── Output Destinations ──────────────────────────────────────────────────────

export function useDestinations() {
  return useQuery({
    queryKey: ['destinations'],
    queryFn:  () => apiGet<any[]>('/destinations'),
  })
}

export function useCreateDestination() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => apiPost('/destinations', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['destinations'] })
      toast.success('Destination created')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  })
}

export function useToggleDestination() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiPatch(`/destinations/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['destinations'] }),
  })
}

export function useDeleteDestination() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/destinations/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['destinations'] })
      toast.success('Destination deleted')
    },
  })
}

export function useTestDestination() {
  return useMutation({
    mutationFn: (id: string) => apiPost(`/destinations/${id}/test`, {}),
  })
}

export function useDestinationHealth() {
  return useQuery({
    queryKey: ['destinations', 'health'],
    queryFn:  () => apiGet<any[]>('/delivery/health'),
    refetchInterval: 60_000,
  })
}

// ─── Email Configs ────────────────────────────────────────────────────────────

export function useEmailConfigs() {
  return useQuery({
    queryKey: ['email-configs'],
    queryFn:  () => apiGet<any[]>('/email-configs'),
  })
}

export function useCreateEmailConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => apiPost('/email-configs', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['email-configs'] })
      toast.success('Email config created')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  })
}

export function useDeleteEmailConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/email-configs/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['email-configs'] })
      toast.success('Email config deleted')
    },
  })
}

export function useToggleEmailConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiPatch(`/email-configs/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['email-configs'] }),
  })
}

export function useTestEmailConfig() {
  return useMutation({
    mutationFn: (id: string) => apiPost(`/email-configs/${id}/test`, {}),
  })
}

// ─── Team / Users ─────────────────────────────────────────────────────────────

export function useTeamMembers() {
  return useQuery({
    queryKey: ['users'],
    queryFn:  () => apiGet<any[]>('/users'),
  })
}

export function useInvitations() {
  return useQuery({
    queryKey: ['invitations'],
    queryFn:  () => apiGet<any[]>('/users/invitations'),
  })
}

export function useInviteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { email: string; role: string }) =>
      apiPost('/users/invite', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations'] })
      toast.success('Invitation sent')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  })
}

export function useRevokeInvitation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/users/invitations/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations'] })
      toast.success('Invitation revoked')
    },
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiPatch(`/users/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated')
    },
  })
}

export function useRemoveUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User removed')
    },
  })
}

// ─── Alert Rules ──────────────────────────────────────────────────────────────

export function useAlertRules() {
  return useQuery({
    queryKey: ['alerts', 'rules'],
    queryFn:  () => apiGet<any[]>('/alerts/rules'),
  })
}

export function useCreateAlertRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { error_type: string; alert_email: string }) =>
      apiPost('/alerts/rules', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Alert rule created')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  })
}

export function useDeleteAlertRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/alerts/rules/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Alert rule deleted')
    },
  })
}

export function useSendTestAlert() {
  return useMutation({
    mutationFn: () => apiPost('/alerts/test', {}),
    onSuccess:  () => toast.success('Test alert triggered — check your email'),
  })
}

// ─── Deletion Rules ───────────────────────────────────────────────────────────

export function useDeletionRules() {
  return useQuery({
    queryKey: ['deletion-rules'],
    queryFn:  () => apiGet<any[]>('/deletion/rules'),
  })
}

export function useCreateDeletionRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { entity_type: string; delete_after_days: number }) =>
      apiPost('/deletion/rules', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deletion-rules'] })
      toast.success('Deletion rule created')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  })
}

export function useUpdateDeletionRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiPut(`/deletion/rules/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deletion-rules'] })
      toast.success('Rule updated')
    },
  })
}

export function useDeleteDeletionRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/deletion/rules/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deletion-rules'] })
      toast.success('Rule deleted')
    },
  })
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { firstName?: string; lastName?: string }) =>
      apiPut('/users/me', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] })
      toast.success('Profile updated')
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiPost('/users/me/change-password', data),
    onSuccess: () => toast.success('Password changed'),
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  })
}

export function useUpdateCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => apiPut('/tenant/me', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] })
      toast.success('Company details updated')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  })
}

export function useAssignPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (planId: string) => apiPost('/plans/assign', { planId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['wallet'] })
      toast.success('Plan assigned')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  })
}
