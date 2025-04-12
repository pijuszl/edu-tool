import { useState, useCallback, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { GridPosition, WorldData } from '../types/game-types'
import { DIRECTIONS_EVEN, DIRECTIONS_ODD } from '../config/game-config'
import { canMoveToPosition } from '../utils/movement'

export function useCharacterMovement(
  initialPosition: GridPosition,
  worldData: WorldData | undefined,
  convertPosition: Function
) {
  const [characterPos, setCharacterPos] =
    useState<GridPosition>(initialPosition)
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(
    null
  )
  const [isMoving, setIsMoving] = useState<boolean>(false)
  const [forceUpdate, setForceUpdate] = useState<boolean>(false)
  const [isClimbing, setIsClimbing] = useState<boolean>(false)
  const [isClimbingDown, setIsClimbingDown] = useState<boolean>(false)
  // Promise resolver ref
  const moveResolveRef = useRef<(() => void) | null>(null)
  // Movement state for internal tracking
  const movementStateRef = useRef({
    movementRequested: false,
    movementInProgress: false,
  })

  // Ensure any pending movement promises are resolved
  const resolvePendingMovement = useCallback(() => {
    if (moveResolveRef.current) {
      moveResolveRef.current()
      moveResolveRef.current = null
    }
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      resolvePendingMovement()
    }
  }, [resolvePendingMovement])

  const turnLeft = useCallback(() => {
    if (!isMoving) {
      setCharacterPos((prev) => ({
        ...prev,
        direction: ((prev.direction ?? 0) + 5) % 6,
      }))
    }
  }, [isMoving])

  const turnRight = useCallback(() => {
    if (!isMoving) {
      setCharacterPos((prev) => ({
        ...prev,
        direction: ((prev.direction ?? 0) + 1) % 6,
      }))
    }
  }, [isMoving])

  // Helper function to get stair direction from tile value
  const getStairDirection = useCallback(
    (x: number, y: number, layer: number): number | null => {
      if (!worldData || layer < 0 || layer >= worldData.layers.length) {
        return null
      }

      const layerData = worldData.layers[layer]
      if (y < 0 || y >= layerData.length || x < 0 || x >= layerData[y].length) {
        return null
      }

      const tileValue = layerData[y][x]
      if (tileValue >= 30 && tileValue <= 35) {
        return tileValue - 30
      }

      return null
    },
    [worldData]
  )

  const moveForward = useCallback(async () => {
    // Only start a new movement if not already moving
    if (isMoving || !worldData) {
      console.log('Move forward called but already moving or no world data')
      return Promise.resolve()
    }

    movementStateRef.current.movementRequested = true
    setIsMoving(true)
    setIsClimbing(false)
    setIsClimbingDown(false)

    // Set character position using state updater to ensure we have the most recent state
    setCharacterPos((prev) => {
      const { x, y, layer, direction } = prev
      const directions = y % 2 === 0 ? DIRECTIONS_EVEN : DIRECTIONS_ODD
      const delta = directions[direction ?? 0]

      const newX = x + delta.dx
      const newY = y + delta.dy

      // Debug the current position and intended new position
      console.log(
        `Moving from (${x}, ${y}, ${layer}) with direction ${direction}`
      )

      // Check if we're on a stairs tile with matching direction
      const stairDirection = getStairDirection(x, y, layer)
      const onStairs = stairDirection !== null && stairDirection === direction

      let newLayer = layer
      let canMove = false

      // FIRST PRIORITY: Try to climb up stairs if we're on stairs pointing in our direction
      if (onStairs) {
        console.log(
          `On stairs with direction ${stairDirection}, attempting to climb up`
        )
        // Try to climb up one layer diagonally
        newLayer = layer + 1

        // Check if we can stand in the target position after climbing
        if (canMoveToPosition(newX, newY, newLayer, worldData)) {
          console.log(`Climbing to (${newX}, ${newY}, ${newLayer})`)
          canMove = true
          // Set climbing state - important to do it here for animation
          setIsClimbing(true)
        } else {
          console.log(`Cannot climb up - target position is not valid`)
          newLayer = layer // Reset to original layer
        }
      }

      // SECOND PRIORITY: Try to climb down stairs if there are stairs below
      if (!canMove && layer > 0) {
        // Check if there are stairs in the target position on the lower layer
        const lowerLayer = layer - 1
        const targetStairDirection = getStairDirection(newX, newY, lowerLayer)
        // Opposite direction = (direction + 3) % 6 for hexagonal grid
        const canStepDown =
          targetStairDirection !== null &&
          (targetStairDirection + 3) % 6 === direction

        if (canStepDown) {
          console.log(
            `Found stairs below at (${newX}, ${newY}, ${lowerLayer}), attempting to climb down`
          )
          // Try to climb down one layer diagonally
          newLayer = lowerLayer

          // Check if we can stand in the target position when climbing down
          if (canMoveToPosition(newX, newY, newLayer, worldData)) {
            console.log(`Climbing down to (${newX}, ${newY}, ${newLayer})`)
            canMove = true
            // Set climbing DOWN state for the animation
            setIsClimbingDown(true)
          } else {
            console.log(`Cannot climb down - target position is not valid`)
            newLayer = layer // Reset to original layer
          }
        }
      }

      // THIRD PRIORITY: Try normal horizontal movement if neither climbing up nor down worked
      if (!canMove) {
        console.log(
          `Attempting normal movement to (${newX}, ${newY}, ${layer})`
        )
        // Regular movement - check if we can move to the new position
        if (canMoveToPosition(newX, newY, layer, worldData)) {
          console.log(`Moving to (${newX}, ${newY}, ${layer})`)
          canMove = true
          newLayer = layer // Ensure we're using the original layer
        } else {
          console.log(
            `Movement blocked - cannot move to (${newX}, ${newY}, ${layer})`
          )
          canMove = false
        }
      }

      if (!canMove) {
        const currentPos = convertPosition(x, y, layer)
        setTargetPosition(currentPos)
        return prev
      }

      // Movement is possible, set the target position
      const newTilePos = convertPosition(newX, newY, newLayer)
      setTargetPosition(newTilePos)
      movementStateRef.current.movementInProgress = true

      return { ...prev, x: newX, y: newY, layer: newLayer }
    })

    // Return a promise that will resolve when movement completes
    return new Promise<void>((resolve) => {
      moveResolveRef.current = resolve
    })
  }, [isMoving, worldData, convertPosition, getStairDirection])

  const handleMoveComplete = useCallback(() => {
    // Reset all movement states
    setIsMoving(false)
    setTargetPosition(null)
    setIsClimbing(false)
    setIsClimbingDown(false)

    movementStateRef.current.movementRequested = false
    movementStateRef.current.movementInProgress = false

    // Resolve the promise
    resolvePendingMovement()
  }, [resolvePendingMovement])

  const resetCharacterPosition = useCallback(
    (position: GridPosition) => {
      // Clean up any in-progress movement
      resolvePendingMovement()

      // Reset state
      setCharacterPos(position)
      setTargetPosition(null)
      setForceUpdate(true)
      setIsMoving(false)
      setIsClimbing(false)
      setIsClimbingDown(false)

      movementStateRef.current.movementRequested = false
      movementStateRef.current.movementInProgress = false

      setTimeout(() => {
        setForceUpdate(false)
      }, 50)
    },
    [resolvePendingMovement]
  )

  return {
    characterPos,
    targetPosition,
    forceUpdate,
    isMoving,
    isClimbing,
    isClimbingDown,
    turnLeft,
    turnRight,
    moveForward,
    handleMoveComplete,
    resetCharacterPosition,
  }
}
