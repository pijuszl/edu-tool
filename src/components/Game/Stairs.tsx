import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { GamePosition } from '../../types/game-types'
import stairsModel from '/src/assets/stairs/stairs.gltf'
import { HEX_METRICS, STAIRS_SCALE } from '../../config/game-config'

type GLTFResult = GLTF & {
  nodes: {
    Object_216: THREE.Mesh
  }
  materials: {
    lpb_gradient: THREE.MeshPhysicalMaterial
  }
}

export const Stairs = ({ position, direction = 0 }: GamePosition) => {
  const { nodes, materials } = useGLTF(stairsModel) as GLTFResult

  const rotation = direction * -(Math.PI / 3) - Math.PI / 2
  const offsetX = (HEX_METRICS.radius / 2) * Math.sin(rotation)
  const offsetZ = (HEX_METRICS.radius / 2) * Math.cos(rotation)

  return (
    <group
      position={[position[0] - offsetX, position[1], position[2] - offsetZ]}
      rotation={[0, rotation, 0]}
    >
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.Object_216 as THREE.Mesh).geometry}
        material={materials.lpb_gradient}
        position={[-0.17, 0.1, 0.2]}
        scale={STAIRS_SCALE}
      />
    </group>
  )
}

useGLTF.preload(stairsModel)
