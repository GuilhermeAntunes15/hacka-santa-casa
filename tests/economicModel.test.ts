import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_INPUTS, computeEconomics, sanitizeInputs } from '../src/lib/economicModel.ts'

const close = (a: number, b: number, tol = 1e-6) => assert.ok(Math.abs(a - b) < tol, `${a} ≠ ${b}`)

test('valores padrão produzem o cenário de referência', () => {
  const r = computeEconomics(DEFAULT_INPUTS)
  close(r.initialInvestment, 130000)
  close(r.annualMaintenance, 9000)
  close(r.baselineCasesPerYear, 38.4)
  close(r.avoidedEventsPerYear, 7.68)
  close(r.grossSavingsPerYear, 69120)
  close(r.balanceAtHorizon, 170600)
  close(r.paybackYears ?? Number.NaN, 130000 / 60120)
  assert.ok(Math.abs((r.paybackYears ?? 0) - 2.162) < 0.001)
  assert.equal(r.series.length, 6)
  close(r.series[0].balance, -130000)
  close(r.series[5].balance, 170600)
})

test('sanitizeInputs: NaN vira mínimo, fora do limite é cortado, ausente usa padrão', () => {
  const s = sanitizeInputs({ beds: -5, incidencePct: Number.NaN })
  assert.equal(s.beds, 1)
  assert.equal(s.incidencePct, 0)
  assert.equal(s.reductionPct, DEFAULT_INPUTS.reductionPct)
  assert.equal(sanitizeInputs({ reductionPct: 250 }).reductionPct, 100)
})

test('payback é nulo quando a economia não cobre a manutenção', () => {
  const r = computeEconomics({ ...DEFAULT_INPUTS, reductionPct: 0 })
  assert.equal(r.paybackYears, null)
  assert.ok(r.balanceAtHorizon < 0)
})
