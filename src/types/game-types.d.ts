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

export type WorldData = {
  start: Position
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
