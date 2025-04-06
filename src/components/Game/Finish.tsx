// components/Game/Finish.tsx
import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { FINISH_SCALE } from '../../config/game-config'

interface FinishProps {
  position: [number, number, number]
  isActive: boolean // true when all collectables are collected
  isVisible: boolean // true when this level's finish should be shown
}

export const Finish: React.FC<FinishProps> = ({
  position,
  isActive,
  isVisible,
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  const [rotation, setRotation] = useState(0)

  // Float animation
  useFrame((state) => {
    if (groupRef.current) {
      // Floating effect
      groupRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.1

      // Rotation effect
      setRotation(state.clock.elapsedTime * 0.5)

      // Scale pulsing when active
      if (isActive && meshRef.current) {
        const pulse = isActive ? 0.15 : 0.05
        const baseScale = isActive ? 1.0 : 0.9
        const scale = baseScale + Math.sin(state.clock.elapsedTime * 2) * pulse
        meshRef.current.scale.set(scale, scale, scale)
      }
    }
  })

  useEffect(() => {
    let animationFrame: number
    let intensity = 0.8
    let increasing = true

    const animateGlow = () => {
      if (materialRef.current) {
        if (increasing) {
          intensity += 0.01
          if (intensity >= 2) {
            increasing = false
          }
        } else {
          intensity -= 0.01
          if (intensity <= 0.8) {
            increasing = true
          }
        }
        materialRef.current.emissiveIntensity = intensity
      }
      animationFrame = requestAnimationFrame(animateGlow)
    }

    if (isActive) {
      animateGlow()
    }

    return () => cancelAnimationFrame(animationFrame)
  }, [isActive])

  if (!isVisible) return null

  return (
    <group ref={groupRef} position={position} scale={FINISH_SCALE}>
      {isActive && (
        <pointLight color="#00ff00" intensity={1} distance={3} decay={2} />
      )}

      <group rotation={[0, rotation, 0]}>
        <RoundedBox ref={meshRef} args={[1, 1, 1]} radius={0.2} smoothness={4}>
          <meshStandardMaterial
            ref={materialRef}
            color={isActive ? '#00ff00' : '#ff0000'}
            emissive={isActive ? '#00aa00' : '#aa0000'}
            emissiveIntensity={isActive ? 0.8 : 0.3}
          />
        </RoundedBox>
      </group>

      {/* Particles for active finish */}
      {isActive && (
        <group>
          {[...Array(10)].map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.sin(Date.now() * 0.001 + i) * 1.2,
                Math.cos(Date.now() * 0.002 + i) * 1.2,
                Math.sin(Date.now() * 0.003 + i) * 1.2,
              ]}
            >
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#00ff00" />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}
