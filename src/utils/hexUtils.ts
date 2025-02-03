import { Direction } from '../types/game'
import * as THREE from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import sceneModel from '/src/assets/scene/scene.gltf'
import { useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { HexagonMetrics } from '../types/game'

export const DIRECTIONS_EVEN: Direction[] = [
  { di: 0, dj: 1 },
  { di: -1, dj: 0 },
  { di: -1, dj: -1 },
  { di: 0, dj: -1 },
  { di: 1, dj: -1 },
  { di: 1, dj: 0 },
]

export const DIRECTIONS_ODD: Direction[] = [
  { di: 0, dj: 1 },
  { di: -1, dj: 1 },
  { di: -1, dj: 0 },
  { di: 0, dj: -1 },
  { di: 1, dj: 0 },
  { di: 1, dj: 1 },
]

export const useHexagonMetrics = () => {
  const { nodes } = useGLTF(sceneModel) as unknown as GLTF & {
    nodes: Record<string, THREE.Mesh>
  }
  const [metrics, setMetrics] = useState<HexagonMetrics | null>(null)

  useEffect(() => {
    if (nodes.Object_186?.geometry) {
      const mesh = new THREE.Mesh(nodes.Object_186.geometry)
      const box = new THREE.Box3().setFromObject(mesh)

      // Get actual model dimensions
      const width = box.max.x - box.min.x
      const height = box.max.y - box.min.y // Use Y-axis for vertical height
      const desiredWidth = 1.0 // Target width in world units
      const scale = desiredWidth / width

      setMetrics({
        width,
        height,
        scale,
        horizontalSpacing: desiredWidth,
        verticalSpacing: (desiredWidth * Math.sqrt(3)) / 2,
        topSurfaceHeight: box.max.y * scale, // Highest point after scaling
      })
    }
  }, [nodes])

  return metrics
}
