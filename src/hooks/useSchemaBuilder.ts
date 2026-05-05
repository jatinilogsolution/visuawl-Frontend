import { useState, useCallback }                  from 'react'
import { useMutation, useQueryClient, useQuery }  from '@tanstack/react-query'
import { apiPost, apiGet, apiPut, apiDelete, apiPatch } from '@/lib/api'
import { toast }                                  from 'react-hot-toast'

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object'

export interface SchemaField {
  id:          string
  key:         string
  type:        FieldType
  required:    boolean
  description: string
  example?:    string
  children?:   SchemaField[]
}

export interface SchemaDefinition {
  name:        string
  description: string
  fields:      SchemaField[]
}

let _id = 0
export const newId = () => `field_${++_id}_${Date.now()}`

export const EMPTY_FIELD = (): SchemaField => ({
  id:          newId(),
  key:         '',
  type:        'string',
  required:    false,
  description: '',
  example:     '',
})

// ── Schema CRUD ───────────────────────────────────────────────────────────────

export function useSchemaList() {
  return useQuery({
    queryKey: ['schemas'],
    queryFn:  () => apiGet<any[]>('/schemas'),
  })
}

export function useSchemaDetail(id: string | null) {
  return useQuery({
    queryKey: ['schema', id],
    queryFn:  () => apiGet<any>(`/schemas/${id}`),
    enabled:  !!id,
  })
}

export function useCreateSchema() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: any) => apiPost('/schemas', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schemas'] })
      toast.success('Schema created')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Create failed'),
  })
}

export function useUpdateSchema(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: any) => apiPut(`/schemas/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schemas'] })
      qc.invalidateQueries({ queryKey: ['schema', id] })
      toast.success('Schema updated')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Update failed'),
  })
}

export function useDeleteSchema() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/schemas/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schemas'] })
      toast.success('Schema deleted')
    },
  })
}

export function useSetDefaultSchema() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiPatch(`/schemas/${id}/default`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schemas'] })
      toast.success('Default schema updated')
    },
  })
}

export function useDuplicateSchema() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiPost(`/schemas/${id}/duplicate`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schemas'] })
      toast.success('Schema duplicated')
    },
  })
}

export function useValidateSchema() {
  return useMutation({
    mutationFn: (schema_definition: any) =>
      apiPost('/schemas/validate', { schema_definition }),
  })
}

export function useTestSchema() {
  return useMutation({
    mutationFn: ({ id, sample_data }: { id: string; sample_data: any }) =>
      apiPost(`/schemas/${id}/test`, { sample_data }),
  })
}

// ── Local field editor state ──────────────────────────────────────────────────

export function useFieldEditor(initial: SchemaField[]) {
  const [fields, setFields] = useState<SchemaField[]>(
    initial.length > 0 ? ensureFieldIds(initial) : []
  )

  const addField = useCallback((parentId?: string) => {
    const f = EMPTY_FIELD()
    if (!parentId) {
      setFields(prev => [...prev, f])
    } else {
      setFields(prev => addChildField(prev, parentId, f))
    }
  }, [])

  const updateField = useCallback((id: string, updates: Partial<SchemaField>) => {
    setFields(prev => updateFieldById(prev, id, updates))
  }, [])

  const removeField = useCallback((id: string) => {
    setFields(prev => removeFieldById(prev, id))
  }, [])

  const moveField = useCallback((id: string, direction: 'up' | 'down') => {
    setFields(prev => moveFieldById(prev, id, direction))
  }, [])

  return { fields, setFields, addField, updateField, removeField, moveField }
}

// Recursive helpers
function ensureFieldIds(fields: SchemaField[]): SchemaField[] {
  return fields.map((f) => ({
    ...f,
    id: f.id || newId(),
    children: f.children ? ensureFieldIds(f.children) : undefined,
  }))
}

function addChildField(fields: SchemaField[], parentId: string, child: SchemaField): SchemaField[] {
  return fields.map(f => {
    if (f.id === parentId) return { ...f, children: [...(f.children || []), child] }
    if (f.children) return { ...f, children: addChildField(f.children, parentId, child) }
    return f
  })
}

function updateFieldById(fields: SchemaField[], id: string, updates: Partial<SchemaField>): SchemaField[] {
  return fields.map(f => {
    if (f.id === id) return { ...f, ...updates }
    if (f.children) return { ...f, children: updateFieldById(f.children, id, updates) }
    return f
  })
}

function removeFieldById(fields: SchemaField[], id: string): SchemaField[] {
  return fields
    .filter(f => f.id !== id)
    .map(f => f.children ? { ...f, children: removeFieldById(f.children, id) } : f)
}

function moveFieldById(fields: SchemaField[], id: string, dir: 'up' | 'down'): SchemaField[] {
  const idx = fields.findIndex(f => f.id === id)
  if (idx === -1) {
    return fields.map(f =>
      f.children ? { ...f, children: moveFieldById(f.children, id, dir) } : f
    )
  }
  const newIdx = dir === 'up' ? idx - 1 : idx + 1
  if (newIdx < 0 || newIdx >= fields.length) return fields
  const arr = [...fields]
  ;[arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]]
  return arr
}
