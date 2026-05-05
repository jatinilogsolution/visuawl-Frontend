import { createFileRoute }     from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { toast }               from 'react-hot-toast'
import { useForm }             from 'react-hook-form'
import { zodResolver }         from '@hookform/resolvers/zod'
import { z }                   from 'zod'
import { apiGet, extractError } from '@/lib/api'
import {
  useSchemaList,
  useSchemaDetail,
  useCreateSchema,
  useUpdateSchema,
  useDeleteSchema,
  useSetDefaultSchema,
  useDuplicateSchema,
  useValidateSchema,
  useTestSchema,
  useFieldEditor,
  EMPTY_FIELD,
  newId,
  type SchemaField,
} from '@/hooks/useSchemaBuilder'
import { FieldRow }         from '@/components/schemas/FieldRow'
import { SchemaPreview }    from '@/components/schemas/SchemaPreview'
import { SchemaCard }       from '@/components/schemas/SchemaCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button }           from '@/components/ui/Button'
import { Input }            from '@/components/ui/Input'
import { Spinner }          from '@/components/ui/Spinner'
import { cn }               from '@/lib/utils'
import {
  Plus, Save, X, Play, Check,
  FileJson, Sparkles, ChevronRight,
  AlertTriangle, CheckCircle,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/schemas')({
  component: SchemasPage,
})

// ─── Schema form schema ───────────────────────────────────────────────────────

const metaSchema = z.object({
  name:        z.string().min(1, 'Name required'),
  description: z.string().optional(),
  is_default:  z.boolean().optional(),
})

type MetaForm = z.infer<typeof metaSchema>
type ExampleField = {
  key: string
  type: SchemaField['type']
  required: boolean
  description: string
}

const EXAMPLE_FIELDS: ExampleField[] = [
  {
    key: 'invoice_number',
    type: 'string',
    required: true,
    description: 'Invoice or bill number as printed on document',
  },
  {
    key: 'total_amount',
    type: 'number',
    required: true,
    description: 'Final total amount payable including all taxes',
  },
  {
    key: 'vendor_name',
    type: 'string',
    required: true,
    description: 'Name of the vendor or supplier',
  },
  {
    key: 'line_items',
    type: 'array',
    required: false,
    description: 'List of individual line items or products',
  },
]

function withFieldIds(fields: any[]): SchemaField[] {
  return fields.map((f: any) => ({
    ...f,
    id: f.id || newId(),
    children: Array.isArray(f.children) ? withFieldIds(f.children) : undefined,
  }))
}

function stripFieldIds(fields: SchemaField[]): any[] {
  return fields.map(({ id, children, ...rest }) => ({
    ...rest,
    children: children?.length ? stripFieldIds(children) : undefined,
  }))
}

function validateSchemaFields(fields: SchemaField[]): string | null {
  if (fields.length === 0) return 'Add at least one field'

  const walk = (level: SchemaField[], path: string): string | null => {
    const seen = new Set<string>()
    for (const field of level) {
      const key = field.key.trim()
      if (!key) return 'All fields must have a key name'
      if (seen.has(key)) return `Duplicate key "${key}" in ${path}`
      seen.add(key)

      if (field.children?.length) {
        const childPath = path === 'root' ? key : `${path}.${key}`
        const childError = walk(field.children, childPath)
        if (childError) return childError
      }
    }
    return null
  }

  return walk(fields, 'root')
}

function sampleToFieldType(value: unknown): SchemaField['type'] {
  if (Array.isArray(value)) return 'array'
  if (value instanceof Date) return 'date'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  if (value && typeof value === 'object') return 'object'

  if (typeof value === 'string') {
    const maybeDate = Date.parse(value)
    if (Number.isFinite(maybeDate) && value.includes('-')) return 'date'
  }
  return 'string'
}

function humanizeKey(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
}

function convertJsonToSchemaFields(input: unknown): SchemaField[] {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return []

  const walkObject = (obj: Record<string, unknown>): SchemaField[] => {
    return Object.entries(obj).map(([key, raw]) => {
      const type = sampleToFieldType(raw)
      const field: SchemaField = {
        ...EMPTY_FIELD(),
        key,
        type,
        required: false,
        description: `Extract ${humanizeKey(key) || key}`,
      }

      if (type === 'object' && raw && typeof raw === 'object' && !Array.isArray(raw)) {
        const children = walkObject(raw as Record<string, unknown>)
        if (children.length) field.children = children
      }

      if (type === 'array') {
        const first = Array.isArray(raw) ? raw[0] : undefined
        if (first && typeof first === 'object' && !Array.isArray(first)) {
          const children = walkObject(first as Record<string, unknown>)
          if (children.length) field.children = children
        }
      }

      if (
        raw !== null &&
        raw !== undefined &&
        (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean')
      ) {
        field.example = String(raw)
      }

      return field
    })
  }

  return walkObject(input as Record<string, unknown>)
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function SchemasPage() {
  const [editingId, setEditingId]     = useState<string | null>(null)
  const [showBuilder, setShowBuilder] = useState(false)

  const { data: listData, isLoading }  = useSchemaList()
  const schemas                        = listData?.data || []

  const deleteMutation    = useDeleteSchema()
  const defaultMutation   = useSetDefaultSchema()
  const duplicateMutation = useDuplicateSchema()

  const handleEdit = (id: string) => {
    setEditingId(id)
    setShowBuilder(true)
  }

  const handleNew = () => {
    setEditingId(null)
    setShowBuilder(true)
  }

  const handleClose = () => {
    setShowBuilder(false)
    setEditingId(null)
  }

  const handleViewUniversalSchema = async () => {
    try {
      const res = await apiGet<any>('/schemas/universal')
      const pretty = JSON.stringify(res.data, null, 2)
      const blob = new Blob([pretty], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (err) {
      toast.error(extractError(err))
    }
  }

  if (showBuilder) {
    return (
      <SchemaBuilder
        editingId={editingId}
        onClose={handleClose}
      />
    )
  }

  return (
    <div className="p-6 max-w-[1100px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs tracking-widest uppercase mb-1"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            extraction templates
          </div>
          <h1 className="text-3xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Schemas
          </h1>
        </div>
        <Button variant="primary" size="md" onClick={handleNew}>
          <Plus size={14} />
          New Schema
        </Button>
      </div>

      {/* Universal schema info */}
      <div
        className="flex items-center gap-4 p-4 mb-6"
        style={{
          background:   'var(--bg-surface)',
          border:       '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div
          className="w-10 h-10 flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--amber-glow)', border: '1px solid var(--amber-dim)', borderRadius: 'var(--radius-md)' }}
        >
          <Sparkles size={18} style={{ color: 'var(--amber)' }} />
        </div>
        <div>
          <div className="text-sm font-semibold mb-0.5"
            style={{ color: 'var(--text-primary)' }}>
            Universal Schema (Built-in)
          </div>
          <div className="text-xs"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Automatically extracts vendor, customer, line items, totals, taxes and payment info
            from any invoice or receipt. Used when no custom schema is selected.
          </div>
        </div>
        <div className="ml-auto flex-shrink-0">
          <Button variant="ghost" size="sm"
            onClick={handleViewUniversalSchema}>
            View Schema
            <ChevronRight size={12} />
          </Button>
        </div>
      </div>

      {/* Schema grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : schemas.length === 0 ? (
        <div className="py-20 text-center">
          <FileJson size={32} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            No custom schemas yet
          </div>
          <div className="text-xs mb-6" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Create a schema to define a custom extraction format
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[560px] mx-auto mb-6 text-left">
            {EXAMPLE_FIELDS.slice(0, 2).map((example) => (
              <div
                key={example.key}
                className="p-3"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div
                  className="text-xs font-semibold mb-0.5"
                  style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}
                >
                  {example.key}
                </div>
                <div
                  className="text-xs"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                >
                  {example.type} · {example.required ? 'required' : 'optional'}
                </div>
              </div>
            ))}
          </div>
          <Button variant="primary" size="md" onClick={handleNew}>
            <Plus size={14} />
            Create First Schema
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {schemas.map((s: any) => (
            <SchemaCard
              key={s.id}
              schema={s}
              onEdit={handleEdit}
              onDuplicate={(id) => duplicateMutation.mutate(id)}
              onDelete={(id) => deleteMutation.mutate(id)}
              onSetDefault={(id) => defaultMutation.mutate(id)}
            />
          ))}
          {/* Add new card */}
          <button
            onClick={handleNew}
            className="p-4 border-2 border-dashed transition-all hover:border-amber-500/40 hover:bg-amber-500/3 flex flex-col items-center justify-center gap-3 min-h-36"
            style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius-lg)' }}
          >
            <div
              className="w-10 h-10 flex items-center justify-center"
              style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}
            >
              <Plus size={18} style={{ color: 'var(--text-muted)' }} />
            </div>
            <span className="text-xs uppercase tracking-widest"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
              New Schema
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Schema Builder Panel ─────────────────────────────────────────────────────

function SchemaBuilder({
  editingId,
  onClose,
}: {
  editingId: string | null
  onClose:   () => void
}) {
  const { data: existing } = useSchemaDetail(editingId)
  const createMutation     = useCreateSchema()
  const updateMutation     = useUpdateSchema(editingId || '')
  const validateMutation   = useValidateSchema()
  const testMutation       = useTestSchema()

  const [activeTab, setActiveTab] = useState<'build' | 'preview' | 'test'>('build')
  const [testInput, setTestInput] = useState('')
  const [testResult, setTestResult] = useState<any>(null)
  const [importJsonText, setImportJsonText] = useState('')
  const [appendImported, setAppendImported] = useState(false)

  const { fields, setFields, addField, updateField, removeField, moveField } =
    useFieldEditor([])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MetaForm>({
    resolver: zodResolver(metaSchema),
    defaultValues: {
      name:        existing?.data?.name        || '',
      description: existing?.data?.description || '',
      is_default:  existing?.data?.isDefault   || false,
    },
  })

  // Load existing data
  useEffect(() => {
    if (existing?.data) {
      reset({
        name:        existing.data.name,
        description: existing.data.description || '',
        is_default:  existing.data.isDefault,
      })
      if (existing.data.schema_definition?.fields) {
        setFields(withFieldIds(existing.data.schema_definition.fields))
      }
    }
  }, [existing?.data, reset, setFields])

  const schemaName = watch('name') || 'My Schema'

  // Validate fields
  const validateFields = (): boolean => {
    const error = validateSchemaFields(fields)
    if (error) {
      toast.error(error)
      return false
    }
    return true
  }

  const onSave = handleSubmit(async (meta) => {
    if (!validateFields()) return

    const schema_definition = {
      name:        meta.name,
      description: meta.description || '',
      fields:      stripFieldIds(fields),
    }

    if (editingId) {
      await updateMutation.mutateAsync({ ...meta, schema_definition })
    } else {
      await createMutation.mutateAsync({ ...meta, schema_definition })
    }

    onClose()
  })

  const onValidate = async () => {
    if (!validateFields()) return
    const schema_definition = {
      name:   schemaName,
      description: '',
      fields: stripFieldIds(fields),
    }
    try {
      const result = await validateMutation.mutateAsync(schema_definition)
      toast.success(`Valid — ${(result.data as any).fieldCount} fields`)
    } catch (err: any) {
      const errors = err?.response?.data?.details
      toast.error(Array.isArray(errors) ? errors[0] : 'Validation failed')
    }
  }

  const onTest = async () => {
    if (!editingId) {
      toast.error('Save the schema first before testing')
      return
    }
    let sample: any
    try {
      sample = JSON.parse(testInput || '{}')
    } catch {
      toast.error('Invalid JSON in test input')
      return
    }
    try {
      const result = await testMutation.mutateAsync({ id: editingId, sample_data: sample })
      setTestResult(result.data)
    } catch {
      toast.error('Test failed')
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending
  const addExampleField = (example: ExampleField) => {
    setFields(prev => [
      ...prev,
      {
        ...EMPTY_FIELD(),
        key: example.key,
        type: example.type,
        required: example.required,
        description: example.description,
      },
    ])
  }

  const onImportJsonFields = () => {
    if (!importJsonText.trim()) {
      toast.error('Paste JSON first')
      return
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(importJsonText)
    } catch {
      toast.error('Invalid JSON format')
      return
    }

    const generated = convertJsonToSchemaFields(parsed)
    if (!generated.length) {
      toast.error('JSON must be an object like { "field": "value" }')
      return
    }

    if (appendImported) {
      setFields(prev => [...prev, ...generated])
    } else {
      setFields(generated)
    }

    toast.success(`Generated ${generated.length} field${generated.length > 1 ? 's' : ''} from JSON`)
  }

  const TABS = [
    { id: 'build',   label: 'Build Fields'   },
    { id: 'preview', label: 'JSON Preview'   },
    { id: 'test',    label: 'Test Schema'    },
  ] as const

  return (
    <div className="p-6 max-w-[1100px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onClose}
            className="text-xs flex items-center gap-1.5 transition-colors hover:text-amber-400"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            ← Schemas
          </button>
          <div className="w-px h-4" style={{ background: 'var(--border)' }} />
          <h1 className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            {editingId ? 'Edit Schema' : 'New Schema'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onValidate} loading={validateMutation.isPending}>
            <Check size={13} />
            Validate
          </Button>
          <Button variant="primary" size="md" onClick={onSave} loading={isSaving}>
            <Save size={13} />
            {editingId ? 'Save Changes' : 'Create Schema'}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={13} />
          </Button>
        </div>
      </div>

      {/* Meta form */}
      <Card padding="md" className="mb-5">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Schema Name"
            placeholder="Purchase Order Schema"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Description (optional)"
            placeholder="For extracting purchase order documents"
            {...register('description')}
          />
        </div>
        <div className="flex items-center gap-2 mt-3">
          <input
            type="checkbox"
            id="is_default"
            {...register('is_default')}
            className="w-4 h-4 accent-amber-500"
          />
          <label htmlFor="is_default" className="text-xs cursor-pointer"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            Set as default schema (used for all uploads without explicit schema selection)
          </label>
        </div>
      </Card>

      {/* Tab bar */}
      <div className="flex gap-0 mb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'px-5 py-2.5 text-xs font-semibold uppercase tracking-widest',
              'border-b-2 transition-colors -mb-px',
              activeTab === t.id
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── BUILD TAB ────────────────────────────────────────────────── */}
      {activeTab === 'build' && (
        <div className="animate-fade-in-up">
          <Card padding="md" className="mb-4">
            <CardHeader
              title="JSON to Fields"
              subtitle="Paste sample JSON and auto-create schema fields. You can edit/add more fields afterward."
            />
            <div className="space-y-3">
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder={`{
  "invoice_number": "INV-2026-001",
  "total_amount": 1299.5,
  "vendor": {
    "name": "Acme Corp",
    "gstin": "22AAAAA0000A1Z5"
  },
  "line_items": [
    { "name": "Item A", "qty": 2, "price": 199.5 }
  ]
}`}
                rows={10}
                className="w-full px-3 py-2 text-xs border resize-y focus:outline-none focus:border-amber-500"
                style={{
                  background: 'var(--bg-base)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  borderRadius: 'var(--radius-md)',
                }}
              />

              <div className="flex items-center justify-between gap-3">
                <label className="text-xs flex items-center gap-2"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  <input
                    type="checkbox"
                    checked={appendImported}
                    onChange={(e) => setAppendImported(e.target.checked)}
                    className="w-4 h-4 accent-amber-500"
                  />
                  Append to existing fields (instead of replace)
                </label>

                <Button variant="outline" size="sm" onClick={onImportJsonFields}>
                  <FileJson size={13} />
                  Generate Fields
                </Button>
              </div>
            </div>
          </Card>

          {/* Column headers */}
          <div
            className="grid gap-2 px-3 py-2 mb-2 text-xs font-semibold uppercase tracking-widest"
            style={{
              gridTemplateColumns: '20px 1fr 120px 60px 1fr 80px',
              color:   'var(--text-muted)',
              fontFamily: 'var(--font-display)',
            }}
          >
            <span />
            <span>Key Name</span>
            <span>Type</span>
            <span>Req?</span>
            <span>Description for AI</span>
            <span>Actions</span>
          </div>

          {/* Fields */}
          <div className="space-y-1 mb-4">
            {fields.map((field, i) => (
              <FieldRow
                key={field.id}
                field={field}
                onUpdate={updateField}
                onRemove={removeField}
                onMove={moveField}
                onAddChild={addField}
                isFirst={i === 0}
                isLast={i === fields.length - 1}
              />
            ))}
          </div>

          {/* Add field */}
          <button
            type="button"
            onClick={() => addField()}
            className="flex items-center gap-2 w-full py-2.5 text-xs transition-all border-2 border-dashed hover:border-amber-500/40 hover:bg-amber-500/3"
            style={{
              color:        'var(--text-muted)',
              borderColor:  'var(--border)',
              borderRadius: 'var(--radius-md)',
              fontFamily:   'var(--font-mono)',
            }}
          >
            <Plus size={13} className="mx-auto" />
          </button>

          {/* Tips */}
          {fields.length === 0 && (
            <div
              className="mt-6 p-5 text-center"
              style={{
                background:   'var(--bg-surface)',
                border:       '1px dashed var(--border)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div className="text-3xl mb-3">📋</div>
              <div className="text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}>
                Start building your schema
              </div>
              <div className="text-xs mb-4"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Each field tells the AI what to extract and where to put it in the output JSON.
                Good descriptions = more accurate extraction.
              </div>
              <div className="grid grid-cols-2 gap-3 text-left">
                {EXAMPLE_FIELDS.map(example => (
                  <div
                    key={example.key}
                    className="p-3 cursor-pointer hover:border-amber-500/30 transition-all"
                    style={{
                      background:   'var(--bg-elevated)',
                      border:       '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                    }}
                    onClick={() => addExampleField(example)}
                  >
                    <div className="text-xs font-semibold mb-0.5"
                      style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                      {example.key}
                    </div>
                    <div className="text-xs"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {example.type} · {example.required ? 'required' : 'optional'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PREVIEW TAB ──────────────────────────────────────────────── */}
      {activeTab === 'preview' && (
        <Card padding="md" className="animate-fade-in-up">
          <CardHeader
            title="AI Prompt Shape"
            subtitle="This is the exact JSON structure sent to Groq/Mistral as the extraction target"
          />
          <SchemaPreview fields={fields} name={schemaName} />

          {/* Validate button */}
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <Button
              variant="outline"
              size="md"
              onClick={onValidate}
              loading={validateMutation.isPending}
            >
              <Check size={13} />
              Validate Schema Definition
            </Button>
            {validateMutation.isSuccess && (
              <div className="flex items-center gap-2 mt-3 text-xs"
                style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>
                <CheckCircle size={13} />
                Schema is valid
              </div>
            )}
            {validateMutation.isError && (
              <div className="flex items-center gap-2 mt-3 text-xs"
                style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                <AlertTriangle size={13} />
                Validation failed — check field definitions
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ── TEST TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'test' && (
        <div className="space-y-4 animate-fade-in-up">
          {!editingId && (
            <div
              className="flex items-center gap-3 p-4 text-sm"
              style={{
                background:   'var(--amber-glow)',
                border:       '1px solid var(--amber-dim)',
                borderRadius: 'var(--radius-md)',
                color:        'var(--amber)',
                fontFamily:   'var(--font-mono)',
              }}
            >
              <AlertTriangle size={14} />
              Save the schema first before running a test
            </div>
          )}

          <Card padding="md">
            <CardHeader
              title="Test Against Sample Data"
              subtitle="Paste extracted JSON output to check which fields match your schema"
            />

            <div className="space-y-4">
              {/* Input */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                  Sample Extracted Data (JSON)
                </div>
                <textarea
                  value={testInput}
                  onChange={e => setTestInput(e.target.value)}
                  placeholder={`{
  "invoice_number": "INV-2024-001",
  "total_amount": 11800,
  "vendor_name": "Acme Supplies"
}`}
                  rows={8}
                  className="w-full px-3 py-2 text-xs border resize-y focus:outline-none focus:border-amber-500"
                  style={{
                    background:   'var(--bg-base)',
                    borderColor:  'var(--border)',
                    color:        'var(--text-primary)',
                    fontFamily:   'var(--font-mono)',
                    borderRadius: 'var(--radius-md)',
                  }}
                />
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={onTest}
                loading={testMutation.isPending}
                disabled={!editingId}
              >
                <Play size={13} />
                Run Test
              </Button>
            </div>
          </Card>

          {/* Test results */}
          {testResult && (
            <Card padding="md" className="animate-fade-in-up">
              <CardHeader
                title="Test Results"
                action={
                  <div className={cn('text-xs font-bold',
                    testResult.valid ? 'text-green-400' : 'text-yellow-400'
                  )} style={{ fontFamily: 'var(--font-mono)' }}>
                    {testResult.valid ? '✓ ALL MATCHED' : '⚠ SOME MISSING'}
                  </div>
                }
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Matched */}
                <div>
                  <div className="text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5"
                    style={{ color: 'var(--green)', fontFamily: 'var(--font-display)' }}>
                    <CheckCircle size={12} />
                    Matched ({testResult.matched?.length || 0})
                  </div>
                  <div className="space-y-1">
                    {(testResult.matched || []).map((f: string) => (
                      <div key={f} className="flex items-center gap-2 text-xs"
                        style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing */}
                <div>
                  <div className="text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                    <AlertTriangle size={12} />
                    Missing ({testResult.missing?.length || 0})
                  </div>
                  <div className="space-y-1">
                    {(testResult.missing || []).map((f: string) => (
                      <div key={f} className="flex items-center gap-2 text-xs"
                        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        <div className="w-1.5 h-1.5 rounded-full"
                          style={{ background: 'var(--border-light)' }} />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {testResult.warnings?.length > 0 && (
                <div className="mt-4 space-y-1">
                  {testResult.warnings.map((w: string, i: number) => (
                    <div key={i} className="text-xs"
                      style={{ color: 'var(--yellow)', fontFamily: 'var(--font-mono)' }}>
                      ⚠ {w}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
