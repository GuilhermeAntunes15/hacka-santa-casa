import type { ReactNode } from 'react'
import { motion } from 'motion/react'

interface SectionProps {
  id: string
  eyebrow?: string
  title: string
  intro?: ReactNode
  children: ReactNode
  className?: string
  /** grid técnico de fundo nas seções-chave */
  grid?: boolean
}

const EASE = [0.16, 1, 0.3, 1] as const

export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

export default function Section({ id, eyebrow, title, intro, children, className = '', grid = false }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`relative border-t border-hair px-4 py-16 sm:px-6 lg:px-10 lg:py-24 ${className}`}
    >
      {grid && (
        <div
          aria-hidden
          className="tech-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
        />
      )}
      <div className="relative mx-auto max-w-7xl">
        <Reveal className="mb-10 grid gap-4 lg:mb-12 lg:grid-cols-12 lg:items-end">
          <header className="lg:col-span-8">
            {eyebrow && (
              <p className="label-mono mb-4 flex items-center gap-3 text-accent">
                <span aria-hidden className="h-px w-6 bg-accent/70" />
                {eyebrow}
              </p>
            )}
            <h2
              id={`${id}-title`}
              className="text-3xl leading-[1.08] font-semibold tracking-[-0.025em] text-balance sm:text-4xl lg:text-[2.75rem]"
            >
              {title}
            </h2>
          </header>
          {intro && <div className="max-w-xl text-base text-pretty text-muted lg:col-span-4 lg:pb-1">{intro}</div>}
        </Reveal>
        <Reveal delay={0.06}>{children}</Reveal>
      </div>
    </section>
  )
}
