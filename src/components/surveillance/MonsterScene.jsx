/**
 * MonsterScene.jsx — Canvas React Three Fiber
 *
 * Scène complète avec :
 *  - Éclairage dynamique selon l'état (vert calme / rouge colère)
 *  - Post-processing : Bloom sur les yeux et les particules
 *  - ContactShadows pour la profondeur au sol
 *  - Float pour le flottement doux
 *  - Fond de scène transparent (le panel garde sa couleur)
 */

import { Suspense, useMemo } from 'react'
import { Canvas }            from '@react-three/fiber'
import { ContactShadows, Float, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette }    from '@react-three/postprocessing'
import { useSpring, a }      from '@react-spring/three'
import MonsterModel          from './MonsterModel'

/* ── Lumières dynamiques selon l'état ── */
function SceneLights({ etat }) {
  const isDort   = etat === 'dort'
  const isColere = etat === 'alerte'

  const { rimColor, rimIntensity, fillColor, pointColor } = useSpring({
    rimColor:     isColere ? '#FF4040' : isDort ? '#A8E6CF' : '#B0F0D8',
    rimIntensity: isColere ? 2.8       : isDort ? 0.6       : 1.2,
    fillColor:    isColere ? '#FF8060' : '#A8E6CF',
    pointColor:   isColere ? '#FF3030' : '#FFFFFF',
    config: { tension: 120, friction: 30 },
  })

  return (
    <>
      {/* Lumière ambiante douce */}
      <ambientLight intensity={isDort ? 0.35 : 0.55} color="#D0F0E8" />

      {/* Lumière clé — top droite (3D shading principal) */}
      <directionalLight
        position={[3, 4, 3]}
        intensity={isColere ? 2.2 : 1.6}
        color={isColere ? '#FFDDCC' : '#FFFFFF'}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Lumière de remplissage gauche — couleur thématique */}
      <a.pointLight
        position={[-3, 1, 2]}
        intensity={0.8}
        color={fillColor}
        distance={8}
      />

      {/* Lumière de contour (rim light) — derrière le monstre */}
      <a.pointLight
        position={[0, 0, -4]}
        intensity={rimIntensity}
        color={rimColor}
        distance={10}
      />

      {/* Lumière basse pour les pieds / sol */}
      <pointLight position={[0, -3, 2]} intensity={0.4} color="#89DFC4" distance={6} />

      {/* Spot rouge si colère — dramatique */}
      {isColere && (
        <pointLight
          position={[0, 1.5, 2.5]}
          intensity={3.0}
          color="#FF2020"
          distance={5}
        />
      )}
    </>
  )
}

/* ── Composant principal ── */
export default function MonsterScene({ etat = 'dort', phrase = '' }) {
  const isDort   = etat === 'dort'
  const isColere = etat === 'alerte'

  /* Float adapté à l'état */
  const floatProps = useMemo(() => ({
    speed:            isDort ? 0.55 : isColere ? 0 : 1.2,
    rotationIntensity: isDort ? 0.04 : isColere ? 0 : 0.06,
    floatIntensity:   isDort ? 0.35 : isColere ? 0 : 0.20,
  }), [etat])

  /* Couleur de fond selon état */
  const bgColor = isColere ? '#1A0A0A' : isDort ? '#0A1A14' : '#0D1A14'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>

      {/* Canvas 3D */}
      <div style={{
        width:  '100%',
        height: '340px',
        borderRadius: '16px',
        overflow: 'hidden',
        background: bgColor,
        transition: 'background 0.8s ease',
      }}>
        <Canvas
          camera={{ position: [0, 0, 4.2], fov: 48 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'default' }}
          shadows
          dpr={[1, 1.5]}
        >
          <Suspense fallback={null}>

            {/* Éclairage dynamique */}
            <SceneLights etat={etat} />

            {/* Monstre flottant */}
            <Float {...floatProps}>
              <MonsterModel etat={etat} />
            </Float>

            {/* Ombre au sol */}
            <ContactShadows
              position={[0, -1.65, 0]}
              opacity={isColere ? 0.55 : 0.30}
              scale={4.5}
              blur={2.5}
              far={2}
              color={isColere ? '#3A0A0A' : '#0A2A1A'}
            />

            {/* Post-processing */}
            <EffectComposer>
              <Bloom
                luminanceThreshold={0.75}
                luminanceSmoothing={0.4}
                intensity={isColere ? 1.2 : isDort ? 0.3 : 0.6}
                mipmapBlur
              />
              <Vignette eskil={false} offset={0.3} darkness={isColere ? 0.9 : 0.5} />
            </EffectComposer>

          </Suspense>
        </Canvas>
      </div>

      {/* Bulle de dialogue phrase mascotte */}
      {phrase && (
        <div style={{
          maxWidth:     '280px',
          width:        '100%',
          textAlign:    'center',
          padding:      '10px 16px',
          borderRadius: '18px',
          fontSize:     '13px',
          fontWeight:   '500',
          lineHeight:   '1.5',
          background:   isColere ? 'rgba(255,60,60,0.12)' : 'rgba(168,230,207,0.12)',
          border:       `1.5px solid ${isColere ? 'rgba(255,100,100,0.5)' : 'rgba(126,207,184,0.5)'}`,
          color:        isColere ? '#FFAAAA' : '#A8E6CF',
          backdropFilter: 'blur(6px)',
        }}>
          {phrase}
        </div>
      )}
    </div>
  )
}
