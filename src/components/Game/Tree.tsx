// Tree.tsx
import React from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import sceneModel from '/src/assets/scene/scene.gltf'

type TreeProps = {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
}

export const Tree = ({ position, rotation, scale }: TreeProps) => {
  const { nodes } = useGLTF(sceneModel) as unknown as GLTF & {
    nodes: Record<string, THREE.Mesh>
  }

  return (
    <mesh
      geometry={nodes.Object_12.geometry}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <meshToonMaterial color="#81bd00" />
    </mesh>
  )
}
