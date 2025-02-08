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
      x: number,
      y: number,
      layer: number,
      metrics: HexagonMetrics | null
    ): THREE.Vector3 => {
      if (!metrics) return new THREE.Vector3()
      const nx =
        x * metrics.horizontalSpacing +
        (y % 2 === 1 ? metrics.horizontalSpacing / 2 : 0)
      const nz = y * metrics.verticalSpacing
      // For layer 0, we want the tile’s bottom to be at y = 0.
      // Thus, gridY = (layer * tileHeight) - tileOffset.
      const ny = layer * metrics.topSurfaceHeight - metrics.tileOffset
      return new THREE.Vector3(nx, ny, nz)
    },
    []
  )

  const hexagons = useMemo(() => {
    if (!hexMetrics || !worldData) return []
    const cells: React.ReactElement[] = []
    worldData.layers.forEach((layerData, layerIndex) => {
      for (let y = 0; y < layerData.length; y++) {
        for (let x = 0; x < layerData[y].length; x++) {
          if (layerData[y][x] === 1) {
            const pos = getPositionFromGrid(x, y, layerIndex, hexMetrics)
            cells.push(
              <Hexagon
                key={`${layerIndex}-${y}-${x}`}
                position={[pos.x, pos.y, pos.z]}
                scale={hexMetrics.scale}
                layer={layerIndex}
              />
            )
          } else if (layerData[y][x] === 2) {
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
      setIsMoving(true)

      setCharacterPos((prev) => {
        const { x, y, layer, direction } = prev // Get the latest position
        const directions = y % 2 === 0 ? DIRECTIONS_EVEN : DIRECTIONS_ODD
        const delta = directions[direction ?? 0]

        const newX = x + delta.dx
        const newY = y + delta.dy

        const currentLayerData = worldData.layers[layer]

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
              setIsMoving(false)
              return prev // No movement
            }
          }

          console.log(`Moving from (${x}, ${y})`)
          console.log(`Moving to (${newX}, ${newY})`)

          const newTilePos = getPositionFromGrid(newX, newY, layer, hexMetrics)
          newTilePos.y += hexMetrics.topSurfaceHeight

          setTargetPosition(newTilePos)

          return { ...prev, x: newX, y: newY, layer }
        }

        setIsMoving(false)
        return prev // No movement
      })

      // Wait for React to update the state before proceeding
      await new Promise((resolve) => setTimeout(resolve, 50))

      setIsMoving(false)

      return new Promise<void>((resolve) => {
        moveResolveRef.current = resolve
      })
    }
  }, [isMoving, worldData, hexMetrics, getPositionFromGrid])

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
