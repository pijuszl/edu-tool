// src/components/Game/Collectable.tsx
import { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import coinModel from '/src/assets/coin/scene.gltf'
import { COINS_SCALE } from '../../config/game-config'

type CollectableProps = {
  position: [number, number, number]
  isCollected: boolean
}

export function Collectable({ position, isCollected }: CollectableProps) {
  const ref = useRef<THREE.Group>(null)
  const { scene } = useGLTF(coinModel) // Path to your GLTF model - replace with your actual model
  const rotation = Math.PI / 2

  // Add floating animation for the collectable
  useFrame((state) => {
    if (ref.current && !isCollected) {
      // Rotate the collectable
      ref.current.rotation.y += 0.005

      // Make it float up and down slightly
      ref.current.position.y =
        position[1] + Math.sin(state.clock.getElapsedTime() * 2) * 0.1
    }
  })

  return (
    <group
      ref={ref}
      position={position}
      visible={!isCollected}
      rotation={[rotation, 0, 0]}
    >
      <primitive
        object={scene.clone()}
        scale={[COINS_SCALE, COINS_SCALE, COINS_SCALE]}
      />
    </group>
  )
}

// Preload the model for better performance
useGLTF.preload(coinModel)
