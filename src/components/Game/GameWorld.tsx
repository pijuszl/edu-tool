// components/Game/GameWorld.tsx
import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { MapControls } from '@react-three/drei'
import { Character } from './Character'
import * as THREE from 'three'

interface GameWorldProps {
  worldObjects: React.ReactNode[]
  collectableElements: React.ReactNode[]
  finishElement: React.ReactNode
  characterPosition: [number, number, number]
  characterRotation: number
  targetPosition: THREE.Vector3 | null
  onMoveComplete: () => void
  forceUpdate: boolean
  isClimbing: boolean
}

export const GameWorld = ({
  worldObjects,
  collectableElements,
  finishElement,
  characterPosition,
  characterRotation,
  targetPosition,
  onMoveComplete,
  forceUpdate,
  isClimbing,
}: GameWorldProps) => {
  return (
    <Canvas camera={{ position: [-2, 2, 3], fov: 50 }}>
      <ambientLight intensity={1} />
      <directionalLight position={[3, 5, 2]} intensity={1.5} castShadow />
      <Suspense fallback={null}>
        {worldObjects}
        {collectableElements}
        {finishElement}
        <Character
          position={characterPosition}
          rotation={characterRotation}
          targetPosition={targetPosition}
          onMoveComplete={onMoveComplete}
          forceUpdate={forceUpdate}
          isClimbing={isClimbing} // Pass false for climbing prop
        />
      </Suspense>
      <MapControls />
    </Canvas>
  )
}
