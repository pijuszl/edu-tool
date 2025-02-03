import { Editor } from '@monaco-editor/react'
import { Box, IconButton, Paper, Typography } from '@mui/material'
import {
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
  ArrowUpward as ArrowUpwardIcon,
} from '@mui/icons-material'
import { useGameActions, useGameProcessing } from '../store/gameStore'

type CodeEditorProps = {
  width: number
  isDragging: boolean
}

const CodeEditor = ({ width, isDragging }: CodeEditorProps) => {
  const { addCommand } = useGameActions()
  const isProcessing = useGameProcessing()

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
            disabled={isProcessing}
            color="primary"
            size="large"
          >
            <RotateLeftIcon fontSize="inherit" />
          </IconButton>

          <IconButton
            aria-label="move forward"
            onClick={() => addCommand('forward')}
            disabled={isProcessing}
            color="primary"
            size="large"
          >
            <ArrowUpwardIcon fontSize="inherit" />
          </IconButton>

          <IconButton
            aria-label="turn left"
            onClick={() => addCommand('right')}
            disabled={isProcessing}
            color="primary"
            size="large"
          >
            <RotateRightIcon fontSize="inherit" />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  )
}

export default CodeEditor
