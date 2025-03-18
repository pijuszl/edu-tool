// src/components/Game/index.tsx
import {
  Suspense,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react'
import { getPositionFromGrid } from '../../utils/position-converter'
import { MapControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Hexagon } from './Hexagon'
import { Stairs } from './Stairs'
import { Trees } from './Trees'
import { Character } from './Character'
import { Collectable } from './Collectable'
import { ScoreDisplay } from './ScoreDisplay'
import { DebugOverlay } from './DebugOverlay'
import { LevelData, WorldData, GridPosition } from '../../types/game-types'
import {
  DIRECTIONS_EVEN,
  DIRECTIONS_ODD,
  HEX_METRICS,
} from '../../config/game-config'
import {
  useGameCommands,
  useGameRunning,
  useSetRunning,
} from '../../store/game-store'

const Game = ({ levels }: LevelData) => {
  const [currentLevel, setCurrentLevel] = useState<number>(0)
  const worldData = levels[currentLevel] as WorldData

  const initialPosition = useMemo(
    () => levels[currentLevel].start,
    [currentLevel, levels]
  )

  const [characterPos, setCharacterPos] =
    useState<GridPosition>(initialPosition)
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(
    null
  )
  const [isMoving, setIsMoving] = useState<boolean>(false)
  const [forceUpdate, setForceUpdate] = useState<boolean>(false)

  // New state for collectables and score
  const [collectedItems, setCollectedItems] = useState<boolean[]>([])
  const [score, setScore] = useState<number>(0)

  const commands = useGameCommands()
  const isRunning = useGameRunning()
  const setRunning = useSetRunning()

  const moveResolveRef = useRef<(() => void) | null>(null)

  const convertPosition = useCallback(getPositionFromGrid, [])

  // Initialize collectable state when level changes
  useEffect(() => {
    if (worldData?.collectables) {
      setCollectedItems(new Array(worldData.collectables.length).fill(false))
      setScore(0)
    }
  }, [currentLevel, worldData])

  const objects = useMemo(() => {
    if (!worldData) return []
    const obj: React.ReactElement[] = []

    worldData.layers.forEach((layerData, layerIndex) => {
      for (let y = 0; y < layerData.length; y++) {
        for (let x = 0; x < layerData[y].length; x++) {
          const pos = convertPosition(x, y, layerIndex)
          const value = layerData[y][x]

          if (value === 1) {
            obj.push(
              <Hexagon
                key={`${layerIndex}-${x}-${y}`}
                position={[pos.x, pos.y, pos.z]}
              />
            )
          } else if (value === 2) {
            obj.push(
              <Trees
                key={`${layerIndex}-${x}-${y}`}
                position={[pos.x, pos.y, pos.z]}
              />
            )
          } else if (Math.floor(value / 10) === 3) {
            const direction = value % 10
            obj.push(
              <Stairs
                key={`${layerIndex}-${x}-${y}`}
                position={[pos.x, pos.y, pos.z]}
                direction={direction}
              />
            )
          }
        }
      }
    })

    return obj
  }, [levels])

  // Render collectables
  const collectableElements = useMemo(() => {
    if (!worldData?.collectables) return []

    return worldData.collectables.map((item, index) => {
      // Correctly position collectables - need to swap x and y when calling convertPosition
      // This is because the game uses y, x order in convertPosition
      const pos = convertPosition(item.x, item.y, item.layer)
      pos.y += HEX_METRICS.height * 0.5 // Position slightly above the hexagon

      console.log(
        `Rendering collectable ${index} at grid (${item.x}, ${item.y}, ${item.layer}) -> world pos ${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}`
      )

      return (
        <Collectable
          key={`collectable-${index}`}
          position={pos.toArray() as [number, number, number]}
          isCollected={collectedItems[index]}
        />
      )
    })
  }, [worldData?.collectables, collectedItems, convertPosition])

  const turnLeft = useCallback(() => {
    if (!isMoving) {
      setCharacterPos((prev) => ({
        ...prev,
        direction: ((prev.direction ?? 0) + 1) % 6,
      }))
    }
  }, [isMoving])

  const turnRight = useCallback(() => {
    if (!isMoving) {
      setCharacterPos((prev) => ({
        ...prev,
        direction: ((prev.direction ?? 0) + 5) % 6,
      }))
    }
  }, [isMoving])

  const moveForward = useCallback(async () => {
    if (!isMoving) {
      setIsMoving(true)

      setCharacterPos((prev) => {
        const { x, y, layer, direction } = prev // Get the latest position
        const directions = y % 2 === 0 ? DIRECTIONS_EVEN : DIRECTIONS_ODD
        const delta = directions[direction ?? 0]

        const newX = x + delta.dx
        const newY = y + delta.dy

        // Check if there's a tile on the layer below (ground check)
        const groundLayerIndex = layer - 1
        if (
          groundLayerIndex < 0 ||
          groundLayerIndex >= worldData.layers.length
        ) {
          console.log(`No ground layer available at ${groundLayerIndex}`)
          setTargetPosition(convertPosition(x, y, layer))
          setIsMoving(false)
          return prev // No movement - no ground layer
        }

        const groundLayerData = worldData.layers[groundLayerIndex]
        if (
          newY < 0 ||
          newY >= groundLayerData.length ||
          newX < 0 ||
          newX >= groundLayerData[newY].length ||
          groundLayerData[newY][newX] !== 1
        ) {
          console.log(`No ground at (${newX}, ${newY}, ${groundLayerIndex})`)
          setTargetPosition(convertPosition(x, y, layer))
          setIsMoving(false)
          return prev // No movement - no ground beneath
        }

        // Check for obstacles on current layer
        const currentLayerData = worldData.layers[layer]
        if (
          newY < currentLayerData.length &&
          newX < currentLayerData[newY].length &&
          (currentLayerData[newY][newX] === 1 ||
            currentLayerData[newY][newX] === 2)
        ) {
          console.log(`Obstacle at (${newX}, ${newY}, ${layer})`)
          setTargetPosition(convertPosition(x, y, layer))
          setIsMoving(false)
          return prev // No movement - obstacle in the way
        }

        // Check for obstacles one layer above
        if (layer + 1 < worldData.layers.length) {
          const upperLayerData = worldData.layers[layer + 1]
          if (
            newY < upperLayerData.length &&
            newX < upperLayerData[newY].length &&
            (upperLayerData[newY][newX] === 1 ||
              upperLayerData[newY][newX] === 2)
          ) {
            console.log(`Overhead obstacle at (${newX}, ${newY}, ${layer + 1})`)
            setTargetPosition(convertPosition(x, y, layer))
            setIsMoving(false)
            return prev // No movement - overhead obstacle
          }
        }

        // All checks passed, we can move forward
        console.log(`Moving from (${x}, ${y}, ${layer})`)
        console.log(`Moving to (${newX}, ${newY}, ${layer})`)

        const newTilePos = convertPosition(newX, newY, layer)
        newTilePos.y += HEX_METRICS.height

        setTargetPosition(newTilePos)

        return { ...prev, x: newX, y: newY }
      })

      // Wait for React to update the state before proceeding
      await new Promise((resolve) => setTimeout(resolve, 50))

      setIsMoving(false)

      return new Promise<void>((resolve) => {
        moveResolveRef.current = resolve
      })
    }
  }, [isMoving, worldData])

  // Helper function to check if we can move to a position
  const canMoveToPosition = (
    newX: number,
    newY: number,
    layer: number,
    worldData: WorldData
  ) => {
    const currentLayerData = worldData.layers[layer]

    // Check if the position is within bounds and is a walkable tile (value === 1)
    if (
      newY >= 0 &&
      newY < currentLayerData.length &&
      newX >= 0 &&
      newX < currentLayerData[newY].length &&
      currentLayerData[newY][newX] === 1
    ) {
      // Block movement if an upper block exists directly above
      if (layer + 1 < worldData.layers.length) {
        const upperLayerData = worldData.layers[layer + 1]
        if (
          newY < upperLayerData.length &&
          newX < upperLayerData[newY].length &&
          (upperLayerData[newY][newX] === 1 || upperLayerData[newY][newX] === 2)
        ) {
          return false // Cannot move - blocked from above
        }
      }
      return true // Can move
    }

    return false // Cannot move - out of bounds or not walkable
  }

  const handleMoveComplete = () => {
    setIsMoving(false)
    setTargetPosition(null)

    // Debug current character position
    console.log(
      `Character position: (${characterPos.x}, ${characterPos.y}, ${characterPos.layer})`
    )

    // Check for collectable pickups immediately after movement completes
    if (worldData?.collectables) {
      const newCollectedItems = [...collectedItems]
      let collectedCount = 0

      worldData.collectables.forEach((collectable, index) => {
        // Check if the character's x,y position matches the collectable
        // The collectable should be on the same layer as the character
        const samePosition =
          collectable.x === characterPos.x && collectable.y === characterPos.y
        const sameLayer = collectable.layer === characterPos.layer

        console.log(
          `Checking collectable ${index} at (${collectable.x}, ${collectable.y}, ${collectable.layer})`
        )
        console.log(`Same position: ${samePosition}, Same layer: ${sameLayer}`)

        if (!collectedItems[index] && samePosition && sameLayer) {
          console.log(
            `✅ COLLECTED item at (${collectable.x}, ${collectable.y}, ${collectable.layer})`
          )
          newCollectedItems[index] = true
          collectedCount++
        }
      })

      if (collectedCount > 0) {
        console.log(`Collected ${collectedCount} items!`)
        setCollectedItems(newCollectedItems)
        setScore((prevScore) => prevScore + collectedCount)
      }
    }

    if (moveResolveRef.current) {
      moveResolveRef.current()
      moveResolveRef.current = null
    }
  }

  const processCommands = async () => {
    if (commands.length > 0 && isRunning) {
      // First, force reset the character position
      const startLayer =
        worldData?.collectables?.[0]?.layer || initialPosition.layer
      const correctInitialPosition = {
        ...initialPosition,
        layer: startLayer,
      }

      setCharacterPos(correctInitialPosition)
      setTargetPosition(null)
      setForceUpdate(true)

      // Reset collectables and score
      if (worldData?.collectables) {
        setCollectedItems(new Array(worldData.collectables.length).fill(false))
        setScore(0)
      }

      // Wait for the force update to be applied
      await new Promise((resolve) => setTimeout(resolve, 50))
      setForceUpdate(false)

      // Now process the commands
      for (const command of commands) {
        switch (command) {
          case 'forward':
            await moveForward()
            break
          case 'left':
            turnLeft()
            break
          case 'right':
            turnRight()
            break
        }
      }
    }
  }

  useEffect(() => {
    const runCommands = async () => {
      console.log('running: ', isRunning)
      if (isRunning) {
        await processCommands()
        setRunning(false)
      }
    }
    runCommands()
  }, [isRunning])
  // if (loading) return <div>Loading world...</div>

  // Compute the cat's starting position by taking the grid position and adding the cat offset.
  const catPos = convertPosition(
    characterPos.y,
    characterPos.x,
    characterPos.layer
  )

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ScoreDisplay
        score={score}
        totalCollectables={worldData?.collectables?.length || 0}
      />
      <DebugOverlay
        characterPos={characterPos}
        collectables={worldData?.collectables}
        collectedItems={collectedItems}
        enabled={true} // Set to false to hide in production
      />
      <Canvas camera={{ position: [-2, 2, 3], fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[3, 5, 2]} intensity={1.5} castShadow />
        <Suspense fallback={null}>
          {objects}
          {collectableElements}
          <Character
            position={catPos.toArray() as [number, number, number]}
            rotation={((characterPos.direction ?? 0) * Math.PI) / 3}
            targetPosition={targetPosition}
            onMoveComplete={handleMoveComplete}
            forceUpdate={forceUpdate}
          />
        </Suspense>
        <MapControls />
      </Canvas>
    </div>
  )
}

export default Game
