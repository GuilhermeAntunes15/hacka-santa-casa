import { useEffect, useState } from 'react'
import { Play } from 'lucide-react'
import { NAV_LINKS } from '../lib/content'
import { usePresentationStore } from '../store/presentationStore'

export default function Header() {
  const active = usePresentationStore((s) => s.active)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,border-color] duration-300 ${
        scrolled ? 'border-hair bg-bg/80 backdrop-blur-md' : 'border-transparent bg-bg/0'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <a href="#inicio" className="flex shrink-0 items-center gap-2.5 text-[15px] font-semibold tracking-tight">
          <img src="/favicon.svg" alt="" width={22} height={22} />
          <span>
            PressuSense <span className="text-accent">Air</span>
          </span>
        </a>
        <nav aria-label="Seções" className="hidden lg:block">
          <ul className="flex gap-1 text-[13px] text-muted">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="rounded-[4px] px-2.5 py-1.5 transition-colors hover:bg-white/[0.04] hover:text-fg">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button"
          data-testid="demo-start"
          disabled={active}
          className="group inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-tech/60 bg-tech/15 pr-3.5 pl-2 text-[13px] font-medium text-fg transition-colors hover:border-tech hover:bg-tech/25 disabled:cursor-default disabled:opacity-50"
          onClick={() => usePresentationStore.getState().start()}
        >
          <span aria-hidden className="grid size-6 place-items-center rounded-[4px] bg-tech text-bg">
            <Play size={12} fill="currentColor" />
          </span>
          Demo de 3 minutos
        </button>
      </div>
      {/* Navegação compacta abaixo de lg: trilho rolável, sem menu escondido */}
      <nav aria-label="Seções (compacto)" className="border-t border-hair lg:hidden">
        <ul className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 py-1 [scrollbar-width:none] sm:px-5">
          {NAV_LINKS.map((l) => (
            <li key={l.href} className="shrink-0">
              <a href={l.href} className="label-mono inline-flex h-10 items-center rounded-[4px] px-2.5 transition-colors hover:text-fg">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
