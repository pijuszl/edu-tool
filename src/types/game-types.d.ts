export type GridPosition = {
  layer: number
  x: number
  y: number
  direction?: number
}

export type GridMoves = {
  dx: number
  dy: number
}

export type WorldSize = {
  width: number
  length: number
  height: number
}

export type WorldData = {
  start: Position
  worldSize: WorldSize
  layers: number[][][]
  collectables: Position[]
}

export type LevelData = {
  levels: WorldData[]
}

export interface HexagonMetrics {
  width: number
  height: number
  scale: number
  horizontalSpacing: number
  verticalSpacing: number
  topSurfaceHeight: number // The tile’s full height (after scaling)
  tileOffset: number // Amount to shift geometry vertically so its bottom is at y = 0
}
