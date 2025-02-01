import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  Suspense,
  useCallback,
} from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import catModel from '/src/assets/cat/cat.gltf'
import sceneModel from '/src/assets/scene/scene.gltf'
import level1 from '/src/assets/world/level1.json'
import { DoubleSide } from 'three'

// ==================================================
// Types
// ==================================================
interface GridPosition {
  i: number
  j: number
}

// ==================================================
// Constants
// ==================================================
// Adjust these so that the hexagon tile fills a 1x1 cell.
const CELL_SIZE = 1.0
const CHARACTER_SCALE = 0.001
const HEXAGON_SCALE = 1.0 // Tile scale (adjust as needed)
const GRID_SPACING = 1.0 // Use full tile width so they touch exactly
const CELL_HEIGHT = 0.1
const ROTATION_LERP_FACTOR = 5

const ANIMATION_DURATION = 2.0
const ANIMATION_TIMESCALE = 0.7

// ==================================================
// Direction Types & Arrays
// ==================================================
interface Direction {
  di: number
  dj: number
}

const DIRECTIONS_EVEN: Direction[] = [
  { di: 0, dj: 1 },
  { di: -1, dj: 0 },
  { di: -1, dj: -1 },
  { di: 0, dj: -1 },
  { di: 1, dj: -1 },
  { di: 1, dj: 0 },
]

const DIRECTIONS_ODD: Direction[] = [
  { di: 0, dj: 1 },
  { di: -1, dj: 1 },
  { di: -1, dj: 0 },
  { di: 0, dj: -1 },
  { di: 1, dj: 0 },
  { di: 1, dj: 1 },
]

// ==================================================
// Utility Functions
// ==================================================
const easeInOutQuad = (t: number): number =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

function getShortestRotation(current: number, target: number): number {
  const PI2 = Math.PI * 2
  const diff = (target - current) % PI2
  return diff > Math.PI ? diff - PI2 : diff < -Math.PI ? diff + PI2 : diff
}

// ==================================================
// Hexagon Component
// ==================================================
interface HexagonProps {
  position: [number, number, number]
}

function Hexagon({ position }: HexagonProps) {
  // Load the scene GLTF that contains the hexagon and tree geometry.
  const { nodes } = useGLTF(sceneModel) as unknown as GLTF & {
    nodes: Record<string, any>
  }

  // We define a simple random function based on position for consistency.
  const seed = useMemo(
    () => position[0] * 1000 + position[1] * 100 + position[2],
    [position]
  )
  const rand = useCallback(
    (offset: number) => Math.abs((Math.sin(seed + offset) * 10000) % 1),
    [seed]
  )

  // Define colors based on a simple rule.
  // For the hexagon tile, we use a fixed color (adjust as desired).
  const hexColor = new THREE.Color('#50784b')
  // For tree decorations, compute a color that varies slightly.
  const treeColor = useMemo(() => {
    // For example, vary the lightness slightly based on the seed.
    const t = rand(5)
    return new THREE.Color().setHSL(0.1, 0.5, 0.6 + t * 0.1)
  }, [rand])

  // Generate tree decorations.
  const [decorations, setDecorations] = useState<JSX.Element[]>([])
  useEffect(() => {
    if (!nodes.Object_12?.geometry) return

    const numDecorations = Math.floor(rand(0) * 4) // 0–3 trees per hexagon
    const radius = 0.4 // How far from the center trees should appear
    const angleStep = (Math.PI * 2) / 6
    const availableCorners = [0, 1, 2, 3, 4, 5]
    const decor: JSX.Element[] = []

    for (let i = 0; i < numDecorations; i++) {
      const cornerIdx = Math.floor(rand(i) * availableCorners.length)
      const corner = availableCorners.splice(cornerIdx, 1)[0]
      const angle = angleStep * corner

      const pos: [number, number, number] = [
        position[0] + Math.cos(angle) * radius,
        position[1], // at ground level
        position[2] + Math.sin(angle) * radius,
      ]

      decor.push(
        <mesh
          key={`tree-${position.join(',')}-${i}`}
          geometry={nodes.Object_12.geometry}
          position={pos}
          rotation={[0, rand(i + 10) * Math.PI * 2, 0]}
          scale={0.5} // Increase tree size
        >
          <meshStandardMaterial color={treeColor.getStyle()} />
        </mesh>
      )
    }
    setDecorations(decor)
  }, [nodes, position, rand, treeColor])

  return (
    <>
      <mesh
        geometry={nodes.Object_186.geometry}
        position={position}
        scale={[HEXAGON_SCALE, HEXAGON_SCALE, HEXAGON_SCALE]}
      >
        <meshStandardMaterial
          color={hexColor.getStyle()}
          flatShading={true}
          side={DoubleSide}
        />
      </mesh>
      {decorations}
    </>
  )
}

// ==================================================
// Character Component
// ==================================================
interface CharacterProps {
  position: [number, number, number]
  rotation: number
  targetPosition: THREE.Vector3 | null
  onMoveComplete: () => void
}

function Character({
  position,
  rotation,
  targetPosition,
  onMoveComplete,
}: CharacterProps) {
  const { scene, animations } = useGLTF(catModel)
  const { actions } = useAnimations(animations, scene)
  const characterRef = useRef<THREE.Group>(null)
  // Adjust the cat’s y-position so it sits properly on the ground.
  const adjustedPosition = [position[0], position[1] - 0.2, position[2]] as [
    number,
    number,
    number,
  ]
  const currentPos = useRef(new THREE.Vector3(...adjustedPosition))
  const startPos = useRef(new THREE.Vector3(...adjustedPosition))
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
  }, [targetPosition, actions])

  useFrame((_, delta) => {
    if (!characterRef.current) return

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

    if (characterRef.current) {
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
      position={adjustedPosition}
      scale={[CHARACTER_SCALE, CHARACTER_SCALE, CHARACTER_SCALE]}
      rotation={[0, Math.PI, 0]}
    />
  )
}

// ==================================================
// Game Component
// ==================================================
const Game: React.FC = () => {
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

  // Create hexagon tiles so they exactly touch one another.
  const hexagons = useMemo(() => {
    const cells: JSX.Element[] = []
    for (let i = 0; i < worldData.length; i++) {
      for (let j = 0; j < worldData[i].length; j++) {
        if (worldData[i][j] === 1) {
          // For a flat layout, offset x on odd rows.
          const x = j * GRID_SPACING + (i % 2 === 1 ? GRID_SPACING / 2 : 0)
          // Vertical spacing is 0.75*GRID_SPACING.
          const z = i * (GRID_SPACING * 0.75)
          cells.push(<Hexagon key={`${i}-${j}`} position={[x, 0, z]} />)
        }
      }
    }
    return cells
  }, [worldData])

  // Place the cat exactly on the ground.
  const getPositionFromGrid = (i: number, j: number): THREE.Vector3 => {
    const x = j * GRID_SPACING + (i % 2 === 1 ? GRID_SPACING / 2 : 0)
    const z = i * (GRID_SPACING * 0.75)
    return new THREE.Vector3(x, 0, z)
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
      setTargetPosition(getPositionFromGrid(newI, newJ))
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
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          {hexagons}
          <Character
            position={
              getPositionFromGrid(characterPos.i, characterPos.j).toArray() as [
                number,
                number,
                number,
              ]
            }
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

export default Game
