import Section from './ui/Section'
import StatusBadge, { StatusLegend } from './ui/StatusBadge'
import { PLANNED_KPIS, REGULATORY, ROADMAP, ROADMAP_STEPS } from '../lib/content'

export default function Roadmap() {
  return (
    <Section id="roadmap" eyebrow="Roadmap" title={ROADMAP.title} intro={ROADMAP.intro} grid>
      <div className="mb-10">
        <StatusLegend />
      </div>

      {/* Trilho: vertical no mobile, horizontal a partir de lg. Etapa 1 = trilho sólido + nó preenchido. */}
      <ol className="grid gap-0 lg:grid-cols-5 lg:gap-6">
        {ROADMAP_STEPS.map((s, i) => {
          const current = i === 0
          return (
            <li
              key={s.title}
              data-testid={`roadmap-step-${i + 1}`}
              data-current={current}
              className="relative pb-8 pl-8 last:pb-0 lg:pt-10 lg:pb-0 lg:pl-0"
            >
              {/* segmento do trilho */}
              <span
                aria-hidden
                className={`absolute top-3 bottom-0 left-[5px] w-0 border-l lg:top-[5px] lg:bottom-auto lg:left-3 lg:h-0 lg:w-auto lg:border-t lg:border-l-0 ${
                  current ? 'border-ok/70' : 'border-dashed border-line'
                } ${i === ROADMAP_STEPS.length - 1 ? 'hidden lg:block lg:right-0' : 'lg:-right-6'}`}
              />
              {/* nó */}
              <span aria-hidden className="absolute top-1 left-0 grid size-3 place-items-center lg:top-0">
                {current && <span className="absolute size-5 animate-ping rounded-full bg-ok/25 [animation-duration:2.4s] motion-reduce:hidden" />}
                <span className={`relative size-3 rounded-[3px] ${current ? 'bg-ok' : 'border border-muted/60 bg-bg'}`} />
              </span>
              <p className="num mb-2 text-[11px] text-muted">{s.estimate}</p>
              <h3 className={`text-[15px] leading-snug font-semibold text-balance ${current ? 'text-fg' : 'text-fg/85'}`}>{s.title}</h3>
              <div className="mt-2.5">
                <StatusBadge status={s.status} label={s.statusLabel} />
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-muted text-pretty">{s.description}</p>
            </li>
          )
        })}
      </ol>

      <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2">
        <div className="bg-bg p-5">
          <h3 className="label-mono mb-3 !text-[10px]">Indicadores planejados (a medir em protótipo)</h3>
          <ul className="space-y-2 text-sm text-fg/90">
            {PLANNED_KPIS.map((k) => (
              <li key={k} className="flex gap-3 leading-relaxed">
                <span aria-hidden className="mt-[9px] h-px w-3 shrink-0 bg-muted/60" />
                {k}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-bg p-5">
          <h3 className="label-mono mb-3 !text-[10px]">Planejamento regulatório</h3>
          <ul className="space-y-2 text-sm text-fg/90">
            {REGULATORY.map((k) => (
              <li key={k} className="flex gap-3 leading-relaxed">
                <span aria-hidden className="mt-[9px] h-px w-3 shrink-0 bg-muted/60" />
                {k}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}
