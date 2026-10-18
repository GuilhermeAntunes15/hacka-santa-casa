import { ExternalLink } from 'lucide-react'
import Logo from './Logo'
import { COMPARISON, DISCLAIMERS } from '../lib/content'

export default function Footer() {
  return (
    <footer className="relative border-t border-hair px-4 pt-14 pb-10 text-sm sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-4">
          <p className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
            <Logo height={36} className="text-fg" />
          </p>
          <p className="label-mono">HackaSanta 2026 · MVP digital</p>
          <p className="max-w-sm text-xs leading-relaxed text-muted">
            Sem login, sem backend e sem coleta de dados pessoais. Modelos matemáticos simplificados e dados fictícios.
          </p>
        </div>
        <div className="lg:col-span-8">
          <h2 className="label-mono mb-3">Avisos</h2>
          <ul className="divide-y divide-hair border-y border-hair" data-testid="footer-disclaimers">
            {DISCLAIMERS.map((d, i) => (
              <li key={d} className="flex gap-4 py-2.5 text-xs leading-relaxed text-muted">
                <span aria-hidden className="num shrink-0 text-muted/60">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
          <a
            href={COMPARISON.referenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-xs text-muted underline decoration-line underline-offset-4 transition-colors hover:text-fg hover:decoration-tech"
          >
            Referência de categoria: Stiegelmeyer/Novacare — sistemas de pressão alternada
            <ExternalLink size={12} aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  )
}
