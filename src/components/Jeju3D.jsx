import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Line } from '@react-three/drei'
import * as THREE from 'three'

// ── 좌표 변환: 위도·경도 → 3D 좌표 (1 unit ≈ 5km) ─────────
const CENTER = { lat: 33.38, lng: 126.56 }
export const toXZ = (lat, lng) => [(lng - CENTER.lng) * 18.6, (CENTER.lat - lat) * 22.2]

const SIZE = [20, 11]   // 지형 평면 크기
const A = 7.9, B = 3.6  // 섬 타원 반지름(x, z)
const HALLA = toXZ(33.3617, 126.5292)
const OREUMS = [[33.4786, 126.8118, 0.5], [33.4546, 126.716, 0.6], [33.366, 126.357, 0.65], [33.435, 126.366, 0.7], [33.431, 126.69, 0.45], [33.253, 126.364, 0.4]]
  .map(([lat, lng, h]) => ({ at: toXZ(lat, lng), h }))

// 섬 모양 + 한라산 + 오름 봉우리로 만든 높이 함수
function terrainHeight(x, z) {
  const d = Math.hypot(x / A, z / B)
  const wobble = 1 + 0.05 * Math.sin(x * 1.7) * Math.cos(z * 2.3)
  const land = THREE.MathUtils.smoothstep(1 - d * wobble, 0, 0.18) // 해안선
  if (land <= 0) return -0.25
  let h = 0.12 + 0.25 * land
  h += 2.3 * Math.exp(-(Math.hypot(x - HALLA[0], z - HALLA[1]) ** 2) / 2.2) * land
  for (const o of OREUMS) h += o.h * Math.exp(-(Math.hypot(x - o.at[0], z - o.at[1]) ** 2) / 0.18) * land
  return h
}

function Island() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(SIZE[0], SIZE[1], 220, 120)
    g.rotateX(-Math.PI / 2)
    const pos = g.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const c = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const y = terrainHeight(pos.getX(i), pos.getZ(i))
      pos.setY(i, y)
      if (y < 0) c.set('#9fd3d0')
      else if (y < 0.18) c.set('#efe3c2')
      else if (y < 0.7) c.set('#8cc9a0').lerp(new THREE.Color('#5fae7e'), Math.min(1, y))
      else if (y < 1.7) c.set('#8a9a7b').lerp(new THREE.Color('#a79b87'), y - 0.7)
      else c.set('#d8d4cc').lerp(new THREE.Color('#ffffff'), Math.min(1, (y - 1.7) * 1.2))
      colors.set([c.r, c.g, c.b], i * 3)
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    g.computeVertexNormals()
    return g
  }, [])
  return <mesh geometry={geo}><meshStandardMaterial vertexColors roughness={0.95} /></mesh>
}

function Sea() {
  const ref = useRef()
  useFrame(({ clock }) => { ref.current.position.y = 0.02 + Math.sin(clock.elapsedTime * 0.6) * 0.015 })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[140, 90]} />
      <meshStandardMaterial color="#4fb3c8" transparent opacity={0.72} roughness={0.2} metalness={0.1} />
    </mesh>
  )
}

function Clouds() {
  const ref = useRef()
  const clouds = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ x: -9 + i * 3.1, y: 4.2 + (i % 3) * 0.5, z: -3 + ((i * 7) % 6), s: 0.5 + (i % 3) * 0.25 })), [])
  useFrame(({ clock }) => { ref.current.position.x = Math.sin(clock.elapsedTime * 0.05) * 1.5 })
  return (
    <group ref={ref}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={c.s}>
          {[[0, 0, 0, 1], [0.9, -0.1, 0.1, 0.75], [-0.9, -0.1, -0.1, 0.7]].map(([x, y, z, r], k) => (
            <mesh key={k} position={[x, y, z]}><sphereGeometry args={[r, 16, 16]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.85} /></mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function Stop({ order, lat, lng, name, verified }) {
  const [x, z] = toXZ(lat, lng)
  const y = Math.max(terrainHeight(x, z), 0.05)
  const ring = useRef()
  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * 0.9) % 1
    ring.current.scale.setScalar(1 + t * 2.4)
    ring.current.material.opacity = (1 - t) * 0.7
  })
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshStandardMaterial color={verified ? '#ff8a65' : '#9e9e9e'} emissive={verified ? '#ff8a65' : '#555'} emissiveIntensity={0.6} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.14, 0.19, 32]} />
        <meshBasicMaterial color="#ff8a65" transparent />
      </mesh>
      <Html position={[0, 0.75, 0]} center distanceFactor={9} zIndexRange={[10, 0]}>
        <div className="pin-label"><b>{order}</b> {name}</div>
      </Html>
    </group>
  )
}

// stops: [{ name, lat, lng, verified }] — 추천 코스의 방문 순서대로. 비어 있으면 섬만 천천히 돌아갑니다.
export default function Jeju3D({ stops = [], height = 480, focusX = 0 }) {
  const placed = stops.filter((s) => s.lat && s.lng)
  const pts = placed.map((s) => toXZ(s.lat, s.lng))
  const cx = pts.length ? pts.reduce((a, p) => a + p[0], 0) / pts.length : focusX
  const cz = pts.length ? pts.reduce((a, p) => a + p[1], 0) / pts.length : 0
  const spread = pts.length > 1 ? Math.max(...pts.map((p) => Math.hypot(p[0] - cx, p[1] - cz))) : 0
  const dist = pts.length ? Math.min(Math.max(6 + spread * 1.6, 8), 14) : 11.5   // 장소가 가까워도 섬 지형이 보이도록 최소 거리 유지
  const path = placed.map((s) => { const [x, z] = toXZ(s.lat, s.lng); return [x, Math.max(terrainHeight(x, z), 0.05) + 0.3, z] })
  return (
    <Canvas camera={{ position: [cx, dist * 0.75, cz + dist], fov: 45 }} style={{ height }} dpr={[1, 2]}>
      <color attach="background" args={['#e9f6f4']} />
      <fog attach="fog" args={['#e9f6f4', 16, 38]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[6, 10, 4]} intensity={1.8} />
      <Sea />
      <Island />
      <Clouds />
      {placed.map((s, i) => <Stop key={i} order={i + 1} {...s} />)}
      {path.length > 1 && <Line points={path} color="#ff8a65" lineWidth={3} dashed dashSize={0.25} gapSize={0.15} />}
      <OrbitControls enablePan={false} target={[cx, 0, cz]} minDistance={5} maxDistance={22} maxPolarAngle={Math.PI / 2.2}
        autoRotate autoRotateSpeed={0.45} />
    </Canvas>
  )
}
