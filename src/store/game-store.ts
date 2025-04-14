// src/store/game-store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { DEFAULT_CODE } from '../config/game-config'
import { Command } from '../types/editor-types'

type State = {
  commands: Command[]
  isRunning: boolean
  completedLevels: number[]
  unlockedLevels: number[]
  currentLevelIndex: number
}

type Actions = {
  addCommand: (command: Command) => void
  addManyCommands: (commands: Command[]) => void
  removeCommandAt: (index: number) => void
  clearCommands: () => void
  setRunning: (isProcessing: boolean) => void
  setCommands: (commands: Command[]) => void
  completeLevel: (levelIndex: number) => void
  unlockLevel: (levelIndex: number) => void
  setCurrentLevel: (levelIndex: number) => void
  resetGameState: () => void
}

const useGameStore = create<State & Actions>()(
  persist(
    (set) => ({
      commands: [],
      isRunning: false,
      completedLevels: [],
      unlockedLevels: [0],
      currentLevelIndex: 0,

      addCommand: (command: Command) =>
        set((state) => ({
          commands: [...state.commands, command],
        })),
      addManyCommands: (commands: Command[]) =>
        set((state) => ({
          commands: [...state.commands, ...commands],
        })),
      removeCommandAt: (index: number) =>
        set((state) => ({
          commands: state.commands.filter((_, i) => i !== index),
        })),
      clearCommands: () => set(() => ({ commands: [], code: DEFAULT_CODE })),
      setRunning: (isRunning: boolean) => set(() => ({ isRunning })),
      setCommands: (commands: Command[]) => set(() => ({ commands })),
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
        set(() => ({
          commands: [],
          code: DEFAULT_CODE,
          isRunning: false,
        })),
    }),
    {
      name: 'edu-game-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        completedLevels: state.completedLevels,
        unlockedLevels: state.unlockedLevels,
      }),
    }
  )
)

export const useGameRunning = () => useGameStore((state) => state.isRunning)
export const useGameCommands = () => useGameStore((state) => state.commands)
export const useAddCommand = () => useGameStore((state) => state.addCommand)
export const useAddManyCommands = () =>
  useGameStore((state) => state.addManyCommands)
export const useRemoveCommandAt = () =>
  useGameStore((state) => state.removeCommandAt)
export const useClearCommands = () =>
  useGameStore((state) => state.clearCommands)
export const useSetRunning = () => useGameStore((state) => state.setRunning)
export const useSetCommands = () => useGameStore((state) => state.setCommands)

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
