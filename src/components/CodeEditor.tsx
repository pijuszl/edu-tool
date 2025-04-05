// src/components/CodeEditor.tsx
import { Editor } from '@monaco-editor/react'
import {
  Button,
  Box,
  IconButton,
  Paper,
  Typography,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material'
import {
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
  ArrowUpward as ArrowUpwardIcon,
  Code as CodeIcon,
  ViewModule as BlocksIcon,
} from '@mui/icons-material'
import {
  useGameCommands,
  useAddCommand,
  useRemoveCommandAt,
  useClearCommands,
  useSetRunning,
  useGameRunning,
  useEditorMode,
  useSetEditorMode,
  useCode,
  useSetCode,
  useSetCommands,
  useParseAndSetCommandsFromCode,
} from '../store/game-store'
import { useEffect, useState, useCallback } from 'react'

type CodeEditorProps = {
  width: number
  isDragging: boolean
}

const commandToCode = (command: string): string => {
  return `${command}();`
}

const CodeEditor = ({ width, isDragging }: CodeEditorProps) => {
  const isRunning = useGameRunning()
  const commands = useGameCommands()
  const addCommand = useAddCommand()
  const removeCommandAt = useRemoveCommandAt()
  const clearCommands = useClearCommands()
  const setRunning = useSetRunning()
  const editorMode = useEditorMode()
  const setEditorMode = useSetEditorMode()
  const code = useCode()
  const setCode = useSetCode()
  const setCommands = useSetCommands()
  const parseAndSetCommandsFromCode = useParseAndSetCommandsFromCode()

  const [showInvalidCodeDialog, setShowInvalidCodeDialog] = useState(false)
  const [pendingMode, setPendingMode] = useState<'block' | 'code' | null>(null)

  const handleCodeChange = useCallback(
    (newCode: string | undefined) => {
      const validCode = newCode || ''
      setCode(validCode)
      if (editorMode === 'code') {
        parseAndSetCommandsFromCode(validCode)
      }
    },
    [editorMode, setCode, parseAndSetCommandsFromCode]
  )

  const handleModeChange = () => {
    const newMode = editorMode === 'block' ? 'code' : 'block'

    if (editorMode === 'code') {
      try {
        new Function(code)
        parseAndSetCommandsFromCode(code)
        setEditorMode(newMode)
      } catch (e) {
        setPendingMode(newMode)
        setShowInvalidCodeDialog(true)
        return
      }
    } else {
      const newCode = commands.map(commandToCode).join('\n')
      setCode(
        newCode ||
          '// Write your code here\n// Use commands: forward(), left(), right()'
      )
      setEditorMode(newMode)
    }
  }

  const handleRunClick = () => {
    if (editorMode === 'code' && !isRunning) {
      parseAndSetCommandsFromCode(code)
    }
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
        <FormControlLabel
          control={
            <Switch
              checked={editorMode === 'code'}
              onChange={handleModeChange}
              disabled={isRunning}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {editorMode === 'code' ? <CodeIcon /> : <BlocksIcon />}
              <Typography sx={{ ml: 1 }}>
                {editorMode === 'code' ? 'Code Mode' : 'Block Mode'}
              </Typography>
            </Box>
          }
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
          // Code Editor View
          <Box sx={{ flex: '1 1 auto' }}>
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
              }}
            />
          </Box>
        ) : (
          // Block Editor View
          <>
            <Box sx={{ flex: '0 0 auto', mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Command Sequence
              </Typography>
              {commands.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No commands added. Use the buttons below to add commands.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {commands.map((command, index) => {
                    let IconComponent
                    switch (command) {
                      case 'left':
                        IconComponent = RotateLeftIcon
                        break
                      case 'forward':
                        IconComponent = ArrowUpwardIcon
                        break
                      case 'right':
                        IconComponent = RotateRightIcon
                        break
                      default:
                        return null
                    }
                    return (
                      <Paper
                        key={index}
                        elevation={2}
                        sx={{
                          p: 0.5,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                        onClick={() => !isRunning && removeCommandAt(index)}
                        title={`Click to remove ${command}`}
                      >
                        <IconComponent fontSize="small" />
                      </Paper>
                    )
                  })}
                </Box>
              )}
            </Box>

            {/* Block Command Buttons */}
            <Box
              sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}
            >
              <IconButton
                aria-label="turn left"
                onClick={() => addCommand('left')}
                disabled={isRunning}
                color="primary"
                size="large"
              >
                <RotateLeftIcon fontSize="inherit" />
              </IconButton>

              <IconButton
                aria-label="move forward"
                onClick={() => addCommand('forward')}
                disabled={isRunning}
                color="primary"
                size="large"
              >
                <ArrowUpwardIcon fontSize="inherit" />
              </IconButton>

              <IconButton
                aria-label="turn right"
                onClick={() => addCommand('right')}
                disabled={isRunning}
                color="primary"
                size="large"
              >
                <RotateRightIcon fontSize="inherit" />
              </IconButton>
            </Box>
          </>
        )}

        {/* Control Buttons - Always visible */}
        <Box
          sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 'auto' }}
        >
          <Button
            variant="outlined"
            size="large"
            onClick={() => clearCommands()}
            disabled={isRunning}
          >
            Clear Code
          </Button>

          <Button variant="contained" size="large" onClick={handleRunClick}>
            {!isRunning ? 'Run Code' : 'Stop Code'}
          </Button>
        </Box>
      </Box>

      {/* Invalid Code Dialog */}
      <Dialog
        open={showInvalidCodeDialog}
        onClose={handleInvalidCodeDialogCancel}
      >
        <DialogTitle>Invalid Code</DialogTitle>
        <DialogContent>
          The current code contains syntax errors. If you switch modes, all code
          will be deleted. Are you sure you want to continue?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleInvalidCodeDialogCancel}>Cancel</Button>
          <Button onClick={handleInvalidCodeDialogConfirm} autoFocus>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default CodeEditor
