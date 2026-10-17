import type { ReactNode } from 'react'
import { Info } from 'lucide-react'

export default function Disclaimer({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`flex gap-2 text-xs leading-relaxed text-muted ${className}`}>
      <Info size={13} aria-hidden className="mt-[3px] shrink-0 text-muted/80" />
      <span className="text-pretty">{children}</span>
    </p>
  )
}
