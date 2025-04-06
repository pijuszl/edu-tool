import { useState, useCallback, useRef } from 'react'
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

  const moveResolveRef = useRef<(() => void) | null>(null)

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
    if (!isMoving && worldData) {
      setIsMoving(true)
      setIsClimbing(false) // Reset climbing state by default

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
        let willClimb = false // Track if this will be a climbing movement

        if (onStairs) {
          console.log(
            `On stairs with direction ${stairDirection}, attempting to climb`
          )
          // Try to climb up one layer diagonally
          newLayer = layer + 1
          willClimb = true // This will be a climbing movement

          // Check if we can stand in the target position after climbing
          if (canMoveToPosition(newX, newY, newLayer, worldData)) {
            console.log(`Climbing to (${newX}, ${newY}, ${newLayer})`)
            canMove = true
            // Set climbing state - important to do it here for animation
            setIsClimbing(true)
          } else {
            console.log(`Cannot climb - target position is not valid`)
            newLayer = layer // Reset to original layer
            willClimb = false // No climbing will happen

            // Check if we can move horizontally (regular movement)
            if (canMoveToPosition(newX, newY, layer, worldData)) {
              console.log(`Moving horizontally to (${newX}, ${newY}, ${layer})`)
              canMove = true
            } else {
              console.log(
                `Cannot move horizontally - target position is not valid`
              )
              canMove = false
            }
          }
        } else {
          console.log(`Normal movement to (${newX}, ${newY}, ${layer})`)
          // Regular movement - check if we can move to the new position
          if (canMoveToPosition(newX, newY, layer, worldData)) {
            console.log(`Moving to (${newX}, ${newY}, ${layer})`)
            canMove = true
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

        const newTilePos = convertPosition(newX, newY, newLayer)
        setTargetPosition(newTilePos)

        return { ...prev, x: newX, y: newY, layer: newLayer }
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      return new Promise<void>((resolve) => {
        moveResolveRef.current = resolve
      })
    }

    return Promise.resolve()
  }, [isMoving, worldData, convertPosition, getStairDirection])

  const handleMoveComplete = useCallback(() => {
    setIsMoving(false)
    setTargetPosition(null)
    setIsClimbing(false) // Reset climbing state when movement completes

    if (moveResolveRef.current) {
      moveResolveRef.current()
      moveResolveRef.current = null
    }
  }, [])

  const resetCharacterPosition = useCallback((position: GridPosition) => {
    setCharacterPos(position)
    setTargetPosition(null)
    setForceUpdate(true)
    setIsClimbing(false)

    setTimeout(() => {
      setForceUpdate(false)
    }, 50)
  }, [])

  return {
    characterPos,
    targetPosition,
    forceUpdate,
    isClimbing,
    turnLeft,
    turnRight,
    moveForward,
    handleMoveComplete,
    resetCharacterPosition,
  }
}
