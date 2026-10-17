import { useShallow } from 'zustand/react/shallow'
import { motion } from 'motion/react'
import { AlertTriangle, Check, Loader2, RotateCcw } from 'lucide-react'
import { useSimulationStore } from '../../store/simulationStore'
import { FAULT_COPY, SIMULATOR } from '../../lib/content'

export default function FaultAlert() {
  const { type, safe } = useSimulationStore(
    useShallow((s) => ({ type: s.sim.fault?.type ?? null, safe: s.sim.fault?.safe ?? false })),
  )
  if (!type) return null
  const copy = FAULT_COPY[type]

  // Faixa sob o 3D, dentro do palco: o viewport encolhe durante a falha para não cobrir o sobrecolchão.
  return (
    <motion.div
      key={type}
      role="alert"
      data-testid="fault-alert"
      data-fault={type}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-[2] grid gap-3 border-t border-danger/40 bg-[#160B12]/90 p-3 text-sm sm:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] sm:p-4"
    >
      <div className="min-w-0 space-y-1">
        <p className="flex items-start gap-2 text-[13px] leading-snug font-semibold text-[#FCA5A5]">
          <AlertTriangle size={16} aria-hidden className="mt-px shrink-0 text-danger" />
          {copy.title}
        </p>
        <p className="pl-6 text-xs leading-snug text-fg/85">{copy.message}</p>
        <p className="pl-6 text-[10.5px] text-muted">{SIMULATOR.faultNotice}</p>
      </div>
      <div className="flex min-w-0 flex-col gap-2 sm:border-l sm:border-danger/25 sm:pl-3">
        {safe ? (
          <div data-testid="safe-state" className="space-y-1">
            <p className="label-mono flex items-center gap-1.5 !text-[10px] !text-ok">
              <span aria-hidden className="size-1.5 rounded-full bg-ok" />
              Estado seguro conceitual
            </p>
            <ul className="grid gap-x-3 gap-y-0.5 text-xs lg:grid-cols-2">
              {copy.safeState.map((item) => (
                <li key={item} className="flex items-start gap-1.5 leading-snug text-fg/90">
                  <Check size={13} aria-hidden className="mt-0.5 shrink-0 text-ok" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="flex items-center gap-1.5 text-xs text-warn">
            <Loader2 size={14} aria-hidden className="animate-spin motion-reduce:animate-none" />
            Aplicando estado seguro…
          </p>
        )}
        <button
          type="button"
          data-testid="fault-reset"
          className="mt-auto inline-flex min-h-10 items-center justify-center gap-1.5 self-start rounded-md border border-line bg-bg/60 px-3 text-xs text-fg transition-colors hover:border-tech hover:bg-tech/10"
          onClick={() => useSimulationStore.getState().reset()}
        >
          <RotateCcw size={14} aria-hidden />
          Reiniciar demonstrador
        </button>
      </div>
    </motion.div>
  )
}
