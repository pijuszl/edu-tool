import * as THREE from 'three'
import { HEX_METRICS } from '../config/game-config'

export const getPositionFromGrid = (
  x: number,
  y: number,
  layer: number
): THREE.Vector3 => {
  const nx =
    x * HEX_METRICS.horizontalSpacing +
    (y % 2 === 1 ? HEX_METRICS.horizontalSpacing / 2 : 0)
  const nz = y * HEX_METRICS.verticalSpacing
  const ny = layer * HEX_METRICS.height

  return new THREE.Vector3(nx, ny, nz)
}
