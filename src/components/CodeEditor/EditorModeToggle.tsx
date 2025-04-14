// src/components/CodeEditor/EditorModeToggle.tsx
import React from 'react'
import { Box, FormControlLabel, Switch, Typography } from '@mui/material'
import { Code as CodeIcon, ViewModule as BlocksIcon } from '@mui/icons-material'

interface EditorModeToggleProps {
  isCodeMode: boolean
  onToggle: () => void
  disabled: boolean
}

/**
 * Toggle switch component for switching between block and code modes
 */
const EditorModeToggle: React.FC<EditorModeToggleProps> = ({
  isCodeMode,
  onToggle,
  disabled,
}) => {
  return (
    <FormControlLabel
      control={
        <Switch checked={isCodeMode} onChange={onToggle} disabled={disabled} />
      }
      label={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isCodeMode ? <CodeIcon /> : <BlocksIcon />}
          <Typography sx={{ ml: 1 }}>
            {isCodeMode ? 'Code Mode' : 'Block Mode'}
          </Typography>
        </Box>
      }
    />
  )
}

export default EditorModeToggle
