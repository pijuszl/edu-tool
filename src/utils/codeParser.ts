import { Command } from '../types/editor-types'

/**
 * Execute code and collect commands with timeout protection
 */
export const parseCodeToCommands = (
  code: string,
  maxCommands: number = 1000
): { commands: Command[]; error: string | null } => {
  const commands: Command[] = []

  const addCommand = (command: Command) => () => {
    if (commands.length >= maxCommands) {
      throw new Error(`Maximum command limit of ${maxCommands} reached.`)
    }
    commands.push(command)
  }

  try {
    new Function(code)

    const execFunction = new Function('forward', 'left', 'right', code)
    execFunction(addCommand('forward'), addCommand('left'), addCommand('right'))

    return { commands, error: null }
  } catch (e) {
    return {
      commands,
      error: e instanceof Error ? e.message : 'Unknown error occurred',
    }
  }
}

/**
 * Converts a command to JavaScript code
 */
export const commandToCode = (command: string): string => {
  return `${command}();`
}

/**
 * Converts an array of commands to JavaScript code
 */
export const commandsToCode = (commands: string[]): string => {
  return commands.map(commandToCode).join('\n')
}
