import { useState }   from 'react'
import { toast }      from 'react-hot-toast'
import { api }        from '@/lib/api'
import { Button }     from '@/components/ui/Button'
import { cn }         from '@/lib/utils'
import { Download, ChevronDown, FileJson, FileSpreadsheet, FileText, File } from 'lucide-react'

const FORMATS = [
  { id: 'json',  label: 'JSON',  ext: '.json', icon: FileJson,        desc: 'Machine-readable data'  },
  { id: 'csv',   label: 'CSV',   ext: '.csv',  icon: FileText,        desc: 'Spreadsheet compatible' },
  { id: 'excel', label: 'Excel', ext: '.xlsx', icon: FileSpreadsheet, desc: 'Multi-sheet workbook'   },
  { id: 'pdf',   label: 'PDF',   ext: '.pdf',  icon: File,            desc: 'Formatted report'       },
] as const

type ExportFormat = typeof FORMATS[number]['id']

interface ExportMenuProps {
  executionId: string
  filename?:   string | null
}

export function ExportMenu({ executionId, filename }: ExportMenuProps) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState<ExportFormat | null>(null)

  const baseName = (filename || 'extraction').replace(/\.[^.]+$/, '')

  const handleExport = async (format: ExportFormat) => {
    setLoading(format)
    setOpen(false)
    try {
      const res = await api.post(
        `/ingest/executions/${executionId}/export`,
        { format },
        { responseType: 'blob' }
      )

      const ext  = FORMATS.find(f => f.id === format)?.ext || `.${format}`
      const url  = URL.createObjectURL(res.data)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${baseName}_${new Date().toISOString().slice(0,10)}${ext}`
      a.click()
      URL.revokeObjectURL(url)

      toast.success(`Exported as ${format.toUpperCase()}`)
    } catch (err: any) {
      let message = 'Export failed'
      const data = err?.response?.data

      if (data instanceof Blob) {
        try {
          const text = await data.text()
          const parsed = JSON.parse(text)
          message = parsed?.message || message
        } catch {
          // Ignore parse failures and keep default message.
        }
      } else if (typeof data?.message === 'string') {
        message = data.message
      }

      toast.error(message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(!open)}
        loading={!!loading}
      >
        <Download size={12} />
        Export
        <ChevronDown
          size={11}
          className={cn('transition-transform', open && 'rotate-180')}
        />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full z-20 mt-1 w-52"
            style={{
              background:   'var(--bg-overlay)',
              border:       '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              boxShadow:    '0 8px 24px rgba(0,0,0,0.5)',
            }}
          >
            <div className="px-3 py-2"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-xs font-bold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                Download As
              </span>
            </div>
            {FORMATS.map(fmt => {
              const Icon = fmt.icon
              return (
                <button key={fmt.id}
                  onClick={() => handleExport(fmt.id)}
                  disabled={!!loading}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-(--bg-elevated)">
                  <Icon size={14} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                  <div>
                    <div className="text-xs font-semibold"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {fmt.label}
                      <span style={{ color: 'var(--text-muted)' }}>{fmt.ext}</span>
                    </div>
                    {/* <div className="text-xs"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {fmt.desc}
                    </div> */}
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
