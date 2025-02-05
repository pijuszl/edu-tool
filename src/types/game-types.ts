export interface GridPosition {
  i: number
  j: number
  layer: number
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
  topSurfaceHeight: number // The tile’s full height (after scaling)
  tileOffset: number // Amount to shift geometry vertically so its bottom is at y = 0
}
