import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei'
import { Vector3 } from 'three'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import catModel from '/src/assets/cat.gltf?url'
import { Suspense } from 'react'

// Scaling constants
const CELL_SIZE = 0.5
const CHARACTER_SCALE = 0.001
const GRID_SPACING = CELL_SIZE * Math.sqrt(3)
const CELL_HEIGHT = CELL_SIZE * 0.3
const ROTATION_LERP_FACTOR = 5

// Movement timing configuration
const ANIMATION_DURATION = 2.0 // Base duration for movement
const ANIMATION_TIMESCALE = 0.7 // Animation speed multiplier

// Easing function for smooth movement
const easeInOutQuad = (t) => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

const DIRECTIONS_EVEN = [
  { di: 0, dj: 1 },
  { di: -1, dj: 0 },
  { di: -1, dj: -1 },
  { di: 0, dj: -1 },
  { di: 1, dj: -1 },
  { di: 1, dj: 0 },
]

const DIRECTIONS_ODD = [
  { di: 0, dj: 1 },
  { di: -1, dj: 1 },
  { di: -1, dj: 0 },
  { di: 0, dj: -1 },
  { di: 1, dj: 0 },
  { di: 1, dj: 1 },
]

function getShortestRotation(current, target) {
  const PI2 = Math.PI * 2
  const diff = (target - current) % PI2
  return diff > Math.PI ? diff - PI2 : diff < -Math.PI ? diff + PI2 : diff
}

function Character({ position, rotation, targetPosition, onMoveComplete }) {
  useGLTF.preload(catModel)
  const { scene, animations } = useGLTF(catModel)
  const { actions } = useAnimations(animations, scene)
  const characterRef = useRef()
  const currentPos = useRef(new Vector3(...position))
  const startPos = useRef(new Vector3(...position))
  const currentRotation = useRef(rotation)
  const animationTime = useRef(0)
  const isMoving = useRef(false)

  useEffect(() => {
    if (actions.Scene) {
      actions.Scene.setEffectiveTimeScale(ANIMATION_TIMESCALE)
      actions.Scene.reset().stop()
    }
  }, [actions])

  useEffect(() => {
    if (targetPosition && !isMoving.current) {
      startPos.current.copy(currentPos.current)
      animationTime.current = 0
      isMoving.current = true

      if (actions.Scene) {
        actions.Scene.reset().fadeIn(0.2).play()
      }
    }
  }, [targetPosition])

  useFrame((state, delta) => {
    if (!characterRef.current) return

    // Handle movement
    if (targetPosition && isMoving.current) {
      animationTime.current += delta
      const progress = Math.min(animationTime.current / ANIMATION_DURATION, 1)
      const easedProgress = easeInOutQuad(progress)

      currentPos.current.lerpVectors(
        startPos.current,
        targetPosition,
        easedProgress
      )
      characterRef.current.position.copy(currentPos.current)

      if (progress >= 1) {
        if (actions.Scene) {
          actions.Scene.fadeOut(0.2).stop()
        }
        isMoving.current = false
        onMoveComplete()
      }
    }

    // Handle rotation
    if (characterRef.current.rotation) {
      const targetRot = rotation - Math.PI / 2 + Math.PI
      const rotDelta = getShortestRotation(currentRotation.current, targetRot)
      currentRotation.current += rotDelta * delta * ROTATION_LERP_FACTOR
      characterRef.current.rotation.y = currentRotation.current
    }
  })

  return (
    <primitive
      ref={characterRef}
      object={scene}
      position={position}
      scale={[CHARACTER_SCALE, CHARACTER_SCALE, CHARACTER_SCALE]}
      rotation={[0, Math.PI, 0]}
    />
  )
}

const HexGame = ({ worldData }) => {
  const [characterPos, setCharacterPos] = useState({ i: 0, j: 0 })
  const [characterDir, setCharacterDir] = useState(1)
  const [initialized, setInitialized] = useState(false)
  const [targetPosition, setTargetPosition] = useState(null)
  const [isMoving, setIsMoving] = useState(false)

  useEffect(() => {
    if (!initialized) {
      for (let i = 0; i < worldData.length; i++) {
        for (let j = 0; j < worldData[i].length; j++) {
          if (worldData[i][j] === 1) {
            setCharacterPos({ i, j })
            setInitialized(true)
            return
          }
        }
      }
    }
  }, [worldData, initialized])

  const hexagons = useMemo(() => {
    const cells = []
    for (let i = 0; i < worldData.length; i++) {
      for (let j = 0; j < worldData[i].length; j++) {
        if (worldData[i][j] === 1) {
          const x = j * GRID_SPACING + (i % 2 === 1 ? GRID_SPACING / 2 : 0)
          const z = i * GRID_SPACING * 0.75
          cells.push(
            <mesh key={`${i}-${j}`} position={[x, 0, z]}>
              <cylinderGeometry args={[CELL_SIZE, CELL_SIZE, CELL_HEIGHT, 6]} />
              <meshStandardMaterial color="#607D8B" />
            </mesh>
          )
        }
      }
    }
    return cells
  }, [worldData])

  const turnLeft = () => !isMoving && setCharacterDir((prev) => (prev + 1) % 6)
  const turnRight = () => !isMoving && setCharacterDir((prev) => (prev + 5) % 6)

  const getPositionFromGrid = (i, j) => {
    const x = j * GRID_SPACING + (i % 2 === 1 ? GRID_SPACING / 2 : 0)
    return new Vector3(x, 0.05, i * GRID_SPACING * 0.75)
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
      setTargetPosition(getPositionFromGrid(newI, newJ))
      setCharacterPos({ i: newI, j: newJ })
    }
  }

  const handleMoveComplete = () => {
    setIsMoving(false)
    setTargetPosition(null)
  }

  return (
    <div className="h-screen w-screen">
      <Canvas camera={{ position: [-2, 2, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        {hexagons}
        <Suspense fallback={null}>
          <Character
            position={getPositionFromGrid(characterPos.i, characterPos.j)}
            rotation={(characterDir * Math.PI) / 3}
            targetPosition={targetPosition}
            onMoveComplete={handleMoveComplete}
          />
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

const exampleWorld = [
  [1, 1, 0, 1],
  [0, 1, 1, 0],
  [1, 0, 1, 1],
  [0, 1, 0, 1],
]

export default function Game() {
  return <HexGame worldData={exampleWorld} />
}
