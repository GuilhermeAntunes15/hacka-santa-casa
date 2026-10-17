import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Bar, CartesianGrid, Cell, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Plus, RotateCcw } from 'lucide-react'
import Section from './ui/Section'
import Disclaimer from './ui/Disclaimer'
import { DEFAULT_INPUTS, INPUT_LIMITS, computeEconomics, sanitizeValue } from '../lib/economicModel'
import type { EconomicInputs, EconomicKey } from '../lib/economicModel'
import { ECONOMY, PROTOTYPE_BOM } from '../lib/content'
import { formatBRL, formatDecimal } from '../lib/format'

const FIELDS: { key: EconomicKey; testId: string; label: string; unit: string }[] = [
  { key: 'beds', testId: 'econ-beds', label: 'Número de leitos', unit: 'leitos' },
  { key: 'patientsPerBedYear', testId: 'econ-patients', label: 'Pacientes por leito por ano (hipotético)', unit: 'pacientes' },
  { key: 'equipmentCostPerBed', testId: 'econ-equipment', label: 'Custo estimado do equipamento por leito', unit: 'R$' },
  { key: 'maintenancePerBedYear', testId: 'econ-maintenance', label: 'Custo anual estimado de manutenção por leito', unit: 'R$/ano' },
  { key: 'incidencePct', testId: 'econ-incidence', label: 'Taxa hipotética de ocorrência de lesões por pressão', unit: '%' },
  { key: 'reductionPct', testId: 'econ-reduction', label: 'Redução hipotética da ocorrência', unit: '%' },
  { key: 'incrementalCostPerCase', testId: 'econ-case-cost', label: 'Custo incremental hipotético por caso', unit: 'R$' },
  { key: 'horizonYears', testId: 'econ-horizon', label: 'Horizonte de análise', unit: 'anos' },
]

const toRaw = (i: EconomicInputs) =>
  Object.fromEntries(Object.entries(i).map(([k, v]) => [k, String(v)])) as Record<EconomicKey, string>

const parse = (raw: string) => (raw.trim() === '' ? Number.NaN : Number(raw.replace(',', '.')))

const MONO = '"Geist Mono Variable", ui-monospace, monospace'
const TICK = { fill: '#94A3B8', fontSize: 10, fontFamily: MONO }
const AXIS = { stroke: '#1E3A55', tickLine: false, tick: TICK }
const compactBRL = new Intl.NumberFormat('pt-BR', { notation: 'compact', style: 'currency', currency: 'BRL', maximumFractionDigits: 1 })

function Output({
  label,
  testId,
  value,
  tone = 'text-fg',
  big = false,
  className = '',
}: {
  label: string
  testId: string
  value: string
  tone?: string
  big?: boolean
  className?: string
}) {
  return (
    <div className={`flex flex-col justify-between gap-2 bg-bg/70 px-4 py-3.5 ${className}`}>
      <dt className="label-mono !text-[10px] leading-snug">{label}</dt>
      <dd className={`num leading-none tracking-[-0.02em] ${big ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'} ${tone}`} data-testid={testId}>
        {value}
      </dd>
    </div>
  )
}

const Key = ({ color, label, bar }: { color: string; label: string; bar?: boolean }) => (
  <li className="inline-flex items-center gap-1.5">
    <span aria-hidden className={bar ? 'size-2 rounded-[1px]' : 'h-0 w-3 border-t-2'} style={bar ? { background: color } : { borderColor: color }} />
    {label}
  </li>
)

export default function EconomicCalculator() {
  const [raw, setRaw] = useState<Record<EconomicKey, string>>(() => toRaw(DEFAULT_INPUTS))

  const inputs = useMemo(() => {
    const out = { ...DEFAULT_INPUTS }
    for (const f of FIELDS) out[f.key] = sanitizeValue(f.key, parse(raw[f.key]))
    return out
  }, [raw])
  const r = useMemo(() => computeEconomics(inputs), [inputs])

  const setField = (key: EconomicKey, value: string) => setRaw((prev) => ({ ...prev, [key]: value }))
  const normalize = (key: EconomicKey) => setField(key, String(inputs[key]))

  return (
    <Section
      id="economia"
      eyebrow="Modelo econômico exploratório"
      title={ECONOMY.title}
      intro={ECONOMY.disclaimer}
      grid
    >
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <form className="lg:col-span-5" onSubmit={(e) => e.preventDefault()} aria-label="Parâmetros hipotéticos">
          <div className="divide-y divide-hair rounded-lg border border-line bg-surface/40">
            {FIELDS.map((f) => {
              const lim = INPUT_LIMITS[f.key]
              const id = `econ-${f.key}`
              const fill = ((inputs[f.key] - lim.min) / (lim.max - lim.min)) * 100
              return (
                <div key={f.key} className="px-4 py-3">
                  <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-[13px] leading-snug text-fg/90">
                    <span>{f.label}</span>
                    <span className="label-mono shrink-0 !text-[9.5px]">{f.unit}</span>
                  </label>
                  <div className="mt-1.5 flex items-center gap-3">
                    <input
                      type="range"
                      aria-label={`${f.label} (controle deslizante)`}
                      min={lim.min}
                      max={lim.max}
                      step={lim.step}
                      value={inputs[f.key]}
                      onChange={(e) => setField(f.key, e.target.value)}
                      style={{ '--fill': `${Math.max(0, Math.min(100, fill))}%` } as CSSProperties}
                      className="min-w-0 flex-1"
                    />
                    <input
                      id={id}
                      type="number"
                      inputMode="decimal"
                      data-testid={f.testId}
                      min={lim.min}
                      max={lim.max}
                      step={lim.step}
                      value={raw[f.key]}
                      onChange={(e) => setField(f.key, e.target.value)}
                      onBlur={() => normalize(f.key)}
                      className="num h-10 w-28 rounded-md border border-line bg-bg px-2.5 text-right text-sm text-fg transition-colors hover:border-muted/50 focus:border-tech"
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-start gap-4">
            <button
              type="button"
              data-testid="econ-reset"
              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-md border border-line px-3 text-[13px] transition-colors hover:border-tech hover:bg-tech/10"
              onClick={() => setRaw(toRaw(DEFAULT_INPUTS))}
            >
              <RotateCcw size={15} aria-hidden />
              Restaurar valores
            </button>
            <Disclaimer className="min-w-0 flex-1 basis-56">{ECONOMY.priceNote}</Disclaimer>
          </div>
        </form>

        <div className="space-y-3 lg:col-span-7">
          <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
            <Output
              label={`Saldo econômico simplificado em ${inputs.horizonYears} ${inputs.horizonYears === 1 ? 'ano' : 'anos'}`}
              testId="econ-balance"
              value={formatBRL(r.balanceAtHorizon)}
              tone={r.balanceAtHorizon >= 0 ? 'text-ok' : 'text-[#FCA5A5]'}
              big
              className="sm:col-span-2"
            />
            <Output
              label="Ponto de equilíbrio hipotético (anos)"
              testId="econ-payback"
              value={r.paybackYears === null ? 'Não atingido' : formatDecimal(r.paybackYears)}
            />
            <Output label="Investimento inicial" testId="econ-investment" value={formatBRL(r.initialInvestment)} />
            <Output label="Despesa anual de manutenção" testId="econ-maintenance-annual" value={formatBRL(r.annualMaintenance)} />
            <Output label="Economia bruta simulada / ano" testId="econ-gross" value={formatBRL(r.grossSavingsPerYear)} />
            <Output
              label="Eventos potencialmente evitados / ano (cenário hipotético)"
              testId="econ-avoided"
              value={formatDecimal(r.avoidedEventsPerYear)}
              className="sm:col-span-3"
            />
          </dl>

          <figure className="rounded-lg border border-line bg-surface/40 p-4">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <figcaption className="label-mono !text-[10px]">Projeção acumulada · cenário hipotético</figcaption>
              <ul className="num flex flex-wrap gap-x-3 text-[10px] text-muted" aria-label="Legenda">
                <Key color="#3B82F6" label="Saldo acumulado" bar />
                <Key color="#23D5E7" label="Economia bruta acumulada" />
                <Key color="#94A3B8" label="Custo acumulado" />
              </ul>
            </div>
            <div className="h-60" data-testid="econ-chart">
              <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 480, height: 240 }}>
                <ComposedChart data={r.series} margin={{ top: 6, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="year" {...AXIS} tickFormatter={(y: number) => `A${y}`} />
                  <YAxis {...AXIS} tickFormatter={(v: number) => compactBRL.format(v)} width={80} />
                  <ReferenceLine y={0} stroke="#94A3B8" strokeOpacity={0.5} />
                  <Tooltip
                    contentStyle={{ background: '#07111F', border: '1px solid #1E3A55', borderRadius: 4, fontSize: 11, fontFamily: MONO }}
                    cursor={{ fill: 'rgba(59,130,246,0.06)' }}
                    formatter={(v) => formatBRL(Number(v))}
                    labelFormatter={(y) => `Ano ${y}`}
                  />
                  <Bar dataKey="balance" name="Saldo acumulado" isAnimationActive={false} radius={[2, 2, 0, 0]} maxBarSize={36}>
                    {r.series.map((p) => (
                      <Cell key={p.year} fill={p.balance >= 0 ? '#3B82F6' : '#7F1D1D'} />
                    ))}
                  </Bar>
                  <Line dataKey="cumulativeSavings" name="Economia bruta acumulada" stroke="#23D5E7" strokeWidth={1.75} dot={false} isAnimationActive={false} />
                  <Line dataKey="cumulativeCost" name="Custo acumulado" stroke="#94A3B8" strokeDasharray="4 3" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </figure>

          <details className="group rounded-lg border border-line text-sm">
            <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 px-4 text-[13px] font-medium transition-colors hover:text-accent">
              Como calculamos
              <Plus size={14} aria-hidden className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-45" />
            </summary>
            <ul className="num space-y-1.5 border-t border-hair px-4 py-3 text-[11.5px] leading-relaxed text-muted">
              <li>investimento = leitos × custo do equipamento por leito</li>
              <li>manutenção/ano = leitos × manutenção por leito</li>
              <li>casos base/ano = leitos × pacientes por leito/ano × ocorrência ÷ 100</li>
              <li>eventos evitados/ano = casos base × redução ÷ 100</li>
              <li>economia bruta/ano = eventos evitados × custo incremental por caso</li>
              <li>saldo(n) = n × (economia bruta − manutenção) − investimento</li>
              <li>equilíbrio = investimento ÷ (economia bruta − manutenção), se positivo</li>
            </ul>
          </details>

          <details className="group rounded-lg border border-line text-sm">
            <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 px-4 text-[13px] font-medium transition-colors hover:text-accent">
              {PROTOTYPE_BOM.title}
              <Plus size={14} aria-hidden className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-45" />
            </summary>
            <div className="border-t border-hair px-4 py-3">
            <table className="w-full text-xs">
              <thead className="label-mono text-left !text-[9.5px]">
                <tr>
                  <th className="py-1 font-normal">Componente</th>
                  <th className="py-1 font-normal">Qtd</th>
                  <th className="py-1 text-right font-normal">Est.</th>
                </tr>
              </thead>
              <tbody className="num">
                {PROTOTYPE_BOM.items.map((it) => (
                  <tr key={it.item} className="border-t border-line/50">
                    <td className="py-1 font-sans">{it.item}</td>
                    <td className="py-1">{it.qty}</td>
                    <td className="py-1 text-right">~{formatBRL(it.cost)}</td>
                  </tr>
                ))}
                <tr className="border-t border-line">
                  <td className="py-1 font-sans font-semibold">Total do protótipo</td>
                  <td />
                  <td className="py-1 text-right font-semibold">~{formatBRL(PROTOTYPE_BOM.total)}</td>
                </tr>
              </tbody>
            </table>
            <Disclaimer className="mt-3">{PROTOTYPE_BOM.note}</Disclaimer>
            </div>
          </details>
        </div>
      </div>
    </Section>
  )
}
