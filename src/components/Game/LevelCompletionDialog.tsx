// components/Game/LevelCompletionDialog.tsx
import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material'
import { Star, StarBorder, EmojiEvents } from '@mui/icons-material'

interface LevelCompletionDialogProps {
  open: boolean
  onClose: () => void
  levelIndex: number
  collectablesCollected: number
  totalCollectables: number
  onNextLevel: () => void
  isLastLevel: boolean
}

export const LevelCompletionDialog: React.FC<LevelCompletionDialogProps> = ({
  open,
  onClose,
  levelIndex,
  collectablesCollected,
  totalCollectables,
  onNextLevel,
  isLastLevel,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        borderRadius: 2,
        background: 'linear-gradient(135deg, #1a2a6c, #2a3a7c, 0.5)',
        color: 'white',
      }}
    >
      <DialogTitle className="py-4 text-center">
        <Box className="flex flex-col items-center justify-center">
          <EmojiEvents className="mb-2 text-5xl text-yellow-400" />
          <Typography variant="h4" className="font-bold text-white">
            Level {levelIndex + 1} Complete!
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box className="flex flex-col items-center py-4">
          <Typography variant="h6" className="mb-4 text-blue-200">
            Collectables: {collectablesCollected} / {totalCollectables}
          </Typography>

          <Box className="my-4 flex justify-center transition-all duration-500" />

          {isLastLevel && (
            <Typography
              variant="h6"
              className="mt-4 text-center text-green-300"
            >
              Congratulations! You've completed all available levels!
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions className="flex justify-center bg-black bg-opacity-30 p-4">
        {!isLastLevel && (
          <Button
            onClick={onNextLevel}
            variant="contained"
            color="primary"
            className="mr-2 px-8 py-2"
            size="large"
          >
            Next Level
          </Button>
        )}
        <Button
          onClick={onClose}
          variant="outlined"
          className="border-white px-6 py-2 text-white hover:bg-white hover:bg-opacity-10"
        >
          {isLastLevel ? 'Continue' : 'Menu'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
