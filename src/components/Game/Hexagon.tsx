// Hexagon.tsx
import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from 'react'
import * as THREE from 'three'
import { DoubleSide } from 'three'
import { Tree } from './Tree'
import { HEX_METRICS } from '../../config/game-config'

interface HexagonProps {
  position: [number, number, number]
  layer: number
}

export const Hexagon = ({ position, layer }: HexagonProps) => {
  const ref = useRef<THREE.Mesh>(null)

  const seed = useMemo(
    () => position[0] * 1000 + position[1] * 100 + position[2],
    [position]
  )

  const rand = useCallback(
    (offset: number) => Math.abs((Math.sin(seed + offset) * 10000) % 1),
    [seed]
  )

  // In Hexagon.tsx
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    const angle = (2 * Math.PI) / 6

    shape.moveTo(
      HEX_METRICS.width * Math.cos(0),
      HEX_METRICS.width * Math.sin(0)
    )
    for (let i = 1; i <= 6; i++) {
      shape.lineTo(
        HEX_METRICS.width * Math.cos(angle * i),
        HEX_METRICS.width * Math.sin(angle * i)
      )
    }

    // Create geometry and rotate it to lie flat
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: HEX_METRICS.height,
      bevelEnabled: false,
    })

    // Rotate geometry to make it lie flat on XZ plane
    geom.rotateX(-Math.PI / 2)
    geom.rotateY(Math.PI / 2)

    return geom
  }, [])

  const [decorations, setDecorations] = useState<JSX.Element[]>([])

  useEffect(() => {
    const numDecorations = Math.floor(rand(0) * 4)
    const radius = HEX_METRICS.width * 0.5
    const angleStep = (Math.PI * 2) / 6
    const availableCorners = [0, 1, 2, 3, 4, 5]
    const decor: JSX.Element[] = []

    for (let i = 0; i < numDecorations; i++) {
      const cornerIdx = Math.floor(rand(i) * availableCorners.length)
      const corner = availableCorners.splice(cornerIdx, 1)[0]
      const angle = angleStep * corner

      const pos: [number, number, number] = [
        position[0] + Math.cos(angle) * radius,
        position[1] + HEX_METRICS.height,
        position[2] + Math.sin(angle) * radius,
      ]

      decor.push(
        <Tree
          key={`tree-${position.join(',')}-${i}`}
          position={pos}
          rotation={[0, rand(i + 10) * Math.PI * 2, 0]}
          scale={0.5}
        />
      )
    }
    setDecorations(decor)
  }, [rand, position])

  useLayoutEffect(() => {
    if (ref.current && ref.current.geometry) {
      ref.current.geometry.computeBoundingBox()
      const box = ref.current.geometry.boundingBox!
      const offsetY = -box.min.y * 1
      ref.current.position.y = position[1] + offsetY
      ref.current.renderOrder = layer
    }
  }, [position, layer])

  return (
    <>
      <mesh ref={ref} geometry={geometry} position={position} scale={[1, 1, 1]}>
        <meshToonMaterial color="#00ff59" side={DoubleSide} />
      </mesh>
      {decorations}
    </>
  )
}
