// hooks/useCommandProcessor.ts
import { useEffect, useCallback, useRef } from 'react'
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
  initialPosition: GridPosition
) {
  const commands = useGameCommands()
  const isRunning = useGameRunning()
  const setRunning = useSetRunning()

  // Reference to track if we're currently processing commands
  const isProcessingRef = useRef(false)
  // Reference to track if execution should be cancelled
  const cancelExecutionRef = useRef(false)

  const processCommands = useCallback(async () => {
    // If already processing or no commands, exit early
    if (isProcessingRef.current || commands.length === 0) {
      isProcessingRef.current = false
      resetCharacterPosition(initialPosition)
      resetCollectables()
      setRunning(false)

      return
    }

    console.log('Starting command processing...')

    // Set processing flag and reset cancel flag
    isProcessingRef.current = true
    cancelExecutionRef.current = false

    // Reset character position and collectables
    resetCharacterPosition(initialPosition)
    resetCollectables()

    // Wait for the reset to be applied
    await new Promise((resolve) => setTimeout(resolve, 100))
    console.log('Starting command execution...')

    try {
      // Process each command sequentially
      for (let i = 0; i < commands.length; i++) {
        // Check if execution should be cancelled
        if (cancelExecutionRef.current) {
          console.log('Command execution cancelled')
          break
        }

        const command = commands[i]
        console.log(`Executing command: ${command}`)

        try {
          switch (command) {
            case 'forward':
              await moveForward()
              break
            case 'left':
              turnLeft()

              await new Promise((resolve) => setTimeout(resolve, 200))
              break
            case 'right':
              turnRight()

              await new Promise((resolve) => setTimeout(resolve, 200))
              break
          }
        } catch (error) {
          console.error(`Error executing command ${command}:`, error)
          break
        }

        // Check again if we should stop after each command
        if (cancelExecutionRef.current) {
          console.log('Command execution cancelled after command')
          break
        }
      }
    } catch (error) {
      console.error('Error in command processing:', error)
    } finally {
      // Always reset flags when done
      console.log('Command processing complete')
      isProcessingRef.current = false
      setRunning(false)
    }
  }, [
    commands,
    moveForward,
    turnLeft,
    turnRight,
    resetCharacterPosition,
    resetCollectables,
    initialPosition,
    setRunning,
  ])

  // Run commands when isRunning changes to true
  useEffect(() => {
    if (isRunning && !isProcessingRef.current) {
      processCommands()
    } else if (!isRunning && isProcessingRef.current) {
      cancelExecutionRef.current = true
    } else if (isRunning && isProcessingRef.current) {
      setRunning(false)
    }
  }, [isRunning])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelExecutionRef.current = true
      isProcessingRef.current = false
    }
  }, [])
}
