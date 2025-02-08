import { Editor } from '@monaco-editor/react'
import { Button, Box, IconButton, Paper, Typography } from '@mui/material'
import {
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
  ArrowUpward as ArrowUpwardIcon,
} from '@mui/icons-material'
import {
  useGameCommands,
  useAddCommand,
  useClearCommands,
  useSetRunning,
  useGameRunning,
} from '../store/game-store'
import { useEffect } from 'react'

type CodeEditorProps = {
  width: number
  isDragging: boolean
}

const CodeEditor = ({ width, isDragging }: CodeEditorProps) => {
  const isRunning = useGameRunning()

  const commands = useGameCommands()
  const addCommand = useAddCommand()
  const clearCommands = useClearCommands()
  const setRunning = useSetRunning()

  useEffect(() => {
    console.log('added: ', commands)
  }, [commands])

  return (
    <Paper
      sx={{
        height: '100%',
        p: 2,
        width: `${width}%`,
        transition: isDragging ? 'none' : 'width 0.3s',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Code Editor
      </Typography>
      <Box sx={{ height: 'calc(100% - 40px)' }}>
        <Editor
          height="80%"
          defaultLanguage="javascript"
          defaultValue="// Write your code here"
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
          }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
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
            aria-label="turn left"
            onClick={() => addCommand('right')}
            disabled={isRunning}
            color="primary"
            size="large"
          >
            <RotateRightIcon fontSize="inherit" />
          </IconButton>

          <Button
            variant="outlined"
            size="large"
            onClick={() => clearCommands()}
          >
            Clear Code
          </Button>

          <Button
            variant="contained"
            size="large"
            onClick={() => setRunning(!isRunning)}
          >
            {!isRunning ? 'Run Code' : 'Stop Code'}
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}

export default CodeEditor
