import { GridMoves, HexagonMetrics } from '../types/game-types'

export const CHARACTER_SCALE = 0.001
export const ROTATION_LERP_FACTOR = 5
export const ANIMATION_DURATION = 2.0
export const ANIMATION_TIMESCALE = 0.7

export const DIRECTIONS_EVEN: GridMoves[] = [
  { dx: 1, dy: 0 },
  { dx: 0, dy: -1 },
  { dx: -1, dy: -1 },
  { dx: -1, dy: 0 },
  { dx: -1, dy: 1 },
  { dx: 0, dy: 1 },
]

export const DIRECTIONS_ODD: GridMoves[] = [
  { dx: 1, dy: 0 },
  { dx: 1, dy: -1 },
  { dx: 0, dy: -1 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 1, dy: 1 },
]

const HEX_WIDTH = 1 // R in hexagon

export const HEX_METRICS: HexagonMetrics = {
  width: HEX_WIDTH,
  height: 0.7,
  horizontalSpacing: Math.sqrt(3) * HEX_WIDTH,
  verticalSpacing: HEX_WIDTH + HEX_WIDTH / 2,
}
