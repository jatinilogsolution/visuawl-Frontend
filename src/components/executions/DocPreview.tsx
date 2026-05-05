import { useState, useEffect } from 'react'
import { api, resolveApiUrl }   from '@/lib/api'
import { Spinner }              from '@/components/ui/Spinner'
import { Button }               from '@/components/ui/Button'
import { cn }                   from '@/lib/utils'
import {  Maximize2, Minimize2, ExternalLink, FileText, Image } from 'lucide-react'

interface DocPreviewProps {
  executionId: string
  filename?:   string | null
  mimeType?:   string | null
  compact?:    boolean
}

export function DocPreview({
  executionId, filename, mimeType, compact,
}: DocPreviewProps) {
  const [fileUrl, setFileUrl]   = useState<string | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [previewFailed, setPreviewFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setPreviewFailed(false)

    api.get(`/ingest/executions/${executionId}/file-url`)
      .then(res => {
        if (!cancelled) {
          const url = res.data?.data?.url
          setFileUrl(url ? resolveApiUrl(url) : null)
          setLoading(false)
        }
      })
      .catch(_ => {
        if (!cancelled) {
          setError('Preview unavailable')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [executionId])

  const isPdf   = mimeType === 'application/pdf' || filename?.endsWith('.pdf')
  const isImage = mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|webp|tiff)$/i.test(filename || '')

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center', compact ? 'h-32' : 'h-64')}
        style={{ background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div className="flex flex-col items-center gap-2">
          <Spinner size="md" />
          <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Loading preview...
          </span>
        </div>
      </div>
    )
  }

  if (error || !fileUrl) {
    return (
      <div className={cn('flex items-center justify-center', compact ? 'h-32' : 'h-48')}
        style={{ background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
        <div className="flex flex-col items-center gap-2">
          <FileText size={24} style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {error || 'Document not available'}
          </span>
        </div>
      </div>
    )
  }

  const previewHeight = compact ? 200 : expanded ? 600 : 400

  if (previewFailed) {
    return (
      <div className={cn('flex items-center justify-center', compact ? 'h-32' : 'h-48')}
        style={{ background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
        <div className="flex flex-col items-center gap-2">
          <FileText size={24} style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Preview unavailable for this file
          </span>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs"
            style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
            Open in new tab
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="relative"
      style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2"
        style={{ background: 'var(--bg-overlay)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          {isImage ? <Image size={12} style={{ color: 'var(--amber)' }} />
            : <FileText size={12} style={{ color: 'var(--amber)' }} />}
          <span className="text-xs truncate max-w-48"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {filename || 'document'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm">
              <ExternalLink size={11} /> Open
            </Button>
          </a>
          {!compact && (
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
            </Button>
          )}
        </div>
      </div>

      {/* Preview area */}
      <div style={{ height: previewHeight, background: 'var(--bg-base)', overflow: 'hidden' }}>
        {isImage ? (
          <div className="h-full flex items-center justify-center overflow-auto p-3">
            <img
              src={fileUrl}
              alt={filename || 'Document preview'}
              className="max-h-full max-w-full object-contain"
              style={{ borderRadius: 'var(--radius-sm)' }}
              onError={() => setPreviewFailed(true)}
            />
          </div>
        ) : isPdf ? (
          <iframe
            src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            className="w-full h-full border-0"
            title={filename || 'PDF preview'}
            onError={() => setPreviewFailed(true)}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <FileText size={32} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
              <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Preview not available for this file type
              </div>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer"
                className="mt-2 inline-block text-xs"
                style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                Download to view →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
