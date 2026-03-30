// ── Number Formatting ──────────────────────────────────────
export const fmtINR = (n) =>
  '₹' + Number(n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const fmtNum = (n, dec = 2) =>
  Number(n ?? 0).toFixed(dec)

export const fmtK = (n) => {
  if (n >= 10_000_000) return (n / 10_000_000).toFixed(2) + ' Cr'
  if (n >= 100_000)    return (n / 100_000).toFixed(2) + ' L'
  if (n >= 1_000)      return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

export const fmtPct = (n) => {
  const v = Number(n ?? 0)
  return (v >= 0 ? '+' : '') + v.toFixed(2) + '%'
}

// ── Change helpers ─────────────────────────────────────────
export const isUp   = (n) => Number(n) >= 0
export const upDown = (n) => (isUp(n) ? 'up' : 'down')
export const colorClass  = (n) => (isUp(n) ? 'text-green' : 'text-red')
export const badgeClass  = (n) => (isUp(n) ? 'badge-up'   : 'badge-down')

// ── Sentiment ──────────────────────────────────────────────
export const getSentiment = (changePct) => {
  if (changePct >  1) return { label: 'Bullish', color: 'var(--green)', bg: '#00c89614', border: '#00c89640' }
  if (changePct < -1) return { label: 'Bearish', color: 'var(--red)',   bg: '#ff4d6a14', border: '#ff4d6a40' }
  return               { label: 'Neutral',  color: '#ffc94d',   bg: '#ffc94d14', border: '#ffc94d40' }
}

// ── Date/Time ──────────────────────────────────────────────
export const fmtDateTime = (d) => {
  const dt = new Date(d)
  return dt.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true,
  })
}

export const fmtTime = (d) =>
  new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

// ── Sparkline SVG ─────────────────────────────────────────
export const sparklinePath = (data = [], w = 80, h = 30) => {
  if (data.length < 2) return ''
  const mn = Math.min(...data), mx = Math.max(...data)
  const range = mx - mn || 1
  return data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - mn) / range) * (h - 4) - 2
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
}
