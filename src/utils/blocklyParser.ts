// src/components/CodeEditor/BlocklyUtils.ts
import * as Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'
import { Command } from '../types/editor-types'
import { parseCodeToCommands } from './codeParser'

/**
 * Maps a command string to its corresponding block type
 */
export const commandToBlockType = (command: string): string | null => {
  switch (command) {
    case 'forward':
      return 'move_forward'
    case 'left':
      return 'turn_left'
    case 'right':
      return 'turn_right'
    default:
      return null
  }
}

/**
 * Convert commands array to Blockly workspace
 */
export const commandsToBlocks = (
  workspace: Blockly.WorkspaceSvg,
  commands: string[]
): void => {
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
    const blockType = commandToBlockType(command)
    if (!blockType) return // Skip unknown commands

    // Create a new block
    const block = workspace.newBlock(blockType)
    ;(block as any).initSvg()
    block.moveBy(20, 20 + index * 40)
    blocks.push(block)
  })

  // Connect blocks after they're all created
  for (let i = 0; i < blocks.length - 1; i++) {
    if (blocks[i].nextConnection && blocks[i + 1].previousConnection) {
      blocks[i].nextConnection!.connect(blocks[i + 1].previousConnection!)
    }
  }

  // Render all blocks
  blocks.forEach((block) => {
    if (block.rendered === false) {
      ;(block as any).render()
    }
  })

  // Update the entire workspace to render all blocks
  workspace.render()

  // Center the view on the first block
  if (blocks.length > 0) {
    workspace.centerOnBlock(blocks[0].id)
  }

  workspace.setResizesEnabled(true)
}

/**
 * Extract commands from Blockly workspace
 */
export const blocksToCommands = (
  workspace: Blockly.WorkspaceSvg
): { commands: Command[]; error: string | null } => {
  try {
    // Generate JavaScript code from Blockly workspace
    const code = javascriptGenerator.workspaceToCode(workspace)

    // Parse the generated JavaScript to extract commands
    return parseCodeToCommands(code)
  } catch (e) {
    console.error('Error extracting commands from blocks:', e)
    return {
      commands: [],
      error: e instanceof Error ? e.message : 'Unknown error in Blockly code',
    }
  }
}

/**
 * Compare two arrays of commands for equality
 */
export const areCommandsEqual = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}
