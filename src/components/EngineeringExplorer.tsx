import { useState } from 'react'
import { motion } from 'motion/react'
import { Layers3, Plus } from 'lucide-react'
import Section from './ui/Section'
import StatusBadge from './ui/StatusBadge'
import Viewport3D from './three/Viewport3D'
import { LAYERS, LAYER_ORDER, LIMITATIONS } from '../lib/content'
import type { LayerId } from '../lib/simulationEngine'

const DETAIL_ROWS = [
  ['fn', 'Função'],
  ['importance', 'Por que importa'],
  ['costLever', 'Alavanca de custo'],
  ['limitations', 'Limitações'],
] as const

const EASE = [0.16, 1, 0.3, 1] as const

export default function EngineeringExplorer() {
  const [selected, setSelected] = useState<LayerId>('topChambers')
  const [exploded, setExploded] = useState(true)
  const layer = LAYERS[selected]
  const idx = LAYER_ORDER.indexOf(selected)

  return (
    <Section
      id="engenharia"
      eyebrow="Explorador de engenharia"
      title="Engenharia projetada para ser acessível"
      intro="Sete camadas, componentes de prateleira e módulos substituíveis. Selecione uma peça no índice ou no modelo 3D."
      grid
    >
      <div className="grid gap-3 lg:grid-cols-12">
        {/* Índice técnico 01–07 */}
        <nav aria-label="Índice de componentes" className="lg:col-span-3">
          <ol className="divide-y divide-hair overflow-hidden rounded-lg border border-line bg-surface/40" aria-label="Componentes do sobrecolchão">
            {LAYER_ORDER.map((id, i) => {
              const on = selected === id
              return (
                <li key={id}>
                  <button
                    type="button"
                    data-testid={`layer-${id}`}
                    aria-pressed={on}
                    className={`group relative flex min-h-12 w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm transition-colors ${
                      on ? 'bg-surface-2 text-fg' : 'text-muted hover:bg-white/[0.03] hover:text-fg'
                    }`}
                    onClick={() => setSelected(id)}
                  >
                    {on && (
                      <motion.span
                        layoutId="layer-indicator"
                        aria-hidden
                        className="absolute inset-y-0 left-0 w-[2px] bg-accent"
                        transition={{ duration: 0.3, ease: EASE }}
                      />
                    )}
                    <span className={`num text-[11px] ${on ? 'text-accent' : 'text-muted/70'}`}>{String(i + 1).padStart(2, '0')}</span>
                    <span className="flex-1 leading-snug">{LAYERS[id].title}</span>
                    <span aria-hidden className={`h-px w-3 transition-all ${on ? 'w-5 bg-accent' : 'bg-line group-hover:bg-muted'}`} />
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>

        {/* Palco 3D */}
        <div className="relative overflow-hidden rounded-lg border border-line bg-[radial-gradient(ellipse_at_50%_55%,#0E2740_0%,#081627_70%)] lg:col-span-5">
          <div aria-hidden className="tech-grid pointer-events-none absolute inset-0 opacity-70" />
          <div aria-hidden className="frame-corners pointer-events-none absolute inset-0 z-[1]" />
          <Viewport3D
            variant="explorer"
            selectedLayer={selected}
            onSelectLayer={setSelected}
            exploded={exploded}
            className="h-full min-h-[clamp(320px,56vh,560px)]"
          />
          <p className="label-mono pointer-events-none absolute top-3 right-3 z-[2] !text-[10px]">
            <span className="num text-accent">{String(idx + 1).padStart(2, '0')}</span>
            <span className="text-muted/60"> / 07</span>
          </p>
          <button
            type="button"
            data-testid="explorer-explode-toggle"
            aria-pressed={exploded}
            className="absolute top-3 left-3 z-[2] inline-flex min-h-10 items-center gap-1.5 rounded-md border border-hair bg-bg/70 px-3 text-xs backdrop-blur-sm transition-colors hover:border-tech hover:bg-tech/10"
            onClick={() => setExploded((v) => !v)}
          >
            <Layers3 size={14} aria-hidden />
            {exploded ? 'Vista montada' : 'Vista explodida'}
          </button>
        </div>

        {/* Ficha técnica */}
        <article
          data-testid="layer-detail"
          data-layer={selected}
          aria-live="polite"
          className="flex flex-col rounded-lg border border-line bg-surface/40 lg:col-span-4"
        >
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="flex-1"
            >
              <header className="space-y-3 border-b border-hair p-5">
                <p className="label-mono !text-[10px]">
                  Componente <span className="num text-accent">{String(idx + 1).padStart(2, '0')}</span>
                </p>
                <h3 className="text-xl leading-tight font-semibold tracking-[-0.015em] text-balance">{layer.title}</h3>
                <StatusBadge status={layer.status} />
              </header>
              <dl className="divide-y divide-hair">
                {DETAIL_ROWS.map(([key, label]) => (
                  <div key={key} className="grid gap-1 px-5 py-3.5">
                    <dt className="label-mono !text-[10px]">{label}</dt>
                    <dd className="text-[13.5px] leading-relaxed text-fg/90 text-pretty">{layer[key]}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          <details className="group border-t border-hair text-sm">
            <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 px-5 text-[13px] text-muted transition-colors hover:text-fg">
              Limitações gerais do conceito
              <Plus size={14} aria-hidden className="transition-transform duration-200 group-open:rotate-45" />
            </summary>
            <ul className="list-disc space-y-1 px-5 pb-4 pl-9 text-xs leading-relaxed text-muted">
              {LIMITATIONS.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </details>
        </article>
      </div>
    </Section>
  )
}
