// components/Game/index.tsx
import { useState, useMemo, useCallback } from 'react'
import { getPositionFromGrid } from '../../utils/convertPosition'
import { LevelData, WorldData } from '../../types/game-types'
import { GameWorld } from './GameWorld'
import { GameUI } from './GameUI'
import { useGameWorld } from '../../hooks/useGameWorld'
import { useCollectables } from '../../hooks/useCollectables'
import { useCharacterMovement } from '../../hooks/useCharacterMovement'
import { useCommandProcessor } from '../../hooks/useCommandProcessor'

/**
 * Main Game component that orchestrates all game elements
 */
const Game = ({ levels }: LevelData) => {
  const [currentLevel, setCurrentLevel] = useState<number>(0)
  const worldData = levels[currentLevel] as WorldData

  const initialPosition = useMemo(
    () => levels[currentLevel].start,
    [currentLevel, levels]
  )

  const convertPosition = useCallback(getPositionFromGrid, [])

  // Use our custom hooks to manage different aspects of the game
  const worldObjects = useGameWorld(worldData, convertPosition)

  const {
    characterPos,
    targetPosition,
    forceUpdate,
    isClimbing,
    turnLeft,
    turnRight,
    moveForward,
    handleMoveComplete,
    resetCharacterPosition,
  } = useCharacterMovement(initialPosition, worldData, convertPosition)

  const {
    collectableElements,
    collectedItems,
    score,
    checkCollectables,
    resetCollectables,
  } = useCollectables(worldData, characterPos, convertPosition)

  // Setup command processor
  useCommandProcessor(
    moveForward,
    turnLeft,
    turnRight,
    resetCharacterPosition,
    resetCollectables,
    initialPosition,
    worldData
  )

  // Handle move completion including checking for collectables
  const onMoveComplete = useCallback(() => {
    handleMoveComplete()
    checkCollectables()
    // Explicitly log completion
    console.log('Move completed and collectables checked')
  }, [handleMoveComplete, checkCollectables])

  // Compute character's position in the 3D world
  const characterPosition = useMemo(() => {
    const pos = convertPosition(
      characterPos.x,
      characterPos.y,
      characterPos.layer
    )
    return [pos.x, pos.y, pos.z] as [number, number, number]
  }, [characterPos, convertPosition])

  // Calculate character rotation based on direction
  const characterRotation = useMemo(() => {
    return (characterPos.direction ?? 0) * -(Math.PI / 3)
  }, [characterPos.direction])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <GameUI
        score={score}
        totalCollectables={worldData?.collectables?.length || 0}
        characterPos={characterPos}
        collectables={worldData?.collectables}
        collectedItems={collectedItems}
        debugEnabled={true} // Set to false in production
      />
      <GameWorld
        worldObjects={worldObjects}
        collectableElements={collectableElements}
        characterPosition={characterPosition}
        characterRotation={characterRotation}
        targetPosition={targetPosition}
        onMoveComplete={onMoveComplete}
        forceUpdate={forceUpdate}
        isClimbing={isClimbing}
      />
    </div>
  )
}

export default Game
