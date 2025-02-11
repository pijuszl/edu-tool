import React, { useMemo, useCallback } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { GamePosition } from '../../types/game-types'
import treesModel from '/src/assets/trees/trees.gltf'
import { TREES_SCALE } from '../../config/game-config'

type GLTFResult = GLTF & {
  nodes: {
    Object_66: THREE.Mesh
    Object_230: THREE.Mesh
    Object_232: THREE.Mesh
    Object_234: THREE.Mesh
  }
  materials: {
    lpb_gradient: THREE.MeshPhysicalMaterial
  }
}

export const Trees = ({ position }: GamePosition) => {
  const { nodes, materials } = useGLTF(treesModel) as GLTFResult

  const rotation = useMemo(() => {
    const seed = position[0] + position[1] + position[2]
    return seed * (Math.PI / 3)
  }, [position])

  return (
    <group
      position={[position[0], position[1], position[2]]}
      scale={TREES_SCALE}
      rotation={[0, rotation, 0]}
    >
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_66.geometry}
        material={materials.lpb_gradient}
        position={[0.39, 0, 0.35]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_230.geometry}
        material={materials.lpb_gradient}
        position={[-0.1, 0, -0.65]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_232.geometry}
        material={materials.lpb_gradient}
        position={[-0.54, 0, 0.35]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_234.geometry}
        material={materials.lpb_gradient}
        position={[0.804, 0, -0.305]}
      />
    </group>
  )
}

useGLTF.preload(treesModel)
