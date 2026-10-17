import { create } from 'zustand'
import { useSimulationStore } from './simulationStore'
import { DEMO_DURATION, STEPS, runCues, stepIndexAt } from '../lib/presentationScript'

interface PresentationStore {
  active: boolean
  paused: boolean
  elapsed: number
  lastCueAt: number
  start(): void
  stop(): void
  togglePause(): void
  next(): void
  prev(): void
  advance(dt: number): void
}

export const usePresentationStore = create<PresentationStore>()((set, get) => {
  const jumpTo = (t: number) => {
    const from = t - 0.001
    set({ elapsed: t, lastCueAt: t })
    runCues(from, t)
  }

  return {
    active: false,
    paused: false,
    elapsed: 0,
    lastCueAt: -0.001,

    start() {
      const sim = useSimulationStore.getState()
      sim.reset()
      sim.setMode('static')
      sim.setSpeed(1)
      set({ active: true, paused: false })
      jumpTo(0)
    },

    stop() {
      set({ active: false, paused: false })
    },

    togglePause() {
      const { paused, elapsed } = get()
      if (elapsed >= DEMO_DURATION) return
      set({ paused: !paused })
    },

    next() {
      const idx = stepIndexAt(get().elapsed)
      if (idx >= STEPS.length - 1) {
        set({ elapsed: DEMO_DURATION, lastCueAt: DEMO_DURATION, paused: true })
        return
      }
      jumpTo(STEPS[idx + 1].start)
    },

    prev() {
      const idx = stepIndexAt(get().elapsed)
      set({ paused: false })
      jumpTo(STEPS[Math.max(0, idx - 1)].start)
    },

    advance(dt) {
      const { active, paused, elapsed, lastCueAt } = get()
      if (!active || paused || elapsed >= DEMO_DURATION) return
      const t = Math.min(DEMO_DURATION, elapsed + dt)
      set({ elapsed: t, lastCueAt: t, paused: t >= DEMO_DURATION })
      runCues(lastCueAt, t)
    },
  }
})
