// ─── Read from env (injected at build time) ───────────────────────────────────

export const CURRENCY     = import.meta.env.VITE_CURRENCY        || 'INR'
export const CURRENCY_SYM = import.meta.env.VITE_CURRENCY_SYMBOL || '₹'

// ─── Format helpers ───────────────────────────────────────────────────────────

export function formatCurrency(
  amount:    number | string | null | undefined,
  currency?: string
): string {
  if (amount === null || amount === undefined) return '—'
  const num  = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '—'

  const curr = currency || CURRENCY

  if (curr === 'INR') {
    return `₹${num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })}`
  }

  return `$${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })}`
}

export function formatCurrencyCompact(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '—'

  if (CURRENCY === 'INR') {
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`
    if (num >= 1000)   return `₹${(num / 1000).toFixed(2)}K`
    return `₹${num.toFixed(2)}`
  }

  if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`
  return `$${num.toFixed(2)}`
}

// ─── Currency metadata ────────────────────────────────────────────────────────

export function getCurrencyInfo() {
  return {
    code:   CURRENCY,
    symbol: CURRENCY_SYM,
    isINR:  CURRENCY === 'INR',
  }
}