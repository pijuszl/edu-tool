import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { DoubleSide } from 'three'
import sceneModel from '/src/assets/scene/scene.gltf'

interface HexagonProps {
  position: [number, number, number]
  scale: number
}

export const Hexagon: React.FC<HexagonProps> = ({ position, scale }) => {
  const { nodes } = useGLTF(sceneModel) as unknown as GLTF & {
    nodes: Record<string, THREE.Mesh>
  }
  const ref = useRef<THREE.Mesh>(null)

  const seed = useMemo(
    () => position[0] * 1000 + position[1] * 100 + position[2],
    [position]
  )

  const rand = useCallback(
    (offset: number) => Math.abs((Math.sin(seed + offset) * 10000) % 1),
    [seed]
  )

  // Generate tree decorations.
  const [decorations, setDecorations] = useState<JSX.Element[]>([])
  useEffect(() => {
    if (!nodes.Object_12?.geometry) return

    const numDecorations = Math.floor(rand(0) * 4) // 0–3 trees per hexagon
    const radius = 0.4
    const angleStep = (Math.PI * 2) / 6
    const availableCorners = [0, 1, 2, 3, 4, 5]
    const decor: JSX.Element[] = []

    for (let i = 0; i < numDecorations; i++) {
      const cornerIdx = Math.floor(rand(i) * availableCorners.length)
      const corner = availableCorners.splice(cornerIdx, 1)[0]
      const angle = angleStep * corner

      const pos: [number, number, number] = [
        position[0] + Math.cos(angle) * radius,
        position[1],
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
          <meshToonMaterial color="#81bd00" />
        </mesh>
      )
    }
    setDecorations(decor)
  }, [nodes, position, rand])

  useLayoutEffect(() => {
    if (ref.current) {
      // Center geometry at bottom
      ref.current.geometry.computeBoundingBox()
      const box = ref.current.geometry.boundingBox!
      ref.current.position.y = box.max.y * scale
    }
  }, [scale])

  return (
    <>
      <mesh
        ref={ref}
        geometry={nodes.Object_186.geometry}
        position={position}
        scale={[scale, scale, scale]}
      >
        <meshToonMaterial color="#00ff59" side={DoubleSide} />
      </mesh>
      {decorations}
    </>
  )
}
