import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { Edges, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { useSimulationStore } from '../../store/simulationStore'
import { COLS, LEAK_CHAMBER, N_UPPER, POINT_MAX, REF, ROWS, currentActiveGroup, groupOf, pointBump } from '../../lib/simulationEngine'
import type { FaultType, Group, LayerId } from '../../lib/simulationEngine'

export type Variant = 'hero' | 'simulator' | 'explorer'

const LOOK = {
  bedFrame: '#454B55',
  bedMattress: '#8E8A83',
  sheet: '#16213B',
  strap: '#2B3C63',
  tilt: '#1D4ED8',
  chamber: '#86A6CC',
  chamberOpacity: 0.85,
  groupA: '#7CC4FF',
  groupB: '#3B82F6',
  tube: '#9FB3C8',
  hose: '#3A4250',
  sensor: '#FACC15',
  controller: '#E8ECF2',
  screen: '#0F1B2D',
  ledOk: '#21C58E',
  ledFault: '#EF4444',
  cover: '#1B2A4A',
  load: '#9CCFD8',
  loadEdge: '#D8F6FB',
  loadOpacity: 0.4,
  accent: '#23D5E7',
  pointMarker: '#23D5E7',
  pointSquash: 0.35,
  danger: '#EF4444',
  dimOpacity: 0.3,
  bedDimOpacity: 0.18,
  activePulse: 0.35,
  faultPulse: 0.9,
  selectedEmissive: 0.45,
}

const FRAME_H = 0.05
const MAT_H = 0.16
const MAT_TOP = FRAME_H + MAT_H
const MAT_D = 0.92
const BOARD_X = 1.08
const BOARD_T = 0.04
const HEAD_H = 0.6
const FOOT_H = 0.36
const SHEET_T = 0.015
const BASE_TOP = MAT_TOP + SHEET_T
const H0 = 0.04
const TILT_LIFT = 0.45
const TILT_Z = 0.225
const TILT_RZ = 0.2
const TILT_LEN = 1.9
const DECK = BASE_TOP + H0
const CELL_Y = 0.005
const CELL_R = 0.045
const CELL_W = 0.062
const CELL_SPAN = 0.72
const PITCH = 0.12
const LINE_Y = 0.03
const LINE_A_Z = -0.41
const LINE_B_Z = -0.435
const COVER_TOP = 0.088
const SKIRT_BOTTOM = -H0 - SHEET_T
const CTRL_D = 0.08
const CTRL_H = 0.17
const CTRL_POS = new THREE.Vector3(BOARD_X + BOARD_T / 2 + CTRL_D / 2, FOOT_H - CTRL_H / 2, 0)
const HOSE_Z = [0.03, -0.03] as const

const chamberX = (i: number) => (i - (N_UPPER - 1) / 2) * PITCH
const CELL_MIN = 0.25
const cellRy = (u: number) => CELL_R * Math.max(u, CELL_MIN)
const cellSx = (u: number) => (CELL_W / CELL_R) * Math.min(1, 0.55 + 0.45 * Math.max(u, CELL_MIN))

type LayerKey = LayerId | 'base'

const INTRO_ORDER: LayerKey[] = ['base', 'foam', 'tiltChambers', 'pneumatic', 'topChambers', 'sensors', 'controller', 'cover']

const EXPLODE: Partial<Record<LayerKey, [number, number, number]>> = {
  foam: [0, 0.16, 0],
  tiltChambers: [0, 0.38, 0],
  topChambers: [0, 0.66, 0],
  sensors: [0, 0.8, 0],
  cover: [0, 1.02, 0],
  pneumatic: [0, 0, -0.35],
  controller: [0.3, 0, 0],
}

const LOADS = [
  { x: -0.82, size: [0.2, 0.1, 0.26] as const },
  { x: -0.42, size: [0.3, 0.12, 0.5] as const },
  { x: 0, size: [0.36, 0.14, 0.44] as const },
  { x: 0.82, size: [0.22, 0.08, 0.34] as const },
]

const easeOutCubic = (x: number) => 1 - (1 - Math.min(1, Math.max(0, x))) ** 3

const REF_UPPER: number[] = Array<number>(N_UPPER).fill(REF)

const FAULT_LAYER: Record<FaultType, LayerId> = {
  leak: 'topChambers',
  overpressure: 'pneumatic',
  pump: 'controller',
  sensor: 'sensors',
}

interface MattressModelProps {
  variant: Variant
  reducedMotion: boolean
  selectedLayer: LayerId | null
  onSelectLayer?: (id: LayerId) => void
  exploded: boolean
}

function makeMaterials(variant: Variant) {
  const transparent = variant === 'explorer'
  const std = (color: string, opts: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.05, transparent, ...opts })
  const chambers = Array.from(
    { length: N_UPPER },
    () =>
      new THREE.MeshPhysicalMaterial({
        color: LOOK.chamber,
        roughness: 0.35,
        clearcoat: 0.6,
        clearcoatRoughness: 0.25,
        transparent: true,
        opacity: LOOK.chamberOpacity,
        depthWrite: true,
      }),
  )
  chambers.forEach((m) => (m.userData.baseOpacity = LOOK.chamberOpacity))
  const mat = new THREE.MeshBasicMaterial({ color: LOOK.sensor, wireframe: true, transparent: true, opacity: 0.35, depthWrite: false })
  mat.userData.baseOpacity = 0.35
  return {
    bedFrame: std(LOOK.bedFrame, { roughness: 0.9, metalness: 0, envMapIntensity: 0.3 }),
    bedMattress: std(LOOK.bedMattress, { roughness: 1, metalness: 0, envMapIntensity: 0.25 }),
    tilt: std(LOOK.tilt, { roughness: 0.35 }),
    sheet: std(LOOK.sheet, { roughness: 0.6 }),
    strap: std(LOOK.strap, { roughness: 0.7 }),
    chambers,
    tube: std(LOOK.tube, { roughness: 0.3, metalness: 0.25 }),
    hose: std(LOOK.hose, { roughness: 0.5, metalness: 0.3 }),
    sensor: std(LOOK.sensor, { roughness: 0.4 }),
    mat,
    controller: std(LOOK.controller, { roughness: 0.45, metalness: 0.05 }),
    screen: new THREE.MeshBasicMaterial({ color: LOOK.screen, transparent }),
    led: new THREE.MeshBasicMaterial({ color: LOOK.ledOk, transparent }),
    cover: std(LOOK.cover, { roughness: 0.7, side: THREE.DoubleSide }),
    load: std(LOOK.load, { transparent: true, opacity: LOOK.loadOpacity, depthWrite: false, roughness: 0.5 }),
  }
}

type Materials = ReturnType<typeof makeMaterials>

const layerMaterials = (m: Materials): Record<LayerKey, THREE.Material[]> => ({
  base: [m.bedFrame, m.bedMattress],
  tiltChambers: [m.tilt],
  foam: [m.sheet, m.strap],
  topChambers: m.chambers,
  pneumatic: [m.tube],
  sensors: [m.sensor, m.mat],
  controller: [m.controller, m.screen, m.led, m.hose],
  cover: [m.cover],
})

const C = {
  chamber: new THREE.Color(LOOK.chamber),
  a: new THREE.Color(LOOK.groupA),
  b: new THREE.Color(LOOK.groupB),
  accent: new THREE.Color(LOOK.accent),
  danger: new THREE.Color(LOOK.danger),
  black: new THREE.Color('#000000'),
  ledOk: new THREE.Color(LOOK.ledOk),
  ledFault: new THREE.Color(LOOK.ledFault),
}

function setEmissive(m: THREE.Material, color: THREE.Color, intensity: number) {
  if (m instanceof THREE.MeshStandardMaterial) {
    m.emissive.copy(intensity > 0 ? color : C.black)
    m.emissiveIntensity = intensity
  }
}

const LINE_END_X = 0.985

function hoseCurve(z: number) {
  const y = DECK + LINE_Y
  const port = CTRL_POS.x + CTRL_D / 4
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(LINE_END_X, y, z),
    new THREE.Vector3(1.03, y + 0.06, z),
    new THREE.Vector3(BOARD_X, FOOT_H + 0.05, z),
    new THREE.Vector3(port, FOOT_H + 0.035, z),
    new THREE.Vector3(port, FOOT_H, z),
  ])
}

function lineCurve(z: number, turnX: number, endZ: number) {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.96, LINE_Y, z),
    new THREE.Vector3(turnX, LINE_Y, z),
    new THREE.Vector3(LINE_END_X - 0.01, LINE_Y, (z + endZ) / 2),
    new THREE.Vector3(LINE_END_X, LINE_Y, endZ),
  ])
}

function mergedBoxes(boxes: [w: number, h: number, d: number, x: number, y: number, z: number][]) {
  const parts = boxes.map(([w, h, d, x, y, z]) => new THREE.BoxGeometry(w, h, d).translate(x, y, z))
  const merged = mergeGeometries(parts)
  parts.forEach((g) => g.dispose())
  return merged
}

export default function MattressModel({ variant, reducedMotion, selectedLayer, onSelectLayer, exploded }: MattressModelProps) {
  const mats = useMemo(() => makeMaterials(variant), [variant])
  const byLayer = useMemo(() => layerMaterials(mats), [mats])

  const geo = useMemo(() => {
    const cell = new THREE.CapsuleGeometry(CELL_R, CELL_SPAN - 2 * CELL_R, 6, 20).rotateX(Math.PI / 2)
    const tilt = new THREE.CylinderGeometry(1, 1, TILT_LEN, 40).rotateZ(Math.PI / 2)
    const branchParts = Array.from({ length: N_UPPER }, (_, i) => {
      const z = groupOf(i) === 'A' ? LINE_A_Z : LINE_B_Z
      const len = Math.abs(z) - CELL_SPAN / 2
      return new THREE.CylinderGeometry(0.007, 0.007, len, 6).rotateX(Math.PI / 2).translate(chamberX(i), LINE_Y, z + len / 2)
    })
    const branches = mergeGeometries(branchParts)
    branchParts.forEach((g) => g.dispose())
    const hoseParts = HOSE_Z.map((z) => new THREE.TubeGeometry(hoseCurve(z), 48, 0.012, 8, false))
    const hoses = mergeGeometries(hoseParts)
    hoseParts.forEach((g) => g.dispose())
    const hookParts = [-0.09, 0.09].map((z) => new THREE.TorusGeometry(0.03, 0.006, 6, 16, Math.PI).translate(BOARD_X, FOOT_H, z))
    const hooks = mergeGeometries(hookParts)
    hookParts.forEach((g) => g.dispose())
    const strapZ = MAT_D / 2 + 0.004
    return {
      cell,
      tilt,
      lineA: new THREE.TubeGeometry(lineCurve(LINE_A_Z, 0.84, HOSE_Z[0]), 64, 0.012, 8, false),
      lineB: new THREE.TubeGeometry(lineCurve(LINE_B_Z, 0.88, HOSE_Z[1]), 64, 0.012, 8, false),
      branches,
      hoses,
      hooks,
      puck: new THREE.CylinderGeometry(0.028, 0.028, 0.03, 16),
      bed: mergedBoxes([
        [2 * BOARD_X + BOARD_T, FRAME_H, 0.98, 0, FRAME_H / 2, 0],
        [BOARD_T, HEAD_H, 0.98, -BOARD_X, HEAD_H / 2, 0],
        [BOARD_T, FOOT_H, 0.98, BOARD_X, FOOT_H / 2, 0],
      ]),
      straps: mergedBoxes(
        [-0.6, 0.6].flatMap((x) =>
          [-strapZ, strapZ].map((z): [number, number, number, number, number, number] => [0.05, 0.13, 0.008, x, MAT_TOP + SHEET_T - 0.065, z]),
        ),
      ),
    }
  }, [])

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose())
      Object.values(byLayer)
        .flat()
        .forEach((m) => m.dispose())
      mats.load.dispose()
    },
    [geo, byLayer, mats],
  )

  useEffect(() => () => void (document.body.style.cursor = ''), [])

  const root = useRef<THREE.Group>(null)
  const pivot = useRef<THREE.Group>(null)
  const platform = useRef<THREE.Group>(null)
  const tiltL = useRef<THREE.Mesh>(null)
  const tiltR = useRef<THREE.Mesh>(null)
  const chambers = useRef<(THREE.Mesh | null)[]>([])
  const loads = useRef<(THREE.Mesh | null)[]>([])
  const marker = useRef<THREE.Group>(null)
  const markerCone = useRef<THREE.Mesh>(null)
  const uVis = useRef<number[]>(REF_UPPER.slice())
  const groups = useRef<Partial<Record<LayerKey, THREE.Group>>>({})
  const t0 = useRef(-1)
  const explode = useRef(exploded ? 1 : 0)

  const setGroup = (k: LayerKey) => (g: THREE.Group | null) => {
    if (g) groups.current[k] = g
  }

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (t0.current < 0) t0.current = t
    const local = t - t0.current
    const intro = variant === 'hero' && !reducedMotion

    let upper = REF_UPPER
    let tilt = 0
    let fault: FaultType | null = null
    let active: Group | null = null
    let showGroups = false
    if (variant === 'simulator') {
      const st = useSimulationStore.getState()
      upper = st.sim.upper
      tilt = st.sim.tilt
      fault = st.sim.fault?.type ?? null
      active = currentActiveGroup(st.sim)
      showGroups = st.showGroups
      const point = st.sim.point
      if (point) {
        const k = LOOK.pointSquash * (point.intensity / POINT_MAX)
        for (let i = 0; i < N_UPPER; i++) uVis.current[i] = upper[i] * (1 - k * pointBump(i - point.r))
        upper = uVis.current
      }
      if (marker.current) {
        marker.current.visible = !!point
        if (point) {
          marker.current.position.set(chamberX(point.r), CELL_Y + 2 * cellRy(upper[point.r]), -CELL_SPAN / 2 + ((point.c + 0.5) * CELL_SPAN) / COLS)
          markerCone.current?.scale.setScalar(0.6 + (0.4 * point.intensity) / POINT_MAX)
        }
      }
    }

    explode.current = reducedMotion
      ? exploded
        ? 1
        : 0
      : THREE.MathUtils.damp(explode.current, exploded ? 1 : 0, 5, delta)

    INTRO_ORDER.forEach((k, idx) => {
      const g = groups.current[k]
      if (!g) return
      const off = EXPLODE[k]
      const drop = intro && k !== 'base' ? 0.8 * (1 - easeOutCubic((local - idx * 0.15) / 0.7)) : 0
      g.position.set((off?.[0] ?? 0) * explode.current, (off?.[1] ?? 0) * explode.current + drop, (off?.[2] ?? 0) * explode.current)
    })

    if (root.current) root.current.rotation.y = variant === 'hero' && !reducedMotion ? Math.sin(t * 0.2) * 0.15 : 0

    const rad = (tilt * Math.PI) / 180
    const pz = tilt >= 0 ? TILT_Z : -TILT_Z
    if (pivot.current && platform.current) {
      pivot.current.position.set(0, DECK, pz)
      pivot.current.rotation.x = rad
      platform.current.position.z = -pz
    }
    const hl = H0 + (tilt > 0 ? TILT_LIFT * Math.sin(rad) : 0)
    const hr = H0 + (tilt < 0 ? TILT_LIFT * Math.sin(-rad) : 0)
    if (tiltL.current) {
      tiltL.current.scale.y = hl / 2
      tiltL.current.position.y = BASE_TOP + hl / 2
    }
    if (tiltR.current) {
      tiltR.current.scale.y = hr / 2
      tiltR.current.position.y = BASE_TOP + hr / 2
    }

    const pulse = 0.5 + 0.5 * Math.sin(t * 4)
    const faultPulse = LOOK.faultPulse * (0.45 + 0.55 * Math.sin(t * 7) ** 2)
    const introWave = intro ? INTRO_ORDER.indexOf('topChambers') * 0.15 + 0.3 : 0

    for (let i = 0; i < N_UPPER; i++) {
      const mesh = chambers.current[i]
      if (!mesh) continue
      const u = intro ? REF * easeOutCubic((local - introWave - i * 0.04) / 0.5) : upper[i]
      const ry = cellRy(u)
      mesh.scale.set(cellSx(u), ry / CELL_R, 1)
      mesh.position.y = CELL_Y + ry
      const m = mats.chambers[i]
      const g = groupOf(i)
      const faulty = (fault === 'leak' && i === LEAK_CHAMBER) || (fault === 'overpressure' && g === 'A')
      m.color.copy(faulty ? C.danger : showGroups ? (g === 'A' ? C.a : C.b) : C.chamber)
      if (faulty) setEmissive(m, C.danger, faultPulse)
      else if (active === g) setEmissive(m, C.accent, LOOK.activePulse * pulse)
      else if (variant === 'explorer' && selectedLayer === 'topChambers') setEmissive(m, C.accent, LOOK.selectedEmissive)
      else setEmissive(m, C.black, 0)
    }

    LOADS.forEach((load, k) => {
      const mesh = loads.current[k]
      if (!mesh) return
      const half = load.size[0] / 2
      let top = 0
      for (let i = 0; i < N_UPPER; i++) {
        if (Math.abs(chamberX(i) - load.x) <= half + PITCH / 2) top = Math.max(top, cellRy(upper[i]))
      }
      mesh.position.y = CELL_Y + 2 * top + load.size[1] / 2
    })

    const faultLayer = fault ? FAULT_LAYER[fault] : null
    ;(Object.keys(byLayer) as LayerKey[]).forEach((k) => {
      if (k === 'topChambers') return
      const highlight = k === faultLayer ? faultPulse : variant === 'explorer' && k === selectedLayer ? LOOK.selectedEmissive : 0
      byLayer[k].forEach((m) => setEmissive(m, k === faultLayer ? C.danger : C.accent, highlight))
    })
    if (fault === 'sensor') mats.mat.color.copy(C.danger)

    mats.led.color.copy(fault ? (Math.sin(t * 8) > 0 ? C.ledFault : C.black) : C.ledOk)

    if (variant === 'explorer') {
      ;(Object.keys(byLayer) as LayerKey[]).forEach((k) => {
        const bed = k === 'base'
        const dim = bed ? selectedLayer !== null || exploded : selectedLayer !== null && k !== selectedLayer
        byLayer[k].forEach((m) => {
          const base = (m.userData.baseOpacity as number | undefined) ?? 1
          const target = dim ? base * (bed ? LOOK.bedDimOpacity : LOOK.dimOpacity) : base
          m.opacity = reducedMotion ? target : THREE.MathUtils.damp(m.opacity, target, 8, delta)
          m.depthWrite = m.opacity > 0.6
        })
      })
    }
  })

  const placePoint = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      if (e.delta > 5 || !e.uv) return
      e.stopPropagation()
      useSimulationStore.getState().setPointLoad(e.uv.x * ROWS, (1 - e.uv.y) * COLS)
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      document.body.style.cursor = 'crosshair'
    },
    onPointerOut: () => {
      document.body.style.cursor = ''
    },
  }

  const pick = (id: LayerId) =>
    onSelectLayer
      ? {
          onClick: (e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation()
            onSelectLayer(id)
          },
          onPointerOver: (e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
          },
          onPointerOut: () => {
            document.body.style.cursor = ''
          },
        }
      : {}

  const blockPick = onSelectLayer ? { onClick: (e: ThreeEvent<MouseEvent>) => e.stopPropagation() } : {}

  return (
    <group ref={root}>
      <group ref={setGroup('base')} {...blockPick}>
        <mesh geometry={geo.bed} material={mats.bedFrame} />
        <RoundedBox args={[2.0, MAT_H, MAT_D]} radius={0.04} smoothness={3} position={[0, FRAME_H + MAT_H / 2, 0]} material={mats.bedMattress} />
      </group>

      <group ref={setGroup('foam')} {...pick('foam')}>
        <RoundedBox args={[1.98, SHEET_T, 0.9]} radius={0.006} smoothness={2} position={[0, MAT_TOP + SHEET_T / 2, 0]} material={mats.sheet} />
        <mesh geometry={geo.straps} material={mats.strap} />
      </group>

      <group ref={setGroup('tiltChambers')} {...pick('tiltChambers')}>
        <mesh ref={tiltL} geometry={geo.tilt} material={mats.tilt} scale={[1, H0 / 2, TILT_RZ]} position={[0, BASE_TOP + H0 / 2, -TILT_Z]} />
        <mesh ref={tiltR} geometry={geo.tilt} material={mats.tilt} scale={[1, H0 / 2, TILT_RZ]} position={[0, BASE_TOP + H0 / 2, TILT_Z]} />
      </group>

      <group ref={setGroup('controller')} {...pick('controller')}>
        <group position={CTRL_POS} rotation={[0, Math.PI / 2, 0]}>
          <RoundedBox args={[0.28, CTRL_H, CTRL_D]} radius={0.025} smoothness={3} material={mats.controller} />
          <mesh position={[-0.025, 0.01, CTRL_D / 2 + 0.0005]} material={mats.screen}>
            <planeGeometry args={[0.16, 0.08]} />
          </mesh>
          <mesh position={[0.095, 0.01, CTRL_D / 2 - 0.002]} material={mats.led}>
            <sphereGeometry args={[0.012, 12, 12]} />
          </mesh>
        </group>
        <mesh geometry={geo.hooks} material={mats.controller} />
        <mesh geometry={geo.hoses} material={mats.hose} />
      </group>

      <group ref={pivot}>
        <group ref={platform}>
          <group ref={setGroup('topChambers')} {...pick('topChambers')}>
            {Array.from({ length: N_UPPER }, (_, i) => (
              <mesh
                key={i}
                ref={(m: THREE.Mesh | null) => {
                  chambers.current[i] = m
                }}
                geometry={geo.cell}
                material={mats.chambers[i]}
                scale={[cellSx(REF), REF, 1]}
                position={[chamberX(i), CELL_Y + cellRy(REF), 0]}
              />
            ))}
          </group>

          <group ref={setGroup('pneumatic')} {...pick('pneumatic')}>
            <mesh geometry={geo.lineA} material={mats.tube} />
            <mesh geometry={geo.lineB} material={mats.tube} />
            <mesh geometry={geo.branches} material={mats.tube} />
          </group>

          <group ref={setGroup('sensors')} {...pick('sensors')}>
            <mesh geometry={geo.puck} material={mats.sensor} position={[0.55, LINE_Y + 0.02, LINE_A_Z]} />
            <mesh geometry={geo.puck} material={mats.sensor} position={[0.25, LINE_Y + 0.02, LINE_B_Z]} />
            <mesh geometry={geo.puck} material={mats.sensor} position={[-0.3, LINE_Y + 0.02, (LINE_A_Z + LINE_B_Z) / 2]} />
            {variant === 'explorer' && (
              <mesh position={[0, CELL_Y - 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.mat}>
                <planeGeometry args={[1.9, CELL_SPAN, 15, 7]} />
              </mesh>
            )}
          </group>

          {variant === 'simulator' &&
            LOADS.map((load, k) => (
              <mesh
                key={k}
                ref={(m: THREE.Mesh | null) => {
                  loads.current[k] = m
                }}
                position={[load.x, CELL_Y + 2 * cellRy(REF) + load.size[1] / 2, 0]}
                material={mats.load}
              >
                <boxGeometry args={[...load.size]} />
                <Edges color={LOOK.loadEdge} threshold={15} transparent opacity={0.7} />
              </mesh>
            ))}

          {variant === 'simulator' && (
            <>
              <mesh rotation-x={-Math.PI / 2} position={[0, CELL_Y + 2 * cellRy(REF), 0]} {...placePoint}>
                <planeGeometry args={[N_UPPER * PITCH, CELL_SPAN]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
              <group ref={marker} visible={false}>
                <mesh rotation-x={-Math.PI / 2} position-y={0.004} renderOrder={2}>
                  <ringGeometry args={[0.035, 0.05, 32]} />
                  <meshBasicMaterial color={LOOK.pointMarker} depthTest={false} transparent />
                </mesh>
                <group position-y={0.1}>
                  <mesh ref={markerCone} rotation-x={Math.PI}>
                    <coneGeometry args={[0.03, 0.12, 16]} />
                    <meshBasicMaterial color={LOOK.pointMarker} />
                  </mesh>
                </group>
              </group>
            </>
          )}

          {variant !== 'simulator' && (
            <group ref={setGroup('cover')} {...pick('cover')}>
              <RoundedBox args={[1.0, 0.02, 0.93]} radius={0.008} smoothness={2} position={[-0.5, COVER_TOP - 0.01, 0]} material={mats.cover} />
              <mesh position={[-0.5, (COVER_TOP + SKIRT_BOTTOM) / 2, -0.461]} material={mats.cover}>
                <boxGeometry args={[1.0, COVER_TOP - SKIRT_BOTTOM, 0.012]} />
              </mesh>
              <mesh position={[-0.5, (COVER_TOP + SKIRT_BOTTOM) / 2, 0.461]} material={mats.cover}>
                <boxGeometry args={[1.0, COVER_TOP - SKIRT_BOTTOM, 0.012]} />
              </mesh>
              <mesh position={[-1.0, (COVER_TOP + SKIRT_BOTTOM) / 2, 0]} material={mats.cover}>
                <boxGeometry args={[0.012, COVER_TOP - SKIRT_BOTTOM, 0.93]} />
              </mesh>
              <group position={[0, COVER_TOP, 0]} rotation={[0, 0, 0.45]}>
                <RoundedBox args={[0.18, 0.016, 0.93]} radius={0.007} smoothness={2} position={[0.09, -0.008, 0]} material={mats.cover} />
              </group>
            </group>
          )}
        </group>
      </group>
    </group>
  )
}
