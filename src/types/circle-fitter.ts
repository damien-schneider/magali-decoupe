export interface Circle {
  diameter: number
  x?: number
  y?: number
  color: string
}

export interface FitResult {
  fits: boolean
  circles: Circle[]
  suggestions?: Circle[]
}

export interface MaxCirclesResult {
  totalCount: number
  circlesByType: {
    diameter: number
    color: string
    count: number
    positions: { x: number; y: number }[]
  }[]
}

export interface FabricDimensions {
  width: number
  height: number
  gap: number
}