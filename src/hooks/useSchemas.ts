import { useQuery } from '@tanstack/react-query'
import { apiGet }   from '@/lib/api'

export interface Schema {
  id:          string
  name:        string
  description: string | null
  fieldCount:  number
  isDefault:   boolean
  createdAt:   string
}

export function useSchemas() {
  return useQuery({
    queryKey: ['schemas'],
    queryFn:  () => apiGet<Schema[]>('/schemas'),
  })
}
