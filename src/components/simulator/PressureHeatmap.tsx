import { useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useSimulationStore } from '../../store/simulationStore'
import { COLS, ROWS } from '../../lib/simulationEngine'
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

function HeatCanvas({ live, matrix, label }: { live?: boolean; matrix?: number[]; label: string }) {
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
      <canvas
        ref={ref}
        width={ROWS}
        height={COLS}
        role="img"
        aria-label={label}
        className="block h-28 w-full rounded-[3px] outline outline-1 -outline-offset-1 outline-white/10 sm:h-32"
        style={{ imageRendering: 'auto' }}
      />
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
  const { regions, side, compare, baseline, sensorFault } = useSimulationStore(
    useShallow((s) => ({
      regions: s.telemetry.regions,
      side: s.telemetry.side,
      compare: s.compare,
      baseline: s.baseline,
      sensorFault: s.sim.fault?.type === 'sensor',
    })),
  )
  const peak = Math.max(...regions.map((r) => r.peak))
  const a = useSimulationStore.getState
  const small = 'min-h-10 rounded-md border px-2.5 text-xs transition-colors'

  return (
    <figure
      data-testid="heatmap"
      data-side-left={side.left.toFixed(1)}
      data-side-right={side.right.toFixed(1)}
      data-peak={peak.toFixed(3)}
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
            <HeatCanvas live label={summary(regions)} />
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
      <Disclaimer>{SIMULATOR.heatmapDisclaimer}</Disclaimer>
    </figure>
  )
}
