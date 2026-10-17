import { useSimulationStore } from '../../store/simulationStore'
import { groupOf, isOutOfRange } from '../../lib/simulationEngine'
import { formatClock, formatDecimal, formatDegrees, formatSignedPP } from '../../lib/format'

const Stat = ({ label, testId, value, unit, hint }: { label: string; testId: string; value: string; unit?: string; hint?: string }) => (
  <div className="bg-bg/60 px-3 py-2.5">
    <dt className="label-mono truncate !text-[9.5px]">{label}</dt>
    <dd className="mt-1 flex items-baseline gap-1">
      <span className="num text-xl leading-none text-fg" data-testid={testId}>
        {value}
      </span>
      {unit && <span className="num text-[10px] text-muted">{unit}</span>}
    </dd>
    {hint && <dd className="mt-1 truncate text-[10px] text-muted">{hint}</dd>}
  </div>
)

function responsibleChambers(tilt: number): string {
  if (tilt > 0.5) return 'Câmara inferior esquerda inflando · direita em exaustão'
  if (tilt < -0.5) return 'Câmara inferior direita inflando · esquerda em exaustão'
  return 'Câmaras inferiores em repouso (base)'
}

export default function SimulationIndicators() {
  const t = useSimulationStore((s) => s.telemetry)
  const mode = useSimulationStore((s) => s.sim.mode)
  const outOfRange = t.chambers.some(isOutOfRange)

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="label-mono !text-[10px]">Estado das câmaras · u.a. (simulado)</h3>
          {outOfRange ? (
            <p className="text-[11px] text-danger">Câmara fora do intervalo de simulação</p>
          ) : (
            <p className="label-mono !text-[9.5px]">C01 cabeceira → C16 pés</p>
          )}
        </div>
        <ul className="grid grid-cols-8 gap-1 lg:grid-cols-16" aria-label="Inflação relativa por câmara">
          {t.chambers.map((v, i) => {
            const out = isOutOfRange(v)
            const g = groupOf(i)
            const active = t.activeGroup === g
            const fill = Math.max(0, Math.min(100, (v / 130) * 100))
            return (
              <li
                key={i}
                data-testid={`chamber-${i + 1}`}
                data-group={g}
                data-out-of-range={out}
                title={out ? 'fora do intervalo de simulação' : undefined}
                className={`relative overflow-hidden rounded-[3px] border px-0.5 pt-1 pb-1 text-center transition-colors ${
                  out ? 'border-danger/80 bg-danger/10' : active ? 'border-accent/60' : 'border-line'
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute inset-x-0 bottom-0 transition-[height] duration-300 ease-out ${
                    out ? 'bg-danger/25' : g === 'A' ? 'bg-accent/15' : 'bg-tech/20'
                  }`}
                  style={{ height: `${fill}%` }}
                />
                <span className="num relative block text-[8.5px] leading-tight text-muted">
                  C{String(i + 1).padStart(2, '0')}·{g}
                </span>
                <span className={`num relative block text-[11px] leading-tight ${out ? 'text-danger' : active ? 'text-accent' : 'text-fg'}`}>{v}</span>
              </li>
            )
          })}
        </ul>
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4">
        <Stat label="Grupo A" testId="stat-group-a" value={`${t.groupA} u.a.`} />
        <Stat label="Grupo B" testId="stat-group-b" value={`${t.groupB} u.a.`} />
        <Stat label="Tempo simulado" testId="stat-elapsed" value={formatClock(t.elapsed)} hint="ciclo comprimido" />
        <Stat label="Ângulo simulado" testId="tilt-value" value={formatDegrees(t.tilt)} hint="geométrico" />
        <Stat label="Câm. inf. · E" testId="lower-left" value={`${t.lowerLeft} u.a.`} />
        <Stat label="Câm. inf. · D" testId="lower-right" value={`${t.lowerRight} u.a.`} />
        <div className="bg-bg/60 px-3 py-2.5">
          <dt className="label-mono !text-[9.5px]">Distribuição · E</dt>
          <dd className="num mt-1 text-xl leading-none" data-testid="side-left">
            {formatDecimal(t.side.left)}%
          </dd>
          <dd className="num mt-1 text-[10px] text-muted">{formatSignedPP(t.side.left - 50)}</dd>
        </div>
        <div className="bg-bg/60 px-3 py-2.5">
          <dt className="label-mono !text-[9.5px]">Distribuição · D</dt>
          <dd className="num mt-1 text-xl leading-none" data-testid="side-right">
            {formatDecimal(t.side.right)}%
          </dd>
          <dd className="num mt-1 text-[10px] text-muted">{formatSignedPP(t.side.right - 50)}</dd>
        </div>
      </dl>

      {mode === 'lateral' && (
        <p className="flex items-center gap-2 text-xs text-accent" data-testid="responsible-chambers">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          {responsibleChambers(t.tilt)}
        </p>
      )}
    </div>
  )
}
