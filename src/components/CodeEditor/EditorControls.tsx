// src/components/CodeEditor/EditorControls.tsx
import React from 'react'
import { Box, Button } from '@mui/material'

interface EditorControlsProps {
  onRun: () => void
  onClear: () => void
  isRunning: boolean
}

const EditorControls = ({ onRun, onClear, isRunning }: EditorControlsProps) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
      <Button
        variant="outlined"
        size="large"
        onClick={onClear}
        disabled={isRunning}
      >
        Ištrinti Kodą
      </Button>

      <Button variant="contained" size="large" onClick={onRun}>
        {!isRunning ? 'Paleisti Kodą' : 'Sustabdyti Kodą'}
      </Button>
    </Box>
  )
}

export default EditorControls
