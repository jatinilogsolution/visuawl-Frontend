import { useCallback, useState, useRef } from 'react'
import { cn }                            from '@/lib/utils'
import { Upload, FileText, X, Plus }     from 'lucide-react'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'application/pdf']
const ACCEPT_STR = '.jpg,.jpeg,.png,.webp,.tiff,.tif,.pdf'
const MAX_MB = 20

interface DropZoneProps {
  mode:         'single' | 'bulk'
  onFiles:      (files: File[]) => void
  disabled?:    boolean
  maxFiles?:    number
}

interface FileWithPreview {
  file:    File
  preview: string | null
}

export function DropZone({ mode, onFiles, disabled, maxFiles = 50 }: DropZoneProps) {
  const [dragging, setDragging]   = useState(false)
  const [files, setFiles]         = useState<FileWithPreview[]>([])
  const [errors, setErrors]       = useState<string[]>([])
  const inputRef                  = useRef<HTMLInputElement>(null)

  const validate = (rawFiles: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[]   = []
    const errs: string[]  = []

    for (const f of rawFiles) {
      if (!ACCEPTED.includes(f.type)) {
        errs.push(`${f.name}: unsupported type (${f.type})`)
        continue
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        errs.push(`${f.name}: exceeds ${MAX_MB}MB`)
        continue
      }
      valid.push(f)
    }

    if (mode === 'single' && valid.length > 1) {
      return { valid: [valid[0]], errors: ['Single upload mode — only first file used'] }
    }

    if (valid.length > maxFiles) {
      return { valid: valid.slice(0, maxFiles), errors: [`Max ${maxFiles} files — truncated`] }
    }

    return { valid, errors: errs }
  }

  const addFiles = useCallback((rawFiles: File[]) => {
    const { valid, errors: errs } = validate(rawFiles)
    setErrors(errs)

    const withPreviews: FileWithPreview[] = valid.map(f => ({
      file:    f,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
    }))

    const next = mode === 'single'
      ? withPreviews
      : [...files, ...withPreviews].slice(0, maxFiles)

    setFiles(next)
    onFiles(next.map(fp => fp.file))
  }, [files, mode, maxFiles, onFiles])

  const removeFile = (i: number) => {
    const next = files.filter((_, idx) => idx !== i)
    setFiles(next)
    onFiles(next.map(fp => fp.file))
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (disabled) return
    addFiles(Array.from(e.dataTransfer.files))
  }, [addFiles, disabled])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      {/* Drop area */}
      <div
        className={cn(
          'relative transition-all duration-200 cursor-pointer',
          'border-2 border-dashed',
          dragging
            ? 'border-amber-500 bg-amber-500/5'
            : 'border-(--border-light) hover:border-(--border-focus) hover:bg-(--bg-elevated)',
          disabled && 'opacity-40 cursor-not-allowed'
        )}
        style={{ borderRadius: 'var(--radius-lg)', minHeight: 160 }}
        onDragOver={e => { e.preventDefault(); if (!disabled) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ACCEPT_STR}
          multiple={mode === 'bulk'}
          onChange={onInputChange}
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div
            className="w-12 h-12 flex items-center justify-center mb-4"
            style={{
              background:   dragging ? 'var(--amber-glow)' : 'var(--bg-elevated)',
              border:       `1px solid ${dragging ? 'var(--amber)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
            }}
          >
            <Upload size={20} style={{ color: dragging ? 'var(--amber)' : 'var(--text-muted)' }} />
          </div>

          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            {dragging
              ? 'Release to upload'
              : mode === 'bulk'
              ? `Drop up to ${maxFiles} files here`
              : 'Drop your document here'}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            or click to browse · JPG, PNG, WEBP, TIFF, PDF · max {MAX_MB}MB each
          </p>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div
          className="p-3 text-xs space-y-1"
          style={{
            background:   'rgba(239,68,68,0.05)',
            border:       '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radius-md)',
            color:        'var(--red)',
            fontFamily:   'var(--font-mono)',
          }}
        >
          {errors.map((e, i) => <div key={i}>⚠ {e}</div>)}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div
            className="text-xs tracking-widest uppercase mb-2"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {files.length} file{files.length > 1 ? 's' : ''} selected
          </div>
          {files.map((fp, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2.5"
              style={{
                background:   'var(--bg-elevated)',
                border:       '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {/* Preview / icon */}
              {fp.preview ? (
                <img
                  src={fp.preview}
                  className="w-8 h-8 object-cover shrink-0"
                  style={{ borderRadius: 'var(--radius-sm)' }}
                  alt=""
                />
              ) : (
                <div
                  className="w-8 h-8 flex items-center justify-center shrink-0"
                  style={{ background: 'var(--bg-overlay)', borderRadius: 'var(--radius-sm)' }}
                >
                  <FileText size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              )}

              {/* Name + size */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-xs truncate"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                >
                  {fp.file.name}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {(fp.file.size / 1024 / 1024).toFixed(2)} MB · {fp.file.type}
                </div>
              </div>

              {/* Remove */}
              <button
                onClick={e => { e.stopPropagation(); removeFile(i) }}
                className="shrink-0 transition-colors hover:text-red-400"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {/* Add more (bulk) */}
          {mode === 'bulk' && files.length < maxFiles && (
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs transition-colors hover:border-amber-500/40"
              style={{
                color:        'var(--text-muted)',
                border:       '1px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                fontFamily:   'var(--font-mono)',
              }}
            >
              <Plus size={12} />
              Add more files ({maxFiles - files.length} remaining)
            </button>
          )}
        </div>
      )}
    </div>
  )
}