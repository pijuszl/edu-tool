import { useEffect, useState } from 'react'
import { useGameActions, useGameCommands } from '../store/gameStore'
import { GridPosition, Direction, Command } from '../types/game'
import { DIRECTIONS_EVEN, DIRECTIONS_ODD } from '../utils/hexUtils'
import * as THREE from 'three'
import { HexagonMetrics } from '../types/game'

interface UseCommandHandlerProps {
  initialPosition: GridPosition
  worldData: number[][]
}

export const useCommandHandler = ({
  initialPosition,
  worldData,
}: UseCommandHandlerProps) => {
  const [position, setPosition] = useState(initialPosition)
  const [direction, setDirection] = useState(0)
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(
    null
  )
  const commands = useGameCommands()
  const { clearCommands, setProcessing } = useGameActions()

  const getNewPosition = (current: GridPosition, dir: number): GridPosition => {
    const directions = current.i % 2 === 0 ? DIRECTIONS_EVEN : DIRECTIONS_ODD
    const delta = directions[dir]
    return { i: current.i + delta.di, j: current.j + delta.dj }
  }

  const getPositionFromGrid = (
    position: GridPosition,
    metrics: HexagonMetrics | null
  ): THREE.Vector3 => {
    if (!metrics) return new THREE.Vector3() // Fallback for null case

    const x =
      position.j * metrics.horizontalSpacing +
      (position.i % 2 === 1 ? metrics.horizontalSpacing / 2 : 0)
    const z = position.i * metrics.verticalSpacing

    return new THREE.Vector3(x, metrics.topSurfaceHeight, z)
  }

  const isValidPosition = (pos: GridPosition): boolean => {
    return (
      pos.i >= 0 &&
      pos.j >= 0 &&
      pos.i < worldData.length &&
      pos.j < worldData[pos.i]?.length &&
      worldData[pos.i][pos.j] === 1
    )
  }

  const processCommand = async (command: Command) => {
    setProcessing(true)

    switch (command) {
      case 'left':
        setDirection((prev) => (prev + 5) % 6)
        await new Promise((resolve) => setTimeout(resolve, 300))
        break

      case 'right':
        setDirection((prev) => (prev + 1) % 6)
        await new Promise((resolve) => setTimeout(resolve, 300))
        break

      case 'forward':
        const newPos = getNewPosition(position, direction)
        if (isValidPosition(newPos)) {
          setTargetPosition(getPositionFromGrid(newPos, metrics))
          await new Promise((resolve) => setTimeout(resolve, 500))
          setPosition(newPos)
        }
        break
    }

    setProcessing(false)
  }

  useEffect(() => {
    const executeCommands = async () => {
      for (const command of commands) {
        await processCommand(command)
      }
      clearCommands()
    }

    if (commands.length > 0) {
      executeCommands()
    }
  }, [commands])

  return { position, direction, targetPosition }
}
