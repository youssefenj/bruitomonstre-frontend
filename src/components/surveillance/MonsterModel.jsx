/**
 * MonsterModel.jsx — Monstre 3D procédural React Three Fiber
 *
 * États :
 *   "dort"   → silence   : respiration lente, yeux fermés, z z z flottants
 *   "ecoute" → avertissement : yeux grands ouverts, bouche mi-ouverte, pulsation
 *   "alerte" → critique  : tremblement, sourcils froncés, gueule ouverte, lueur rouge
 */

import { useRef, useMemo, useEffect, Suspense } from 'react'
import { useFrame }    from '@react-three/fiber'
import { Text, Float, MeshDistortMaterial, Sparkles } from '@react-three/drei'
import { useSpring, a }  from '@react-spring/three'
import * as THREE        from 'three'

/* ─────────────────────────────────────────────
   CONSTANTES COULEUR
───────────────────────────────────────────── */
const C = {
  bodyLight:  '#CDFAEB',
  bodyMid:    '#8ADCC4',
  bodyDark:   '#5EB09A',
  hornLight:  '#B8EFD8',
  hornDark:   '#6ABFA8',
  darkGreen:  '#1E4A38',
  eyeWhite:   '#FFFFFF',
  eyeIris:    '#0B1810',
  teeth:      '#F5F0E8',
  tongue:     '#FF8FAD',
  angry:      '#FF4040',
}

/* ─────────────────────────────────────────────
   FOURRURE — sphères en InstancedMesh
   Disposition uniforme (sphère de Fibonacci)
───────────────────────────────────────────── */
function FurBumps({ color }) {
  const ref   = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const COUNT = 42

  const data = useMemo(() => {
    const phi = Math.PI * (Math.sqrt(5) - 1)
    return Array.from({ length: COUNT }, (_, i) => {
      const y     = 1 - (i / (COUNT - 1)) * 2
      const r     = Math.sqrt(1 - y * y)
      const theta = phi * i
      const s     = 0.09 + (i % 5) * 0.018
      return { x: r * Math.cos(theta) * 0.96, y: y * 0.96, z: r * Math.sin(theta) * 0.96, s }
    })
  }, [])

  useEffect(() => {
    if (!ref.current) return
    data.forEach(({ x, y, z, s }, i) => {
      dummy.position.set(x, y, z)
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [data, dummy])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} castShadow>
      <sphereGeometry args={[1, 6, 5]} />
      <meshStandardMaterial color={color} roughness={0.9} metalness={0.02} />
    </instancedMesh>
  )
}

/* ─────────────────────────────────────────────
   CORNE (gauche side=-1 / droite side=1)
───────────────────────────────────────────── */
function Horn({ side }) {
  const stripeY = [-0.16, 0, 0.15]
  return (
    <group
      position={[side * 0.52, 0.80, 0.08]}
      rotation={[0.18, 0, side * -0.44]}
    >
      {/* Cône principal */}
      <mesh castShadow>
        <coneGeometry args={[0.09, 0.65, 12]} />
        <meshStandardMaterial color={C.hornLight} roughness={0.75} metalness={0.05} />
      </mesh>
      {/* Rayures */}
      {stripeY.map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.075, 0.014, 6, 20]} />
          <meshStandardMaterial color={C.hornDark} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

/* ─────────────────────────────────────────────
   ŒIL FERMÉ (dort)
───────────────────────────────────────────── */
function ClosedEye({ side }) {
  const geom = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.16, 0, 0),
      new THREE.Vector3(0,     0.1, 0),
      new THREE.Vector3(0.16,  0,   0),
    )
    return new THREE.TubeGeometry(curve, 24, 0.022, 8, false)
  }, [])

  return (
    <mesh position={[side * 0.36, 0.15, 0.91]} geometry={geom}>
      <meshStandardMaterial color={C.darkGreen} roughness={0.8} />
    </mesh>
  )
}

/* ─────────────────────────────────────────────
   ŒIL OUVERT
───────────────────────────────────────────── */
function OpenEye({ side, angry = false }) {
  return (
    <group position={[side * 0.36, 0.16, 0.87]}>
      {/* Blanc */}
      <mesh>
        <sphereGeometry args={[0.195, 20, 20]} />
        <meshStandardMaterial color={C.eyeWhite} roughness={0.25} metalness={0.08} />
      </mesh>
      {/* Iris */}
      <mesh position={[0, 0, 0.13]}>
        <sphereGeometry args={[0.115, 14, 14]} />
        <meshStandardMaterial color={C.eyeIris} roughness={0.35} metalness={0.15} />
      </mesh>
      {/* Reflet principal */}
      <mesh position={[0.065, 0.065, 0.215]}>
        <sphereGeometry args={[0.038, 8, 8]} />
        <meshStandardMaterial
          color="white"
          emissive="white"
          emissiveIntensity={1.2}
          roughness={0.05}
        />
      </mesh>
      {/* Petit reflet secondaire */}
      <mesh position={[-0.05, -0.04, 0.21]}>
        <sphereGeometry args={[0.018, 6, 6]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.6} roughness={0.1} />
      </mesh>

      {/* Sourcil en colère */}
      {angry && (
        <mesh
          position={[side * -0.015, 0.25, 0.05]}
          rotation={[0, 0, side * 0.45]}
        >
          <capsuleGeometry args={[0.02, 0.22, 4, 8]} />
          <meshStandardMaterial color={C.darkGreen} roughness={0.8} />
        </mesh>
      )}
    </group>
  )
}

/* ─────────────────────────────────────────────
   BOUCHE — Silence (petit sourire)
───────────────────────────────────────────── */
function MouthSleep() {
  const geom = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.12, 0,     0),
      new THREE.Vector3(0,    -0.08,  0),
      new THREE.Vector3(0.12,  0,     0),
    )
    return new THREE.TubeGeometry(curve, 20, 0.018, 8, false)
  }, [])

  return (
    <mesh position={[0, -0.30, 0.93]} geometry={geom}>
      <meshStandardMaterial color={C.darkGreen} roughness={0.8} />
    </mesh>
  )
}

/* ─────────────────────────────────────────────
   BOUCHE — Réveillé (mi-ouverte, quelques dents)
───────────────────────────────────────────── */
function MouthAwake() {
  const teethX = [-0.14, -0.07, 0, 0.07, 0.14]
  return (
    <group position={[0, -0.28, 0.86]}>
      {/* Cavité */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.20, 0.14, 0.08, 18, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#1A3828" roughness={0.9} side={THREE.BackSide} />
      </mesh>
      {/* Lèvres / contour */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.20, 0.028, 8, 22, Math.PI]} />
        <meshStandardMaterial color={C.darkGreen} roughness={0.75} />
      </mesh>
      {/* Dents supérieures */}
      {teethX.map((x, i) => (
        <mesh key={i} position={[x, 0.04, 0.03]}>
          <coneGeometry args={[0.030, 0.09, 5]} />
          <meshStandardMaterial color={C.teeth} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

/* ─────────────────────────────────────────────
   BOUCHE — Colère (grande gueule ouverte)
───────────────────────────────────────────── */
function MouthAngry() {
  const teethTop = [-0.27, -0.19, -0.11, -0.03, 0.05, 0.13, 0.21, 0.28]
  return (
    <group position={[0, -0.22, 0.82]}>
      {/* Cavité profonde */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.24, 0.14, 22, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#0E2218" roughness={0.95} side={THREE.BackSide} />
      </mesh>
      {/* Contour lèvre */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.34, 0.032, 8, 24, Math.PI]} />
        <meshStandardMaterial color={C.darkGreen} roughness={0.75} />
      </mesh>
      {/* Dents supérieures — cônes */}
      {teethTop.map((x, i) => (
        <mesh key={i} position={[x, 0.06, 0.04]}>
          <coneGeometry args={[0.034, 0.10, 5]} />
          <meshStandardMaterial color={C.teeth} roughness={0.3} metalness={0.05} />
        </mesh>
      ))}
      {/* Dents inférieures — plus petites */}
      {[-0.22, -0.11, 0, 0.11, 0.22].map((x, i) => (
        <mesh key={i} position={[x, -0.06, 0.02]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.026, 0.075, 5]} />
          <meshStandardMaterial color={C.teeth} roughness={0.3} />
        </mesh>
      ))}
      {/* Langue */}
      <mesh position={[0, -0.10, 0.02]}>
        <sphereGeometry args={[0.14, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={C.tongue} roughness={0.55} />
      </mesh>
    </group>
  )
}

/* ─────────────────────────────────────────────
   PIED
───────────────────────────────────────────── */
function Foot({ side }) {
  const clawX = [-0.15, -0.05, 0.05, 0.15]
  return (
    <group position={[side * 0.45, -1.10, 0.08]}>
      <mesh castShadow>
        <sphereGeometry args={[0.30, 18, 14]} />
        <meshStandardMaterial color={C.bodyMid} roughness={0.85} metalness={0.03} />
      </mesh>
      {clawX.map((x, i) => (
        <mesh key={i}
          position={[x, -0.12, 0.24]}
          rotation={[0.5, 0, (x / 0.15) * 0.18]}
        >
          <coneGeometry args={[0.022, 0.10, 5]} />
          <meshStandardMaterial color={C.bodyDark} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

/* ─────────────────────────────────────────────
   Z FLOTTANTS (dort)
───────────────────────────────────────────── */
function ZParticles() {
  const letters = [
    { pos: [1.15, 0.75,  0.1], size: 0.24, speed: 0.7 },
    { pos: [1.45, 1.05,  0.1], size: 0.18, speed: 0.6 },
    { pos: [1.70, 1.32,  0.1], size: 0.13, speed: 0.5 },
  ]
  return (
    <>
      {letters.map(({ pos, size, speed }, i) => (
        <Float key={i} speed={speed} floatIntensity={0.5} rotationIntensity={0}>
          <Text
            position={pos}
            fontSize={size}
            color="#7ECFB8"
            anchorX="center"
            anchorY="middle"
            renderOrder={1}
          >
            z
          </Text>
        </Float>
      ))}
    </>
  )
}

/* ─────────────────────────────────────────────
   CORPS PRINCIPAL avec shader distorsion
───────────────────────────────────────────── */
function MainBody({ color, distort = 0.08 }) {
  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        color={color}
        roughness={0.82}
        metalness={0.04}
        distort={distort}
        speed={1.5}
      />
    </mesh>
  )
}

/* ─────────────────────────────────────────────
   COMPOSANT PRINCIPAL
───────────────────────────────────────────── */
export default function MonsterModel({ etat = 'dort' }) {
  const groupRef = useRef()
  const time     = useRef(0)

  const isDort   = etat === 'dort'
  const isColere = etat === 'alerte'

  /* ── Transitions de couleur et scale via react-spring ── */
  const { bodyColor, scaleXYZ, distortAmt } = useSpring({
    bodyColor:  isColere ? '#D06060' : C.bodyMid,
    scaleXYZ:   isColere ? [1.06, 1.06, 1.06] : [1, 1, 1],
    distortAmt: isColere ? 0.22 : isDort ? 0.06 : 0.10,
    config:     { tension: 180, friction: 28 },
  })

  /* ── Animation continue par frame ── */
  useFrame((state, delta) => {
    time.current += delta
    if (!groupRef.current) return
    const t = time.current

    if (isDort) {
      /* Respiration lente */
      const breath = 1 + Math.sin(t * 0.7) * 0.022
      groupRef.current.scale.setScalar(breath)
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.03
    } else if (isColere) {
      /* Tremblement nerveux */
      groupRef.current.position.x = Math.sin(t * 18) * 0.055
      groupRef.current.position.y = Math.sin(t * 22) * 0.025
      groupRef.current.rotation.z = Math.sin(t * 14) * 0.028
    } else {
      /* Pulsation légère en état d'éveil */
      groupRef.current.position.y = Math.sin(t * 1.4) * 0.018
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.06
      /* Reset autres */
      groupRef.current.position.x = 0
      groupRef.current.rotation.z = 0
    }
  })

  return (
    <a.group ref={groupRef} scale={scaleXYZ}>

      {/* Fourrure (bosses périphériques) */}
      <FurBumps color={C.bodyLight} />

      {/* Corps principal avec MeshDistortMaterial */}
      <MainBody color={bodyColor} distort={distortAmt} />

      {/* Reflet brillant 3D */}
      <mesh position={[-0.25, 0.35, 0.82]}>
        <sphereGeometry args={[0.28, 12, 12]} />
        <meshStandardMaterial
          color="white"
          transparent
          opacity={0.14}
          roughness={0.1}
          metalness={0}
          depthWrite={false}
        />
      </mesh>

      {/* Cornes */}
      <Horn side={-1} />
      <Horn side={1}  />

      {/* Yeux */}
      {isDort ? (
        <>
          <ClosedEye side={-1} />
          <ClosedEye side={1}  />
        </>
      ) : (
        <>
          <OpenEye side={-1} angry={isColere} />
          <OpenEye side={1}  angry={isColere} />
        </>
      )}

      {/* Bouche selon état */}
      {isDort   && <MouthSleep  />}
      {!isDort && !isColere && <MouthAwake />}
      {isColere && <MouthAngry  />}

      {/* Pieds */}
      <Foot side={-1} />
      <Foot side={1}  />

      {/* Lueur rouge si colère */}
      {isColere && (
        <Sparkles
          count={30}
          scale={2.8}
          size={1.8}
          speed={0.5}
          color="#FF5050"
          opacity={0.6}
        />
      )}

      {/* Z flottants si dort */}
      {isDort && <ZParticles />}

    </a.group>
  )
}
