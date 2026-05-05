import { useState }        from 'react'
import { toast }           from 'react-hot-toast'
import { useDecryptField } from '@/hooks/useAdmin'
import { Button }          from '@/components/ui/Button'
// import { cn }              from '@/lib/utils'
import { Eye, EyeOff, ShieldAlert, Copy, Clock } from 'lucide-react'

interface DecryptFieldButtonProps {
  tenantId:    string
  tableName:   string
  fieldName:   string
  rowId:       string
  displayName: string
  sensitivity: 'low' | 'medium' | 'high' | 'critical'
  context?:    string
}

const SENSITIVITY_COLORS = {
  low:      'var(--text-muted)',
  medium:   'var(--blue)',
  high:     'var(--yellow)',
  critical: 'var(--red)',
}

export function DecryptFieldButton({
  tenantId, tableName, fieldName, rowId,
  displayName, sensitivity, context,
}: DecryptFieldButtonProps) {
  const [revealed, setRevealed]   = useState<string | null>(null)
  const [showPin, setShowPin]     = useState(false)
  const [pin, setPin]             = useState('')
  const [hidden, setHidden]       = useState(true)
  const [decryptedAt, setDecryptedAt] = useState<string | null>(null)
  const decryptMutation           = useDecryptField()

  // Super admin PIN (just a UX friction, not a security gate — backend already gates by role + permission)
  const CONFIRM_PHRASE = 'DECRYPT'

  const handleDecrypt = async () => {
    if (pin.trim().toUpperCase() !== CONFIRM_PHRASE) {
      toast.error(`Type ${CONFIRM_PHRASE} to confirm`)
      return
    }

    try {
      const res = await decryptMutation.mutateAsync({
        tenantId,
        tableName,
        fieldName,
        rowId,
        context: context || `Admin panel: ${tableName}.${fieldName}`,
      })

      setRevealed(res.data.decrypted)
      setDecryptedAt(res.data.decryptedAt)
      setHidden(false)
      setShowPin(false)
      setPin('')
      toast.success('Field decrypted — action logged')
    } catch {
      // Error toast is already handled by mutation onError.
    }
  }

  const copy = () => {
    if (!revealed) return
    navigator.clipboard.writeText(revealed)
    toast.success('Copied')
  }

  if (revealed) {
    return (
      <div
        className="mt-1 p-2"
        style={{
          background:   sensitivity === 'critical' ? 'rgba(239,68,68,0.06)' : 'var(--bg-elevated)',
          border:       `1px solid ${SENSITIVITY_COLORS[sensitivity]}40`,
          borderRadius: 'var(--radius-md)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <ShieldAlert size={11} style={{ color: SENSITIVITY_COLORS[sensitivity] }} />
            <span className="text-xs font-bold uppercase tracking-widest"
              style={{ color: SENSITIVITY_COLORS[sensitivity], fontFamily: 'var(--font-display)' }}>
              {sensitivity}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              · decrypted · logged
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setHidden(!hidden)}
              className="transition-colors hover:text-amber-400"
              style={{ color: 'var(--text-muted)' }}>
              {hidden ? <Eye size={12}/> : <EyeOff size={12}/>}
            </button>
            <button onClick={copy}
              className="transition-colors hover:text-amber-400"
              style={{ color: 'var(--text-muted)' }}>
              <Copy size={12}/>
            </button>
            <button
              onClick={() => { setRevealed(null); setDecryptedAt(null) }}
              className="text-xs transition-colors hover:text-red-400 px-1"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              hide
            </button>
          </div>
        </div>

        {/* Value */}
        <div
          className="text-xs break-all p-2"
          style={{
            fontFamily:   'var(--font-mono)',
            color:        hidden ? 'transparent' : 'var(--text-primary)',
            background:   hidden ? 'var(--bg-overlay)' : 'transparent',
            borderRadius: 'var(--radius-sm)',
            userSelect:   hidden ? 'none' : 'auto',
            filter:       hidden ? 'blur(6px)' : 'none',
            transition:   'filter 0.2s ease',
            minHeight:    24,
          }}
        >
          {hidden ? '●●●●●●●●●●●●●●●●' : revealed}
        </div>

        {/* Audit timestamp */}
        {decryptedAt && (
          <div className="flex items-center gap-1 mt-1.5"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
            <Clock size={9}/>
            Logged at {new Date(decryptedAt).toLocaleString()}
          </div>
        )}
      </div>
    )
  }

  if (showPin) {
    return (
      <div
        className="mt-1 p-3"
        style={{
          background:   'var(--bg-elevated)',
          border:       `1px solid ${SENSITIVITY_COLORS[sensitivity]}`,
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert size={13} style={{ color: SENSITIVITY_COLORS[sensitivity] }} />
          <span className="text-xs font-bold"
            style={{ color: SENSITIVITY_COLORS[sensitivity], fontFamily: 'var(--font-mono)' }}>
            Decrypting: {displayName}
          </span>
        </div>

        <div className="text-xs mb-2"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          This action is permanently logged. Type{' '}
          <span style={{ color: 'var(--amber)', fontWeight: 700 }}>DECRYPT</span>{' '}
          to confirm.
        </div>

        <div className="flex items-center gap-2">
          <input
            value={pin}
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleDecrypt()}
            placeholder="Type DECRYPT"
            className="flex-1 h-8 px-2 text-xs border bg-transparent focus:outline-none"
            style={{
              borderColor:  'var(--border)',
              color:        'var(--amber)',
              fontFamily:   'var(--font-mono)',
              letterSpacing: '0.1em',
              borderRadius: 'var(--radius-sm)',
            }}
            autoFocus
          />
          <Button
            variant="danger"
            size="sm"
            loading={decryptMutation.isPending}
            onClick={handleDecrypt}
          >
            Reveal
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setShowPin(false); setPin('') }}
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowPin(true)}
      className="flex items-center gap-1.5 text-xs transition-all hover:opacity-80 mt-1"
      style={{
        color:      SENSITIVITY_COLORS[sensitivity],
        fontFamily: 'var(--font-mono)',
      }}
    >
      <div
        className="px-2 py-0.5 font-mono text-xs tracking-widest"
        style={{
          background:   `${SENSITIVITY_COLORS[sensitivity]}12`,
          border:       `1px solid ${SENSITIVITY_COLORS[sensitivity]}40`,
          borderRadius: 'var(--radius-sm)',
          letterSpacing: '0.15em',
          userSelect: 'none',
        }}
      >
        ●●●●●●●●
      </div>
      <Eye size={11}/>
      <span style={{ fontSize: '10px' }}>decrypt</span>
    </button>
  )
}
