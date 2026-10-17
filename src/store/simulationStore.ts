import { create } from 'zustand'
import {
  DT_MAX,
  HISTORY_MAX,
  LOWER_BASE,
  MAX_TILT,
  REFERENCE_MATRIX,
  TELEMETRY_INTERVAL,
  buildTelemetry,
  computeLoadMatrix,
  createInitialSim,
  sample,
  tick,
} from '../lib/simulationEngine'
import type { FaultType, SimMode, SimState, Speed, Telemetry } from '../lib/simulationEngine'
import { formatClock } from '../lib/format'

export interface Baseline {
  matrix: number[]
  label: string
}

interface SimulationStore {
  sim: SimState
  telemetry: Telemetry
  showGroups: boolean
  compare: boolean
  baseline: Baseline
  step(dt: number): void
  setMode(mode: SimMode): void
  togglePlay(): void
  setSpeed(s: Speed): void
  reset(): void
  setTiltTarget(deg: number): void
  snapNeutral(): void
  returnToCenter(): void
  triggerFault(t: FaultType): void
  toggleGroups(): void
  toggleCompare(): void
  captureBaseline(): void
  resetBaseline(): void
}

const REFERENCE_BASELINE: Baseline = { matrix: REFERENCE_MATRIX, label: 'Referência (modo estático)' }

let acc = 0
const MAX_SUBSTEPS = 5

const initial = createInitialSim()

export const useSimulationStore = create<SimulationStore>()((set, get) => {
  const commit = (sim: SimState, history = get().telemetry.history) => set({ sim, telemetry: buildTelemetry(sim, history) })

  const withMode = (sim: SimState, mode: SimMode): SimState => ({
    ...sim,
    mode,
    fault: null,
    playing: true,
    tiltTarget: mode === 'lateral' ? sim.tiltTarget : 0,
  })

  return {
    sim: initial,
    telemetry: buildTelemetry(initial, []),
    showGroups: true,
    compare: false,
    baseline: REFERENCE_BASELINE,

    step(dt) {
      const { sim: prev, telemetry } = get()
      // ponytail: até 5 sub-passos mantêm tempo real até 2 fps (GPU lenta/SwiftShader) — abaixo disso a simulação desacelera; aumentar MAX_SUBSTEPS se necessário
      const n = Math.min(MAX_SUBSTEPS, Math.max(1, Math.ceil(dt / DT_MAX)))
      let sim = prev
      for (let k = 0; k < n; k++) sim = tick(sim, dt / n)
      acc += dt
      if (acc >= TELEMETRY_INTERVAL) {
        acc = 0
        if (sim.playing || sim.fault) {
          commit(sim, [...telemetry.history.slice(-(HISTORY_MAX - 1)), sample(sim)])
          return
        }
      }
      set({ sim })
    },

    setMode(mode) {
      commit(withMode(get().sim, mode))
    },

    togglePlay() {
      const { sim } = get()
      if (sim.fault) return
      commit({ ...sim, playing: !sim.playing })
    },

    setSpeed(speed) {
      const { sim } = get()
      if (sim.fault) return
      commit({ ...sim, speed })
    },

    reset() {
      const { mode, speed } = get().sim
      acc = 0
      commit({ ...createInitialSim(), mode, speed }, [])
    },

    setTiltTarget(deg) {
      const cur = get().sim
      const sim = cur.mode === 'lateral' ? cur : withMode(cur, 'lateral')
      const tiltTarget = Math.max(-MAX_TILT, Math.min(MAX_TILT, Number.isFinite(deg) ? deg : 0))
      commit({ ...sim, tiltTarget, playing: true })
    },

    snapNeutral() {
      const { sim } = get()
      commit({
        ...sim,
        tilt: 0,
        tiltTarget: 0,
        lower: [LOWER_BASE, LOWER_BASE],
        matrix: sim.fault?.type === 'sensor' ? sim.matrix : computeLoadMatrix(sim.upper, 0),
      })
    },

    returnToCenter() {
      commit({ ...get().sim, tiltTarget: 0, playing: true })
    },

    triggerFault(type) {
      commit({ ...get().sim, mode: 'fault', playing: false, fault: { type, elapsed: 0, safe: false } })
    },

    toggleGroups() {
      set({ showGroups: !get().showGroups })
    },

    toggleCompare() {
      set({ compare: !get().compare })
    },

    captureBaseline() {
      const { sim } = get()
      set({ baseline: { matrix: sim.matrix.slice(), label: `Capturado em ${formatClock(sim.elapsed)}` } })
    },

    resetBaseline() {
      set({ baseline: REFERENCE_BASELINE })
    },
  }
})
