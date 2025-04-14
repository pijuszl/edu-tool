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
  start: GridPosition
  layers: number[][][]
  collectables: GridPosition[]
  finish: GridPosition
}

export type LevelData = {
  levels: WorldData[]
}

export type HexagonMetrics = {
  radius: number //Radius of the circle that circumscribes the hexagon
  height: number
  horizontalSpacing: number
  verticalSpacing: number
}

export type GamePosition = {
  position: [number, number, number]
  direction?: number
}
