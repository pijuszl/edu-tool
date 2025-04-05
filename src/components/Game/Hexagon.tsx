// Hexagon.tsx
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { DoubleSide } from 'three'
import { HEX_METRICS } from '../../config/game-config'
import { GamePosition } from '../../types/game-types'

export const Hexagon = ({ position }: GamePosition) => {
  const ref = useRef<THREE.Mesh>(null)

  // const seed = useMemo(
  //   () => position[0] * 1000 + position[1] * 100 + position[2],
  //   [position]
  // )

  // const rand = useCallback(
  //   (offset: number) => Math.abs((Math.sin(seed + offset) * 10000) % 1),
  //   [seed]
  // )

  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    const angle = (2 * Math.PI) / 6

    shape.moveTo(
      HEX_METRICS.radius * Math.cos(0),
      HEX_METRICS.radius * Math.sin(0)
    )
    for (let i = 1; i <= 6; i++) {
      shape.lineTo(
        HEX_METRICS.radius * Math.cos(angle * i),
        HEX_METRICS.radius * Math.sin(angle * i)
      )
    }

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: HEX_METRICS.height,
      bevelEnabled: false,
    })

    geom.rotateX(-Math.PI / 2)
    geom.rotateY(Math.PI / 2)

    return geom
  }, [])

  // const [decorations, setDecorations] = useState<React.ReactElement[]>([])

  // useEffect(() => {
  //   const numDecorations = Math.floor(rand(0) * 4)
  //   const radius = HEX_METRICS.radius * 0.5
  //   const angleStep = (Math.PI * 2) / 6
  //   const availableCorners = [0, 1, 2, 3, 4, 5]
  //   const decor: React.ReactElement[] = []

  //   for (let i = 0; i < numDecorations; i++) {
  //     const cornerIdx = Math.floor(rand(i) * availableCorners.length)
  //     const corner = availableCorners.splice(cornerIdx, 1)[0]
  //     const angle = angleStep * corner

  //     const pos: [number, number, number] = [
  //       position[0] + Math.cos(angle) * radius,
  //       position[1] + HEX_METRICS.height,
  //       position[2] + Math.sin(angle) * radius,
  //     ]

  //     decor.push(
  //       <Tree
  //         key={`tree-${position.join(',')}-${i}`}
  //         position={pos}
  //         rotation={[0, rand(i + 10) * Math.PI * 2, 0]}
  //         scale={1}
  //       />
  //     )
  //   }
  //   setDecorations(decor)
  // }, [rand, position])

  // useLayoutEffect(() => {
  //   if (ref.current && ref.current.geometry) {
  //     ref.current.geometry.computeBoundingBox()
  //     const box = ref.current.geometry.boundingBox!
  //     const offsetY = -box.min.y * 1
  //     ref.current.position.y = position[1] + offsetY
  //     ref.current.renderOrder = layer
  //   }
  // }, [position, layer])

  return (
    <>
      <mesh ref={ref} geometry={geometry} position={position}>
        <meshToonMaterial color="#00ff59" side={DoubleSide} />
      </mesh>
      {/* {decorations} */}
    </>
  )
}
