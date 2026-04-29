import { useState, useCallback } from 'react'
import { api, extractError }     from '@/lib/api'
import { useQueryClient }        from '@tanstack/react-query'

export interface UploadResult {
  executionId: string
  status:      string
  filename:    string
  size:        string
  mimeType:    string
  stages:      { stage: string; status: string; order: number }[]
  message:     string
}

export interface BulkResult {
  summary: { total: number; queued: number; rejected: number }
  processing?: {
    started: boolean
    stopOnFailure: boolean
    failOnValidationWarnings: boolean
  }
  files:   {
    filename:    string
    status:      'queued' | 'rejected'
    executionId?: string
    size?:        string
    error?:       string
  }[]
}

export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

export function useUpload() {
  const qc                          = useQueryClient()
  const [status, setStatus]         = useState<UploadStatus>('idle')
  const [progress, setProgress]     = useState(0)
  const [result, setResult]         = useState<UploadResult | null>(null)
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null)
  const [error, setError]           = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus('idle')
    setProgress(0)
    setResult(null)
    setBulkResult(null)
    setError(null)
  }, [])

  // ── Single file upload ─────────────────────────────────────────────────────
  const uploadSingle = useCallback(async (
    file:     File,
    schemaId?: string
  ): Promise<UploadResult | null> => {
    setStatus('uploading')
    setProgress(0)
    setError(null)
    setResult(null)

    try {
      const form = new FormData()
      form.append('file', file)
      if (schemaId) form.append('schemaId', schemaId)

      const { data } = await api.post('/ingest/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded / (e.total || 1)) * 80))
        },
      })

      setProgress(85)
      setStatus('processing')

      const uploadResult: UploadResult = data.data

      // Auto-trigger processing
      await api.post(`/ingest/executions/${uploadResult.executionId}/process`)

      setProgress(100)
      setStatus('done')
      setResult(uploadResult)

      // Invalidate executions list
      qc.invalidateQueries({ queryKey: ['executions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })

      return uploadResult

    } catch (err) {
      const msg = extractError(err)
      setError(msg)
      setStatus('error')
      return null
    }
  }, [qc])

  // ── Bulk file upload ───────────────────────────────────────────────────────
  const uploadBulk = useCallback(async (
    files:    File[],
    schemaId?: string,
    options?: {
      stopOnFailure?: boolean
      failOnValidationWarnings?: boolean
    }
  ): Promise<BulkResult | null> => {
    setStatus('uploading')
    setProgress(0)
    setError(null)
    setBulkResult(null)

    try {
      const form = new FormData()
      files.forEach(f => form.append('files', f))
      if (schemaId) form.append('schemaId', schemaId)
      if (options?.stopOnFailure) form.append('stopOnFailure', 'true')
      if (options?.failOnValidationWarnings) form.append('failOnValidationWarnings', 'true')

      const { data } = await api.post('/ingest/bulk', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded / (e.total || 1)) * 90))
        },
      })

      setProgress(100)
      setStatus('done')

      const bulk: BulkResult = data.data
      setBulkResult(bulk)

      qc.invalidateQueries({ queryKey: ['executions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })

      return bulk

    } catch (err) {
      const msg = extractError(err)
      setError(msg)
      setStatus('error')
      return null
    }
  }, [qc])

  return {
    status, progress, result, bulkResult, error,
    uploadSingle, uploadBulk, reset,
  }
}
