import { ArrowRight, ArrowDown } from 'lucide-react'
import { motion } from 'motion/react'
import Viewport3D from './three/Viewport3D'
import { HERO } from '../lib/content'

const EASE = [0.16, 1, 0.3, 1] as const
const rise = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: EASE, delay: 0.04 + i * 0.05 },
})

// Rótulos da referência visual do conceito (docs/referencia-conceito.png).
// ponytail: posições fixas nos cantos do palco, não ancoradas à geometria (que será refeita pelo coder).
const CALLOUTS = [
  { k: 'A', title: 'Camada superior', text: 'Pressão alternada · células transversais A/B', pos: 'lg:top-4 lg:left-4' },
  { k: 'B', title: 'Camada inferior', text: 'Reposicionamento lateral · câmaras longitudinais', pos: 'lg:right-4 lg:bottom-16' },
  { k: 'C', title: 'Estrutura híbrida', text: 'Espuma de alta densidade em “U” + ar', pos: 'lg:bottom-16 lg:left-4' },
  { k: 'D', title: 'Controle pneumático', text: 'Bomba 12 V, válvulas e microcontrolador', pos: 'lg:top-4 lg:right-4' },
]

export default function Hero() {
  return (
    <section
      id="inicio"
      aria-labelledby="inicio-title"
      className="relative overflow-hidden px-4 sm:px-6 lg:px-10"
    >
      <div aria-hidden className="tech-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_80%_70%_at_60%_40%,black,transparent)]" />
      <div className="relative mx-auto flex max-w-7xl flex-col lg:min-h-[calc(100svh-3.5rem)]">
        <div className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-12 lg:gap-6 lg:py-6">
          <div className="lg:col-span-5">
            <motion.p {...rise(0)} className="label-mono flex flex-wrap items-center gap-x-2 gap-y-1 text-accent">
              <span aria-hidden className="size-1.5 animate-led rounded-[1px] bg-accent motion-reduce:animate-none" />
              HackaSanta 2026
              <span aria-hidden className="text-muted">·</span>
              <span className="text-muted">Simulação digital de engenharia</span>
            </motion.p>
            <motion.h1
              {...rise(1)}
              id="inicio-title"
              className="mt-5 text-[3.25rem] leading-[0.95] font-semibold tracking-[-0.04em] sm:text-7xl lg:text-[4.25rem]"
            >
              {HERO.title}
            </motion.h1>
            <motion.p {...rise(2)} className="mt-6 text-2xl leading-tight font-medium tracking-[-0.015em] text-balance sm:text-[1.75rem]">
              {HERO.headline}
            </motion.p>
            <motion.p {...rise(3)} className="mt-4 max-w-[46ch] text-base leading-relaxed text-pretty text-muted">
              {HERO.subtitle}
            </motion.p>
            <motion.div {...rise(4)} className="mt-8 flex flex-wrap gap-3">
              <a
                href="#simulador"
                className="group inline-flex h-11 items-center gap-2 rounded-md bg-fg px-5 text-sm font-semibold text-bg transition-colors hover:bg-white"
              >
                {HERO.ctaSimulator}
                <ArrowDown size={16} aria-hidden className="transition-transform duration-200 group-hover:translate-y-0.5" />
              </a>
              <a
                href="#engenharia"
                className="group inline-flex h-11 items-center gap-2 rounded-md border border-line px-5 text-sm font-medium text-fg transition-colors hover:border-tech hover:bg-tech/10"
              >
                {HERO.ctaExplore}
                <ArrowRight size={16} aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            className="relative lg:col-span-7 2xl:-mr-16"
          >
            {/* halo discreto, só aqui */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-[8%] rounded-full bg-[radial-gradient(closest-side,rgb(59_130_246/0.22),rgb(35_213_231/0.06)_55%,transparent)] blur-2xl"
            />
            <div className="frame-corners relative">
              <div aria-hidden className="ruler-x absolute inset-x-6 top-0 h-2 opacity-60" />
              <div aria-hidden className="ruler-y absolute inset-y-6 left-0 hidden w-2 opacity-60 lg:block" />
              <Viewport3D variant="hero" className="h-[clamp(300px,58vh,640px)]" />
              <ul className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-hair bg-hair lg:contents" aria-label="Componentes principais">
                {CALLOUTS.map((c, i) => (
                  <motion.li
                    key={c.k}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE, delay: 0.7 + i * 0.15 }}
                    className={`pointer-events-none bg-bg p-3 lg:absolute lg:max-w-[15rem] lg:rounded-[4px] lg:border lg:border-hair lg:bg-bg/70 lg:px-3 lg:py-2 lg:backdrop-blur-sm ${c.pos}`}
                  >
                    <p className="label-mono flex items-center gap-2 !text-[10px] text-fg">
                      <span className="num text-accent">{c.k}</span>
                      {c.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-muted">{c.text}</p>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        <motion.dl
          {...rise(5)}
          data-testid="hero-problem"
          className="mb-6 grid border-y border-hair text-sm sm:grid-cols-3 sm:divide-x sm:divide-hair lg:mb-8"
        >
          <div className="py-4 sm:pr-6">
            <dt className="label-mono">Problema</dt>
            <dd className="mt-1.5 leading-relaxed text-fg/90">{HERO.problem}</dd>
          </div>
          <div className="border-t border-hair py-4 sm:border-t-0 sm:px-6">
            <dt className="label-mono">Proposta</dt>
            <dd className="mt-1.5 leading-relaxed text-fg/90">{HERO.proposal}</dd>
          </div>
          <div className="border-t border-hair py-4 sm:border-t-0 sm:pl-6">
            <dt className="label-mono flex items-center gap-2">
              <span aria-hidden className="size-1.5 rounded-[1px] bg-warn" />
              Status
            </dt>
            <dd className="mt-1.5 leading-relaxed text-fg">{HERO.status}</dd>
          </div>
        </motion.dl>
      </div>
    </section>
  )
}
