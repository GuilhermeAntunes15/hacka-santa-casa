import { useSimulationStore } from '../../store/simulationStore'
import { N_UPPER, REF, groupOf, isOutOfRange } from '../../lib/simulationEngine'

const REF_CHAMBERS = Array<number>(N_UPPER).fill(Math.round(REF * 100))

export default function MattressFallback({ variant }: { variant: 'hero' | 'simulator' | 'explorer' }) {
  const telemetry = useSimulationStore((s) => (variant === 'simulator' ? s.telemetry : null))
  const chambers = telemetry?.chambers ?? REF_CHAMBERS
  const tilt = telemetry?.tilt ?? 0
  const lowerL = telemetry?.lowerLeft ?? 12
  const lowerR = telemetry?.lowerRight ?? 12

  return (
    <div data-testid="mattress-fallback" className="flex h-full flex-col items-center justify-center gap-3 p-4">
      <svg viewBox="0 0 420 150" className="w-full max-w-xl" role="img" aria-label="Esquema 2D do colchão: vista lateral das câmaras e corte transversal da inclinação">
        <g transform="translate(10 20)">
          <rect x="0" y="90" width="290" height="10" rx="3" fill="#1B2B3F" />
          <rect x="4" y="74" width="282" height="16" rx="3" fill="#CBD6E2" />
          {chambers.map((v, i) => {
            const h = Math.max(4, (Math.min(v, 130) / 100) * 50)
            return (
              <rect
                key={i}
                x={6 + i * 17.4}
                y={74 - h}
                width="15"
                height={h}
                rx="4"
                fill={isOutOfRange(v) ? '#EF4444' : groupOf(i) === 'A' ? '#23D5E7' : '#3B82F6'}
                opacity={0.9}
              />
            )
          })}
          <text x="0" y="118" fill="#94A3B8" fontSize="10" fontFamily="monospace">CABECEIRA</text>
          <text x="290" y="118" fill="#94A3B8" fontSize="10" fontFamily="monospace" textAnchor="end">PÉS</text>
        </g>
        <g transform="translate(330 20)">
          <rect x="0" y="90" width="80" height="10" rx="3" fill="#1B2B3F" />
          <rect x="4" y={90 - (8 + (lowerL / 100) * 40)} width="34" height={8 + (lowerL / 100) * 40} rx="5" fill="#6F93B8" />
          <rect x="42" y={90 - (8 + (lowerR / 100) * 40)} width="34" height={8 + (lowerR / 100) * 40} rx="5" fill="#6F93B8" />
          <g transform={`rotate(${tilt} 40 70)`}>
            <rect x="2" y="56" width="76" height="14" rx="3" fill="#CBD6E2" />
          </g>
          <text x="40" y="118" fill="#94A3B8" fontSize="10" fontFamily="monospace" textAnchor="middle">E · D</text>
        </g>
      </svg>
      <p className="text-center font-mono text-xs text-muted">WebGL indisponível — exibindo esquema 2D equivalente</p>
    </div>
  )
}
