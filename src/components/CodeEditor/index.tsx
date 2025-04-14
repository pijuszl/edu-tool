// src/components/CodeEditor/index.tsx
import React, { useRef } from 'react'
import { Box, Paper } from '@mui/material'
import { useCodeEditor } from '../../hooks/useCodeEditor'
import EditorModeToggle from './EditorModeToggle'
import BlockEditor from './BlockEditor'
import CodeTextEditor from './CodeTextEditor'
import EditorControls from './EditorControls'
import InvalidCodeDialog from './InvalidCodeDialog'
import { Command } from '../../types/game-types'

interface CodeEditorProps {
  width: number
  isDragging: boolean
}

export interface BlockEditorRef {
  applyChanges: () => void
}

const CodeEditor: React.FC<CodeEditorProps> = ({ width, isDragging }) => {
  const blockEditorRef = useRef<BlockEditorRef>(null)

  const {
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
  } = useCodeEditor()

  const handleSyncCommands = (newCommands: Command[]) => {
    clearCommands()
    addManyCommands(newCommands)
  }

  const handleModeChangeWithApply = () => {
    // Apply BlockEditor changes first if we're in block mode
    if (editorMode === 'block' && blockEditorRef.current) {
      console.log('Applying changes from BlockEditor')
      blockEditorRef.current.applyChanges()
    }

    handleModeChange()
  }

  const handleRunWithApply = () => {
    // Apply BlockEditor changes first if we're in block mode
    if (editorMode === 'block' && blockEditorRef.current) {
      blockEditorRef.current.applyChanges()
    }
    handleRunClick()
  }

  const handleClearWithApply = () => {
    // Apply BlockEditor changes first if we're in block mode
    if (editorMode === 'block' && blockEditorRef.current) {
      blockEditorRef.current.applyChanges()
    }
    
    clearCommands()
  }

  return (
    <Paper
      sx={{
        height: '100%',
        p: 2,
        width: `${width}%`,
        transition: isDragging ? 'none' : 'width 0.3s',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <EditorModeToggle
          isCodeMode={editorMode === 'code'}
          onToggle={handleModeChangeWithApply}
          disabled={isRunning}
        />
      </Box>

      <Box
        sx={{
          height: 'calc(100% - 40px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {editorMode === 'code' ? (
          <CodeTextEditor code={code} onChange={handleCodeChange} />
        ) : (
          <BlockEditor
            ref={blockEditorRef}
            commands={commands}
            onSyncCommands={handleSyncCommands}
            disabled={isRunning}
          />
        )}

        <EditorControls
          onRun={handleRunWithApply}
          onClear={handleClearWithApply}
          isRunning={isRunning}
        />
      </Box>

      <InvalidCodeDialog
        open={showInvalidCodeDialog}
        onConfirm={handleInvalidCodeDialogConfirm}
        onCancel={handleInvalidCodeDialogCancel}
        type={errorType}
      />
    </Paper>
  )
}

export default CodeEditor
