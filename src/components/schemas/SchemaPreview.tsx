import type { SchemaField } from '@/hooks/useSchemaBuilder'

interface SchemaPreviewProps {
  fields: SchemaField[]
  name:   string
}

function buildPreview(fields: SchemaField[]): any {
  const obj: Record<string, any> = {}
  for (const f of fields) {
    let typeHint = f.type
    if (!f.required) typeHint += ' | null'
    if (f.description) typeHint += ` — ${f.description}`

    if ((f.type === 'object' || f.type === 'array') && f.children?.length) {
      const child = buildPreview(f.children)
      obj[f.key || 'unnamed'] = f.type === 'array' ? [child] : child
    } else {
      obj[f.key || 'unnamed'] = typeHint
    }
  }
  return obj
}

function countFields(fields: SchemaField[]): { total: number; required: number } {
  return fields.reduce(
    (acc, field) => {
      const childCount = field.children?.length ? countFields(field.children) : { total: 0, required: 0 }
      return {
        total: acc.total + 1 + childCount.total,
        required: acc.required + (field.required ? 1 : 0) + childCount.required,
      }
    },
    { total: 0, required: 0 }
  )
}

function JsonLine({ value, depth = 0 }: { value: any; depth?: number }) {
  if (typeof value === 'string') {
    const [type, ...rest] = value.split(' — ')
    return (
      <span>
        <span style={{ color: '#4ade80' }}>"{type}"</span>
        {rest.length > 0 && (
          <span style={{ color: 'var(--text-muted)' }}>{' // '}{rest.join(' — ')}</span>
        )}
      </span>
    )
  }

  if (Array.isArray(value)) {
    return (
      <span>
        <span style={{ color: 'var(--text-primary)' }}>{'['}</span>
        <div style={{ paddingLeft: 16 }}>
          {value.map((v, i) => (
            <div key={i}>
              <JsonLine value={v} depth={depth + 1} />
              {i < value.length - 1 && <span style={{ color: 'var(--text-muted)' }}>,</span>}
            </div>
          ))}
        </div>
        <span style={{ color: 'var(--text-primary)' }}>
          {']'}
          {depth > 0 && ','}
        </span>
      </span>
    )
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value)
    return (
      <span>
        <span style={{ color: 'var(--text-primary)' }}>{'{'}</span>
        <div style={{ paddingLeft: 16 }}>
          {keys.map((key, i) => (
            <div key={key}>
              <span style={{ color: '#e879f9' }}>"{key}"</span>
              <span style={{ color: 'var(--text-muted)' }}>: </span>
              <JsonLine value={value[key]} depth={depth + 1} />
              {i < keys.length - 1 && <span style={{ color: 'var(--text-muted)' }}>,</span>}
            </div>
          ))}
        </div>
        <span style={{ color: 'var(--text-primary)' }}>
          {'}'}
          {depth > 0 && ','}
        </span>
      </span>
    )
  }

  return <span style={{ color: 'var(--text-secondary)' }}>{String(value)}</span>
}

export function SchemaPreview({ fields, name }: SchemaPreviewProps) {
  const preview = buildPreview(fields)
  const counts = countFields(fields)
  const fieldCount = counts.total
  const requiredCount = counts.required

  return (
    <div>
      <div className="text-xs uppercase tracking-widest mb-3"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
        {name}
      </div>
      {/* Stats */}
      <div className="flex items-center gap-4 mb-4">
        {[
          { label: 'Fields',   value: fieldCount },
          { label: 'Required', value: requiredCount },
          { label: 'Optional', value: fieldCount - requiredCount },
        ].map(({ label, value }) => (
          <div key={label}>
            <span className="text-xs uppercase tracking-widest"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
              {label}
            </span>
            <span className="ml-2 text-sm font-bold"
              style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* JSON preview */}
      <div
        className="overflow-auto p-4 text-xs leading-relaxed"
        style={{
          background:   'var(--bg-base)',
          border:       '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          fontFamily:   'var(--font-mono)',
          maxHeight:    420,
        }}
      >
        {fieldCount === 0 ? (
          <span style={{ color: 'var(--text-muted)' }}>// Add fields to see preview</span>
        ) : (
          <JsonLine value={preview} />
        )}
      </div>
    </div>
  )
}
