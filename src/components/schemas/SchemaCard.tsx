import { useState }           from 'react'
import { Badge }              from '@/components/ui/Badge'
import { Button }             from '@/components/ui/Button'
import { formatDateTime }     from '@/lib/utils'
import { cn }                 from '@/lib/utils'
import {
  Star, Copy, Trash2, Edit2,
  Layers, FileJson,
} from 'lucide-react'

interface SchemaCardProps {
  schema:     any
  onEdit:     (id: string) => void
  onDuplicate: (id: string) => void
  onDelete:   (id: string) => void
  onSetDefault: (id: string) => void
}

export function SchemaCard({
  schema, onEdit, onDuplicate, onDelete, onSetDefault,
}: SchemaCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div
      className={cn(
        'p-4 transition-all duration-200',
        'border hover:border-[var(--border-light)]',
        schema.isDefault && 'border-amber-500/30'
      )}
      style={{
        background:   schema.isDefault ? 'var(--amber-glow)' : 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <FileJson size={16} style={{ color: schema.isDefault ? 'var(--amber)' : 'var(--text-muted)', flexShrink: 0 }} />
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
              {schema.name}
            </div>
            {schema.description && (
              <div className="text-xs truncate mt-0.5"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {schema.description}
              </div>
            )}
          </div>
        </div>
        {schema.isDefault && (
          <Badge variant="amber">
            <Star size={9} className="mr-1" />
            DEFAULT
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <Layers size={11} style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {schema.fieldCount} fields
          </span>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {formatDateTime(schema.createdAt)}
        </span>
      </div>

      {/* Actions */}
      {!confirmDelete ? (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => onEdit(schema.id)} className="flex-1">
            <Edit2 size={11} />
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDuplicate(schema.id)}>
            <Copy size={11} />
          </Button>
          {!schema.isDefault && (
            <Button variant="ghost" size="sm" onClick={() => onSetDefault(schema.id)}>
              <Star size={11} />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={11} />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs flex-1" style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
            Delete "{schema.name}"?
          </span>
          <Button variant="danger" size="sm" onClick={() => onDelete(schema.id)}>Yes</Button>
          <Button variant="ghost"  size="sm" onClick={() => setConfirmDelete(false)}>No</Button>
        </div>
      )}
    </div>
  )
}
