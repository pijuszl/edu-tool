// hooks/useCommandProcessor.ts
import { useEffect, useCallback } from 'react'
import { GridPosition, WorldData } from '../types/game-types'
import {
  useGameCommands,
  useGameRunning,
  useSetRunning,
} from '../store/game-store'

export function useCommandProcessor(
  moveForward: () => Promise<void>,
  turnLeft: () => void,
  turnRight: () => void,
  resetCharacterPosition: (position: GridPosition) => void,
  resetCollectables: () => void,
  initialPosition: GridPosition,
  worldData: WorldData | undefined
) {
  const commands = useGameCommands()
  const isRunning = useGameRunning()
  const setRunning = useSetRunning()

  const processCommands = useCallback(async () => {
    if (commands.length > 0 && isRunning) {
      console.log('Starting command processing...')

      // First, reset the character position
      const startLayer =
        worldData?.collectables?.[0]?.layer || initialPosition.layer
      const correctInitialPosition = {
        ...initialPosition,
        layer: startLayer,
      }

      resetCharacterPosition(correctInitialPosition)
      resetCollectables()

      // Wait for the force update to be applied
      await new Promise((resolve) => setTimeout(resolve, 100))
      console.log('Starting command execution...')

      // Now process the commands
      for (const command of commands) {
        console.log(`Executing command: ${command}`)

        switch (command) {
          case 'forward':
            await moveForward()
            // Add a brief delay between commands
            await new Promise((resolve) => setTimeout(resolve, 100))
            break
          case 'left':
            turnLeft()
            // Slight delay after rotation
            await new Promise((resolve) => setTimeout(resolve, 200))
            break
          case 'right':
            turnRight()
            // Slight delay after rotation
            await new Promise((resolve) => setTimeout(resolve, 200))
            break
        }
      }
      console.log('Command processing complete')
    }
  }, [
    commands,
    isRunning,
    moveForward,
    turnLeft,
    turnRight,
    resetCharacterPosition,
    resetCollectables,
    initialPosition,
    worldData,
  ])

  // Run commands when isRunning changes
  useEffect(() => {
    const runCommands = async () => {
      if (isRunning) {
        await processCommands()
        setRunning(false)
      }
    }
    runCommands()
  }, [isRunning])

  return { processCommands }
}
