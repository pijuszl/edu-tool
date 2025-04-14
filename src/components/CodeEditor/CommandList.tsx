// src/components/CodeEditor/CommandList.tsx
import React from 'react'
import { Box, Paper, Typography } from '@mui/material'
import {
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
  ArrowUpward as ArrowUpwardIcon,
} from '@mui/icons-material'

interface CommandListProps {
  commands: string[]
  onRemoveCommand: (index: number) => void
  disabled: boolean
}

/**
 * Returns the appropriate icon component based on command type
 */
const getCommandIcon = (command: string) => {
  switch (command) {
    case 'left':
      return <RotateLeftIcon fontSize="small" />
    case 'forward':
      return <ArrowUpwardIcon fontSize="small" />
    case 'right':
      return <RotateRightIcon fontSize="small" />
    default:
      return null
  }
}

/**
 * Displays a visual representation of the command sequence
 */
const CommandList: React.FC<CommandListProps> = ({
  commands,
  onRemoveCommand,
  disabled,
}) => {
  if (commands.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary">
        No commands added. Use the buttons below to add commands.
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {commands.map((command, index) => (
        <Paper
          key={index}
          elevation={2}
          sx={{
            p: 0.5,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: disabled ? 'default' : 'pointer',
            '&:hover': {
              backgroundColor: disabled ? 'inherit' : 'action.hover',
            },
          }}
          onClick={() => !disabled && onRemoveCommand(index)}
          title={`Click to remove ${command}`}
        >
          {getCommandIcon(command)}
        </Paper>
      ))}
    </Box>
  )
}

export default CommandList
