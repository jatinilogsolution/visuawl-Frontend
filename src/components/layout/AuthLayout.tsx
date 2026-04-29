import { Zap } from 'lucide-react'

interface AuthLayoutProps {
  children:    React.ReactNode
  title:       string
  subtitle?:   string
  backLink?:   React.ReactNode
}

export function AuthLayout({ children, title, subtitle, backLink }: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* ── Left panel — branding ─────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-96 xl:w-120 flex-col relative shrink-0"
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(var(--border) 1px, transparent 1px),
              linear-gradient(90deg, var(--border) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-auto">
            {/* <div
              className="w-9 h-9 flex items-center justify-center"
              style={{ background: 'var(--amber)', borderRadius: 'var(--radius-sm)' }}
            >
              <Zap size={18} className="text-black" />
            </div> */}
            <span
              className="text-base font-bold tracking-widest uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              VISUAWL
            </span>
          </div>

          {/* Hero text */}
          <div className="mb-auto">
            <h1
              className="text-5xl xl:text-6xl font-bold leading-none mb-6"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
            >
              EXTRACT.
              <br />
              <span style={{ color: 'var(--amber)' }}>AUTOMATE.</span>
              <br />
              DELIVER.
            </h1>

            <p className="text-sm leading-relaxed mb-10" style={{ color: 'var(--text-secondary)', maxWidth: 320 }}>
              Enterprise OCR and invoice extraction. Upload any document — 
              get structured JSON delivered to your systems automatically.
            </p>

            {/* Feature list */}
            {/* <div className="space-y-3">
              {[
                ['⚡', 'Groq + Mistral AI with automatic fallback'],
                ['🔐', 'AES-256-GCM encryption per tenant'],
                ['🔄', '5 input types → 5 output destinations'],
                ['📊', 'Full token + cost analytics'],
              ].map(([icon, text]) => (
                <div key={text} className="flex items-center gap-3">
                  <span className="text-base">{icon}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {text}
                  </span>
                </div>
              ))}
            </div> */}
          </div>

          {/* Stats row */}
          {/* <div className="grid grid-cols-3 gap-3 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
            {[
              ['28', 'DB Tables'],
              ['18', 'API Routes'],
              ['5+', 'AI Models'],
            ].map(([num, label]) => (
              <div key={label}>
                <div
                  className="text-2xl font-bold"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--amber)' }}
                >
                  {num}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {label}
                </div>
              </div>
            ))}
          </div> */}
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-7 h-7 flex items-center justify-center"
            style={{ background: 'var(--amber)', borderRadius: 'var(--radius-sm)' }}>
            <Zap size={14} className="text-black" />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            VISUAWL
          </span>
        </div>

        <div className="w-full max-w-md animate-fade-in-up">
          {/* Header */}
          <div className="mb-8">
            {backLink && <div className="mb-4">{backLink}</div>}
            <h2
              className="text-4xl font-bold tracking-tight mb-2"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}