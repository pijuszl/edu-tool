// src/store/game-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_CODE } from '../config/game-config'

type Command = 'forward' | 'left' | 'right'
type EditorMode = 'block' | 'code'

type State = {
  commands: Command[]
  isRunning: boolean
  editorMode: EditorMode
  code: string
  completedLevels: number[]
  unlockedLevels: number[]
  currentLevelIndex: number
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
  completeLevel: (levelIndex: number) => void
  unlockLevel: (levelIndex: number) => void
  setCurrentLevel: (levelIndex: number) => void
  resetGameState: () => void
}

// Helper function to parse code and extract valid commands
const parseCodeToCommands = (code: string): Command[] => {
  try {
    // Basic syntax validation
    new Function(code)

    return code
      .split('\n')
      .filter((line) => line.includes('(') && line.includes(')'))
      .map((line) => line.split('(')[0].trim())
      .filter((cmd) => ['forward', 'left', 'right'].includes(cmd)) as Command[]
  } catch (e) {
    return []
  }
}

const useGameStore = create<State & Actions>()(
  persist(
    (set) => ({
      commands: [],
      isRunning: false,
      editorMode: 'block',
      code: DEFAULT_CODE,
      completedLevels: [],
      unlockedLevels: [0],
      currentLevelIndex: 0,

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
      },
      completeLevel: (levelIndex: number) =>
        set((state) => {
          const newCompletedLevels = [...state.completedLevels]
          if (!newCompletedLevels.includes(levelIndex)) {
            newCompletedLevels.push(levelIndex)
          }
          return { completedLevels: newCompletedLevels }
        }),
      unlockLevel: (levelIndex: number) =>
        set((state) => {
          const newUnlockedLevels = [...state.unlockedLevels]
          if (!newUnlockedLevels.includes(levelIndex)) {
            newUnlockedLevels.push(levelIndex)
          }
          return { unlockedLevels: newUnlockedLevels }
        }),
      setCurrentLevel: (levelIndex: number) =>
        set(() => ({ currentLevelIndex: levelIndex })),
      resetGameState: () =>
        set((state) => ({
          commands: [],
          code: DEFAULT_CODE,
          isRunning: false,
        })),
    }),
    {
      name: 'edu-game-storage',
      partialize: (state) => ({
        completedLevels: state.completedLevels,
        unlockedLevels: state.unlockedLevels,
      }),
    }
  )
)

// Existing exports
export const useGameRunning = () => useGameStore((state) => state.isRunning)
export const useGameCommands = () => useGameStore((state) => state.commands)
export const useAddCommand = () => useGameStore((state) => state.addCommand)
export const useRemoveCommandAt = () =>
  useGameStore((state) => state.removeCommandAt)
export const useClearCommands = () =>
  useGameStore((state) => state.clearCommands)
export const useSetRunning = () => useGameStore((state) => state.setRunning)
export const useEditorMode = () => useGameStore((state) => state.editorMode)
export const useSetEditorMode = () =>
  useGameStore((state) => state.setEditorMode)
export const useCode = () => useGameStore((state) => state.code)
export const useSetCode = () => useGameStore((state) => state.setCode)
export const useSetCommands = () => useGameStore((state) => state.setCommands)
export const useParseAndSetCommandsFromCode = () =>
  useGameStore((state) => state.parseAndSetCommandsFromCode)

// New exports for level functionality
export const useCompletedLevels = () =>
  useGameStore((state) => state.completedLevels)
export const useUnlockedLevels = () =>
  useGameStore((state) => state.unlockedLevels)
export const useCurrentLevelIndex = () =>
  useGameStore((state) => state.currentLevelIndex)
export const useCompleteLevel = () =>
  useGameStore((state) => state.completeLevel)
export const useUnlockLevel = () => useGameStore((state) => state.unlockLevel)
export const useSetCurrentLevel = () =>
  useGameStore((state) => state.setCurrentLevel)
export const useResetGameState = () =>
  useGameStore((state) => state.resetGameState)
