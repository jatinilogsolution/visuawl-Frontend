import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, setTokens, clearTokens, setStoredUser, extractError } from '@/lib/api'

// Types

export interface AuthUser {
    id: string
    tenantId: string
    role: 'super_admin' | 'tenant_admin' | 'tenant_user'
}

export interface TenantProfile {
    id: string
    name: string
    slug: string
    email: string
    walletBalance: number
    status: string
    logoUrl?: string | null
}

export interface UserProfile {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    role: string
    lastLoginAt: string | null
}

export interface AuthState {
    // State
    user: AuthUser | null
    profile: UserProfile | null
    tenant: TenantProfile | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null

    // Actions
    login: (email: string, password: string) => Promise<void>
    register: (data: RegisterData) => Promise<void>
    logout: () => Promise<void>
    fetchMe: () => Promise<void>
    clearError: () => void
}

export interface RegisterData {
    companyName: string
    email: string
    password: string
    firstName: string
    lastName: string
    country?: string
    timezone?: string
}

//  Auth store 

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            profile: null,
            tenant: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            //  Login 
            login: async (email, password) => {
                set({ isLoading: true, error: null })
                try {
                    const { data } = await api.post('/auth/login', { email, password })

                    setTokens(data.data.accessToken, data.data.refreshToken)

                    const authUser: AuthUser = {
                        id: data.data.user.id,
                        tenantId: data.data.user.tenantId,
                        role: data.data.user.role,
                    }

                    set({ user: authUser, isAuthenticated: true, isLoading: false })
                    setStoredUser(authUser)

                    // Fetch full profile
                    await get().fetchMe()

                } catch (err) {
                    set({ isLoading: false, error: extractError(err) })
                    throw err
                }
            },

            //  Register 
            register: async (registerData) => {
                set({ isLoading: true, error: null })
                try {
                    const { data } = await api.post('/auth/register', registerData)

                    setTokens(data.data.accessToken, data.data.refreshToken)

                    const authUser: AuthUser = {
                        id: data.data.user.id,
                        tenantId: data.data.user.tenantId,
                        role: data.data.user.role,
                    }

                    set({ user: authUser, isAuthenticated: true, isLoading: false })
                    setStoredUser(authUser)

                    await get().fetchMe()

                } catch (err) {
                    set({ isLoading: false, error: extractError(err) })
                    throw err
                }
            },

            //  Logout 
            logout: async () => {
                try {
                    await api.post('/auth/logout')
                } catch { }
                clearTokens()
                set({
                    user: null,
                    profile: null,
                    tenant: null,
                    isAuthenticated: false,
                    error: null,
                })
                window.location.href = '/login'
            },

            //  Fetch me 
            fetchMe: async () => {
                try {
                    const { data } = await api.get('/auth/me')
                    set({
                        profile: data.data.user,
                        tenant: data.data.tenant,
                    })
                } catch (err) {
                    // If /me fails it means token is invalid
                    if ((err as any)?.response?.status === 401) {
                        clearTokens()
                        set({ user: null, isAuthenticated: false })
                    }
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'ocr-auth',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)
