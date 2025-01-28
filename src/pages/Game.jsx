import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState, useMemo, useEffect } from 'react'

const DIRECTIONS_EVEN = [
  { di: 0, dj: 1 }, // East
  { di: -1, dj: 0 }, // Northeast
  { di: -1, dj: -1 }, // Northwest
  { di: 0, dj: -1 }, // West
  { di: 1, dj: -1 }, // Southwest
  { di: 1, dj: 0 }, // Southeast
]

const DIRECTIONS_ODD = [
  { di: 0, dj: 1 }, // East
  { di: -1, dj: 1 }, // Northeast
  { di: -1, dj: 0 }, // Northwest
  { di: 0, dj: -1 }, // West
  { di: 1, dj: 0 }, // Southwest
  { di: 1, dj: 1 }, // Southeast
]

function Character({ position, rotation, targetPosition, onMoveComplete }) {
  const { scene, animations } = useGLTF('/player.gltf')
  const { actions, mixer } = useAnimations(animations, scene)
  const characterRef = useRef()
  const currentPos = useRef(new Vector3(...position))

  useFrame((state, delta) => {
    if (characterRef.current && targetPosition) {
      const distance = currentPos.current.distanceTo(targetPosition)

      if (distance > 0.1) {
        // Move towards target position
        currentPos.current.lerp(targetPosition, delta * 5)
        characterRef.current.position.copy(currentPos.current)

        // Play walk animation if not already playing
        if (!actions.Walk?.isRunning()) {
          actions.Walk?.play()
        }
      } else {
        // Snap to final position and stop animation
        characterRef.current.position.copy(targetPosition)
        actions.Walk?.stop()
        onMoveComplete()
      }
    }
  })

  return (
    <primitive
      ref={characterRef}
      object={scene}
      position={position}
      rotation={[0, rotation, 0]}
      scale={[0.5, 0.5, 0.5]}
    />
  )
}

const Game = ({ worldData }) => {
  const [characterPos, setCharacterPos] = useState({ i: 0, j: 0 })
  const [characterDir, setCharacterDir] = useState(0)
  const [initialized, setInitialized] = useState(false)

  // Initialize character position to first available block
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

  // Generate hexagonal grid
  const hexagons = useMemo(() => {
    const cells = []
    for (let i = 0; i < worldData.length; i++) {
      for (let j = 0; j < worldData[i].length; j++) {
        if (worldData[i][j] === 1) {
          const x = j * Math.sqrt(3) + (i % 2 === 1 ? Math.sqrt(3) / 2 : 0)
          const z = i * 1.5
          cells.push(
            <mesh key={`${i}-${j}`} position={[x, 0, z]}>
              <cylinderGeometry args={[1, 1, 1, 6]} />
              <meshStandardMaterial color="#607D8B" />
            </mesh>
          )
        }
      }
    }
    return cells
  }, [worldData])

  // Calculate character position in 3D space
  const charPosition = useMemo(() => {
    const { i, j } = characterPos
    const x = j * Math.sqrt(3) + (i % 2 === 1 ? Math.sqrt(3) / 2 : 0)
    return [x, 0.5, i * 1.5]
  }, [characterPos])

  // Movement functions
  const turnLeft = () => setCharacterDir((prev) => (prev + 5) % 6)
  const turnRight = () => setCharacterDir((prev) => (prev + 1) % 6)

  const moveForward = () => {
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
      setCharacterPos({ i: newI, j: newJ })
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 15, 0], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        {hexagons}

        <mesh
          position={charPosition}
          rotation={[0, (characterDir * Math.PI) / 3, 0]}
        >
          <boxGeometry args={[0.8, 1, 0.8]} />
          <meshStandardMaterial color="#E91E63" />
        </mesh>

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>

      <div
        style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
        }}
      >
        <button onClick={turnLeft}>↩ Turn Left</button>
        <button onClick={moveForward}>↑ Move Forward</button>
        <button onClick={turnRight}>↪ Turn Right</button>
      </div>
    </div>
  )
}

export default Game
