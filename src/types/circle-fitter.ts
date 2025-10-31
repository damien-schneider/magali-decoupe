export type Circle = {
  diameter: number;
  x?: number;
  y?: number;
  color: string;
};

export type FitResult = {
  fits: boolean;
  circles: Circle[];
  suggestions?: Circle[];
  timeout?: boolean;
};

export type MaxCirclesResult = {
  totalCount: number;
  circlesByType: {
    diameter: number;
    color: string;
    count: number;
    positions: { x: number; y: number }[];
  }[];
  timeout?: boolean;
};

export type FabricDimensions = {
  width: number;
  height: number;
  gap: number;
};
