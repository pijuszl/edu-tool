// src/store/game-store.ts
import { create } from 'zustand'

type Command = 'forward' | 'left' | 'right'
type EditorMode = 'block' | 'code'

type State = {
  commands: Command[]
  isRunning: boolean
  editorMode: EditorMode
  code: string
}

type Actions = {
  addCommand: (command: Command) => void
  removeCommandAt: (index: number) => void
  clearCommands: () => void
  setRunning: (isProcessing: boolean) => void
  setEditorMode: (mode: EditorMode) => void
  setCode: (code: string) => void
  setCommands: (commands: Command[]) => void
  parseAndSetCommandsFromCode: (code: string) => boolean
}

const DEFAULT_CODE = `// Write your code here
// Use commands: forward(), left(), right()`

// Helper function to parse code and extract valid commands
const parseCodeToCommands = (code: string): Command[] => {
  try {
    // Basic syntax validation
    new Function(code)
    
    return code
      .split('\n')
      .filter(line => line.includes('(') && line.includes(')'))
      .map(line => line.split('(')[0].trim())
      .filter(cmd => ['forward', 'left', 'right'].includes(cmd)) as Command[]
  } catch (e) {
    return []
  }
}

const useGameStore = create<State & Actions>((set) => ({
  commands: [],
  isRunning: false,
  editorMode: 'block',
  code: DEFAULT_CODE,
  addCommand: (command: Command) =>
    set((state) => ({
      commands: [...state.commands, command],
    })),
  removeCommandAt: (index: number) =>
    set((state) => ({
      commands: state.commands.filter((_, i) => i !== index),
    })),
  clearCommands: () => set(() => ({ commands: [], code: DEFAULT_CODE })),
  setRunning: (isRunning: boolean) => set(() => ({ isRunning })),
  setEditorMode: (mode: EditorMode) => set(() => ({ editorMode: mode })),
  setCode: (code: string) => set(() => ({ code })),
  setCommands: (commands: Command[]) => set(() => ({ commands })),
  parseAndSetCommandsFromCode: (code: string) => {
    try {
      new Function(code) // Validate syntax
      const commands = parseCodeToCommands(code)
      set(() => ({ commands }))
      return true
    } catch (e) {
      return false
    }
  }
}))

export const useGameRunning = () => useGameStore((state) => state.isRunning)
export const useGameCommands = () => useGameStore((state) => state.commands)
export const useAddCommand = () => useGameStore((state) => state.addCommand)
export const useRemoveCommandAt = () => useGameStore((state) => state.removeCommandAt)
export const useClearCommands = () => useGameStore((state) => state.clearCommands)
export const useSetRunning = () => useGameStore((state) => state.setRunning)
export const useEditorMode = () => useGameStore((state) => state.editorMode)
export const useSetEditorMode = () => useGameStore((state) => state.setEditorMode)
export const useCode = () => useGameStore((state) => state.code)
export const useSetCode = () => useGameStore((state) => state.setCode)
export const useSetCommands = () => useGameStore((state) => state.setCommands)
export const useParseAndSetCommandsFromCode = () => useGameStore((state) => state.parseAndSetCommandsFromCode)