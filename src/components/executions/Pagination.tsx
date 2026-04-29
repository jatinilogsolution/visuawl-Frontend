import { Button } from '@/components/ui/Button'
import { cn }     from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page:       number
  totalPages: number
  total:      number
  limit:      number
  onChange:   (page: number) => void
}

export function Pagination({ page, totalPages, total, limit, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const from = (page - 1) * limit + 1
  const to   = Math.min(page * limit, total)

  // Build page numbers array
  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-between pt-4"
      style={{ borderTop: '1px solid var(--border)' }}>

      {/* Count */}
      <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        {from}-{to} of {total}
      </div>

      {/* Pages */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft size={13} />
        </Button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dot-${i}`} className="px-2 text-xs"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={cn(
                'w-7 h-7 text-xs font-medium transition-all',
                page === p
                  ? 'bg-amber-500 text-black'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
              )}
              style={{ borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}
            >
              {p}
            </button>
          )
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight size={13} />
        </Button>
      </div>
    </div>
  )
}
