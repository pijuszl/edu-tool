import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { HEX_METRICS } from '../../config/game-config'
import { GamePosition } from '../../types/game-types'

export const Hexagon = ({ position }: GamePosition) => {
  const ref = useRef<THREE.Mesh>(null)

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

  return (
    <>
      <mesh ref={ref} geometry={geometry} position={position}>
        <meshToonMaterial color="#00ff59" />
      </mesh>
    </>
  )
}
