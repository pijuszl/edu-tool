import React, { useState, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import * as THREE from 'three'
import level1 from '/src/assets/world/level1.json'
import { useHexagonMetrics } from '../hooks/useHexagonMetrics'
import { Hexagon } from '../components/Hexagon'
import { Character } from '../components/Character'
import { GridPosition, HexagonMetrics } from '../types/GameTypes'
import { DIRECTIONS_EVEN, DIRECTIONS_ODD } from '../constants/directions'

const GamePage: React.FC = () => {
  const hexMetrics = useHexagonMetrics()
  const [worldData, setWorldData] = useState<number[][]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [characterPos, setCharacterPos] = useState<GridPosition>({ i: 0, j: 0 })
  const [characterDir, setCharacterDir] = useState<number>(1)
  const [initialized, setInitialized] = useState<boolean>(false)
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(
    null
  )
  const [isMoving, setIsMoving] = useState<boolean>(false)

  useEffect(() => {
    if (!initialized) {
      const data: number[][] = level1
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
          if (data[i][j] === 1) {
            setCharacterPos({ i, j })
            setInitialized(true)
            setWorldData(data)
            setLoading(false)
            return
          }
        }
      }
    }
  }, [initialized])

  const hexagons = useMemo(() => {
    if (!hexMetrics) return []
    const cells: JSX.Element[] = []
    for (let i = 0; i < worldData.length; i++) {
      for (let j = 0; j < worldData[i].length; j++) {
        if (worldData[i][j] === 1) {
          const x =
            j * hexMetrics.horizontalSpacing +
            (i % 2 === 1 ? hexMetrics.horizontalSpacing / 2 : 0)
          const z = i * hexMetrics.verticalSpacing
          cells.push(
            <Hexagon
              key={`${i}-${j}`}
              position={[x, 0, z]}
              scale={hexMetrics.scale}
            />
          )
        }
      }
    }
    return cells
  }, [worldData, hexMetrics])

  const getPositionFromGrid = (
    i: number,
    j: number,
    metrics: HexagonMetrics | null
  ): THREE.Vector3 => {
    if (!metrics) return new THREE.Vector3()
    const x =
      j * metrics.horizontalSpacing +
      (i % 2 === 1 ? metrics.horizontalSpacing / 2 : 0)
    const z = i * metrics.verticalSpacing
    return new THREE.Vector3(x, metrics.topSurfaceHeight, z)
  }

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
    if (isMoving) return
    const { i, j } = characterPos
    const directions = i % 2 === 0 ? DIRECTIONS_EVEN : DIRECTIONS_ODD
    const delta = directions[characterDir]
    const newI = i + delta.di
    const newJ = j + delta.dj

    if (
      newI >= 0 &&
      newI < worldData.length &&
      newJ >= 0 &&
      newJ < worldData[newI].length &&
      worldData[newI][newJ] === 1
    ) {
      setIsMoving(true)
      setTargetPosition(getPositionFromGrid(newI, newJ, hexMetrics))
      setCharacterPos({ i: newI, j: newJ })
    }
  }

  const handleMoveComplete = () => {
    setIsMoving(false)
    setTargetPosition(null)
  }

  if (loading) return <div>Loading world...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="h-screen w-screen">
      <Canvas camera={{ position: [-2, 2, 3], fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[3, 5, 2]} intensity={1.5} castShadow />
        <Suspense fallback={null}>
          {hexagons}
          {hexMetrics && (
            <Character
              position={
                getPositionFromGrid(
                  characterPos.i,
                  characterPos.j,
                  hexMetrics
                ).toArray() as [number, number, number]
              }
              rotation={(characterDir * Math.PI) / 3}
              targetPosition={targetPosition}
              onMoveComplete={handleMoveComplete}
            />
          )}
        </Suspense>
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
      <div className="absolute left-1/2 top-5 flex -translate-x-1/2 transform gap-2">
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-400"
          onClick={turnLeft}
          disabled={isMoving}
        >
          ↩ Turn Left
        </button>
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-400"
          onClick={moveForward}
          disabled={isMoving}
        >
          ↑ Move Forward
        </button>
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-400"
          onClick={turnRight}
          disabled={isMoving}
        >
          ↪ Turn Right
        </button>
      </div>
    </div>
  )
}

export default GamePage
