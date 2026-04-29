import { useState }       from 'react'
import { cn }             from '@/lib/utils'
import type { SchemaField, FieldType } from '@/hooks/useSchemaBuilder'
import {
  Trash2, ChevronDown, ChevronUp, Plus,
  ChevronRight, GripVertical,
} from 'lucide-react'

const TYPES: { value: FieldType; label: string; color: string }[] = [
  { value: 'string',  label: 'string',  color: '#4ade80' },
  { value: 'number',  label: 'number',  color: '#60a5fa' },
  { value: 'boolean', label: 'boolean', color: 'var(--amber)' },
  { value: 'date',    label: 'date',    color: '#c084fc' },
  { value: 'array',   label: 'array',   color: '#f472b6' },
  { value: 'object',  label: 'object',  color: '#fb923c' },
]

const TYPE_COLOR: Record<FieldType, string> = Object.fromEntries(
  TYPES.map(t => [t.value, t.color])
) as Record<FieldType, string>

interface FieldRowProps {
  field:        SchemaField
  depth?:       number
  onUpdate:     (id: string, u: Partial<SchemaField>) => void
  onRemove:     (id: string) => void
  onMove:       (id: string, dir: 'up' | 'down') => void
  onAddChild?:  (parentId: string) => void
  isFirst?:     boolean
  isLast?:      boolean
}

export function FieldRow({
  field, depth = 0, onUpdate, onRemove, onMove, onAddChild,
  isFirst, isLast,
}: FieldRowProps) {
  const [childrenOpen, setChildrenOpen] = useState(true)
  const hasChildren = field.type === 'object' || field.type === 'array'
  const typeColor   = TYPE_COLOR[field.type]

  return (
    <div style={{ marginLeft: depth * 20 }}>
      {/* Field row */}
      <div
        className={cn(
          'group flex items-start gap-2 p-3 transition-all',
          'border hover:border-[var(--border-light)]'
        )}
        style={{
          background:   'var(--bg-elevated)',
          border:       '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 4,
        }}
      >
        {/* Grip */}
        <div className="pt-0.5 cursor-grab opacity-30 group-hover:opacity-60 flex-shrink-0">
          <GripVertical size={14} style={{ color: 'var(--text-muted)' }} />
        </div>

        {/* Fields */}
        <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: '1fr 120px 60px 1fr' }}>
          {/* Key name */}
          <input
            value={field.key}
            onChange={e => onUpdate(field.id, { key: e.target.value })}
            placeholder="field_name"
            className="h-7 px-2 text-xs bg-transparent border focus:outline-none focus:border-amber-500"
            style={{
              borderColor:  'var(--border)',
              color:        'var(--text-primary)',
              fontFamily:   'var(--font-mono)',
              borderRadius: 'var(--radius-sm)',
            }}
          />

          {/* Type */}
          <select
            value={field.type}
            onChange={e => onUpdate(field.id, { type: e.target.value as FieldType })}
            className="h-7 px-2 text-xs border bg-transparent focus:outline-none focus:border-amber-500 cursor-pointer"
            style={{
              borderColor:  'var(--border)',
              color:        typeColor,
              fontFamily:   'var(--font-mono)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {TYPES.map(t => (
              <option key={t.value} value={t.value}
                style={{ background: 'var(--bg-overlay)', color: 'var(--text-primary)' }}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Required toggle */}
          <button
            type="button"
            onClick={() => onUpdate(field.id, { required: !field.required })}
            className={cn(
              'h-7 px-2 text-xs font-bold uppercase transition-all border',
              field.required
                ? 'text-amber-400 border-amber-500/40 bg-amber-500/8'
                : 'text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--border-light)]'
            )}
            style={{ borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
          >
            {field.required ? 'REQ' : 'OPT'}
          </button>

          {/* Description */}
          <input
            value={field.description}
            onChange={e => onUpdate(field.id, { description: e.target.value })}
            placeholder="Field description for AI"
            className="h-7 px-2 text-xs bg-transparent border focus:outline-none focus:border-amber-500"
            style={{
              borderColor:  'var(--border)',
              color:        'var(--text-secondary)',
              fontFamily:   'var(--font-mono)',
              borderRadius: 'var(--radius-sm)',
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
          {hasChildren && (
            <button
              type="button"
              onClick={() => setChildrenOpen(!childrenOpen)}
              className="w-6 h-6 flex items-center justify-center transition-colors hover:text-amber-400"
              style={{ color: 'var(--text-muted)' }}
            >
              {childrenOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          )}
          <button
            type="button"
            onClick={() => !isFirst && onMove(field.id, 'up')}
            disabled={isFirst}
            className="w-6 h-6 flex items-center justify-center transition-colors hover:text-amber-400 disabled:opacity-20"
            style={{ color: 'var(--text-muted)' }}
          >
            <ChevronUp size={12} />
          </button>
          <button
            type="button"
            onClick={() => !isLast && onMove(field.id, 'down')}
            disabled={isLast}
            className="w-6 h-6 flex items-center justify-center transition-colors hover:text-amber-400 disabled:opacity-20"
            style={{ color: 'var(--text-muted)' }}
          >
            <ChevronDown size={12} />
          </button>
          <button
            type="button"
            onClick={() => onRemove(field.id)}
            className="w-6 h-6 flex items-center justify-center transition-colors hover:text-red-400"
            style={{ color: 'var(--text-muted)' }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && childrenOpen && (
        <div className="mt-1 mb-2">
          {(field.children || []).map((child, i) => (
            <FieldRow
              key={child.id}
              field={child}
              depth={depth + 1}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onMove={onMove}
              onAddChild={onAddChild}
              isFirst={i === 0}
              isLast={i === (field.children?.length || 1) - 1}
            />
          ))}
          {onAddChild && (
            <button
              type="button"
              onClick={() => onAddChild(field.id)}
              className="flex items-center gap-1.5 text-xs transition-colors hover:text-amber-400 ml-5 mt-1"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              <Plus size={11} />
              Add {field.type === 'array' ? 'item field' : 'child field'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
