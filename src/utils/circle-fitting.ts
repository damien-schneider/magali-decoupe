import type {
  Circle,
  FitResult,
  MaxCirclesResult,
} from "@/types/circle-fitter";

const COMPUTATION_TIMEOUT_MS = 20_000; // 20 seconds timeout

const checkTimeout = (startTime: number): boolean =>
  Date.now() - startTime > COMPUTATION_TIMEOUT_MS;

type Position = {
  x: number;
  y: number;
};

type PositionSearchParams = {
  width: number;
  height: number;
  radius: number;
  placedCircles: Circle[];
  gapSize: number;
  startTime: number;
};

const isValidPosition = (
  params: {
    x: number;
    y: number;
    radius: number;
    placedCircles: Circle[];
    gapSize: number;
  }
): boolean => {
  const { x, y, radius, placedCircles, gapSize } = params;
  
  for (const other of placedCircles) {
    if (other.x === undefined || other.y === undefined) {
      return false;
    }
    const dx = x - other.x;
    const dy = y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = radius + other.diameter / 2 + gapSize;
    if (distance < minDistance - 0.1) {
      return false;
    }
  }
  return true;
};

const findPositionForCircle = (
  params: PositionSearchParams
): Position | null => {
  const { width, height, radius, placedCircles, gapSize, startTime } = params;

  for (let x = radius; x <= width - radius; x += 2) {
    if (checkTimeout(startTime)) {
      return null;
    }
    
    for (let y = radius; y <= height - radius; y += 2) {
      if (checkTimeout(startTime)) {
        return null;
      }
      
      if (isValidPosition({ x, y, radius, placedCircles, gapSize })) {
        return { x, y };
      }
    }
  }
  
  return null;
};

export const tryFitCircles = (
  width: number,
  height: number,
  circlesToFit: Circle[],
  gapSize: number
): FitResult => {
  const computationStartTime = Date.now();
  const sortedCircles = [...circlesToFit].sort(
    (a, b) => b.diameter - a.diameter
  );
  const placedCircles: Circle[] = [];

  for (const circle of sortedCircles) {
    if (checkTimeout(computationStartTime)) {
      const suggestions = generateSuggestions(width, height, circlesToFit);
      return {
        fits: false,
        circles: placedCircles,
        suggestions,
        timeout: true
      };
    }

    const position = findPositionForCircle({
      width,
      height,
      radius: circle.diameter / 2,
      placedCircles,
      gapSize,
      startTime: computationStartTime,
    });

    if (position) {
      placedCircles.push({ ...circle, ...position });
    } else {
      const suggestions = generateSuggestions(width, height, circlesToFit);
      return { fits: false, circles: placedCircles, suggestions };
    }
  }

  return { fits: true, circles: placedCircles };
};
export const generateSuggestions = (
  width: number,
  height: number,
  originalCircles: Circle[]
): Circle[] => {
  const totalCircleArea = originalCircles.reduce(
    (sum, c) => sum + Math.PI * (c.diameter / 2) ** 2,
    0
  );
  const fabricArea = width * height;

  if (totalCircleArea > fabricArea * 0.7) {
    const scaleFactor = Math.sqrt((fabricArea * 0.6) / totalCircleArea);
    return originalCircles.map((c) => ({
      ...c,
      diameter: Math.round(c.diameter * scaleFactor * 10) / 10,
    }));
  }

  const sorted = [...originalCircles].sort((a, b) => b.diameter - a.diameter);
  return sorted.map((c, i) => ({
    ...c,
    diameter: i < 2 ? Math.round(c.diameter * 0.85 * 10) / 10 : c.diameter,
  }));
};

const tryPlaceCircle = (
  params: {
    width: number;
    height: number;
    circle: Circle;
    placedCircles: { x: number; y: number; diameter: number; color: string }[];
    gapSize: number;
    stepSize: number;
  }
): boolean => {
  const { width, height, circle, placedCircles, gapSize, stepSize } = params;
  const radius = circle.diameter / 2;

  for (let x = radius; x <= width - radius; x += stepSize) {
    for (let y = radius; y <= height - radius; y += stepSize) {
      const isValid = placedCircles.every((other) => {
        const dx = x - other.x;
        const dy = y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = radius + other.diameter / 2 + gapSize;
        return distance >= minDistance - 0.1;
      });

      if (isValid) {
        placedCircles.push({
          x,
          y,
          diameter: circle.diameter,
          color: circle.color,
        });
        return true;
      }
    }
  }
  
  return false;
};

const groupCirclesByType = (
  params: {
    sortedCircles: Circle[];
    placedCircles: { x: number; y: number; diameter: number; color: string }[];
  }
): { diameter: number; color: string; count: number; positions: { x: number; y: number }[] }[] => {
  const { sortedCircles, placedCircles } = params;
  
  return sortedCircles.map((circle) => {
    const positions = placedCircles
      .filter((p) => p.diameter === circle.diameter)
      .map((p) => ({ x: p.x, y: p.y }));

    return {
      diameter: circle.diameter,
      color: circle.color,
      count: positions.length,
      positions,
    };
  });
};

export const calculateMaxCirclesForAll = (
  width: number,
  height: number,
  circlesToFit: Circle[],
  gapSize: number
): MaxCirclesResult => {
  const computationStartTime = Date.now();
  const placedCircles: {
    x: number;
    y: number;
    diameter: number;
    color: string;
  }[] = [];
  const sortedCircles = [...circlesToFit].sort(
    (a, b) => b.diameter - a.diameter
  );

  // Optimize: Use larger step size based on smallest circle
  const minDiameter = Math.min(...sortedCircles.map((c) => c.diameter));
  const stepSize = minDiameter * 0.4;

  let circleIndex = 0;
  let consecutiveFailures = 0;
  const maxConsecutiveFailures = sortedCircles.length * 3;
  const maxAttempts = 5000; // Reduced from 10000

  while (
    consecutiveFailures < maxConsecutiveFailures &&
    circleIndex < maxAttempts
  ) {
    // Check for timeout
    if (Date.now() - computationStartTime > COMPUTATION_TIMEOUT_MS) {
      return {
        totalCount: placedCircles.length,
        circlesByType: groupCirclesByType({ sortedCircles, placedCircles }),
        timeout: true,
      };
    }

    const currentCircle = sortedCircles[circleIndex % sortedCircles.length];
    const placed = tryPlaceCircle({
      width,
      height,
      circle: currentCircle,
      placedCircles,
      gapSize,
      stepSize,
    });

    if (placed) {
      consecutiveFailures = 0;
    } else {
      consecutiveFailures++;
    }

    circleIndex++;
  }

  return {
    totalCount: placedCircles.length,
    circlesByType: groupCirclesByType({ sortedCircles, placedCircles }),
  };
};