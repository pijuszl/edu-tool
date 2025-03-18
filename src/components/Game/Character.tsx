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
  const initialRotation = rotation - Math.PI / 2 + Math.PI // Calculate the correct initial rotation
  const currentRotation = useRef(initialRotation) // Initialize with the correct rotation
  const targetRotation = useRef(initialRotation) // Track the target rotation for animations
  const animationTime = useRef(0)
  const isMoving = useRef(false)
  const isInitialRender = useRef(true) // Flag to track initial render

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
      // Update both current and target rotation to the new rotation
      const newTargetRot = rotation - Math.PI / 2 + Math.PI
      currentRotation.current = newTargetRot
      targetRotation.current = newTargetRot
      characterRef.current.position.copy(currentPos.current)
      characterRef.current.rotation.y = newTargetRot
      isMoving.current = false
      animationTime.current = 0
      
      if (actions.Scene) {
        actions.Scene.reset().stop()
      }
    }
  }, [forceUpdate, adjustedPosition, rotation, actions])

  // Update the target rotation when rotation prop changes
  useEffect(() => {
    const newTargetRot = rotation - Math.PI / 2 + Math.PI
    targetRotation.current = newTargetRot

    // If this is the initial render, set current rotation immediately (no animation)
    if (isInitialRender.current && characterRef.current) {
      currentRotation.current = newTargetRot
      characterRef.current.rotation.y = newTargetRot
      isInitialRender.current = false
    }
  }, [rotation])

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

    // Handle position animation
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

    // Handle rotation animation (only after initial render)
    if (!isInitialRender.current && characterRef.current) {
      const rotDelta = getShortestRotation(
        currentRotation.current,
        targetRotation.current
      )
      if (Math.abs(rotDelta) > 0.001) {
        currentRotation.current += rotDelta * delta * ROTATION_LERP_FACTOR
        characterRef.current.rotation.y = currentRotation.current
      }
    }
  })

  return (
    <primitive
      ref={characterRef}
      object={scene}
      position={adjustedPosition}
      scale={[CHARACTER_SCALE, CHARACTER_SCALE, CHARACTER_SCALE]}
      rotation={[0, initialRotation, 0]} // Set initial rotation only (will be updated by ref)
    />
  )
}
