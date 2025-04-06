// components/Game/LevelCarousel.tsx
import React, { useState } from 'react'
import { Button, IconButton } from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'

interface LevelCarouselProps {
  completedLevels: number[]
  unlockedLevels: number[]
  currentLevelIndex: number
  totalLevels: number
  onSelectLevel: (levelIndex: number) => void
}

export const LevelCarousel: React.FC<LevelCarouselProps> = ({
  completedLevels,
  unlockedLevels,
  currentLevelIndex,
  totalLevels,
  onSelectLevel,
}) => {
  const [startIndex, setStartIndex] = useState(0)
  const maxVisibleLevels = 10

  const handlePrev = () => {
    setStartIndex(Math.max(0, startIndex - maxVisibleLevels))
  }

  const handleNext = () => {
    const maxStart = Math.max(0, totalLevels - maxVisibleLevels)
    setStartIndex(Math.min(maxStart, startIndex + maxVisibleLevels))
  }

  // Calculate visible range
  const visibleCount = Math.min(maxVisibleLevels, totalLevels - startIndex)

  return (
    <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 transform items-center justify-center rounded-lg bg-black bg-opacity-50 p-2 shadow-lg">
      {startIndex > 0 && (
        <IconButton
          onClick={handlePrev}
          size="small"
          className="mx-1 text-white"
          sx={{ bgcolor: 'rgba(85, 85, 85, 0.7)' }}
        >
          <ChevronLeft />
        </IconButton>
      )}

      <div className="flex gap-1">
        {Array.from({ length: visibleCount }).map((_, i) => {
          const levelIndex = startIndex + i
          const isCompleted = completedLevels.includes(levelIndex)
          const isUnlocked = unlockedLevels.includes(levelIndex)
          const isCurrent = currentLevelIndex === levelIndex

          // Determine button classes based on level status
          let bgColor = 'bg-gray-500' // Default locked
          if (isCompleted)
            bgColor = 'bg-green-500' // Completed
          else if (isUnlocked) bgColor = 'bg-blue-500' // Unlocked

          return (
            <Button
              key={levelIndex}
              onClick={() => isUnlocked && onSelectLevel(levelIndex)}
              variant="contained"
              className={`h-8 min-w-8 p-0 font-bold ${bgColor} ${isCurrent ? 'ring-2 ring-white' : ''} ${!isUnlocked ? 'opacity-70' : ''}`}
              sx={{
                minWidth: '32px',
                color: 'white',
                fontWeight: 'bold',
                backgroundColor: isCompleted
                  ? '#4CAF50'
                  : isUnlocked
                    ? '#2196F3'
                    : '#9E9E9E',
                '&:hover': {
                  backgroundColor: isCompleted
                    ? '#3b8a3e'
                    : isUnlocked
                      ? '#1976d2'
                      : '#757575',
                },
              }}
            >
              {levelIndex + 1}
            </Button>
          )
        })}
      </div>

      {startIndex + maxVisibleLevels < totalLevels && (
        <IconButton
          onClick={handleNext}
          size="small"
          className="mx-1 text-white"
          sx={{ bgcolor: 'rgba(85, 85, 85, 0.7)' }}
        >
          <ChevronRight />
        </IconButton>
      )}
    </div>
  )
}
