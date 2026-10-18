import { Component, Suspense, lazy, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import MattressFallback from './MattressFallback'
import { useSimulationStore } from '../../store/simulationStore'
import type { LayerId } from '../../lib/simulationEngine'

const Mattress3D = lazy(() => import('./Mattress3D'))

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

const WEBGL = hasWebGL()
const COARSE = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
const ZOOM_MIN = 1
const ZOOM_MAX = 1.8
const ZOOM_STEP = 0.2

const LABELS: Record<Viewport3DProps['variant'], string> = {
  hero: 'Modelo 3D do sobrecolchão NUVA instalado sobre o colchão existente do leito: manta-base de fixação, câmaras de inclinação, células de ar, tubulações, sensores, capa e controlador pendurado na pezeira.',
  simulator: 'Modelo 3D do simulador: sobrecolchão sobre o colchão existente, com as células de ar mudando de volume conforme o modo selecionado e cargas artificiais sobre a superfície. Clique na superfície do sobrecolchão para aplicar uma carga pontual ilustrativa; o mapa de carga oferece alternativa por teclado.',
  explorer: 'Modelo 3D do explorador de engenharia, com as sete camadas do sobrecolchão selecionáveis; o colchão existente do leito aparece apenas como contexto.',
}

class GLBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export interface Viewport3DProps {
  variant: 'hero' | 'simulator' | 'explorer'
  selectedLayer?: LayerId | null
  onSelectLayer?: (id: LayerId) => void
  exploded?: boolean
  className?: string
}

const btn =
  'grid size-10 place-items-center rounded-md border border-hair bg-bg/70 text-muted backdrop-blur-sm transition-colors hover:border-tech hover:text-fg disabled:opacity-40 disabled:hover:border-line disabled:hover:text-fg'

export default function Viewport3D({ variant, selectedLayer = null, onSelectLayer, exploded = false, className = '' }: Viewport3DProps) {
  const ref = useRef<HTMLDivElement>(null)
  const near = useInView(ref, { margin: '300px', once: true })
  const visible = useInView(ref)
  const reduced = useReducedMotion() ?? false
  const [zoom, setZoom] = useState(1)
  const [resetKey, setResetKey] = useState(0)
  const fault = useSimulationStore((s) => (variant === 'simulator' ? (s.sim.fault?.type ?? 'none') : undefined))

  const fallback = <MattressFallback variant={variant} />
  const loading = (
    <div data-testid="viewport-loading" className="grid h-full place-items-center font-mono text-xs uppercase tracking-widest text-muted"><span className="animate-led motion-reduce:animate-none">
      Carregando modelo 3D…</span>
    </div>
  )

  return (
    <div
      data-testid="viewport-3d"
      data-variant={variant}
      data-webgl={String(WEBGL)}
      data-fault={fault}
      data-reduced-motion={String(reduced)}
      className={`relative ${className}`}
    >
      {WEBGL ? (
        <div ref={ref} role="img" aria-label={LABELS[variant]} className="absolute inset-0">
          {near ? (
            <GLBoundary fallback={fallback}>
              <Suspense fallback={loading}>
                <Mattress3D
                  variant={variant}
                  active={visible}
                  zoom={zoom}
                  resetKey={resetKey}
                  orbit={!COARSE}
                  reducedMotion={reduced}
                  selectedLayer={selectedLayer}
                  onSelectLayer={onSelectLayer}
                  exploded={exploded}
                />
              </Suspense>
            </GLBoundary>
          ) : (
            loading
          )}
        </div>
      ) : (
        <div ref={ref} className="absolute inset-0">
          {fallback}
        </div>
      )}
      {WEBGL && (
        <div className="absolute right-3 bottom-3 z-[2] flex gap-1">
          <button
            type="button"
            className={btn}
            aria-label="Aproximar"
            data-testid={`zoom-in-${variant}`}
            disabled={zoom >= ZOOM_MAX}
            onClick={() => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))}
          >
            <Plus size={16} aria-hidden />
          </button>
          <button
            type="button"
            className={btn}
            aria-label="Afastar"
            data-testid={`zoom-out-${variant}`}
            disabled={zoom <= ZOOM_MIN}
            onClick={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))}
          >
            <Minus size={16} aria-hidden />
          </button>
          <button
            type="button"
            className={btn}
            aria-label="Resetar vista"
            data-testid={`zoom-reset-${variant}`}
            onClick={() => {
              setZoom(1)
              setResetKey((k) => k + 1)
            }}
          >
            <RotateCcw size={16} aria-hidden />
          </button>
        </div>
      )}
    </div>
  )
}
