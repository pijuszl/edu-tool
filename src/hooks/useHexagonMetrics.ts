// src/hooks/useHexagonMetrics.ts
import { useState, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { HexagonMetrics } from '../types/game-types'
import sceneModel from '/src/assets/scene/scene.gltf'

export const useHexagonMetrics = (): HexagonMetrics | null => {
  const { nodes } = useGLTF(sceneModel) as unknown as GLTF & {
    nodes: Record<string, THREE.Mesh>
  }
  const [metrics, setMetrics] = useState<HexagonMetrics | null>(null)

  useEffect(() => {
    if (nodes.Object_186?.geometry) {
      const mesh = new THREE.Mesh(nodes.Object_186.geometry)
      const box = new THREE.Box3().setFromObject(mesh)

      const width = box.max.x - box.min.x
      const height = box.max.y - box.min.y
      const desiredWidth = 1.0
      const scale = desiredWidth / width
      const tileHeight = height * scale // the tile’s height after scaling
      const tileOffset = -box.min.y * scale // shift needed so that the geometry’s bottom is at y = 0

      setMetrics({
        width,
        height,
        scale,
        horizontalSpacing: desiredWidth,
        verticalSpacing: (desiredWidth * Math.sqrt(3)) / 2,
        topSurfaceHeight: tileHeight,
        tileOffset: tileOffset,
      })
    }
  }, [nodes])

  return metrics
}
