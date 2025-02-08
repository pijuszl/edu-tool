import { create } from 'zustand'

type Command = 'forward' | 'left' | 'right'

type State = {
  commands: Command[]
  isRunning: boolean
}
type Actions = {
  addCommand: (command: Command) => void
  clearCommands: () => void
  setRunning: (isProcessing: boolean) => void
}

const useGameStore = create<State & Actions>((set) => ({
  commands: [],
  isRunning: false,
  addCommand: (command: Command) =>
    set((state) => ({
      commands: [...state.commands, command],
    })),
  clearCommands: () => set(() => ({ commands: [] })),
  setRunning: (isRunning: boolean) => set(() => ({ isRunning: isRunning })),
}))

export const useGameRunning = () => useGameStore((state) => state.isRunning)
export const useGameCommands = () => useGameStore((state) => state.commands)
export const useAddCommand = () => useGameStore((state) => state.addCommand)
export const useClearCommands = () =>
  useGameStore((state) => state.clearCommands)
export const useSetRunning = () => useGameStore((state) => state.setRunning)
