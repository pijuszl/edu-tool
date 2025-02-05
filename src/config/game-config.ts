import { Direction } from '../types/game-types'

export const CELL_SIZE = 1.0
export const CHARACTER_SCALE = 0.001
export const ROTATION_LERP_FACTOR = 5
export const ANIMATION_DURATION = 2.0
export const ANIMATION_TIMESCALE = 0.7

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
