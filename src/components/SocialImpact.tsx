import { Reveal } from './ui/Section'
import Disclaimer from './ui/Disclaimer'
import { IMPACT, IMPACT_POINTS } from '../lib/content'

// Editorial: título grande, sem estatística, pontos em duas colunas com hairlines.
export default function SocialImpact() {
  return (
    <section id="impacto" aria-labelledby="impacto-title" className="relative border-t border-hair px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="label-mono mb-6 flex items-center gap-3 text-accent">
            <span aria-hidden className="h-px w-6 bg-accent/70" />
            Impacto social
          </p>
          <h2
            id="impacto-title"
            className="max-w-5xl text-4xl leading-[1.04] font-semibold tracking-[-0.035em] text-balance sm:text-5xl lg:text-[4rem]"
          >
            {IMPACT.title}
          </h2>
        </Reveal>
        <Reveal delay={0.06}>
          <ul className="mt-14 grid gap-x-12 md:grid-cols-2">
            {IMPACT_POINTS.map((p) => (
              <li key={p.title} className="border-t border-hair py-6">
                <h3 className="text-lg font-semibold tracking-[-0.01em]">{p.title}</h3>
                <p className="mt-2 max-w-[56ch] text-[15px] leading-relaxed text-muted text-pretty">{p.text}</p>
              </li>
            ))}
          </ul>
          <Disclaimer className="mt-6 border-t border-hair pt-6">{IMPACT.note}</Disclaimer>
        </Reveal>
      </div>
    </section>
  )
}
