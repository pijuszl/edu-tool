import { useState, useRef, useEffect } from 'react'
import { Box, Paper, Divider, Typography, Button } from '@mui/material'
import { styled } from '@mui/material/styles'
import Editor from '@monaco-editor/react'
import GameView from '../GameView'
import { useGameActions, useGameProcessing } from '../../store/gameStore'

const StyledDivider = styled(Divider)(({ theme }) => ({
  width: '8px',
  cursor: 'col-resize',
  backgroundColor: theme.palette.grey[300],
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  },
  '&.active': {
    backgroundColor: theme.palette.primary.dark,
  },
}))

const GameLayout = () => {
  const [leftWidth, setLeftWidth] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { addCommand } = useGameActions()
  const isProcessing = useGameProcessing()

  const handleMouseDown = () => setIsDragging(true)
  const handleMouseUp = () => setIsDragging(false)

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const newWidth =
      ((e.clientX - containerRect.left) / containerRect.width) * 100
    setLeftWidth(Math.min(Math.max(20, newWidth), 80))
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Editor Panel */}
      <Paper
        sx={{
          height: '100%',
          p: 2,
          width: `${leftWidth}%`,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h6">Code Editor</Typography>
        <Box sx={{ flex: 1 }}>
          <Editor
            height="100%"
            defaultLanguage="javascript"
            defaultValue="// Program your robot here"
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => addCommand('left')}
            disabled={isProcessing}
            fullWidth
          >
            ↩ Turn Left
          </Button>
          <Button
            variant="contained"
            onClick={() => addCommand('forward')}
            disabled={isProcessing}
            fullWidth
          >
            ↑ Move Forward
          </Button>
          <Button
            variant="contained"
            onClick={() => addCommand('right')}
            disabled={isProcessing}
            fullWidth
          >
            ↪ Turn Right
          </Button>
        </Box>
      </Paper>

      <StyledDivider
        orientation="vertical"
        className={isDragging ? 'active' : ''}
        onMouseDown={handleMouseDown}
      />

      {/* Game View */}
      <Box
        sx={{
          height: '100%',
          width: `${100 - leftWidth}%`,
          position: 'relative',
        }}
      >
        <GameView />
      </Box>
    </Box>
  )
}

export default GameLayout
