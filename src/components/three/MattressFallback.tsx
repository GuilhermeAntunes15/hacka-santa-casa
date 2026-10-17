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
      <svg viewBox="0 0 420 150" className="w-full max-w-xl" role="img" aria-label="Esquema 2D do sobrecolchão instalado sobre o colchão existente: vista lateral das células e corte transversal da inclinação">
        <g transform="translate(10 20)">
          <rect x="-6" y="38" width="4" height="66" rx="1" fill="#454B55" />
          <rect x="292" y="58" width="4" height="46" rx="1" fill="#454B55" />
          <rect x="0" y="98" width="290" height="6" rx="2" fill="#454B55" />
          <rect x="0" y="80" width="290" height="18" rx="5" fill="#8E8A83" />
          <rect x="2" y="76" width="286" height="4" rx="1" fill="#16213B" />
          <rect x="4" y="70" width="282" height="6" rx="2" fill="#1D4ED8" />
          {chambers.map((v, i) => {
            const h = Math.max(4, (Math.min(v, 130) / 100) * 34)
            return (
              <rect
                key={i}
                x={6 + i * 17.4}
                y={70 - h}
                width="15"
                height={h}
                rx="4"
                fill={isOutOfRange(v) ? '#EF4444' : groupOf(i) === 'A' ? '#23D5E7' : '#3B82F6'}
                opacity={0.9}
              />
            )
          })}
          <text x="145" y="93" fill="#3A3F47" fontSize="8" fontFamily="monospace" textAnchor="middle">COLCHÃO EXISTENTE</text>
          <text x="0" y="118" fill="#94A3B8" fontSize="10" fontFamily="monospace">CABECEIRA</text>
          <text x="290" y="118" fill="#94A3B8" fontSize="10" fontFamily="monospace" textAnchor="end">PÉS</text>
        </g>
        <g transform="translate(330 20)">
          <rect x="0" y="80" width="80" height="20" rx="4" fill="#8E8A83" />
          <rect x="2" y="77" width="76" height="3" rx="1" fill="#16213B" />
          <rect x="4" y={77 - (4 + (lowerL / 100) * 30)} width="34" height={4 + (lowerL / 100) * 30} rx="4" fill="#1D4ED8" />
          <rect x="42" y={77 - (4 + (lowerR / 100) * 30)} width="34" height={4 + (lowerR / 100) * 30} rx="4" fill="#1D4ED8" />
          <g transform={`rotate(${tilt} ${tilt >= 0 ? 59 : 21} 69)`}>
            <rect x="2" y="59" width="76" height="10" rx="3" fill="#86A6CC" />
          </g>
          <text x="40" y="118" fill="#94A3B8" fontSize="10" fontFamily="monospace" textAnchor="middle">E · D</text>
        </g>
      </svg>
      <p className="text-center font-mono text-xs text-muted">WebGL indisponível — exibindo esquema 2D equivalente</p>
    </div>
  )
}
