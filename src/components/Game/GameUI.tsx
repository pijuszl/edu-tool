// components/Game/GameUI.tsx
import React from 'react'
import { Paper, Typography, Box, Chip, LinearProgress } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { DebugOverlay } from './DebugOverlay'
import { GridPosition } from '../../types/game-types'

interface GameUIProps {
  score: number
  totalCollectables: number
  characterPos: GridPosition
  collectables?: { x: number; y: number; layer: number }[]
  collectedItems: boolean[]
  debugEnabled?: boolean
  levelIndex: number
  levelCount: number
  allCollectablesCollected: boolean
}

export const GameUI: React.FC<GameUIProps> = ({
  score,
  totalCollectables,
  characterPos,
  collectables,
  collectedItems,
  debugEnabled = false,
  levelIndex,
  levelCount,
  allCollectablesCollected,
}) => {
  const completionPercentage =
    totalCollectables > 0 ? Math.round((score / totalCollectables) * 100) : 0

  const getColor = () => {
    if (completionPercentage === 100) return 'success' // Green
    if (completionPercentage >= 75) return 'warning' // Light Green
    if (completionPercentage >= 50) return 'warning' // Yellow
    if (completionPercentage >= 25) return 'warning' // Amber
    return 'warning' // Orange
  }

  return (
    <>
      {/* Level Info */}
      <Paper
        elevation={3}
        className="absolute left-5 top-16 z-10 rounded bg-black bg-opacity-70 p-3 font-mono text-sm text-white"
        sx={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      >
        <Typography variant="h5" className="text-white">
          Lygis: {levelIndex + 1} / {levelCount}
        </Typography>

        {/* Status of collectables */}
        <Box className="mt-1 flex items-center">
          <Typography
            variant="h6"
            className={`${allCollectablesCollected ? 'text-green-500' : 'text-orange-400'} flex items-center`}
          >
            Surinkti taškai: {score} / {totalCollectables}
            {allCollectablesCollected && totalCollectables > 0 && (
              <CheckCircleIcon
                className="ml-1 text-green-500"
                fontSize="small"
              />
            )}
          </Typography>
        </Box>

        {/* Instructions for the player */}
        {allCollectablesCollected ? (
          <Box className="mt-2">
            <Chip
              label="Find the green finish block!"
              color="success"
              size="small"
              className="text-xs"
            />
          </Box>
        ) : (
          totalCollectables > 0 && (
            <Box className="w-full">
              <LinearProgress
                variant="determinate"
                value={completionPercentage}
                color={getColor()}
                className="rounded"
                sx={{
                  height: 8,
                  borderRadius: 1,
                  backgroundColor: 'rgba(85, 85, 85, 0.5)',
                }}
              />
            </Box>
          )
        )}
      </Paper>

      {debugEnabled && (
        <DebugOverlay
          characterPos={characterPos}
          collectables={collectables}
          collectedItems={collectedItems}
        />
      )}
    </>
  )
}
