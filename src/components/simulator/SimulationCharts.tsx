import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useSimulationStore } from '../../store/simulationStore'
import { regionLoads } from '../../lib/simulationEngine'

const MONO = '"Geist Mono Variable", ui-monospace, monospace'
const TICK = { fill: '#94A3B8', fontSize: 10, fontFamily: MONO }
const AXIS = { stroke: '#1E3A55', tickLine: false, tick: TICK }
const GRID = { stroke: 'rgba(148,163,184,0.12)', strokeDasharray: '2 4' }
const TOOLTIP = {
  contentStyle: { background: '#07111F', border: '1px solid #1E3A55', borderRadius: 4, fontSize: 11, fontFamily: MONO },
  itemStyle: { padding: 0 },
}

const Key = ({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) => (
  <li className="inline-flex items-center gap-1.5">
    <span aria-hidden className="h-0 w-3 border-t-2" style={{ borderColor: color, borderStyle: dashed ? 'dashed' : 'solid' }} />
    {label}
  </li>
)

export default function SimulationCharts() {
  const { history, regions, mode, compare, baseline } = useSimulationStore(
    useShallow((s) => ({
      history: s.telemetry.history,
      regions: s.telemetry.regions,
      mode: s.sim.mode,
      compare: s.compare,
      baseline: s.baseline.matrix,
    })),
  )
  const baselineRegions = useMemo(() => regionLoads(baseline), [baseline])
  const lineData = useMemo(() => history.map((h, i) => ({ i, ...h })), [history])
  const barData = regions.map((r, k) => ({
    label: r.label.replace('Região ', ''),
    agora: +r.share.toFixed(1),
    antes: +baselineRegions[k].share.toFixed(1),
  }))
  const lateral = mode === 'lateral'

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="label-mono !text-[10px]">Pressões pneumáticas simuladas · u.a.</h3>
          <ul className="num flex flex-wrap gap-x-3 text-[10px] text-muted" aria-label="Legenda">
            <Key color="#23D5E7" label="Grupo A" />
            <Key color="#3B82F6" label="Grupo B" />
            {lateral && <Key color="#F2F7FA" label="Inf. esquerda" dashed />}
            {lateral && <Key color="#94A3B8" label="Inf. direita" dashed />}
          </ul>
        </div>
        <div className="h-44" data-testid="chart-history">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 176 }}>
            <LineChart data={lineData} margin={{ top: 6, right: 4, bottom: 0, left: -18 }}>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="i" tick={false} stroke="#1E3A55" />
              <YAxis domain={[0, 130]} ticks={[0, 35, 70, 100, 130]} {...AXIS} />
              <Tooltip {...TOOLTIP} labelFormatter={() => ''} />
              <Line type="monotone" dataKey="a" name="Grupo A" stroke="#23D5E7" dot={false} isAnimationActive={false} strokeWidth={1.75} />
              <Line type="monotone" dataKey="b" name="Grupo B" stroke="#3B82F6" dot={false} isAnimationActive={false} strokeWidth={1.75} />
              {lateral && (
                <Line type="monotone" dataKey="l" name="Inf. esquerda" stroke="#F2F7FA" strokeDasharray="4 3" dot={false} isAnimationActive={false} strokeWidth={1.25} />
              )}
              {lateral && (
                <Line type="monotone" dataKey="r" name="Inf. direita" stroke="#94A3B8" strokeDasharray="4 3" dot={false} isAnimationActive={false} strokeWidth={1.25} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="lg:col-span-5">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="label-mono !text-[10px]">Carga estimada por região · % do total</h3>
          <ul className="num flex gap-x-3 text-[10px] text-muted" aria-label="Legenda">
            {compare && <Key color="#475569" label="Antes" />}
            <Key color="#23D5E7" label="Agora" />
          </ul>
        </div>
        <div className="h-44" data-testid="chart-regions">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 176 }}>
            <BarChart data={barData} margin={{ top: 6, right: 4, bottom: 0, left: -18 }} barGap={2}>
              <CartesianGrid {...GRID} vertical={false} />
              <XAxis dataKey="label" interval={0} {...AXIS} tick={{ ...TICK, fontSize: 9 }} />
              <YAxis domain={[0, 50]} ticks={[0, 25, 50]} {...AXIS} />
              <Tooltip {...TOOLTIP} cursor={{ fill: 'rgba(35,213,231,0.06)' }} />
              {compare && <Bar dataKey="antes" name="Antes" fill="#475569" isAnimationActive={false} radius={[2, 2, 0, 0]} />}
              <Bar dataKey="agora" name="Agora" fill="#23D5E7" fillOpacity={0.85} isAnimationActive={false} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
