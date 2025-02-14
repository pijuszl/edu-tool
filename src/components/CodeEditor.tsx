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
  useRemoveCommand,
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
  const removeCommand = useRemoveCommand()
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
      <Box
        sx={{
          height: 'calc(100% - 40px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Code Editor */}
        <Box sx={{ flex: '0 0 60%' }}>
          <Editor
            height="100%"
            defaultLanguage="javascript"
            defaultValue="// Write your code here"
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
            }}
          />
        </Box>

        <Box
          sx={{
            flex: '0 0 20%',
            overflow: 'auto',
            p: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            mt: 1,
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Komandų seka
          </Typography>
          {commands.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              Nėra pridėtų komandų. Naudokite žemiau esančius mygtukus, kad
              pridėtumėte komandas.
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
                    }}
                    title={command}
                  >
                    <IconComponent fontSize="small" />
                  </Paper>
                )
              })}
            </Box>
          )}
        </Box>

        {/* Control Buttons */}
        <Box
          sx={{
            flex: '0 0 20%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
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
              aria-label="turn right"
              onClick={() => addCommand('right')}
              disabled={isRunning}
              color="primary"
              size="large"
            >
              <RotateRightIcon fontSize="inherit" />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => removeCommand()}
            >
              Remove Command
            </Button>

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
      </Box>
    </Paper>
  )
}

export default CodeEditor
