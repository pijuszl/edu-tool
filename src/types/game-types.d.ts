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

export type HexagonMetrics = {
  radius: number //R in hexagon
  height: number
  horizontalSpacing: number
  verticalSpacing: number
}

export type GamePosition = {
  position: [number, number, number]
  direction?: number
}
