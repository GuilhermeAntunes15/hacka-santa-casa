import { ExternalLink } from 'lucide-react'
import Section from './ui/Section'
import StatusBadge, { StatusLegend } from './ui/StatusBadge'
import { COMPARISON, COMPARISON_ROWS } from '../lib/content'

export default function Comparison() {
  return (
    <Section id="comparacao" eyebrow="Contexto tecnológico" title={COMPARISON.title} intro={COMPARISON.intro}>
      <div className="mb-6 grid gap-5 border-y border-hair py-5 lg:grid-cols-12 lg:items-center">
        <p className="max-w-2xl text-sm leading-relaxed text-muted lg:col-span-7">{COMPARISON.category}</p>
        <div className="space-y-3 lg:col-span-5 lg:justify-self-end">
          <a
            href={COMPARISON.referenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="stiegelmeyer-link"
            className="inline-flex min-h-10 items-center gap-1.5 text-sm text-fg underline decoration-tech/60 underline-offset-4 transition-colors hover:decoration-tech"
          >
            {COMPARISON.referenceLabel}
            <ExternalLink size={14} aria-hidden className="shrink-0 text-tech" />
          </a>
          <StatusLegend />
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <caption className="sr-only">Comparação de recursos entre a categoria comercial e o direcionamento do NUVA</caption>
          <thead className="bg-surface/70">
            <tr className="label-mono !text-[10px]">
              <th scope="col" className="w-[22%] px-4 py-3 font-normal">
                Recurso
              </th>
              <th scope="col" className="w-[24%] px-4 py-3 font-normal">
                Sistemas existentes (categoria)
              </th>
              <th scope="col" className="px-4 py-3 font-normal">
                Direcionamento NUVA
              </th>
              <th scope="col" className="w-[1%] px-4 py-3 font-normal whitespace-nowrap">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((r) => (
              <tr key={r.feature} className="border-t border-hair align-top transition-colors hover:bg-white/[0.02]">
                <th scope="row" className="px-4 py-3.5 font-medium text-fg">
                  {r.feature}
                </th>
                <td className="px-4 py-3.5 text-muted">{r.existing}</td>
                <td className="px-4 py-3.5 leading-relaxed text-fg/90">{r.pressusense}</td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">{COMPARISON.note}</p>
    </Section>
  )
}
