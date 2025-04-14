// src/components/CodeEditor/useBlocklyWorkspace.ts
import { useRef, useState, useEffect } from 'react'
import * as Blockly from 'blockly'
import { Command } from '../types/game-types'
import {
  defineCustomBlocks,
  createToolbox,
  createBlocklyOptions,
} from '../config/blockly-config'
import {
  blocksToCommands,
  commandsToBlocks,
  areCommandsEqual,
} from '../utils/blocklyParser'

export interface UseBlocklyWorkspaceProps {
  initialCommands: string[]
  containerRef: React.RefObject<HTMLDivElement>
  disabled: boolean
  maxBlocks: number
}

export interface UseBlocklyWorkspaceReturn {
  workspace: Blockly.WorkspaceSvg | null
  localCommands: Command[]
  blockCount: number
  isBlockLimitReached: boolean
  error: string | null
  syncFromExternalCommands: (commands: string[]) => void
  getCommandsFromWorkspace: () => Command[]
  applyChanges: () => void
  clearError: () => void
}

export const useBlocklyWorkspace = ({
  initialCommands,
  containerRef,
  disabled,
  maxBlocks,
}: UseBlocklyWorkspaceProps): UseBlocklyWorkspaceReturn => {
  // Refs and state
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const [blockCount, setBlockCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [localCommands, setLocalCommands] = useState<Command[]>([])

  // State tracking refs to prevent race conditions
  const isUpdatingRef = useRef(false)
  const isDraggingRef = useRef(false)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  // Initialize Blockly
  useEffect(() => {
    if (!containerRef.current) return

    try {
      // Define custom blocks
      defineCustomBlocks()

      // Configure the toolbox
      const toolbox = createToolbox()

      // Create a new workspace
      workspaceRef.current = Blockly.inject(
        containerRef.current,
        createBlocklyOptions(toolbox)
      )

      // Initialize with commands
      if (initialCommands.length > 0 && workspaceRef.current) {
        isUpdatingRef.current = true
        try {
          commandsToBlocks(workspaceRef.current, initialCommands)
          // Initialize local commands
          setLocalCommands(initialCommands as Command[])
        } finally {
          isUpdatingRef.current = false
        }
      }

      // Set up event handlers
      setupWorkspaceEvents()

      // Set up resize observer for responsive behavior
      setupResizeObserver()

      // Get initial block count
      updateBlockCount()
    } catch (error) {
      console.error('Error initializing Blockly:', error)
      setError('Failed to initialize block editor. Please try reloading.')
    }

    return () => {
      cleanupWorkspace()
    }
  }, [])

  // Set up Blockly workspace events
  const setupWorkspaceEvents = () => {
    if (!workspaceRef.current) return

    workspaceRef.current.addChangeListener((e: Blockly.Events.Abstract) => {
      // Handle drag events
      if (e.type === Blockly.Events.BLOCK_DRAG) {
        const dragEvent = e as Blockly.Events.BlockDrag
        isDraggingRef.current = dragEvent.isStart || false
      }

      // Handle block changes (only when not disabled, updating, or dragging)
      if (
        !disabled &&
        !isUpdatingRef.current &&
        !isDraggingRef.current &&
        (e.type === Blockly.Events.BLOCK_CREATE ||
          e.type === Blockly.Events.BLOCK_DELETE ||
          e.type === Blockly.Events.BLOCK_CHANGE ||
          e.type === Blockly.Events.BLOCK_MOVE)
      ) {
        // Update block count
        updateBlockCount()

        // Update local commands
        updateLocalCommands()
      }
    })
  }

  // Set up resize observer for responsive behavior
  const setupResizeObserver = () => {
    if (!containerRef.current) return

    resizeObserverRef.current = new ResizeObserver(() => {
      if (workspaceRef.current) {
        // Add a slight delay to ensure dimensions have settled
        setTimeout(() => {
          Blockly.svgResize(workspaceRef.current!)
        }, 10)
      }
    })

    resizeObserverRef.current.observe(containerRef.current)
  }

  // Update block count from workspace
  const updateBlockCount = () => {
    if (!workspaceRef.current) return

    const count = workspaceRef.current.getAllBlocks(false).length
    setBlockCount(count)
  }

  // Update local commands without updating global store
  const updateLocalCommands = () => {
    if (!workspaceRef.current) return

    const { commands, error: extractError } = blocksToCommands(
      workspaceRef.current
    )

    if (extractError) {
      setError(extractError)
      return
    }

    // Only update if commands have changed
    if (!areCommandsEqual(commands as string[], localCommands as string[])) {
      setLocalCommands(commands)
    }

    // Check block limit
    if (blockCount > maxBlocks) {
      setError(`Too many blocks! Maximum allowed is ${maxBlocks}.`)
    } else {
      // Clear error if no longer at block limit
      if (error && error.includes('Too many blocks')) {
        setError(null)
      }
    }
  }

  // Clean up workspace on unmount
  const cleanupWorkspace = () => {
    if (resizeObserverRef.current && containerRef.current) {
      resizeObserverRef.current.unobserve(containerRef.current)
      resizeObserverRef.current.disconnect()
    }

    if (workspaceRef.current) {
      try {
        workspaceRef.current.dispose()
      } catch (e) {
        console.error('Error disposing workspace:', e)
      }
    }
  }

  // Sync workspace with external commands (e.g., when switching from code mode)
  const syncFromExternalCommands = (commands: string[]) => {
    if (!workspaceRef.current) return

    isUpdatingRef.current = true
    try {
      // Only update if commands have actually changed
      if (!areCommandsEqual(commands, localCommands as string[])) {
        commandsToBlocks(workspaceRef.current, commands)
        setLocalCommands(commands as Command[])
        updateBlockCount()
      }
    } catch (e) {
      console.error('Error syncing from external commands:', e)
      setError('Failed to update blocks from commands.')
    } finally {
      isUpdatingRef.current = false
    }
  }

  // Get the current commands from the workspace
  const getCommandsFromWorkspace = (): Command[] => {
    if (!workspaceRef.current) return []

    const { commands, error: extractError } = blocksToCommands(
      workspaceRef.current
    )

    if (extractError) {
      setError(extractError)
      return []
    }

    return commands
  }

  // Apply changes manually (for UI button)
  const applyChanges = () => {
    if (!workspaceRef.current || disabled) return
    updateLocalCommands()
  }

  // Clear any error
  const clearError = () => {
    setError(null)
  }

  return {
    workspace: workspaceRef.current,
    localCommands,
    blockCount,
    isBlockLimitReached: blockCount >= maxBlocks,
    error,
    syncFromExternalCommands,
    getCommandsFromWorkspace,
    applyChanges,
    clearError,
  }
}
