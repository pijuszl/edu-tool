// import React, {
//   useMemo,
//   useCallback,
//   useState,
//   useEffect,
//   useRef,
//   useLayoutEffect,
// } from 'react'
// import { useGLTF } from '@react-three/drei'
// import * as THREE from 'three'
// import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
// import { DoubleSide } from 'three'
// import sceneModel from '/src/assets/scene/scene.gltf'
// import { GridPosition } from '../../types/game-types'

// interface GameObjectProps {
//   position: GridPosition
//   scale: number
// }

// export const GameObject = ({ position, scale }: GameObjectProps) => {
//   const { nodes } = useGLTF(sceneModel) as unknown as GLTF & {
//     nodes: Record<string, THREE.Mesh>
//   }
//   const ref = useRef<THREE.Mesh>(null)

//   const seed = useMemo(
//     () => position[0] * 1000 + position[1] * 100 + position[2],
//     [position]
//   )

//   const rand = useCallback(
//     (offset: number) => Math.abs((Math.sin(seed + offset) * 10000) % 1),
//     [seed]
//   )

//   // Compute tile offset from geometry so the bottom aligns at y = 0.
//   let tileOffset = 0
//   if (nodes.Object_186?.geometry) {
//     const mesh = new THREE.Mesh(nodes.Object_186.geometry)
//     const box = new THREE.Box3().setFromObject(mesh)
//     tileOffset = -box.min.y * scale
//   }

//   // Generate tree decorations – add the tile offset so trees appear on top.
//   const [decorations, setDecorations] = useState<React.ReactElement[]>([])
//   useEffect(() => {
//     if (!nodes.Object_12?.geometry) return

//     const numDecorations = Math.floor(rand(0) * 4)
//     const radius = 0.4
//     const angleStep = (Math.PI * 2) / 6
//     const availableCorners = [0, 1, 2, 3, 4, 5]
//     const decor: React.ReactElement[] = []

//     for (let i = 0; i < numDecorations; i++) {
//       const cornerIdx = Math.floor(rand(i) * availableCorners.length)
//       const corner = availableCorners.splice(cornerIdx, 1)[0]
//       const angle = angleStep * corner

//       const pos: [number, number, number] = [
//         position[0] + Math.cos(angle) * radius,
//         position[1] + tileOffset,
//         position[2] + Math.sin(angle) * radius,
//       ]

//       decor.push(
//         <mesh
//           key={`tree-${position.join(',')}-${i}`}
//           geometry={nodes.Object_12.geometry}
//           position={pos}
//           rotation={[0, rand(i + 10) * Math.PI * 2, 0]}
//           scale={0.5}
//         >
//           <meshToonMaterial color="#81bd00" />
//         </mesh>
//       )
//     }
//     setDecorations(decor)
//   }, [nodes, position, rand, tileOffset])

//   useLayoutEffect(() => {
//     if (ref.current && ref.current.geometry) {
//       ref.current.geometry.computeBoundingBox()
//       const box = ref.current.geometry.boundingBox!
//       const offsetY = -box.min.y * scale
//       // Shift the mesh so that its bottom aligns with the grid position.
//       ref.current.position.y = position[1] + offsetY
//       // Use renderOrder based on layer so that upper layers are drawn on top.
//       ref.current.renderOrder = layer
//     }
//   }, [scale, position, layer])

//   return (
//     <>
//       <mesh
//         ref={ref}
//         geometry={nodes.Object_186.geometry}
//         position={position}
//         scale={[scale, scale, scale]}
//       >
//         <meshToonMaterial
//           color="#00ff59"
//           side={DoubleSide}
//           polygonOffset
//           polygonOffsetFactor={-1 - layer}
//           polygonOffsetUnits={1}
//         />
//       </mesh>
//       {decorations}
//     </>
//   )
// }
