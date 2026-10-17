export type SimMode = 'static' | 'alternating' | 'lateral' | 'fault'
export type FaultType = 'leak' | 'overpressure' | 'pump' | 'sensor'
export type Group = 'A' | 'B'
export type LayerId = 'cover' | 'topChambers' | 'tiltChambers' | 'foam' | 'pneumatic' | 'sensors' | 'controller'
export type SubsystemId = 'pump' | 'valves' | 'lineA' | 'lineB' | 'lateral' | 'sensors' | 'controller'
export type Health = 'ok' | 'alert' | 'offline'
export type RegionId = 'head' | 'scapular' | 'sacral' | 'thighs' | 'heels'

export const SPEEDS = [0.5, 1, 2, 4] as const
export type Speed = (typeof SPEEDS)[number]

export interface FaultState {
  type: FaultType
  elapsed: number
  safe: boolean
}

export interface PointLoad {
  r: number
  c: number
  intensity: number
}

export interface SimState {
  mode: SimMode
  playing: boolean
  speed: Speed
  elapsed: number
  phase: number
  upper: number[]
  lower: [number, number]
  tilt: number
  tiltTarget: number
  fault: FaultState | null
  point: PointLoad | null
  matrix: number[]
}

export interface RegionLoad {
  id: RegionId
  label: string
  share: number
  peak: number
}

export interface HistorySample {
  a: number
  b: number
  l: number
  r: number
}

export interface Telemetry {
  elapsed: number
  groupA: number
  groupB: number
  lowerLeft: number
  lowerRight: number
  tilt: number
  activeGroup: Group | null
  cycleLabel: string
  chambers: number[]
  regions: RegionLoad[]
  side: { left: number; right: number }
  subsystems: Record<SubsystemId, Health>
  history: HistorySample[]
  pointPeak: number | null
}

export const N_UPPER = 16
export const ROWS = 16
export const COLS = 8
export const REF = 0.8
export const HIGH = 1.0
export const LOW = 0.4
export const OVER = 1.25
export const SIM_RANGE = [0.3, 1.05] as const
export const LOWER_BASE = 0.12
export const MAX_TILT = 20
export const CYCLE_SECONDS = 8
export const TILT_RATE = 6
export const INFLATE_RATE = 3
export const HISTORY_MAX = 150
export const TELEMETRY_INTERVAL = 0.1
export const LEAK_CHAMBER = 6
export const DT_MAX = 0.1
export const TILT_GAIN = 1.4
export const POINT_MIN = 0.2
export const POINT_MAX = 1.2
export const POINT_DEFAULT = 0.6
export const POINT_SIGMA = 0.8

const SAFE_AFTER: Record<FaultType, number> = { leak: 2.5, overpressure: 2.2, pump: 1.0, sensor: 1.0 }
const OVERPRESSURE_SECONDS = 1.2

export const groupOf = (i: number): Group => (i % 2 === 0 ? 'A' : 'B')

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const smoothstep = (x: number) => {
  const t = clamp(x, 0, 1)
  return t * t * (3 - 2 * t)
}

export function alternatingLevel(phase: number): number {
  const p = ((phase % 1) + 1) % 1
  if (p < 0.3) return 1
  if (p < 0.5) return 1 - smoothstep((p - 0.3) / 0.2)
  if (p < 0.8) return 0
  return smoothstep((p - 0.8) / 0.2)
}

export function cycleLabel(phase: number): string {
  const p = ((phase % 1) + 1) % 1
  if (p < 0.3) return 'Grupo A sustenta · Grupo B alivia'
  if (p < 0.5) return 'Transição: A reduz, B infla'
  if (p < 0.8) return 'Grupo B sustenta · Grupo A alivia'
  return 'Transição: B reduz, A infla'
}

export const activeGroup = (phase: number): Group => (alternatingLevel(phase) >= 0.5 ? 'A' : 'B')

export const isCycling = (s: SimState) => s.mode === 'alternating' || (s.mode === 'fault' && !s.fault)

export const currentActiveGroup = (s: SimState): Group | null => (isCycling(s) ? activeGroup(s.phase) : null)

export function upperTargets(s: SimState): number[] {
  if (!isCycling(s)) return Array<number>(N_UPPER).fill(REF)
  const lvl = alternatingLevel(s.phase)
  const a = LOW + (HIGH - LOW) * lvl
  const b = LOW + (HIGH - LOW) * (1 - lvl)
  return Array.from({ length: N_UPPER }, (_, i) => (groupOf(i) === 'A' ? a : b))
}

export function lowerTargets(tilt: number): [number, number] {
  return [
    LOWER_BASE + ((1 - LOWER_BASE) * Math.max(0, tilt)) / MAX_TILT,
    LOWER_BASE + ((1 - LOWER_BASE) * Math.max(0, -tilt)) / MAX_TILT,
  ]
}

export const approach = (cur: number, target: number, rate: number, dt: number) =>
  cur + (target - cur) * (1 - Math.exp(-rate * dt))

export function moveToward(cur: number, target: number, maxDelta: number): number {
  const d = target - cur
  if (Math.abs(d) <= maxDelta) return target
  return cur + Math.sign(d) * maxDelta
}

const BODY_PARTS = [
  { r: 0.8, c: 3.5, a: 0.55, sr: 1.0, sc: 1.6 },
  { r: 3.8, c: 3.5, a: 0.75, sr: 1.0, sc: 1.6 },
  { r: 7.6, c: 3.5, a: 1.0, sr: 1.0, sc: 1.6 },
  { r: 11, c: 3.5, a: 0.45, sr: 1.3, sc: 1.6 },
  { r: 14.6, c: 2.5, a: 0.6, sr: 1.0, sc: 0.6 },
  { r: 14.6, c: 4.5, a: 0.6, sr: 1.0, sc: 0.6 },
]

const BODY: number[] = Array.from({ length: ROWS * COLS }, (_, idx) => {
  const r = Math.floor(idx / COLS)
  const c = idx % COLS
  let v = 0
  for (const p of BODY_PARTS) {
    v += p.a * Math.exp(-0.5 * ((r - p.r) / p.sr) ** 2) * Math.exp(-0.5 * ((c - p.c) / p.sc) ** 2)
  }
  return v
})

export function makePointLoad(r: number, c: number, intensity = POINT_DEFAULT): PointLoad {
  const int = (v: number, max: number) => clamp(Math.floor(Number.isFinite(v) ? v : 0), 0, max)
  return {
    r: int(r, ROWS - 1),
    c: int(c, COLS - 1),
    intensity: clamp(Number.isFinite(intensity) ? intensity : POINT_DEFAULT, POINT_MIN, POINT_MAX),
  }
}

export const pointBump = (d: number) => Math.exp(-0.5 * (d / POINT_SIGMA) ** 2)

export function computeLoadMatrix(upper: number[], tilt: number, point: PointLoad | null = null): number[] {
  const s = upper.map((u) => Math.max(u, 0.05))
  const rowFactor = s.map((v, r) => {
    let sum = 0
    let n = 0
    for (let k = Math.max(0, r - 2); k <= Math.min(ROWS - 1, r + 2); k++) {
      sum += s[k]
      n++
    }
    return v / (sum / n)
  })
  const sinT = Math.sin((tilt * Math.PI) / 180)
  const colFactor = Array.from({ length: COLS }, (_, c) => Math.max(0.05, 1 + TILT_GAIN * sinT * ((c - 3.5) / 3.5)))
  return BODY.map((b, idx) => {
    const r = Math.floor(idx / COLS)
    const c = idx % COLS
    const bump = point ? point.intensity * pointBump(r - point.r) * pointBump(c - point.c) : 0
    return clamp(((b + bump) * rowFactor[r] * colFactor[c]) / 1.6, 0, 1)
  })
}

export const REFERENCE_MATRIX: number[] = computeLoadMatrix(Array<number>(N_UPPER).fill(REF), 0)

const REGIONS: { id: RegionId; label: string; from: number; to: number }[] = [
  { id: 'head', label: 'Cabeça', from: 0, to: 1 },
  { id: 'scapular', label: 'Região escapular', from: 2, to: 5 },
  { id: 'sacral', label: 'Região sacral', from: 6, to: 9 },
  { id: 'thighs', label: 'Coxas', from: 10, to: 12 },
  { id: 'heels', label: 'Calcanhares', from: 13, to: 15 },
]

export const regionAt = (r: number): string => (REGIONS.find((g) => r >= g.from && r <= g.to) ?? REGIONS[0]).label

export function regionLoads(matrix: number[]): RegionLoad[] {
  const total = matrix.reduce((a, b) => a + b, 0) || 1
  return REGIONS.map(({ id, label, from, to }) => {
    let sum = 0
    let peak = 0
    for (let r = from; r <= to; r++) {
      for (let c = 0; c < COLS; c++) {
        const v = matrix[r * COLS + c]
        sum += v
        peak = Math.max(peak, v)
      }
    }
    return { id, label, share: (sum / total) * 100, peak }
  })
}

export function sideShare(matrix: number[]): { left: number; right: number } {
  let left = 0
  let right = 0
  matrix.forEach((v, idx) => {
    if (idx % COLS < COLS / 2) left += v
    else right += v
  })
  const total = left + right || 1
  return { left: (left / total) * 100, right: (right / total) * 100 }
}

export function subsystemHealth(fault: FaultState | null): Record<SubsystemId, Health> {
  const h: Record<SubsystemId, Health> = {
    pump: 'ok',
    valves: 'ok',
    lineA: 'ok',
    lineB: 'ok',
    lateral: 'ok',
    sensors: 'ok',
    controller: 'ok',
  }
  if (!fault) return h
  if (fault.type === 'leak') h.lineA = 'alert'
  if (fault.type === 'overpressure') {
    h.lineA = 'alert'
    h.valves = 'alert'
  }
  if (fault.type === 'pump') h.pump = 'offline'
  if (fault.type === 'sensor') h.sensors = 'offline'
  h.controller = 'alert'
  return h
}

export function createInitialSim(): SimState {
  return {
    mode: 'static',
    playing: true,
    speed: 1,
    elapsed: 0,
    phase: 0,
    upper: Array<number>(N_UPPER).fill(REF),
    lower: [LOWER_BASE, LOWER_BASE],
    tilt: 0,
    tiltTarget: 0,
    fault: null,
    point: null,
    matrix: REFERENCE_MATRIX,
  }
}

function faultTarget(fault: FaultState, i: number): { target: number; rate: number } {
  switch (fault.type) {
    case 'leak':
      return i === LEAK_CHAMBER ? { target: 0.08, rate: 0.5 } : { target: REF, rate: INFLATE_RATE }
    case 'overpressure':
      if (fault.elapsed < OVERPRESSURE_SECONDS && groupOf(i) === 'A') return { target: OVER, rate: 6 }
      return { target: REF, rate: 3 }
    case 'pump':
      return { target: LOW, rate: 0.3 }
    case 'sensor':
      return { target: REF, rate: INFLATE_RATE }
  }
}

export function tick(s: SimState, dtReal: number): SimState {
  const dt = Math.min(Math.max(dtReal, 0), DT_MAX)
  let { elapsed, phase, tilt, tiltTarget, fault } = s
  let upper: number[]

  if (fault) {
    const fe = fault.elapsed + dt
    fault = { type: fault.type, elapsed: fe, safe: fault.safe || fe >= SAFE_AFTER[fault.type] }
    tiltTarget = 0
    tilt = moveToward(tilt, 0, TILT_RATE * 1.5 * dt)
    const f = fault
    upper = s.upper.map((u, i) => {
      const { target, rate } = faultTarget(f, i)
      return approach(u, target, rate, dt)
    })
  } else {
    const dts = s.playing ? dt * s.speed : 0
    elapsed += dts
    if (s.mode === 'alternating' || s.mode === 'fault') phase = (phase + dts / CYCLE_SECONDS) % 1
    tilt = moveToward(tilt, tiltTarget, TILT_RATE * dts)
    const targets = upperTargets({ ...s, phase })
    upper = s.upper.map((u, i) => approach(u, targets[i], INFLATE_RATE, dts))
  }

  return {
    ...s,
    elapsed,
    phase,
    tilt,
    tiltTarget,
    fault,
    upper,
    lower: lowerTargets(tilt),
    matrix: fault?.type === 'sensor' ? s.matrix : computeLoadMatrix(upper, tilt, s.point),
  }
}

const pct = (v: number) => Math.round(v * 100)
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1)

export function sample(s: SimState): HistorySample {
  return {
    a: pct(mean(s.upper.filter((_, i) => groupOf(i) === 'A'))),
    b: pct(mean(s.upper.filter((_, i) => groupOf(i) === 'B'))),
    l: pct(s.lower[0]),
    r: pct(s.lower[1]),
  }
}

export const isOutOfRange = (pctValue: number) => pctValue < SIM_RANGE[0] * 100 || pctValue > SIM_RANGE[1] * 100

export function buildTelemetry(s: SimState, history: HistorySample[]): Telemetry {
  const smp = sample(s)
  const group = currentActiveGroup(s)
  return {
    elapsed: s.elapsed,
    groupA: smp.a,
    groupB: smp.b,
    lowerLeft: smp.l,
    lowerRight: smp.r,
    tilt: s.tilt,
    activeGroup: group,
    cycleLabel: group ? cycleLabel(s.phase) : '',
    chambers: s.upper.map(pct),
    regions: regionLoads(s.matrix),
    side: sideShare(s.matrix),
    subsystems: subsystemHealth(s.fault),
    history,
    pointPeak: s.point ? pct(s.matrix[s.point.r * COLS + s.point.c]) : null,
  }
}
