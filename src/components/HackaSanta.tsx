import Section from './ui/Section'
import StatusBadge from './ui/StatusBadge'
import { CRITERIA, HACKASANTA } from '../lib/content'

export default function HackaSanta() {
  return (
    <Section id="hackasanta" eyebrow="Contexto do projeto" title={HACKASANTA.title}>
      <dl className="mb-12 grid border-y border-hair text-sm sm:grid-cols-3 sm:divide-x sm:divide-hair">
        <div className="py-4 sm:pr-6">
          <dt className="label-mono !text-[10px]">Tema</dt>
          <dd className="mt-1.5 leading-relaxed text-fg">“{HACKASANTA.theme}”</dd>
        </div>
        <div className="border-t border-hair py-4 sm:border-t-0 sm:px-6">
          <dt className="label-mono !text-[10px]">Trilha principal</dt>
          <dd className="mt-1.5 text-fg">{HACKASANTA.mainTrack}</dd>
        </div>
        <div className="border-t border-hair py-4 sm:border-t-0 sm:pl-6">
          <dt className="label-mono !text-[10px]">Trilhas relacionadas</dt>
          <dd className="mt-1.5 text-fg">{HACKASANTA.relatedTracks.join(' · ')}</dd>
        </div>
      </dl>

      <h3 className="label-mono mb-3 !text-[10px]">Critérios do edital · peso</h3>
      {/* Barra segmentada 5 × 20% */}
      <div aria-hidden className="mb-4 flex gap-1">
        {CRITERIA.map((c) => (
          <div key={c.name} style={{ width: `${c.weight}%` }} className="h-1.5 rounded-[1px] bg-tech/70" />
        ))}
      </div>
      <ul className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-5" aria-label="Critérios do edital">
        {CRITERIA.map((c) => (
          <li key={c.name} data-testid="criterion" className="flex flex-col gap-3 bg-bg p-4">
            <p className="flex items-baseline justify-between gap-2">
              <span className="font-semibold">{c.name}</span>
              <span className="num text-sm text-[#7AA7F8]">{c.weight}%</span>
            </p>
            <p className="flex-1 text-[13px] leading-relaxed text-muted">{c.approach}</p>
            <StatusBadge status={c.status} />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted">{HACKASANTA.note}</p>
    </Section>
  )
}
