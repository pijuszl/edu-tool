// src/components/Game/Character.tsx
import React, { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import {
  easeInOutQuad,
  getShortestRotation,
} from '../../utils/movement-animation'
import {
  CHARACTER_SCALE,
  ANIMATION_DURATION,
  ANIMATION_TIMESCALE,
  ROTATION_LERP_FACTOR,
} from '../../config/game-config'

interface CharacterProps {
  position: [number, number, number]
  rotation: number
  targetPosition: THREE.Vector3 | null
  onMoveComplete: () => void
  forceUpdate?: boolean
}

export const Character = ({
  position,
  rotation,
  targetPosition,
  onMoveComplete,
  forceUpdate = false,
}: CharacterProps) => {
  const { scene, animations } = useGLTF(
    '/src/assets/cat/cat.gltf'
  ) as unknown as GLTF & {
    scene: THREE.Group
    animations: any
  }
  const { actions } = useAnimations(animations, scene)
  const characterRef = useRef<THREE.Group>(null)

  // Use the provided position as the starting (and fixed) cat position.
  const adjustedPosition = [position[0], position[1], position[2]] as [
    number,
    number,
    number,
  ]
  const currentPos = useRef(new THREE.Vector3(...adjustedPosition))
  const startPos = useRef(new THREE.Vector3(...adjustedPosition))
  const currentRotation = useRef(rotation)
  const animationTime = useRef(0)
  const isMoving = useRef(false)

  useEffect(() => {
    if (actions.Scene) {
      actions.Scene.setEffectiveTimeScale(ANIMATION_TIMESCALE)
      actions.Scene.reset().stop()
    }
  }, [actions])

  // Handle force updates (instant position changes)
  useEffect(() => {
    if (forceUpdate && characterRef.current) {
      currentPos.current.set(...adjustedPosition)
      startPos.current.set(...adjustedPosition)
      currentRotation.current = rotation
      characterRef.current.position.copy(currentPos.current)
      characterRef.current.rotation.y = rotation - Math.PI / 2 + Math.PI
      isMoving.current = false
      animationTime.current = 0
      if (actions.Scene) {
        actions.Scene.reset().stop()
      }
    }
  }, [forceUpdate, adjustedPosition, rotation, actions])

  useEffect(() => {
    if (targetPosition && !isMoving.current && !forceUpdate) {
      startPos.current.copy(currentPos.current)
      animationTime.current = 0
      isMoving.current = true

      if (actions.Scene) {
        actions.Scene.reset().fadeIn(0.2).play()
      }
    }
  }, [targetPosition, actions, forceUpdate])

  useFrame((_, delta) => {
    if (!characterRef.current || forceUpdate) return

    if (targetPosition && isMoving.current) {
      animationTime.current += delta
      const progress = Math.min(animationTime.current / ANIMATION_DURATION, 1)
      const easedProgress = easeInOutQuad(progress)

      const newPos = startPos.current
        .clone()
        .lerp(targetPosition, easedProgress)
      newPos.y = startPos.current.y
      currentPos.current.copy(newPos)
      characterRef.current.position.copy(currentPos.current)

      if (progress >= 1) {
        if (actions.Scene) {
          actions.Scene.fadeOut(0.2).stop()
        }
        isMoving.current = false
        onMoveComplete()
      }
    }

    if (characterRef.current && !forceUpdate) {
      const targetRot = rotation - Math.PI / 2 + Math.PI
      const rotDelta = getShortestRotation(currentRotation.current, targetRot)
      currentRotation.current += rotDelta * delta * ROTATION_LERP_FACTOR
      characterRef.current.rotation.y = currentRotation.current
    }
  })

  return (
    <primitive
      ref={characterRef}
      object={scene}
      position={adjustedPosition}
      scale={[CHARACTER_SCALE, CHARACTER_SCALE, CHARACTER_SCALE]}
      rotation={[0, Math.PI, 0]}
    />
  )
}