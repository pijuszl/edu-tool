import { useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import catModel from '../../assets/cat/cat.gltf'

const CHARACTER_SCALE = 0.001
const ROTATION_LERP_FACTOR = 5
const ANIMATION_DURATION = 2.0

const Character = ({ position, rotation, targetPosition }: any) => {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF(catModel)
  const { actions } = useAnimations(animations, group)
  const currentPos = useMemo(() => new THREE.Vector3(...position), [position])
  const targetPos = useRef(new THREE.Vector3())
  const startPos = useRef(new THREE.Vector3())
  const progress = useRef(0)

  useEffect(() => {
    if (targetPosition) {
      startPos.current.copy(currentPos)
      targetPos.current.copy(targetPosition)
      progress.current = 0
      actions.Scene?.play()
    }
  }, [targetPosition])

  useFrame((_, delta) => {
    if (!group.current) return

    if (targetPosition && progress.current < 1) {
      progress.current = Math.min(
        progress.current + delta / ANIMATION_DURATION,
        1
      )
      group.current.position.lerpVectors(
        startPos.current,
        targetPos.current,
        progress.current
      )
    }

    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      rotation,
      delta * ROTATION_LERP_FACTOR
    )
  })

  return (
    <primitive
      ref={group}
      object={scene}
      position={currentPos}
      scale={CHARACTER_SCALE}
      rotation={[0, Math.PI, 0]}
    />
  )
}

export default Character
