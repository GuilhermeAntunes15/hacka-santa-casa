import type { CSSProperties, ReactNode } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { motion } from 'motion/react'
import { ArrowLeftToLine, ArrowRightToLine, Crosshair, Pause, Play, RotateCcw, Undo2 } from 'lucide-react'
import { useSimulationStore } from '../../store/simulationStore'
import { MAX_TILT, SPEEDS } from '../../lib/simulationEngine'
import type { Health, SubsystemId } from '../../lib/simulationEngine'
import { FAULT_COPY, FAULT_ORDER, HEALTH_LABELS, SIMULATOR, SUBSYSTEM_LABELS } from '../../lib/content'
import { formatDegrees } from '../../lib/format'

const HEALTH_TONE: Record<Health, { text: string; led: string }> = {
  ok: { text: 'text-ok', led: 'bg-ok' },
  alert: { text: 'text-warn', led: 'bg-warn' },
  offline: { text: 'text-danger', led: 'bg-danger' },
}

const key = (on = false) =>
  `inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border px-3 text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
    on ? 'border-accent/70 bg-accent/10 text-accent' : 'border-line text-fg hover:border-tech/70 hover:bg-tech/10'
  }`

const Group = ({ title, children }: { title: string; children: ReactNode }) => (
  <fieldset className="space-y-2.5">
    <legend className="label-mono mb-2.5 !text-[10px]">{title}</legend>
    {children}
  </fieldset>
)

const EASE = [0.16, 1, 0.3, 1] as const

export default function SimulationControls() {
  const { mode, playing, speed, tiltTarget, faultType, showGroups, cycleLabel, subsystems } = useSimulationStore(
    useShallow((s) => ({
      mode: s.sim.mode,
      playing: s.sim.playing,
      speed: s.sim.speed,
      tiltTarget: s.sim.tiltTarget,
      faultType: s.sim.fault?.type ?? null,
      showGroups: s.showGroups,
      cycleLabel: s.telemetry.cycleLabel,
      subsystems: s.telemetry.subsystems,
    })),
  )
  const a = useSimulationStore.getState
  const faulted = faultType !== null

  return (
    <div className="flex h-full flex-col gap-4 rounded-lg border border-line bg-surface/50 p-3.5 sm:p-4">
      {/* Abas de modo: indicador ativo em ciano */}
      <div role="group" aria-label="Modo de simulação" className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line">
        {SIMULATOR.modes.map((m, i) => {
          const on = mode === m.id
          return (
            <button
              key={m.id}
              type="button"
              data-testid={`mode-${m.id}`}
              aria-pressed={on}
              className={`relative flex min-h-11 items-center gap-2 px-3 py-2 text-left text-[13px] leading-tight transition-colors ${
                on ? 'bg-surface-2 text-fg' : 'bg-bg/80 text-muted hover:bg-surface hover:text-fg'
              }`}
              onClick={() => a().setMode(m.id)}
            >
              {on && (
                <motion.span
                  layoutId="mode-indicator"
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[2px] bg-accent"
                  transition={{ duration: 0.3, ease: EASE }}
                />
              )}
              <span className={`num text-[10px] ${on ? 'text-accent' : 'text-muted/70'}`}>M{i + 1}</span>
              {m.label}
            </button>
          )
        })}
      </div>

      {/* Transporte */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-testid="sim-play-toggle"
          aria-label={playing ? 'Pausar simulação' : 'Reproduzir simulação'}
          title={playing ? 'Pausar' : 'Reproduzir'}
          disabled={faulted}
          className={`${key()} w-10 px-0`}
          onClick={() => a().togglePlay()}
        >
          {playing ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
        </button>
        <button
          type="button"
          data-testid="sim-reset"
          aria-label="Reiniciar simulação"
          title="Reiniciar"
          className={`${key()} w-10 px-0`}
          onClick={() => a().reset()}
        >
          <RotateCcw size={16} aria-hidden />
        </button>
        <div className="ml-auto flex items-center gap-1" role="group" aria-label="Velocidade de simulação">
          <span className="label-mono mr-1 !text-[10px]">Vel.</span>
          {SPEEDS.map((sp) => (
            <button
              key={sp}
              type="button"
              data-testid={`speed-${sp}`}
              aria-pressed={speed === sp}
              disabled={faulted}
              className={`${key(speed === sp)} num min-w-10 px-1.5 text-xs`}
              onClick={() => a().setSpeed(sp)}
            >
              {String(sp).replace('.', ',')}×
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-hair" aria-hidden />

      {/* Grupo do modo ativo, com entrada curta */}
      <motion.div key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}>
        {mode === 'static' && (
          <Group title="Pressão estática">
            <p className="text-[13px] leading-relaxed text-muted">
              Todas as câmaras superiores em estado de referência. Observe o mapa de carga estimada e os indicadores abaixo.
            </p>
          </Group>
        )}

        {mode === 'alternating' && (
          <Group title="Grupos A e B">
            <button type="button" data-testid="toggle-groups" aria-pressed={showGroups} className={`${key(showGroups)} w-full`} onClick={() => a().toggleGroups()}>
              {showGroups ? 'Ocultar cores dos grupos' : 'Mostrar grupos A e B'}
            </button>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="size-2 rounded-[2px] bg-accent" /> Grupo A · câmaras ímpares
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="size-2 rounded-[2px] bg-tech" /> Grupo B · pares
              </span>
            </div>
            <p className="num rounded-[4px] border border-hair bg-bg/50 px-2.5 py-2 text-[13px] text-accent" data-testid="cycle-label">
              {cycleLabel || '—'}
            </p>
          </Group>
        )}

        {mode === 'lateral' && (
          <Group title="Reposicionamento lateral">
            <div className="grid grid-cols-2 gap-1.5">
              <button type="button" data-testid="tilt-left" className={key(tiltTarget < 0)} onClick={() => a().setTiltTarget(-15)}>
                <ArrowLeftToLine size={15} aria-hidden />
                Inclinar à esquerda
              </button>
              <button type="button" data-testid="tilt-right" className={key(tiltTarget > 0)} onClick={() => a().setTiltTarget(15)}>
                Inclinar à direita
                <ArrowRightToLine size={15} aria-hidden />
              </button>
              <button type="button" data-testid="tilt-neutral" className={key()} onClick={() => a().snapNeutral()}>
                <Crosshair size={15} aria-hidden />
                Posição neutra
              </button>
              <button type="button" data-testid="tilt-center" className={key()} onClick={() => a().returnToCenter()}>
                <Undo2 size={15} aria-hidden />
                Retornar ao centro
              </button>
            </div>
            <label className="block">
              <span className="flex items-baseline justify-between text-xs text-muted">
                <span>Ângulo demonstrativo (alvo)</span>
                <span className="num text-sm text-fg">{formatDegrees(tiltTarget)}</span>
              </span>
              <input
                type="range"
                data-testid="tilt-slider"
                aria-label="Ângulo demonstrativo"
                min={-MAX_TILT}
                max={MAX_TILT}
                step={1}
                value={tiltTarget}
                onChange={(e) => a().setTiltTarget(Number(e.target.value))}
                style={{ '--fill': `${((tiltTarget + MAX_TILT) / (2 * MAX_TILT)) * 100}%` } as CSSProperties}
                className="w-full"
              />
              <span className="num flex justify-between text-[10px] text-muted">
                <span>−{MAX_TILT}° E</span>
                <span>0°</span>
                <span>+{MAX_TILT}° D</span>
              </span>
            </label>
            <p className="text-[11px] leading-snug text-muted">{SIMULATOR.lateralNotice}</p>
          </Group>
        )}

        {mode === 'fault' && (
          <Group title="Simular falha">
            <div className="grid grid-cols-2 gap-1.5">
              {FAULT_ORDER.map((f) => (
                <button
                  key={f}
                  type="button"
                  data-testid={`fault-${f}`}
                  aria-pressed={faultType === f}
                  className={`min-h-10 rounded-md border px-2.5 py-1.5 text-left text-[12.5px] leading-tight transition-colors ${
                    faultType === f ? 'border-danger/80 bg-danger/10 text-[#FCA5A5]' : 'border-line text-fg hover:border-danger/60 hover:bg-danger/5'
                  }`}
                  onClick={() => a().triggerFault(f)}
                >
                  {FAULT_COPY[f].label}
                </button>
              ))}
            </div>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-hair pt-2.5 text-xs" aria-label="Estado dos subsistemas">
              {(Object.keys(SUBSYSTEM_LABELS) as SubsystemId[]).map((id) => {
                const tone = HEALTH_TONE[subsystems[id]]
                return (
                  <li key={id} data-testid={`health-${id}`} data-health={subsystems[id]} className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5 text-muted">
                      <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${tone.led}`} />
                      <span className="truncate">{SUBSYSTEM_LABELS[id]}</span>
                    </span>
                    <span className={`font-mono text-[11px] ${tone.text}`}>{HEALTH_LABELS[subsystems[id]]}</span>
                  </li>
                )
              })}
            </ul>
          </Group>
        )}
      </motion.div>
    </div>
  )
}
