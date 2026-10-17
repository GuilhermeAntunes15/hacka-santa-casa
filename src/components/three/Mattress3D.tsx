import { useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, OrbitControls, Shadow } from '@react-three/drei'
import * as THREE from 'three'
import MattressModel from './MattressLayers'
import type { Variant } from './MattressLayers'
import type { LayerId } from '../../lib/simulationEngine'

type Vec3 = [number, number, number]

const CAMERAS: Record<Variant, { position: Vec3; target: Vec3; fov: number; aspect: number }> = {
  hero: { position: [3.0, 1.75, 2.75], target: [0.12, 0.22, 0], fov: 30, aspect: 1.65 },
  simulator: { position: [1.95, 1.6, 2.45], target: [0.08, 0.24, 0], fov: 30, aspect: 1.9 },
  explorer: { position: [3.6, 2.8, 3.7], target: [0.25, 0.62, 0], fov: 32, aspect: 0.85 },
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

function FovFit({ fov, aspect }: { fov: number; aspect: number }) {
  const get = useThree((s) => s.get)
  const current = useThree((s) => s.size.width / Math.max(1, s.size.height))

  useEffect(() => {
    const cam = get().camera as THREE.PerspectiveCamera
    const half = Math.tan(THREE.MathUtils.degToRad(fov / 2)) * Math.max(1, aspect / current)
    cam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(half))
    cam.updateProjectionMatrix()
  }, [get, current, fov, aspect])
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
      <directionalLight position={[2.5, 5, 3.5]} intensity={1.6} color="#F4F7FF" />
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
      <FovFit fov={cam.fov} aspect={cam.aspect} />
      <ZoomRig zoom={p.zoom} resetKey={p.resetKey} position={cam.position} target={cam.target} />
    </Canvas>
  )
}
