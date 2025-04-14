// src/components/CodeEditor/BlockEditor.tsx
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { Box, Typography, Alert, Button } from '@mui/material'
import * as Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'
import { Command } from '../../types/game-types'
import { parseCodeToCommands } from '../../utils/codeParser'

interface BlockEditorProps {
  commands: string[]
  onSyncCommands: (commands: Command[]) => void
  disabled: boolean
}

// Add this interface for the ref
export interface BlockEditorRef {
  applyChanges: () => void
}

const MAX_BLOCKS = 50 // Maximum number of blocks allowed

// Define custom blocks for the game commands
const defineCustomBlocks = () => {
  // Move Forward block
  Blockly.Blocks['move_forward'] = {
    init: function () {
      this.appendDummyInput().appendField('Eiti Pirmyn')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(120) // Green
      this.setTooltip('Judinti veikėją pirmyn')
    },
  }

  // Turn Left block
  Blockly.Blocks['turn_left'] = {
    init: function () {
      this.appendDummyInput().appendField('Sukti į kairę')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230) // Blue
      this.setTooltip('Sukti veikėją į kairę')
    },
  }

  // Turn Right block
  Blockly.Blocks['turn_right'] = {
    init: function () {
      this.appendDummyInput().appendField('Sukti į dešinę')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230) // Blue
      this.setTooltip('Sukti veikėją į dešinę')
    },
  }

  // Define JavaScript generators
  javascriptGenerator.forBlock['move_forward'] = function () {
    return 'forward();\n'
  }

  javascriptGenerator.forBlock['turn_left'] = function () {
    return 'left();\n'
  }

  javascriptGenerator.forBlock['turn_right'] = function () {
    return 'right();\n'
  }
}

// Create toolbox configuration
const createToolbox = () => {
  return {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Movement',
        colour: '120',
        expanded: true, // Keep this category expanded
        contents: [
          { kind: 'block', type: 'move_forward' },
          { kind: 'block', type: 'turn_left' },
          { kind: 'block', type: 'turn_right' },
        ],
      },
      {
        kind: 'category',
        name: 'Loops',
        colour: '290',
        expanded: true, // Keep this category expanded
        contents: [
          {
            kind: 'block',
            type: 'controls_repeat_ext',
            inputs: {
              TIMES: {
                shadow: {
                  type: 'math_number',
                  fields: { NUM: 5 },
                },
              },
            },
          },
          {
            kind: 'block',
            type: 'controls_for',
            inputs: {
              FROM: {
                shadow: {
                  type: 'math_number',
                  fields: { NUM: 1 },
                },
              },
              TO: {
                shadow: {
                  type: 'math_number',
                  fields: { NUM: 10 },
                },
              },
              BY: {
                shadow: {
                  type: 'math_number',
                  fields: { NUM: 1 },
                },
              },
            },
          },
          { kind: 'block', type: 'controls_whileUntil' },
        ],
      },
      {
        kind: 'category',
        name: 'Logic',
        colour: '210',
        expanded: true, // Keep this category expanded
        contents: [
          { kind: 'block', type: 'controls_if' },
          { kind: 'block', type: 'logic_compare' },
          { kind: 'block', type: 'logic_operation' },
        ],
      },
      {
        kind: 'category',
        name: 'Math',
        colour: '230',
        expanded: true, // Keep this category expanded
        contents: [
          { kind: 'block', type: 'math_number' },
          { kind: 'block', type: 'math_arithmetic' },
        ],
      },
      {
        kind: 'category',
        name: 'Variables',
        custom: 'VARIABLE',
        colour: '330',
        expanded: true, // Keep this category expanded
      },
    ],
  }
}

/**
 * Convert commands array to Blockly workspace
 */
const commandsToBlocks = (
  workspace: Blockly.WorkspaceSvg,
  commands: string[]
) => {
  try {
    // Clear the workspace - suppress events to avoid recursion
    workspace.setResizesEnabled(false)
    workspace.clear()

    if (commands.length === 0) {
      workspace.setResizesEnabled(true)
      return
    }

    // Create disconnected blocks first
    const blocks: Blockly.Block[] = []

    commands.forEach((command, index) => {
      // Map command to block type
      let blockType: string
      switch (command) {
        case 'forward':
          blockType = 'move_forward'
          break
        case 'left':
          blockType = 'turn_left'
          break
        case 'right':
          blockType = 'turn_right'
          break
        default:
          return // Skip unknown commands
      }

      // Create a new block
      const block = workspace.newBlock(blockType)
      block.initSvg()
      block.moveBy(20, 20 + index * 40)
      blocks.push(block)
    })

    // Connect blocks after they're all created
    for (let i = 0; i < blocks.length - 1; i++) {
      if (blocks[i].nextConnection && blocks[i + 1].previousConnection) {
        blocks[i].nextConnection!.connect(blocks[i + 1].previousConnection!)
      }
    }

    // Render the workspace
    workspace.render()

    // Center the view on the first block
    if (blocks.length > 0) {
      workspace.centerOnBlock(blocks[0].id)
    }

    workspace.setResizesEnabled(true)
  } catch (e) {
    console.error('Error converting commands to blocks:', e)
    workspace.setResizesEnabled(true)
  }
}

// Compare two arrays of commands for equality
const areCommandsEqual = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

const BlockEditor = forwardRef<BlockEditorRef, BlockEditorProps>(
  ({ commands, onSyncCommands, disabled }, ref) => {
    const blocklyDiv = useRef<HTMLDivElement>(null)
    const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)
    const [blockCount, setBlockCount] = useState(0)
    const [blockLimitWarning, setBlockLimitWarning] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [localCommands, setLocalCommands] = useState<string[]>([])

    // Use refs to track state to prevent race conditions
    const isUpdatingRef = useRef(false)
    const isDraggingRef = useRef(false)
    const resizeObserverRef = useRef<ResizeObserver | null>(null)
    const pendingUpdateRef = useRef(false)
    const updateTimeoutRef = useRef<number | null>(null)

    // Initialize local commands from props
    useEffect(() => {
      setLocalCommands([...commands])
    }, [])

    // Function to get commands from workspace
    const getCommandsFromWorkspace = (): Command[] => {
      if (!workspaceRef.current) return []

      try {
        // Generate JavaScript code from Blockly workspace
        const code = javascriptGenerator.workspaceToCode(workspaceRef.current)

        // Parse the generated JavaScript to extract commands
        const { commands: extractedCommands, error: parseError } =
          parseCodeToCommands(code)

        if (parseError) {
          setError(parseError)
          return []
        }

        return extractedCommands
      } catch (e) {
        console.error('Error getting commands from workspace:', e)
        setError(
          e instanceof Error ? e.message : 'Unknown error in Blockly code'
        )
        return []
      }
    }

    // Function to safely update local commands
    const updateLocalCommands = () => {
      if (isDraggingRef.current || isUpdatingRef.current) {
        pendingUpdateRef.current = true
        return
      }

      if (!workspaceRef.current || disabled) {
        pendingUpdateRef.current = false
        return
      }

      try {
        isUpdatingRef.current = true
        pendingUpdateRef.current = false

        const newCommands = getCommandsFromWorkspace()

        // Check block limit
        if (blockCount > MAX_BLOCKS) {
          setError(`Too many blocks! Maximum allowed is ${MAX_BLOCKS}.`)
          isUpdatingRef.current = false
          return
        }

        // Clear any previous errors
        setError(null)

        // Only update if commands have changed
        if (!areCommandsEqual(newCommands as string[], localCommands)) {
          setLocalCommands(newCommands as string[])
        }
      } catch (e) {
        console.error('Error updating local commands:', e)
        setError(
          e instanceof Error ? e.message : 'Unknown error in Blockly code'
        )
      } finally {
        isUpdatingRef.current = false

        // If we have a pending update, process it
        if (pendingUpdateRef.current) {
          setTimeout(updateLocalCommands, 100)
        }
      }
    }

    // Function to apply changes to the global state
    const applyChangesToGlobalState = () => {
      if (disabled) return

      const newCommands = getCommandsFromWorkspace()
      if (newCommands.length === 0 && error) return

      // Only update if commands have actually changed
      if (!areCommandsEqual(newCommands as string[], commands)) {
        onSyncCommands(newCommands)
      }
    }

    useImperativeHandle(ref, () => ({
      applyChanges: applyChangesToGlobalState,
    }))

    // Function to keep the toolbox open
    const keepToolboxOpen = () => {
      if (workspaceRef.current && workspaceRef.current.getToolbox()) {
        const toolbox = workspaceRef.current.getToolbox()

        // For flyout-based toolboxes
        if (toolbox?.getFlyout && typeof toolbox.getFlyout === 'function') {
          const flyout = toolbox.getFlyout()
          if (flyout) {
            // Disable auto-close behavior
            flyout.autoClose = false
          }
        }
      }
    }

    // Initialize Blockly
    useEffect(() => {
      if (!blocklyDiv.current) return

      // Define custom blocks
      defineCustomBlocks()

      // Configure the toolbox
      const toolbox = createToolbox()

      try {
        // Create a new workspace
        workspaceRef.current = Blockly.inject(blocklyDiv.current, {
          toolbox,
          trashcan: false,
          scrollbars: true,
          horizontalLayout: false,
          sounds: false,
          move: {
            drag: true,
          },
          zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2,
          },
          grid: {
            spacing: 20,
            length: 3,
            colour: '#ccc',
            snap: true,
          },
          theme: Blockly.Theme.defineTheme('gameTheme', {
            base: Blockly.Themes.Classic,
            name: 'gameTheme',
            componentStyles: {
              workspaceBackgroundColour: '#f5f5f5',
              toolboxBackgroundColour: '#e0e0e0',
              toolboxForegroundColour: '#333',
              flyoutBackgroundColour: '#eee',
              flyoutForegroundColour: '#333',
              flyoutOpacity: 0.9,
              scrollbarColour: '#ccc',
              scrollbarOpacity: 0.8,
            },
          }),
        })

        // Keep the toolbox open initially
        setTimeout(keepToolboxOpen, 100)

        // Monitor drag start/end to prevent updates during drag
        workspaceRef.current.addChangeListener((e: Blockly.Events.Abstract) => {
          if (e.type === Blockly.Events.BLOCK_DRAG) {
            const dragEvent = e as Blockly.Events.BlockDrag
            isDraggingRef.current = dragEvent.isStart || false

            // If drag ended, check for pending updates
            if (!dragEvent.isStart && pendingUpdateRef.current) {
              setTimeout(updateLocalCommands, 100)
            }
          }
        })

        // Handle toolbox item selection to keep it open
        workspaceRef.current.addChangeListener((e: Blockly.Events.Abstract) => {
          if (e.type === Blockly.Events.TOOLBOX_ITEM_SELECT) {
            setTimeout(keepToolboxOpen, 0)
          }
        })

        // Handle block changes
        workspaceRef.current.addChangeListener((e: Blockly.Events.Abstract) => {
          if (disabled || isUpdatingRef.current || isDraggingRef.current) return

          // Only process events that change the blocks
          if (
            e.type === Blockly.Events.BLOCK_CREATE ||
            e.type === Blockly.Events.BLOCK_DELETE ||
            e.type === Blockly.Events.BLOCK_CHANGE ||
            e.type === Blockly.Events.BLOCK_MOVE
          ) {
            // Update block count
            if (workspaceRef.current) {
              const count = workspaceRef.current.getAllBlocks(false).length
              setBlockCount(count)
              setBlockLimitWarning(count >= MAX_BLOCKS)
            }

            // Debounce updates
            if (updateTimeoutRef.current) {
              clearTimeout(updateTimeoutRef.current)
            }

            pendingUpdateRef.current = true
            updateTimeoutRef.current = setTimeout(() => {
              updateLocalCommands()
            }, 300)
          }
        })

        // Set up resize observer for responsive behavior
        if (blocklyDiv.current) {
          resizeObserverRef.current = new ResizeObserver(() => {
            if (workspaceRef.current) {
              setTimeout(() => {
                Blockly.svgResize(workspaceRef.current!)
              }, 10)
            }
          })

          resizeObserverRef.current.observe(blocklyDiv.current)
        }

        // Initialize blocks from commands
        if (commands.length > 0) {
          isUpdatingRef.current = true
          commandsToBlocks(workspaceRef.current, commands)
          setLocalCommands([...commands])
          isUpdatingRef.current = false
        }
      } catch (error) {
        console.error('Error initializing Blockly:', error)
        setError('Failed to initialize block editor. Please try reloading.')
      }

      return () => {
        // Clean up
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current)
        }

        if (resizeObserverRef.current && blocklyDiv.current) {
          resizeObserverRef.current.unobserve(blocklyDiv.current)
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
    }, [])

    // Watch for command changes from outside
    useEffect(() => {
      // Skip if we're currently updating commands from blocks
      if (isUpdatingRef.current || isDraggingRef.current) return

      // Only update the workspace if commands actually changed
      if (!areCommandsEqual(commands, localCommands) && workspaceRef.current) {
        isUpdatingRef.current = true
        try {
          commandsToBlocks(workspaceRef.current, commands)
          setLocalCommands([...commands])
        } catch (e) {
          console.error('Error updating blocks from commands:', e)
        } finally {
          isUpdatingRef.current = false
        }
      }
    }, [commands])

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            mb: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="textSecondary">
            Block Editor ({blockCount}/{MAX_BLOCKS} blocks)
          </Typography>
        </Box>

        {blockLimitWarning && (
          <Alert severity="warning" sx={{ mb: 1 }}>
            Block limit reached! Maximum {MAX_BLOCKS} blocks allowed.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box
          ref={blocklyDiv}
          sx={{
            flex: 1,
            border: '1px solid #ddd',
            borderRadius: '4px',
            overflow: 'hidden',
            mb: 1,
            minHeight: '300px',
            width: '100%',
          }}
        />
      </Box>
    )
  }
)

export default BlockEditor
