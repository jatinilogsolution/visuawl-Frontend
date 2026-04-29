import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

// API client singleton

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — inject access token 

api.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token && cfg.headers) {
    cfg.headers.Authorization = `Bearer ${token}`
  }
  return cfg
})

// Response interceptor — handle 401 + refresh

let isRefreshing   = false
let refreshQueue:  ((token: string) => void)[] = []

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (err) => {
    const original = err.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true

      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(err)
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers!.Authorization = `Bearer ${token}`
            resolve(api(original))
          })
        })
      }

      isRefreshing = true

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
          { refreshToken }
        )

        const newToken = data.data.accessToken
        setAccessToken(newToken)

        refreshQueue.forEach((cb) => cb(newToken))
        refreshQueue = []

        original.headers!.Authorization = `Bearer ${newToken}`
        return api(original)

      } catch {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(err)
  }
)

// Token storage

const KEYS = {
  access:  'ocr_access_token',
  refresh: 'ocr_refresh_token',
  user:    'ocr_user',
}

export function getAccessToken():  string | null { return localStorage.getItem(KEYS.access) }
export function getRefreshToken(): string | null { return localStorage.getItem(KEYS.refresh) }

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(KEYS.access,  access)
  localStorage.setItem(KEYS.refresh, refresh)
}

export function setAccessToken(access: string): void {
  localStorage.setItem(KEYS.access, access)
}

export function clearTokens(): void {
  localStorage.removeItem(KEYS.access)
  localStorage.removeItem(KEYS.refresh)
  localStorage.removeItem(KEYS.user)
}

export function setStoredUser(user: object): void {
  localStorage.setItem(KEYS.user, JSON.stringify(user))
}

export function getStoredUser<T = any>(): T | null {
  try {
    const raw = localStorage.getItem(KEYS.user)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// API response shape 

export interface ApiResponse<T> {
  success: boolean
  message: string
  data:    T
  code?:   string
  details?: unknown
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data:    T[]
  pagination: {
    total:       number
    page:        number
    limit:       number
    totalPages:  number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// Typed API call helpers

export async function apiGet<T>(
  url:    string,
  params?: Record<string, any>
): Promise<ApiResponse<T>> {
  const { data } = await api.get<ApiResponse<T>>(url, { params })
  return data
}

export async function apiPost<T>(
  url:     string,
  payload?: unknown,
  config?:  AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const { data } = await api.post<ApiResponse<T>>(url, payload, config)
  return data
}

export async function apiPut<T>(
  url:     string,
  payload?: unknown
): Promise<ApiResponse<T>> {
  const { data } = await api.put<ApiResponse<T>>(url, payload)
  return data
}

export async function apiPatch<T>(
  url:     string,
  payload?: unknown
): Promise<ApiResponse<T>> {
  const { data } = await api.patch<ApiResponse<T>>(url, payload)
  return data
}

export async function apiDelete<T>(url: string): Promise<ApiResponse<T>> {
  const { data } = await api.delete<ApiResponse<T>>(url)
  return data
}

// Extract error message from axios error

export function extractError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return (
      err.response?.data?.message ||
      err.response?.data?.error   ||
      err.message                 ||
      'An unexpected error occurred'
    )
  }
  if (err instanceof Error) return err.message
  return 'An unexpected error occurred'
}