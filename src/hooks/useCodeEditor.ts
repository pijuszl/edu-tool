//useCodeEditor.ts
import { useState, useCallback } from 'react'
import {
  useGameCommands,
  useAddCommand,
  useAddManyCommands,
  useRemoveCommandAt,
  useClearCommands,
  useSetRunning,
  useGameRunning,
} from '../store/game-store'
import { DEFAULT_CODE } from '../config/game-config'
import { commandsToCode, parseCodeToCommands } from '../utils/codeParser'

type EditorMode = 'block' | 'code'

export const useCodeEditor = () => {
  const isRunning = useGameRunning()
  const commands = useGameCommands()
  const addCommand = useAddCommand()
  const addManyCommands = useAddManyCommands()
  const removeCommandAt = useRemoveCommandAt()
  const clearCommands = useClearCommands()
  const setRunning = useSetRunning()
  const [editorMode, setEditorMode] = useState<EditorMode>('block')
  const [code, setCode] = useState<string>('')

  const [showInvalidCodeDialog, setShowInvalidCodeDialog] = useState(false)
  const [pendingMode, setPendingMode] = useState<'block' | 'code' | null>(null)
  const [errorType, setErrorType] = useState<'run' | 'switch'>('run')

  const handleCodeChange = useCallback(
    (newCode: string | undefined) => {
      const validCode = newCode || ''
      setCode(validCode)
    },
    [setCode]
  )

  const handleModeChange = () => {
    const newMode = editorMode === 'block' ? 'code' : 'block'

    if (editorMode === 'code') {
      const { commands: newCommands, error } = parseCodeToCommands(code)

      if (error) {
        // If there's an execution error, show the dialog
        setErrorType('switch')
        setPendingMode(newMode)
        setShowInvalidCodeDialog(true)
        return
      }

      // If execution is successful, update commands and switch modes
      clearCommands()
      addManyCommands(newCommands)
      setEditorMode(newMode)
    } else {
      // When switching from block to code mode
      const newCode = commandsToCode(commands) || DEFAULT_CODE
      setCode(newCode)
      setEditorMode(newMode)
    }
  }

  const handleRunClick = () => {
    if (editorMode === 'code' && !isRunning) {
      const { commands: newCommands, error } = parseCodeToCommands(code)

      if (error) {
        // If there's an execution error, show a dialog
        setErrorType('run')
        setShowInvalidCodeDialog(true)
        return
      }

      // If execution is successful, update commands
      clearCommands()
      addManyCommands(newCommands)
    }

    // Toggle running state
    setRunning(!isRunning)
  }

  const handleInvalidCodeDialogConfirm = () => {
    setShowInvalidCodeDialog(false)

    if (pendingMode) {
      clearCommands()
      setEditorMode(pendingMode)
      setPendingMode(null)
    }
  }

  const handleInvalidCodeDialogCancel = () => {
    setShowInvalidCodeDialog(false)
    setPendingMode(null)
  }

  return {
    isRunning,
    commands,
    addCommand,
    addManyCommands,
    removeCommandAt,
    clearCommands,
    editorMode,
    code,
    handleCodeChange,
    handleModeChange,
    handleRunClick,
    showInvalidCodeDialog,
    handleInvalidCodeDialogConfirm,
    handleInvalidCodeDialogCancel,
    errorType,
  }
}
