import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  COLS,
  LEAK_CHAMBER,
  REF,
  ROWS,
  alternatingLevel,
  createInitialSim,
  sideShare,
  tick,
} from '../src/lib/simulationEngine.ts'
import type { SimState } from '../src/lib/simulationEngine.ts'

const run = (s: SimState, seconds: number, dt = 0.05): SimState => {
  let cur = s
  for (let t = 0; t < seconds - 1e-9; t += dt) cur = tick(cur, dt)
  return cur
}

test('modo estático mantém referência e carga simétrica', () => {
  const s = run(createInitialSim(), 10)
  for (const u of s.upper) assert.ok(Math.abs(u - REF) < 1e-6)
  const side = sideShare(s.matrix)
  assert.ok(Math.abs(side.left - 50) < 0.5)
  assert.ok(Math.abs(side.right - 50) < 0.5)
  assert.equal(s.matrix.length, ROWS * COLS)
  assert.equal(s.matrix.length, 128)
  for (const v of s.matrix) assert.ok(v >= 0 && v <= 1)
})

test('alternatingLevel tem extremos e é contínuo', () => {
  assert.equal(alternatingLevel(0), 1)
  assert.equal(alternatingLevel(0.6), 0)
  for (let p = 0; p < 1; p += 0.001) {
    assert.ok(Math.abs(alternatingLevel(p + 0.001) - alternatingLevel(p)) <= 0.05, `salto em ${p}`)
  }
})

test('alternatingLevel contínuo na virada do ciclo (0.999 → 0)', () => {
  assert.ok(Math.abs(alternatingLevel(0.999) - alternatingLevel(0)) <= 0.05)
  assert.ok(Math.abs(alternatingLevel(1) - alternatingLevel(0.999)) <= 0.05)
})

test('inclinação lateral à direita infla a câmara esquerda e desloca carga para a direita', () => {
  const s = run({ ...createInitialSim(), mode: 'lateral', tiltTarget: 15 }, 5)
  assert.ok(s.tilt > 0 && s.tilt <= 15)
  assert.ok(s.lower[0] > s.lower[1])
  const side = sideShare(s.matrix)
  assert.ok(side.right > side.left)
})

test('vazamento esvazia a câmara afetada, congela a fase e atinge estado seguro', () => {
  const start: SimState = {
    ...createInitialSim(),
    mode: 'fault',
    playing: false,
    phase: 0.42,
    fault: { type: 'leak', elapsed: 0, safe: false },
  }
  const s = run(start, 5)
  assert.ok(s.upper[LEAK_CHAMBER] < 0.3)
  assert.equal(s.phase, 0.42)
  assert.equal(s.fault?.safe, true)
})

test('dt é limitado a DT_MAX', () => {
  const s = { ...createInitialSim(), mode: 'alternating' as const }
  assert.deepEqual(tick(s, 10), tick(s, 0.1))
})

test('tilt volta ao centro ao trocar para alternado', () => {
  const tilted = run({ ...createInitialSim(), mode: 'lateral', tiltTarget: 15 }, 4)
  assert.ok(tilted.tilt > 14)
  const s = run({ ...tilted, mode: 'alternating', tiltTarget: 0 }, 5)
  assert.ok(Math.abs(s.tilt) < 0.01)
})

test('pausa sem falha congela câmaras, fase e tempo', () => {
  const mid = run({ ...createInitialSim(), mode: 'alternating' }, 3.3)
  const paused = { ...mid, playing: false }
  let s = paused
  for (let i = 0; i < 20; i++) s = tick(s, 0.05)
  assert.deepEqual(s.upper, paused.upper)
  assert.equal(s.phase, paused.phase)
  assert.equal(s.elapsed, paused.elapsed)
})

test('matriz de referência é simétrica', () => {
  const side = sideShare(createInitialSim().matrix)
  assert.ok(Math.abs(side.left - 50) < 0.5)
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS / 2; c++) {
      const m = createInitialSim().matrix
      assert.ok(Math.abs(m[r * COLS + c] - m[r * COLS + (COLS - 1 - c)]) < 1e-9)
    }
  }
})
