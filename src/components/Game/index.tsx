import React, {
  Suspense,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import levelData from '/src/assets/world/level1.json'
import { useHexagonMetrics } from '../../hooks/useHexagonMetrics'
import { Hexagon } from './Hexagon'
import { Character } from './Character'
import { GridPosition, HexagonMetrics } from 'src/types/GameTypes'
import { DIRECTIONS_EVEN, DIRECTIONS_ODD } from 'src/constants/directions'

type WorldData = {
  levels: number[][][]
}

const Game = () => {
  const hexMetrics = useHexagonMetrics()
  const [worldData, setWorldData] = useState<WorldData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [characterPos, setCharacterPos] = useState<GridPosition>({
    i: 0,
    j: 0,
    layer: 0,
  })
  const [characterDir, setCharacterDir] = useState<number>(1)
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(
    null
  )
  const [isMoving, setIsMoving] = useState<boolean>(false)

  useEffect(() => {
    const data: WorldData = levelData
    if (data.levels && data.levels.length > 0) {
      // Choose the first valid cell in layer 0 as the starting position.
      const level0 = data.levels[0]
      for (let i = 0; i < level0.length; i++) {
        for (let j = 0; j < level0[i].length; j++) {
          if (level0[i][j] === 1) {
            setCharacterPos({ i, j, layer: 0 })
            setWorldData(data)
            setLoading(false)
            return
          }
        }
      }
    } else {
      setError('Invalid world data')
      setLoading(false)
    }
  }, [])

  // Compute grid positions using the metrics.
  // The grid position represents the tile’s base position.
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
    const cells: JSX.Element[] = []
    worldData.levels.forEach((layerData, layerIndex) => {
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
  }, [worldData, hexMetrics, getPositionFromGrid])

  const turnLeft = () => {
    if (!isMoving) {
      setCharacterDir((prev) => (prev + 1) % 6)
    }
  }

  const turnRight = () => {
    if (!isMoving) {
      setCharacterDir((prev) => (prev + 5) % 6)
    }
  }

  const moveForward = () => {
    if (isMoving || !worldData || !hexMetrics) return
    const { i, j, layer } = characterPos
    const currentLayerData = worldData.levels[layer]
    const directions = i % 2 === 0 ? DIRECTIONS_EVEN : DIRECTIONS_ODD
    const delta = directions[characterDir]
    const newI = i + delta.di
    const newJ = j + delta.dj

    if (
      newI >= 0 &&
      newI < currentLayerData.length &&
      newJ >= 0 &&
      newJ < currentLayerData[newI].length &&
      currentLayerData[newI][newJ] === 1
    ) {
      // Block movement if an upper block exists directly above.
      if (layer + 1 < worldData.levels.length) {
        const upperLayerData = worldData.levels[layer + 1]
        if (
          newI < upperLayerData.length &&
          newJ < upperLayerData[newI].length &&
          upperLayerData[newI][newJ] === 1
        ) {
          return
        }
      }
      setIsMoving(true)
      // Compute target tile's base position and then add the cat offset.
      const newTilePos = getPositionFromGrid(newI, newJ, layer, hexMetrics)
      newTilePos.y += hexMetrics.topSurfaceHeight // Cat should remain on top
      setTargetPosition(newTilePos)
      setCharacterPos({ i: newI, j: newJ, layer })
    }
  }

  const handleMoveComplete = () => {
    setIsMoving(false)
    setTargetPosition(null)
  }

  if (loading) return <div>Loading world...</div>
  if (error) return <div>Error: {error}</div>

  // Compute the cat’s starting position by taking the grid position and adding the cat offset.
  const catPos = hexMetrics
    ? getPositionFromGrid(
        characterPos.i,
        characterPos.j,
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
            rotation={(characterDir * Math.PI) / 3}
            targetPosition={targetPosition}
            onMoveComplete={handleMoveComplete}
          />
        )}
      </Suspense>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </Canvas>
  )
}

export default Game
