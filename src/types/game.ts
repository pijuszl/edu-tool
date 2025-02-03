export type Command = 'forward' | 'left' | 'right'

export interface GridPosition {
  i: number
  j: number
}

export interface HexagonMetrics {
  width: number
  height: number
  scale: number
  horizontalSpacing: number
  verticalSpacing: number
  topSurfaceHeight: number
}

export interface Direction {
  di: number
  dj: number
}
