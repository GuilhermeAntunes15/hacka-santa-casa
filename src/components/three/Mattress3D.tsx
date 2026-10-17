import { useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, OrbitControls, Shadow } from '@react-three/drei'
import * as THREE from 'three'
import MattressModel from './MattressLayers'
import type { Variant } from './MattressLayers'
import type { LayerId } from '../../lib/simulationEngine'

type Vec3 = [number, number, number]

const CAMERAS: Record<Variant, { position: Vec3; target: Vec3; fov: number }> = {
  hero: { position: [3.05, 1.85, 2.7], target: [0.25, 0.12, 0], fov: 30 },
  simulator: { position: [2.55, 1.3, 1.7], target: [0.3, 0.1, 0], fov: 30 },
  explorer: { position: [3.9, 3.2, 4.0], target: [0.3, 0.62, 0], fov: 32 },
}

export interface Mattress3DProps {
  variant: Variant
  active: boolean
  zoom: number
  resetKey: number
  orbit: boolean
  reducedMotion: boolean
  selectedLayer: LayerId | null
  onSelectLayer?: (id: LayerId) => void
  exploded: boolean
}

interface ControlsLike {
  target: THREE.Vector3
  update(): void
}

function ZoomRig({ zoom, resetKey, position, target }: { zoom: number; resetKey: number; position: Vec3; target: Vec3 }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as unknown as ControlsLike | null

  useEffect(() => {
    if (!controls) camera.lookAt(...target)
  }, [camera, controls, target])

  useEffect(() => {
    if (resetKey === 0) return
    camera.position.set(...position)
    if (controls) {
      controls.target.set(...target)
      controls.update()
    } else camera.lookAt(...target)
  }, [resetKey, camera, controls, position, target])

  useFrame((state, delta) => {
    const cam = state.camera
    if (Math.abs(cam.zoom - zoom) < 1e-4) return
    cam.zoom = THREE.MathUtils.damp(cam.zoom, zoom, 6, delta)
    cam.updateProjectionMatrix()
  })
  return null
}

export default function Mattress3D(p: Mattress3DProps) {
  const cam = CAMERAS[p.variant]
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={p.active ? 'always' : 'never'}
      camera={{ fov: cam.fov, position: cam.position }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[2.5, 5, 3.5]} intensity={1.6} color="#FFF3E2" />
      <directionalLight position={[-3.5, 1.8, 1]} intensity={0.55} color="#BFD6FF" />
      <directionalLight position={[-1, 2.5, -4]} intensity={0.7} color="#E6F0FF" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={1.6} position={[0, 4, 0]} rotation-x={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={0.7} color="#CFE3FF" position={[-4, 1.5, 2]} rotation-y={Math.PI / 2} scale={[4, 2, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#FFF1DE" position={[4, 1.5, 2]} rotation-y={-Math.PI / 2} scale={[4, 2, 1]} />
      </Environment>
      <MattressModel
        variant={p.variant}
        reducedMotion={p.reducedMotion}
        selectedLayer={p.selectedLayer}
        onSelectLayer={p.onSelectLayer}
        exploded={p.exploded}
      />
      <Shadow position={[0, 0.001, 0]} rotation-x={-Math.PI / 2} scale={[3.4, 1.9, 1]} opacity={0.5} color="#000000" />
      {p.orbit && (
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={false}
          enableDamping
          minPolarAngle={0.5}
          maxPolarAngle={1.35}
          minAzimuthAngle={-1}
          maxAzimuthAngle={1}
          target={cam.target}
        />
      )}
      <ZoomRig zoom={p.zoom} resetKey={p.resetKey} position={cam.position} target={cam.target} />
    </Canvas>
  )
}
