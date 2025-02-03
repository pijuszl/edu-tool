export interface GridPosition {
  i: number
  j: number
}

export interface Direction {
  di: number
  dj: number
}

export interface HexagonMetrics {
  width: number
  height: number
  scale: number
  horizontalSpacing: number
  verticalSpacing: number
  topSurfaceHeight: number
}
