// src/components/Game/DebugOverlay.tsx
import React from 'react'
import { GridPosition } from '../../types/game-types'

interface DebugOverlayProps {
  characterPos: GridPosition
  collectables: { layer: number; x: number; y: number }[] | undefined
  collectedItems: boolean[]
  enabled?: boolean
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({
  characterPos,
  collectables,
  collectedItems,
  enabled = true,
}) => {
  if (!enabled) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '5px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 100,
        maxWidth: '300px',
        maxHeight: '300px',
        overflow: 'auto',
      }}
    >
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
        Game Coordinates Debug
      </div>

      <div style={{ marginBottom: '5px' }}>
        <div>Character Position:</div>
        <div>
          x: {characterPos.x}, y: {characterPos.y}, layer: {characterPos.layer}
        </div>
        <div>direction: {characterPos.direction}</div>
      </div>

      <div>
        <div style={{ marginBottom: '5px' }}>Collectables:</div>
        {collectables?.map((item, index) => (
          <div
            key={index}
            style={{
              color: collectedItems[index] ? 'gray' : 'lime',
              marginBottom: '2px',
            }}
          >
            {index}: (x: {item.x}, y: {item.y}, layer: {item.layer})
            {collectedItems[index] ? ' - COLLECTED' : ''}
            {item.x === characterPos.x &&
            item.y === characterPos.y &&
            item.layer === characterPos.layer + 1
              ? ' - CAN COLLECT!'
              : ''}
          </div>
        ))}
      </div>
    </div>
  )
}
