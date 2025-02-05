import { create } from 'zustand'

type Command = 'forward' | 'left' | 'right'

interface GameState {
  commands: Command[]
  isProcessing: boolean
  actions: {
    addCommand: (command: Command) => void
    clearCommands: () => void
    setProcessing: (isProcessing: boolean) => void
  }
}

const useGameStore = create<GameState>((set) => ({
  commands: [],
  isProcessing: false,
  actions: {
    addCommand: (command) => set((state) => ({
      commands: [...state.commands, command]
    })),
    clearCommands: () => set({ commands: [] }),
    setProcessing: (isProcessing) => set({ isProcessing })
  }
}))

export const useGameActions = () => useGameStore((state) => state.actions)
export const useGameCommands = () => useGameStore((state) => state.commands)
export const useGameProcessing = () => useGameStore((state) => state.isProcessing)