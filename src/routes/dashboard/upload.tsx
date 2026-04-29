import { createFileRoute }       from '@tanstack/react-router'
import { useState }              from 'react'
import { toast }                 from 'react-hot-toast'
import { cn }                    from '@/lib/utils'
import { useUpload }             from '@/hooks/useUpload'
import { DropZone }              from '@/components/upload/DropZone'
import { SchemaSelector }        from '@/components/upload/SchemaSelector'
import { UploadProgress }        from '@/components/upload/UploadProgress'
import { ResultViewer }          from '@/components/upload/ResultViewer'
import { BulkResultSummary }     from '@/components/upload/BulkResultSummary'
import { Button }                from '@/components/ui/Button'
import { Card, CardHeader }      from '@/components/ui/Card'
import { Upload, Files, Info }   from 'lucide-react'

export const Route = createFileRoute('/dashboard/upload')({
  component: UploadPage,
})

type UploadMode = 'single' | 'bulk'

function UploadPage() {
  const [mode, setMode]           = useState<UploadMode>('single')
  const [files, setFiles]         = useState<File[]>([])
  const [schemaId, setSchemaId]   = useState<string | null>(null)
  const [stopOnFailure, setStopOnFailure] = useState(false)
  const [failOnValidationWarnings, setFailOnValidationWarnings] = useState(false)

  const {
    status, progress, result, bulkResult, error,
    uploadSingle, uploadBulk, reset,
  } = useUpload()

  const isDone      = status === 'done'
  const isUploading = status === 'uploading' || status === 'processing'

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast.error('Select at least one file')
      return
    }

    if (mode === 'single') {
      const res = await uploadSingle(files[0], schemaId || undefined)
      if (!res) return   // error already set
    } else {
      const res = await uploadBulk(files, schemaId || undefined, {
        stopOnFailure,
        failOnValidationWarnings,
      })
      if (!res) return
    }
  }

  const handleReset = () => {
    reset()
    setFiles([])
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div
          className="text-xs tracking-widest uppercase mb-1"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          extraction engine
        </div>
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          Upload Documents
        </h1>
      </div>

      {/* ── Result view after success ─────────────────────────────────── */}
      {isDone && result && mode === 'single' && (
        <div className="animate-fade-in-up">
          <ResultViewer executionId={result.executionId} onReset={handleReset} />
        </div>
      )}

      {isDone && bulkResult && mode === 'bulk' && (
        <div className="animate-fade-in-up">
          <Card padding="md">
            <CardHeader title="Bulk Upload Complete" />
            <BulkResultSummary result={bulkResult} onReset={handleReset} />
          </Card>
        </div>
      )}

      {/* ── Upload form ─────────────────────────────────────────────────── */}
      {!isDone && (
        <div className="space-y-5">

          {/* Mode selector */}
          <div
            className="flex gap-1 p-1"
            style={{
              background:   'var(--bg-elevated)',
              border:       '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              display:      'inline-flex',
            }}
          >
            {([
              { id: 'single', label: 'Single File',  icon: Upload },
              { id: 'bulk',   label: 'Bulk Upload',  icon: Files  },
            ] as { id: UploadMode; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setMode(id); setFiles([]); reset() }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all',
                  mode === id
                    ? 'bg-amber-500 text-black'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
                style={{ borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-display)' }}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Bulk info banner */}
          {mode === 'bulk' && (
            <div
              className="flex items-center gap-2 px-3 py-2 text-xs"
              style={{
                background:   'var(--bg-elevated)',
                border:       '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color:        'var(--text-muted)',
                fontFamily:   'var(--font-mono)',
              }}
            >
              <Info size={12} style={{ flexShrink: 0 }} />
              Bulk uploads are queued and processed asynchronously. Track progress in Executions.
            </div>
          )}

          {mode === 'bulk' && (
            <Card padding="md">
              <CardHeader
                title="Bulk Failure Controls"
                subtitle="Optional safety behavior for long batch runs"
              />
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stopOnFailure}
                    onChange={(e) => setStopOnFailure(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    Stop remaining queued files when any file fails extraction.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={failOnValidationWarnings}
                    onChange={(e) => setFailOnValidationWarnings(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    Treat validation warnings (for example missing grand total or vendor name) as failures.
                  </span>
                </label>
              </div>
            </Card>
          )}

          {/* Drop zone */}
          <Card padding="md">
            <CardHeader
              title={mode === 'single' ? 'Select Document' : `Select Up To 50 Files`}
              subtitle="JPG, PNG, WEBP, TIFF, PDF — max 20MB each"
            />
            <DropZone
              mode={mode}
              onFiles={setFiles}
              disabled={isUploading}
              maxFiles={50}
            />
          </Card>

          {/* Schema selector */}
          <Card padding="md" className="overflow-visible">
            <CardHeader
              title="Extraction Schema"
              subtitle="Choose the output format for extracted data"
            />
            <div className="relative z-30">
              <SchemaSelector value={schemaId} onChange={setSchemaId} />
            </div>

            {/* Schema info */}
            <div
              className="mt-3 p-3 text-xs"
              style={{
                background:   'var(--bg-elevated)',
                border:       '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color:        'var(--text-muted)',
                fontFamily:   'var(--font-mono)',
              }}
            >
              {schemaId === null
                ? '📋 Universal schema extracts: vendor, customer, line items, taxes, totals, payment info'
                : '📋 Custom schema will override the universal extraction format'}
            </div>
          </Card>

          {/* Progress */}
          <UploadProgress
            status={status}
            progress={progress}
            filename={files[0]?.name}
          />

          {/* Error */}
          {status === 'error' && error && (
            <div
              className="p-4 text-sm"
              style={{
                background:   'rgba(239,68,68,0.05)',
                border:       '1px solid rgba(239,68,68,0.25)',
                borderRadius: 'var(--radius-md)',
                color:        'var(--red)',
                fontFamily:   'var(--font-mono)',
              }}
            >
              ⚠ {error}
            </div>
          )}

          {/* Submit */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSubmit}
            loading={isUploading}
            disabled={files.length === 0 || isUploading}
          >
            <Upload size={16} />
            {mode === 'single'
              ? 'Upload & Extract'
              : `Upload ${files.length > 0 ? `${files.length} File${files.length > 1 ? 's' : ''}` : 'Files'}`
            }
          </Button>

          {/* Tips */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ['⚡', 'Groq AI primary', 'Mistral as fallback for reliability'],
              ['🔐', 'End-to-end encrypted', 'Files encrypted before storage'],
              ['📊', 'Token tracked', 'Cost logged per extraction'],
              ['🔄', 'Auto-deliver', 'Results sent to your destinations'],
            ].map(([icon, title, desc]) => (
              <div
                key={title}
                className="p-3"
                style={{
                  background:   'var(--bg-surface)',
                  border:       '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{icon}</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
                    {title}
                  </span>
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
