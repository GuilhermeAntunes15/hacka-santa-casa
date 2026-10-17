export interface EconomicInputs {
  beds: number
  patientsPerBedYear: number
  equipmentCostPerBed: number
  maintenancePerBedYear: number
  incidencePct: number
  reductionPct: number
  incrementalCostPerCase: number
  horizonYears: number
}

export type EconomicKey = keyof EconomicInputs

export interface Limit {
  min: number
  max: number
  step: number
}

export interface SeriesPoint {
  year: number
  cumulativeCost: number
  cumulativeSavings: number
  balance: number
}

export interface EconomicResult {
  initialInvestment: number
  annualMaintenance: number
  baselineCasesPerYear: number
  avoidedEventsPerYear: number
  grossSavingsPerYear: number
  netPerYear: number
  balanceAtHorizon: number
  paybackYears: number | null
  series: SeriesPoint[]
}

export const DEFAULT_INPUTS: EconomicInputs = {
  beds: 20,
  patientsPerBedYear: 24,
  equipmentCostPerBed: 6500,
  maintenancePerBedYear: 450,
  incidencePct: 8,
  reductionPct: 20,
  incrementalCostPerCase: 9000,
  horizonYears: 5,
}

export const INPUT_LIMITS: Record<EconomicKey, Limit> = {
  beds: { min: 1, max: 1000, step: 1 },
  patientsPerBedYear: { min: 1, max: 120, step: 1 },
  equipmentCostPerBed: { min: 0, max: 200000, step: 100 },
  maintenancePerBedYear: { min: 0, max: 50000, step: 50 },
  incidencePct: { min: 0, max: 100, step: 0.5 },
  reductionPct: { min: 0, max: 100, step: 1 },
  incrementalCostPerCase: { min: 0, max: 500000, step: 100 },
  horizonYears: { min: 1, max: 10, step: 1 },
}

export function sanitizeValue(key: EconomicKey, v: number | undefined): number {
  const { min, max } = INPUT_LIMITS[key]
  if (v === undefined) return DEFAULT_INPUTS[key]
  if (!Number.isFinite(v)) return min
  const clamped = Math.min(max, Math.max(min, v))
  return key === 'horizonYears' ? Math.round(clamped) : clamped
}

export function sanitizeInputs(i: Partial<Record<EconomicKey, number>>): EconomicInputs {
  const out = { ...DEFAULT_INPUTS }
  for (const key of Object.keys(DEFAULT_INPUTS) as EconomicKey[]) out[key] = sanitizeValue(key, i[key])
  return out
}

export function computeEconomics(i: EconomicInputs): EconomicResult {
  const initialInvestment = i.beds * i.equipmentCostPerBed
  const annualMaintenance = i.beds * i.maintenancePerBedYear
  const baselineCasesPerYear = (i.beds * i.patientsPerBedYear * i.incidencePct) / 100
  const avoidedEventsPerYear = (baselineCasesPerYear * i.reductionPct) / 100
  const grossSavingsPerYear = avoidedEventsPerYear * i.incrementalCostPerCase
  const netPerYear = grossSavingsPerYear - annualMaintenance
  const balanceAt = (n: number) => n * netPerYear - initialInvestment
  const series = Array.from({ length: i.horizonYears + 1 }, (_, year) => ({
    year,
    cumulativeCost: initialInvestment + year * annualMaintenance,
    cumulativeSavings: year * grossSavingsPerYear,
    balance: balanceAt(year),
  }))
  return {
    initialInvestment,
    annualMaintenance,
    baselineCasesPerYear,
    avoidedEventsPerYear,
    grossSavingsPerYear,
    netPerYear,
    balanceAtHorizon: balanceAt(i.horizonYears),
    paybackYears: netPerYear > 0 ? initialInvestment / netPerYear : null,
    series,
  }
}
