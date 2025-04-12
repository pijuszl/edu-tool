// components/Game/index.tsx
import { useState, useMemo, useCallback, useEffect } from 'react'
import { getPositionFromGrid } from '../../utils/convertPosition'
import { LevelData, WorldData } from '../../types/game-types'
import { GameWorld } from './GameWorld'
import { GameUI } from './GameUI'
import { LevelCarousel } from './LevelCarousel'
import { Finish } from './Finish'
import { LevelCompletionDialog } from './LevelCompletionDialog'
import { useGameWorld } from '../../hooks/useGameWorld'
import { useCollectables } from '../../hooks/useCollectables'
import { useCharacterMovement } from '../../hooks/useCharacterMovement'
import { useCommandProcessor } from '../../hooks/useCommandProcessor'
import {
  useCurrentLevelIndex,
  useSetCurrentLevel,
  useCompletedLevels,
  useUnlockedLevels,
  useCompleteLevel,
  useUnlockLevel,
  useResetGameState,
} from '../../store/game-store'
import { HEX_METRICS } from '../../config/game-config'

const Game = ({ levels }: LevelData) => {
  // Get level state from the store
  const currentLevelIndex = useCurrentLevelIndex()
  const setCurrentLevel = useSetCurrentLevel()
  const completedLevels = useCompletedLevels()
  const unlockedLevels = useUnlockedLevels()
  const completeLevel = useCompleteLevel()
  const unlockLevel = useUnlockLevel()
  const resetGameState = useResetGameState()

  // State for level completion dialog
  const [showLevelCompleteDialog, setShowLevelCompleteDialog] = useState(false)
  const [levelCompleted, setLevelCompleted] = useState(-1)

  // Make sure the current level index is valid
  useEffect(() => {
    if (currentLevelIndex >= levels.length) {
      setCurrentLevel(0)
    }
  }, [currentLevelIndex, levels.length, setCurrentLevel])

  // Get the current level data
  const worldData = levels[currentLevelIndex] as WorldData

  // Initialize with the current level's starting position
  const initialPosition = useMemo(
    () => levels[currentLevelIndex].start,
    [currentLevelIndex, levels]
  )

  const convertPosition = useCallback(getPositionFromGrid, [])

  // Use our custom hooks to manage different aspects of the game
  const worldObjects = useGameWorld(worldData, convertPosition)

  const {
    characterPos,
    targetPosition,
    forceUpdate,
    isClimbing,
    isClimbingDown,
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

  useCommandProcessor(
    moveForward,
    turnLeft,
    turnRight,
    resetCharacterPosition,
    resetCollectables,
    initialPosition
  )

  // Calculate if all collectables are collected
  const allCollectablesCollected = useMemo(() => {
    if (!worldData.collectables || worldData.collectables.length === 0)
      return true
    return worldData.collectables.length === score
  }, [worldData.collectables, score])

  // Handle level completion
  const checkLevelCompletion = useCallback(() => {
    if (
      worldData.finish &&
      characterPos.x === worldData.finish.x &&
      characterPos.y === worldData.finish.y &&
      characterPos.layer === worldData.finish.layer &&
      allCollectablesCollected
    ) {
      console.log(`Level ${currentLevelIndex} completed!`)

      completeLevel(currentLevelIndex)

      if (currentLevelIndex < levels.length - 1) {
        unlockLevel(currentLevelIndex + 1)
      }

      setLevelCompleted(currentLevelIndex)
      setShowLevelCompleteDialog(true)
    }
  }, [
    worldData.finish,
    characterPos,
    allCollectablesCollected,
    currentLevelIndex,
    completeLevel,
    unlockLevel,
    levels.length,
  ])

  // Handle move completion including checking for collectables and level completion
  const onMoveComplete = useCallback(() => {
    handleMoveComplete()
    checkCollectables()
    checkLevelCompletion()
    console.log('Move completed and collectables checked')
  }, [handleMoveComplete, checkCollectables, checkLevelCompletion])

  // Handle level change
  const handleLevelChange = useCallback(
    (levelIndex: number) => {
      if (levelIndex !== currentLevelIndex) {
        console.log(`Switching to level ${levelIndex}`)
        setCurrentLevel(levelIndex)
        resetGameState()
        resetCollectables()
        resetCharacterPosition(levels[levelIndex].start)
      }
    },
    [
      currentLevelIndex,
      setCurrentLevel,
      resetGameState,
      resetCollectables,
      resetCharacterPosition,
      levels,
    ]
  )

  // Handle proceeding to next level
  const handleNextLevel = useCallback(() => {
    if (levelCompleted < levels.length - 1) {
      handleLevelChange(levelCompleted + 1)
    }
    setShowLevelCompleteDialog(false)
  }, [levelCompleted, levels.length, handleLevelChange])

  // Close dialog without changing level
  const handleCloseDialog = useCallback(() => {
    setShowLevelCompleteDialog(false)
  }, [])

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

  // Create finish element
  const finishElement = useMemo(() => {
    if (!worldData.finish) return null

    const pos = convertPosition(
      worldData.finish.x,
      worldData.finish.y,
      worldData.finish.layer
    )
    pos.y += HEX_METRICS.height * 0.5 // Lift slightly above the ground

    return (
      <Finish
        position={pos.toArray() as [number, number, number]}
        isActive={allCollectablesCollected}
        isVisible={true}
      />
    )
  }, [worldData.finish, convertPosition, allCollectablesCollected])

  return (
    <div className="relative h-full w-full">
      <LevelCarousel
        completedLevels={completedLevels}
        unlockedLevels={unlockedLevels}
        currentLevelIndex={currentLevelIndex}
        totalLevels={levels.length}
        onSelectLevel={handleLevelChange}
      />

      <GameUI
        score={score}
        totalCollectables={worldData?.collectables?.length || 0}
        characterPos={characterPos}
        collectables={worldData?.collectables}
        collectedItems={collectedItems}
        debugEnabled={false}
        levelIndex={currentLevelIndex}
        levelCount={levels.length}
        allCollectablesCollected={allCollectablesCollected}
      />

      <GameWorld
        worldObjects={worldObjects}
        collectableElements={collectableElements}
        finishElement={finishElement}
        characterPosition={characterPosition}
        characterRotation={characterRotation}
        targetPosition={targetPosition}
        onMoveComplete={onMoveComplete}
        forceUpdate={forceUpdate}
        isClimbing={isClimbing}
        isClimbingDown={isClimbingDown}
      />

      {/* Level completion dialog */}
      <LevelCompletionDialog
        open={showLevelCompleteDialog}
        onClose={handleCloseDialog}
        levelIndex={levelCompleted}
        collectablesCollected={score}
        totalCollectables={worldData?.collectables?.length || 0}
        onNextLevel={handleNextLevel}
        isLastLevel={levelCompleted >= levels.length - 1}
      />
    </div>
  )
}

export default Game
