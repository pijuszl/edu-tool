import {
  Suspense,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react'
import { MapControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { useHexagonMetrics } from '../../hooks/useHexagonMetrics'
import { Hexagon } from './Hexagon'
import { Character } from './Character'
import {
  LevelData,
  WorldData,
  GridPosition,
  HexagonMetrics,
} from '../../types/game-types'
import { DIRECTIONS_EVEN, DIRECTIONS_ODD } from '../../config/game-config'
import {
  useGameCommands,
  useGameRunning,
  useClearCommands,
  useSetRunning,
} from '../../store/game-store'

const Game = ({ levels }: LevelData) => {
  const hexMetrics = useHexagonMetrics()
  const [currentLevel, setCurrentLevel] = useState<number>(0)
  const worldData: WorldData = levels[currentLevel]

  const [characterPos, setCharacterPos] = useState<GridPosition>(
    levels[currentLevel].start
  )
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(
    null
  )
  const [isMoving, setIsMoving] = useState<boolean>(false)

  const commands = useGameCommands()
  const clearCommands = useClearCommands()
  const isRunning = useGameRunning()
  const setRunning = useSetRunning()

  const moveResolveRef = useRef<(() => void) | null>(null)

  const getPositionFromGrid = useCallback(
    (
      i: number,
      j: number,
      layer: number,
      metrics: HexagonMetrics | null
    ): THREE.Vector3 => {
      if (!metrics) return new THREE.Vector3()
      const x =
        j * metrics.horizontalSpacing +
        (i % 2 === 1 ? metrics.horizontalSpacing / 2 : 0)
      const z = i * metrics.verticalSpacing
      // For layer 0, we want the tile’s bottom to be at y = 0.
      // Thus, gridY = (layer * tileHeight) - tileOffset.
      const y = layer * metrics.topSurfaceHeight - metrics.tileOffset
      return new THREE.Vector3(x, y, z)
    },
    []
  )

  const hexagons = useMemo(() => {
    if (!hexMetrics || !worldData) return []
    const cells: React.ReactElement[] = []
    worldData.layers.forEach((layerData, layerIndex) => {
      for (let i = 0; i < layerData.length; i++) {
        for (let j = 0; j < layerData[i].length; j++) {
          if (layerData[i][j] === 1) {
            const pos = getPositionFromGrid(i, j, layerIndex, hexMetrics)
            cells.push(
              <Hexagon
                key={`${layerIndex}-${i}-${j}`}
                position={[pos.x, pos.y, pos.z]}
                scale={hexMetrics.scale}
                layer={layerIndex}
              />
            )
          }
        }
      }
    })
    return cells
  }, [levels, hexMetrics, getPositionFromGrid])

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
    if (!isMoving && hexMetrics) {
      const { x, y, layer } = characterPos
      const currentLayerData = worldData.layers[layer]
      const directions = y % 2 === 0 ? DIRECTIONS_EVEN : DIRECTIONS_ODD
      const delta = directions[characterPos.direction ?? 0]
      const newX = x + delta.dx
      const newY = y + delta.dy

      if (
        newY >= 0 &&
        newY < currentLayerData.length &&
        newX >= 0 &&
        newX < currentLayerData[newY].length &&
        currentLayerData[newY][newX] === 1
      ) {
        // Block movement if an upper block exists directly above.
        if (layer + 1 < worldData.layers.length) {
          const upperLayerData = worldData.layers[layer + 1]
          if (
            newY < upperLayerData.length &&
            newX < upperLayerData[newY].length &&
            upperLayerData[newY][newX] === 1
          ) {
            return
          }
        }
        setIsMoving(true)
        // Compute target tile's base position and then add the cat offset.
        const newTilePos = getPositionFromGrid(newY, newX, layer, hexMetrics)

        newTilePos.y += hexMetrics.topSurfaceHeight // Cat should remain on top

        setCharacterPos((prev) => ({
          ...prev,
          x: newX,
          y: newY,
          layer,
        }))

        await new Promise((resolve) => setTimeout(resolve, 50))

        setTargetPosition(newTilePos)
      }

      return new Promise<void>((resolve) => {
        moveResolveRef.current = resolve
      })
    }
  }, [
    isMoving,
    levels,
    worldData,
    hexMetrics,
    getPositionFromGrid,
    characterPos,
  ])

  const handleMoveComplete = () => {
    setIsMoving(false)
    setTargetPosition(null)

    if (moveResolveRef.current) {
      moveResolveRef.current()
      moveResolveRef.current = null
    }
  }

  const processCommands = async () => {
    if (commands.length > 0 && isRunning) {
      console.log('commands: ', commands)
      for (const command of commands) {
        switch (command) {
          case 'forward':
            await moveForward()
            await new Promise((resolve) => setTimeout(resolve, 200)) // Small delay for state update
            break
          case 'left':
            turnLeft()
            await new Promise((resolve) => setTimeout(resolve, 500)) // Turn animation delay
            break
          case 'right':
            turnRight()
            await new Promise((resolve) => setTimeout(resolve, 500))
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

  // Compute the cat’s starting position by taking the grid position and adding the cat offset.
  const catPos = hexMetrics
    ? getPositionFromGrid(
        characterPos.y,
        characterPos.x,
        characterPos.layer,
        hexMetrics
      )
    : new THREE.Vector3()
  if (hexMetrics) {
    catPos.y += hexMetrics.topSurfaceHeight // Raise the cat so it sits on top
  }

  return (
    <Canvas camera={{ position: [-2, 2, 3], fov: 50 }}>
      <ambientLight intensity={1} />
      <directionalLight position={[3, 5, 2]} intensity={1.5} castShadow />
      <Suspense fallback={null}>
        {hexagons}
        {hexMetrics && (
          <Character
            position={catPos.toArray() as [number, number, number]}
            rotation={((characterPos.direction ?? 0) * Math.PI) / 3}
            targetPosition={targetPosition}
            onMoveComplete={handleMoveComplete}
          />
        )}
      </Suspense>
      <MapControls />
    </Canvas>
  )
}

export default Game
