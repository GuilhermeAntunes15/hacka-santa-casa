import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, X } from 'lucide-react'
import { usePresentationStore } from '../store/presentationStore'
import { DEMO_DURATION, STEPS, stepIndexAt } from '../lib/presentationScript'
import { formatClock } from '../lib/format'

const IGNORE = 'input, select, textarea, button, [contenteditable=""], [contenteditable="true"]'

const btn =
  'inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line px-3 text-xs text-fg transition-colors hover:border-tech hover:bg-tech/10 disabled:opacity-40'

export default function PresentationMode() {
  const { active, paused, elapsed } = usePresentationStore(
    useShallow((s) => ({ active: s.active, paused: s.paused, elapsed: s.elapsed })),
  )

  useEffect(() => {
    if (!active) return
    let last = performance.now()
    const id = window.setInterval(() => {
      const now = performance.now()
      usePresentationStore.getState().advance((now - last) / 1000)
      last = now
    }, 200)
    return () => window.clearInterval(id)
  }, [active])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      const p = usePresentationStore.getState()
      if (e.key === 'Escape') {
        p.stop()
        return
      }
      if (e.repeat || (e.target instanceof Element && e.target.closest(IGNORE))) return
      if (e.key === 'ArrowRight') p.next()
      else if (e.key === 'ArrowLeft') p.prev()
      else if (e.key === ' ') {
        e.preventDefault()
        p.togglePause()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  if (!active) return null

  const idx = stepIndexAt(elapsed)
  const step = STEPS[idx]
  const done = elapsed >= DEMO_DURATION
  const a = usePresentationStore.getState

  return (
    <div
      data-testid="demo-bar"
      role="region"
      aria-label="Demo de 3 minutos"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-bg/92 backdrop-blur-md"
    >
      {/* Progresso fino com marcadores de etapa */}
      <div
        role="progressbar"
        data-testid="demo-progress"
        aria-label="Progresso da apresentação"
        aria-valuemin={0}
        aria-valuemax={DEMO_DURATION}
        aria-valuenow={Math.round(elapsed)}
        aria-valuetext={`${formatClock(elapsed)} de ${formatClock(DEMO_DURATION)}`}
        className="relative h-[3px] bg-line/70"
      >
        <div className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-200 ease-linear" style={{ width: `${Math.min(100, (elapsed / DEMO_DURATION) * 100)}%` }} />
        {STEPS.slice(1).map((s) => (
          <span key={s.title} aria-hidden className="absolute -top-1 h-[11px] w-px bg-muted/60" style={{ left: `${(s.start / DEMO_DURATION) * 100}%` }} />
        ))}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2.5 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <ol className="flex gap-1" aria-label="Etapas da apresentação">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                data-testid={`demo-step-${i}`}
                aria-current={i === idx ? 'step' : undefined}
                title={s.title}
                className={`num grid h-6 min-w-6 place-items-center rounded-[3px] border px-1 text-[10px] transition-colors ${
                  i === idx ? 'border-accent/70 bg-accent/10 text-accent' : i < idx ? 'border-line bg-surface text-fg/70' : 'border-line text-muted/70'
                }`}
              >
                <span aria-hidden>{i + 1}</span>
                <span className="sr-only">{s.title}</span>
              </li>
            ))}
          </ol>
          <p className="flex min-w-0 flex-1 items-baseline gap-3 text-sm">
            <span className="num shrink-0 text-xs text-muted">
              <span className="text-fg">{formatClock(elapsed)}</span> / {formatClock(DEMO_DURATION)}
            </span>
            <span className="truncate font-semibold">{done ? 'Demonstração concluída' : step.title}</span>
          </p>
          <div className="flex flex-wrap gap-1">
            {done ? (
              <>
                <button type="button" data-testid="demo-restart" className={btn} onClick={() => a().start()}>
                  <RotateCcw size={14} aria-hidden /> Recomeçar
                </button>
                <button type="button" data-testid="demo-exit" className={btn} onClick={() => a().stop()}>
                  <X size={14} aria-hidden /> Sair
                </button>
              </>
            ) : (
              <>
                <button type="button" data-testid="demo-prev" className={btn} onClick={() => a().prev()}>
                  <ChevronLeft size={15} aria-hidden /> <span>Voltar</span>
                </button>
                <button type="button" data-testid="demo-pause" className={btn} onClick={() => a().togglePause()} aria-pressed={paused}>
                  {paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
                  <span>{paused ? 'Continuar' : 'Pausar'}</span>
                </button>
                <button type="button" data-testid="demo-next" className={`${btn} border-tech/60 bg-tech/15 hover:bg-tech/25`} onClick={() => a().next()}>
                  <span>Avançar</span> <ChevronRight size={15} aria-hidden />
                </button>
                <button type="button" data-testid="demo-exit" className={btn} onClick={() => a().stop()}>
                  <X size={14} aria-hidden /> <span>Sair</span>
                </button>
              </>
            )}
          </div>
        </div>
        {!done && (
          <ul className="hidden gap-x-6 text-xs leading-relaxed text-muted md:flex md:flex-wrap">
            {step.talkingPoints.map((tp) => (
              <li key={tp} className="flex gap-2">
                <span aria-hidden className="mt-[8px] h-px w-2.5 shrink-0 bg-muted/60" />
                {tp}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
