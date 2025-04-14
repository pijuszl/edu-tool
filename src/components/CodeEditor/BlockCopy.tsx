// src/components/CodeEditor/BlockEditor.tsx
import React from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import {
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
  ArrowUpward as ArrowUpwardIcon,
} from '@mui/icons-material'
import CommandList from './CommandList'
import { Command } from '../../types/editor-types'

interface BlockEditorProps {
  commands: string[]
  onAddCommand: (command: Command) => void
  onRemoveCommand: (index: number) => void
  disabled: boolean
}

const BlockEditor: React.FC<BlockEditorProps> = ({
  commands,
  onAddCommand,
  onRemoveCommand,
  disabled,
}) => {
  {
  }

  return (
    <>
      <Box sx={{ flex: '0 0 auto', mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Command Sequence
        </Typography>
        <CommandList
          commands={commands}
          onRemoveCommand={onRemoveCommand}
          disabled={disabled}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
        <IconButton
          aria-label="turn left"
          onClick={() => onAddCommand('left')}
          disabled={disabled}
          color="primary"
          size="large"
        >
          <RotateLeftIcon fontSize="inherit" />
        </IconButton>

        <IconButton
          aria-label="move forward"
          onClick={() => onAddCommand('forward')}
          disabled={disabled}
          color="primary"
          size="large"
        >
          <ArrowUpwardIcon fontSize="inherit" />
        </IconButton>

        <IconButton
          aria-label="turn right"
          onClick={() => onAddCommand('right')}
          disabled={disabled}
          color="primary"
          size="large"
        >
          <RotateRightIcon fontSize="inherit" />
        </IconButton>
      </Box>
    </>
  )
}

export default BlockEditor
