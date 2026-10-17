const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const dec1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export const formatBRL = (v: number) => (Number.isFinite(v) ? brl.format(v) : brl.format(0))

export const formatDecimal = (v: number) => {
  const r = Math.round(v * 10) / 10
  return Number.isFinite(r) ? dec1.format(r === 0 ? 0 : r) : '0,0'
}

export const formatDegrees = (v: number) => `${formatDecimal(v)}°`

export function formatClock(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const formatSignedPP = (v: number) => {
  const r = Math.round(v * 10) / 10
  return `${r > 0 ? '+' : r < 0 ? '−' : '±'}${formatDecimal(Math.abs(r))} p.p.`
}
