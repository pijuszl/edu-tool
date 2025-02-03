import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

const Game = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      <OrbitControls enableZoom={true} />
      <axesHelper args={[5]} />
    </Canvas>
  )
}

export default Game
