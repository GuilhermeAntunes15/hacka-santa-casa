import { useShallow } from 'zustand/react/shallow'
import Viewport3D from '../three/Viewport3D'
import FaultAlert from './FaultAlert'
import PressureHeatmap from './PressureHeatmap'
import SimulationCharts from './SimulationCharts'
import SimulationControls from './SimulationControls'
import SimulationIndicators from './SimulationIndicators'
import { Reveal } from '../ui/Section'
import { SIMULATOR } from '../../lib/content'
import { useSimulationStore } from '../../store/simulationStore'

const MODE_LABEL = Object.fromEntries(SIMULATOR.modes.map((m) => [m.id, m.label])) as Record<string, string>

function StageHud() {
  const { mode, playing, fault } = useSimulationStore(
    useShallow((s) => ({ mode: s.sim.mode, playing: s.sim.playing, fault: s.sim.fault?.type ?? null })),
  )
  const state = fault
    ? { text: 'Falha simulada', led: 'bg-danger', tone: 'text-danger' }
    : playing
      ? { text: 'Simulação ativa', led: 'bg-accent animate-led motion-reduce:animate-none', tone: 'text-accent' }
      : { text: 'Pausado', led: 'bg-muted', tone: 'text-muted' }
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] flex items-start justify-between gap-3 p-3 sm:p-4">
      <p className="label-mono rounded-[4px] bg-bg/60 px-2 py-1 !text-[10px] backdrop-blur-sm">
        <span className="hidden sm:inline">
          Modo <span className="text-muted/60">·</span>{' '}
        </span>
        <span className="text-fg">{MODE_LABEL[mode]}</span>
      </p>
      <p className={`label-mono flex items-center gap-2 rounded-[4px] whitespace-nowrap bg-bg/60 px-2 py-1 !text-[10px] backdrop-blur-sm ${state.tone}`}>
        <span aria-hidden className={`size-1.5 rounded-full ${state.led}`} />
        {state.text}
      </p>
    </div>
  )
}

export default function Simulator() {
  const faulted = useSimulationStore((s) => s.sim.fault !== null)
  return (
    <section id="simulador" aria-labelledby="simulador-title" className="relative border-t border-hair px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
      <div aria-hidden className="tech-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-mono mb-4 flex items-center gap-3 text-accent">
              <span aria-hidden className="h-px w-6 bg-accent/70" />
              Simulador principal
            </p>
            <h2 id="simulador-title" className="max-w-3xl text-3xl leading-[1.08] font-semibold tracking-[-0.025em] text-balance sm:text-4xl lg:text-[2.75rem]">
              {SIMULATOR.title}
            </h2>
          </div>
          <span className="label-mono rounded-[4px] border border-hair px-2.5 py-1.5 !text-[10px]">{SIMULATOR.chip}</span>
        </Reveal>

        <div id="simulador-palco" className="grid gap-3 lg:grid-cols-12">
          <div
            className={`relative overflow-hidden rounded-lg border bg-[radial-gradient(ellipse_at_50%_60%,#0E2740_0%,#081627_70%)] transition-colors lg:col-span-8 ${
              faulted ? 'animate-fault-pulse border-danger/60 motion-reduce:animate-none' : 'border-line'
            }`}
          >
            <div aria-hidden className="tech-grid pointer-events-none absolute inset-0 opacity-70" />
            <div aria-hidden className="frame-corners pointer-events-none absolute inset-0 z-[1]" />
            <StageHud />
            <Viewport3D
              variant="simulator"
              className={`${
                faulted
                  ? 'h-[clamp(260px,72vw,420px)] lg:h-[clamp(240px,calc(100svh-30rem),400px)]'
                  : 'h-[clamp(260px,72vw,420px)] lg:h-[clamp(340px,calc(100svh-22rem),560px)]'
              }`}
            />
            {!faulted && <div aria-hidden className="ruler-x pointer-events-none absolute inset-x-4 bottom-0 h-2 opacity-50" />}
            <FaultAlert />
          </div>
          <div className="lg:col-span-4">
            <SimulationControls />
          </div>
          <div className="rounded-lg border border-line bg-surface/40 p-4 lg:col-span-5">
            <PressureHeatmap />
          </div>
          <div className="rounded-lg border border-line bg-surface/40 p-4 lg:col-span-7">
            <SimulationIndicators />
          </div>
          <div className="rounded-lg border border-line bg-surface/40 p-4 lg:col-span-12">
            <SimulationCharts />
          </div>
        </div>
      </div>
    </section>
  )
}
