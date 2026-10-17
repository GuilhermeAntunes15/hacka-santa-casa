import { useEffect, useRef } from 'react'
import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useSimulationStore } from '../../store/simulationStore'
import { COLS, POINT_DEFAULT, POINT_MAX, POINT_MIN, ROWS, regionAt } from '../../lib/simulationEngine'
import type { RegionLoad } from '../../lib/simulationEngine'
import { SIMULATOR } from '../../lib/content'
import { formatDecimal } from '../../lib/format'
import Disclaimer from '../ui/Disclaimer'

const STOPS: [number, [number, number, number]][] = [
  [0, [0x1e, 0x40, 0xaf]],
  [0.33, [0x23, 0xd5, 0xe7]],
  [0.66, [0xfa, 0xcc, 0x15]],
  [1, [0xef, 0x44, 0x44]],
]

function heatColor(v: number): [number, number, number] {
  const x = Math.min(1, Math.max(0, v))
  for (let k = 1; k < STOPS.length; k++) {
    const [p1, c1] = STOPS[k]
    const [p0, c0] = STOPS[k - 1]
    if (x <= p1) {
      const t = (x - p0) / (p1 - p0)
      return [0, 1, 2].map((j) => Math.round(c0[j] + (c1[j] - c0[j]) * t)) as [number, number, number]
    }
  }
  return STOPS[STOPS.length - 1][1]
}

function draw(canvas: HTMLCanvasElement | null, matrix: number[]) {
  const ctx = canvas?.getContext('2d')
  if (!ctx) return
  const img = ctx.createImageData(ROWS, COLS)
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const [R, G, B] = heatColor(matrix[r * COLS + c])
      const o = (c * ROWS + r) * 4
      img.data[o] = R
      img.data[o + 1] = G
      img.data[o + 2] = B
      img.data[o + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
}

const GRADIENT = 'linear-gradient(to right, #1E40AF, #23D5E7 33%, #FACC15 66%, #EF4444)'

const summary = (regions: RegionLoad[]) =>
  'Mapa ilustrativo de carga estimada. ' + regions.map((r) => `${r.label}: ${formatDecimal(r.share)}%`).join('; ')

const KEY_STEP: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

const CENTER = { r: 7, c: 3 }

type Cell = { r: number; c: number }

function HeatCanvas({ live, matrix, label, point }: { live?: boolean; matrix?: number[]; label: string; point?: Cell | null }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!live) return
    draw(ref.current, useSimulationStore.getState().sim.matrix)
    return useSimulationStore.subscribe((s, p) => {
      if (s.sim.matrix !== p.sim.matrix) draw(ref.current, s.sim.matrix)
    })
  }, [live])

  useEffect(() => {
    if (matrix) draw(ref.current, matrix)
  }, [matrix])

  const a = useSimulationStore.getState

  const onClick = (e: MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect || !rect.width || !rect.height) return
    a().setPointLoad(((e.clientX - rect.left) / rect.width) * ROWS, ((e.clientY - rect.top) / rect.height) * COLS)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const step = KEY_STEP[e.key]
    if (step) a().setPointLoad((point ?? CENTER).r + step[0], (point ?? CENTER).c + step[1])
    else if (e.key === 'Enter') {
      if (!point) a().setPointLoad(CENTER.r, CENTER.c)
    } else if (e.key === 'Delete' || e.key === 'Backspace') a().clearPointLoad()
    else return
    e.preventDefault()
    e.stopPropagation()
  }

  const canvas = (
    <canvas
      ref={ref}
      width={ROWS}
      height={COLS}
      role="img"
      aria-label={label}
      className="block h-28 w-full rounded-[3px] outline outline-1 -outline-offset-1 outline-white/10 sm:h-32"
      style={{ imageRendering: 'auto' }}
    />
  )

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-1.5 gap-y-1">
      <span />
      <div className="label-mono flex justify-between !text-[9px] !tracking-[0.12em]">
        <span>← Cabeceira</span>
        <span>Pés →</span>
      </div>
      <div className="num flex flex-col justify-between py-0.5 text-[9px] text-muted">
        <span>E</span>
        <span>D</span>
      </div>
      {live ? (
        <div
          data-testid="heatmap-surface"
          tabIndex={0}
          role="application"
          aria-label="Mapa interativo de carga: clique ou use as setas para posicionar a carga pontual; Enter aplica; Delete remove"
          className="relative cursor-crosshair rounded-[3px]"
          onClick={onClick}
          onKeyDown={onKeyDown}
        >
          {canvas}
          {point && (
            <span
              data-testid="heatmap-point-marker"
              aria-hidden
              className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.6),0_0_8px_rgba(0,0,0,0.5)]"
              style={{ left: `${((point.r + 0.5) / ROWS) * 100}%`, top: `${((point.c + 0.5) / COLS) * 100}%` }}
            />
          )}
        </div>
      ) : (
        canvas
      )}
      <span />
      {/* marcas das 16 câmaras transversais (linha i = câmara i) */}
      <div aria-hidden className="flex justify-between px-[3%]">
        {Array.from({ length: ROWS }, (_, i) => (
          <span key={i} className={`w-px ${i % 4 === 0 || i === ROWS - 1 ? 'h-1.5 bg-muted/70' : 'h-1 bg-muted/35'}`} />
        ))}
      </div>
    </div>
  )
}

export default function PressureHeatmap() {
  const { regions, side, compare, baseline, sensorFault, pointR, pointC, intensity, pointPeak } = useSimulationStore(
    useShallow((s) => ({
      regions: s.telemetry.regions,
      side: s.telemetry.side,
      compare: s.compare,
      baseline: s.baseline,
      sensorFault: s.sim.fault?.type === 'sensor',
      pointR: s.sim.point?.r ?? null,
      pointC: s.sim.point?.c ?? null,
      intensity: s.sim.point?.intensity ?? null,
      pointPeak: s.telemetry.pointPeak,
    })),
  )
  const point = pointR !== null && pointC !== null ? { r: pointR, c: pointC } : null
  const pct = Math.round((intensity ?? POINT_DEFAULT) * 100)
  const peak = Math.max(...regions.map((r) => r.peak))
  const a = useSimulationStore.getState
  const small = 'min-h-10 rounded-md border px-2.5 text-xs transition-colors'

  return (
    <figure
      data-testid="heatmap"
      data-side-left={side.left.toFixed(1)}
      data-side-right={side.right.toFixed(1)}
      data-peak={peak.toFixed(3)}
      data-point-r={pointR ?? undefined}
      data-point-c={pointC ?? undefined}
      className="space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <figcaption className="label-mono !text-[10px]">Mapa de carga estimada · superfície</figcaption>
        <button
          type="button"
          data-testid="heatmap-compare-toggle"
          aria-pressed={compare}
          className={`${small} ${compare ? 'border-accent/70 bg-accent/10 text-accent' : 'border-line hover:border-tech/70 hover:bg-tech/10'}`}
          onClick={() => a().toggleCompare()}
        >
          Comparar antes e depois
        </button>
      </div>

      <div className={compare ? 'grid grid-cols-1 gap-3 sm:grid-cols-2' : ''}>
        {compare && (
          <div data-testid="heatmap-baseline" className="space-y-1">
            <p className="text-[11px] text-muted">
              <span className="font-semibold text-fg">Antes</span> · {baseline.label}
            </p>
            <HeatCanvas matrix={baseline.matrix} label={`Estado de comparação: ${baseline.label}`} />
          </div>
        )}
        <div className="space-y-1">
          {compare && (
            <p className="text-[11px] text-muted">
              <span className="font-semibold text-fg">Agora</span> · estado atual
            </p>
          )}
          <div className="relative">
            <HeatCanvas live label={summary(regions)} point={point} />
            {sensorFault && (
              <div className="absolute inset-0 grid place-items-center rounded-[3px] bg-bg/70 p-2 text-center text-xs font-medium text-warn">
                S4 sem comunicação — exibindo último valor válido
              </div>
            )}
          </div>
        </div>
      </div>

      {compare && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            data-testid="heatmap-capture"
            className={`${small} border-line hover:border-tech/70 hover:bg-tech/10`}
            onClick={() => a().captureBaseline()}
          >
            Capturar estado atual como “Antes”
          </button>
          <button
            type="button"
            data-testid="heatmap-baseline-reset"
            className={`${small} border-line hover:border-tech/70 hover:bg-tech/10`}
            onClick={() => a().resetBaseline()}
          >
            Usar referência estática
          </button>
        </div>
      )}

      <div aria-label="Legenda do mapa · escala ilustrativa" role="group">
        <div aria-hidden className="h-1.5 rounded-[2px]" style={{ background: GRADIENT }} />
        <ul className="num mt-1 grid grid-cols-4 text-[9.5px] leading-tight text-muted">
          <li>Menor leitura</li>
          <li className="text-center">Intermediária</li>
          <li className="text-center">Relat. elevada</li>
          <li className="text-right">Mais elevada</li>
        </ul>
      </div>
      <fieldset className="space-y-2">
        <legend className="label-mono mb-2 !text-[10px]">Carga pontual</legend>
        <p data-testid="point-load-label" data-active={String(!!point)} className={`text-xs ${point ? 'num text-fg' : 'text-muted'}`}>
          {point
            ? `Carga pontual em: ${regionAt(point.r)} · lado ${point.c < COLS / 2 ? 'E' : 'D'} · pico local ${pointPeak ?? '—'} u.a.`
            : SIMULATOR.pointLoadHint}
        </p>
        <div className="flex items-center gap-2">
          <input
            type="range"
            data-testid="point-load-intensity"
            aria-label="Intensidade da carga pontual"
            min={POINT_MIN * 100}
            max={POINT_MAX * 100}
            step={10}
            value={pct}
            disabled={!point}
            onChange={(e) => a().setPointIntensity(Number(e.target.value) / 100)}
            className="min-w-0 flex-1 disabled:opacity-35"
            style={{ '--fill': `${((pct - POINT_MIN * 100) / ((POINT_MAX - POINT_MIN) * 100)) * 100}%` } as CSSProperties}
          />
          <span className="num w-14 shrink-0 text-right text-xs text-fg">{pct} u.a.</span>
          <button
            type="button"
            data-testid="point-load-clear"
            disabled={!point}
            className={`${small} shrink-0 border-line hover:border-tech/70 hover:bg-tech/10 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line disabled:hover:bg-transparent`}
            onClick={() => a().clearPointLoad()}
          >
            Remover carga pontual
          </button>
        </div>
        <Disclaimer>{SIMULATOR.pointLoadNotice}</Disclaimer>
      </fieldset>
      <Disclaimer>{SIMULATOR.heatmapDisclaimer}</Disclaimer>
    </figure>
  )
}
