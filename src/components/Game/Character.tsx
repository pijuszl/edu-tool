// components/Game/Character.tsx
import React, { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { easeInOutQuad, getShortestRotation } from '../../utils/animation'
import {
  CHARACTER_SCALE,
  ANIMATION_DURATION,
  ANIMATION_TIMESCALE,
  ROTATION_LERP_FACTOR,
  HEX_METRICS,
} from '../../config/game-config'

interface CharacterProps {
  position: [number, number, number]
  rotation: number
  targetPosition: THREE.Vector3 | null
  onMoveComplete: () => void
  forceUpdate?: boolean
  isClimbing?: boolean // New prop to indicate if this is a climbing movement
}

export const Character = ({
  position,
  rotation,
  targetPosition,
  onMoveComplete,
  forceUpdate = false,
  isClimbing = false, // Default to false for backward compatibility
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
  const initialRotation = rotation + Math.PI / 2 // Calculate the correct initial rotation
  const currentRotation = useRef(initialRotation) // Initialize with the correct rotation
  const targetRotation = useRef(initialRotation) // Track the target rotation for animations
  const animationTime = useRef(0)
  const isMoving = useRef(false)
  const isInitialRender = useRef(true) // Flag to track initial render

  // New refs for climbing animation
  const isInClimbingAnimation = useRef(false)
  const climbingPhase = useRef(0) // 0 = not climbing, 1 = first phase, 2 = second phase
  const intermediatePos = useRef(new THREE.Vector3())
  const climbAnimationDuration = ANIMATION_DURATION * 0.6 // Each phase is a bit faster than normal move

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
      const newTargetRot = rotation + Math.PI / 2
      currentRotation.current = newTargetRot
      targetRotation.current = newTargetRot
      characterRef.current.position.copy(currentPos.current)
      characterRef.current.rotation.y = newTargetRot
      isMoving.current = false
      animationTime.current = 0
      isInClimbingAnimation.current = false
      climbingPhase.current = 0

      if (actions.Scene) {
        actions.Scene.reset().stop()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceUpdate, adjustedPosition, rotation]) // Removed actions dependency

  // Update the target rotation when rotation prop changes
  useEffect(() => {
    const newTargetRot = rotation + Math.PI / 2
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

      // Reset climbing animation state
      climbingPhase.current = isClimbing ? 1 : 0
      isInClimbingAnimation.current = isClimbing

      // If climbing, calculate the intermediate position
      if (isClimbing && targetPosition) {
        // First phase: move diagonally up
        const directionVector = new THREE.Vector3()
          .subVectors(targetPosition, startPos.current)
          .normalize()

        // Create an intermediate position that's halfway horizontally and fully up
        intermediatePos.current = startPos.current.clone()
        intermediatePos.current.x +=
          directionVector.x * (HEX_METRICS.horizontalSpacing / 2)
        intermediatePos.current.z +=
          directionVector.z * (HEX_METRICS.verticalSpacing / 2)
        intermediatePos.current.y = targetPosition.y // Go fully up to the target height
      }

      if (actions.Scene) {
        actions.Scene.reset().fadeIn(0.2).play()
      }
    }
  }, [targetPosition, isClimbing])

  useFrame((_, delta) => {
    if (!characterRef.current || forceUpdate) return

    // Handle position animation
    if (targetPosition && isMoving.current) {
      animationTime.current += delta

      // Handle climbing animation with two phases
      if (isInClimbingAnimation.current) {
        const targetForCurrentPhase =
          climbingPhase.current === 1 ? intermediatePos.current : targetPosition

        const progress = Math.min(
          animationTime.current / climbAnimationDuration,
          1
        )
        const easedProgress = easeInOutQuad(progress)

        const newPos = startPos.current
          .clone()
          .lerp(targetForCurrentPhase, easedProgress)
        currentPos.current.copy(newPos)
        characterRef.current.position.copy(currentPos.current)

        // If first phase is complete, start second phase
        if (progress >= 1 && climbingPhase.current === 1) {
          climbingPhase.current = 2
          startPos.current.copy(intermediatePos.current)
          animationTime.current = 0
        }
        // If second phase is complete, finish animation
        else if (progress >= 1 && climbingPhase.current === 2) {
          isInClimbingAnimation.current = false
          climbingPhase.current = 0
          if (actions.Scene) {
            actions.Scene.fadeOut(0.2).stop()
          }
          isMoving.current = false
          onMoveComplete()
        }
      }
      // Regular movement animation (non-climbing)
      else {
        const progress = Math.min(animationTime.current / ANIMATION_DURATION, 1)
        const easedProgress = easeInOutQuad(progress)

        const newPos = startPos.current
          .clone()
          .lerp(targetPosition, easedProgress)
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
