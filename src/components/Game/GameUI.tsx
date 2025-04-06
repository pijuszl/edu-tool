// components/Game/GameUI.tsx
import React from 'react'
import { ScoreDisplay } from './ScoreDisplay'
import { DebugOverlay } from './DebugOverlay'
import { GridPosition } from '../../types/game-types'

interface GameUIProps {
  score: number
  totalCollectables: number
  characterPos: GridPosition
  collectables?: { x: number; y: number; layer: number }[]
  collectedItems: boolean[]
  debugEnabled?: boolean
}

export const GameUI: React.FC<GameUIProps> = ({
  score,
  totalCollectables,
  characterPos,
  collectables,
  collectedItems,
  debugEnabled = false,
}) => {
  return (
    <>
      <ScoreDisplay score={score} totalCollectables={totalCollectables} />
      {debugEnabled && (
        <DebugOverlay
          characterPos={characterPos}
          collectables={collectables}
          collectedItems={collectedItems}
          enabled={debugEnabled}
        />
      )}
    </>
  )
}
