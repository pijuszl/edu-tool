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

export const LevelCompletionDialog = ({
  open,
  onClose,
  levelIndex,
  collectablesCollected,
  totalCollectables,
  onNextLevel,
  isLastLevel,
}: LevelCompletionDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            background: 'linear-gradient(135deg, #00ff59, #00fff2)',
            color: 'white',
          },
        },
      }}
    >
      <DialogTitle className="py-4 text-center">
        <Box className="flex flex-col items-center justify-center">
          <EmojiEvents className="mb-2 text-5xl text-yellow-400" />
          <Typography variant="h4" className="font-bold text-white">
            {levelIndex + 1} Lygis Pereitas!
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box className="flex flex-col items-center py-4">
          <Typography variant="h6" className="mb-4 text-white">
            Surinkta taškų: {collectablesCollected} / {totalCollectables}
          </Typography>

          <Box className="my-4 flex justify-center transition-all duration-500" />

          {isLastLevel && (
            <Typography
              variant="h6"
              className="mt-4 text-center text-green-300"
            >
              Sveikiname! Tu perėjai visus lygius!
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
            Kitas Lygis
          </Button>
        )}
        <Button
          onClick={onClose}
          variant="outlined"
          className="border-white px-6 py-2 text-white hover:bg-white hover:bg-opacity-10"
        >
          {isLastLevel ? 'Tęsti' : 'Grįžti į žaidimą'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
