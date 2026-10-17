import { useEffect } from 'react'
import { useSimulationStore } from '../store/simulationStore'

const WATCHDOG_MS = 100

export function useSimulationLoop() {
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const advance = (now: number) => {
      if (now <= last) return
      useSimulationStore.getState().step((now - last) / 1000)
      last = now
    }
    const frame = (now: number) => {
      advance(now)
      raf = requestAnimationFrame(frame)
    }
    // rAF pausa em aba oculta e despenca com GPU por software; o watchdog mantém o tempo lógico andando
    const watchdog = window.setInterval(() => {
      const now = performance.now()
      if (now - last > WATCHDOG_MS * 1.5) advance(now)
    }, WATCHDOG_MS)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.clearInterval(watchdog)
    }
  }, [])
}
