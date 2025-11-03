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

const isValidPosition = (params: {
  x: number;
  y: number;
  radius: number;
  placedCircles: Circle[];
  gapSize: number;
}): boolean => {
  const { x, y, radius, placedCircles, gapSize } = params;

  for (const other of placedCircles) {
    if (other.x === undefined || other.y === undefined) {
      return false;
    }
    const dx = x - other.x;
    const dy = y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = radius + other.diameter / 2 + gapSize;
    // FIX: Increase tolerance for floating-point precision with small step sizes
    if (distance < minDistance - 0.01) {
      // Reduced tolerance from 0.1 to 0.01 for better precision
      return false;
    }
  }
  return true;
};

// Optimized position finder with better packing efficiency
// Helper function to try hexagonal packing pattern
const tryHexagonalPacking = (
  searchParams: PositionSearchParams
): Position | null => {
  const { width, height, radius, placedCircles, gapSize, startTime } =
    searchParams;

  // Use hexagonal packing pattern - offset every other row
  const rowHeight = radius * Math.sqrt(3);

  for (let row = 0; row * rowHeight <= height + radius; row++) {
    if (checkTimeout(startTime)) {
      return null;
    }

    const y = row * rowHeight + radius;
    const xOffset = (row % 2) * radius; // Offset every other row for hexagonal packing

    for (let col = 0; col * (2 * radius) <= width + 2 * radius; col++) {
      if (checkTimeout(startTime)) {
        return null;
      }

      const x = col * (2 * radius) + xOffset + radius;

      // Check boundaries
      if (
        x < radius ||
        x > width - radius ||
        y < radius ||
        y > height - radius
      ) {
        continue;
      }

      if (isValidPosition({ x, y, radius, placedCircles, gapSize })) {
        return { x, y };
      }
    }
  }

  return null;
};

// Helper function for fine-grained search
const tryFineGrainedSearch = (
  searchParams: PositionSearchParams
): Position | null => {
  const { width, height, radius, placedCircles, gapSize, startTime } =
    searchParams;
  const stepSize = Math.max(radius * 0.3, 1.5);

  for (let x = radius; x <= width - radius; x += stepSize) {
    if (checkTimeout(startTime)) {
      return null;
    }

    for (let y = radius; y <= height - radius; y += stepSize) {
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

const findPositionForCircle = (
  params: PositionSearchParams
): Position | null => {
  // Try hexagonal packing first for better space efficiency
  const position = tryHexagonalPacking(params);
  if (position) {
    return position;
  }

  // Fallback to fine-grained search
  return tryFineGrainedSearch(params);
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
        timeout: true,
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

type CircleValidationParams = {
  x: number;
  y: number;
  radius: number;
  placedCircles: { x: number; y: number; diameter: number; color: string }[];
  gapSize: number;
};

const isValidCirclePosition = (params: CircleValidationParams): boolean => {
  const { x, y, radius, placedCircles, gapSize } = params;
  return placedCircles.every((other) => {
    const dx = x - other.x;
    const dy = y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = radius + other.diameter / 2 + gapSize;
    // ULTRA-FLEXIBLE: Much more tolerance for mixed circle sizes
    return distance >= minDistance - 0.5; // Increased tolerance for mixed sizes
  });
};

type HexagonalPlacementParams = {
  width: number;
  height: number;
  radius: number;
  placedCircles: { x: number; y: number; diameter: number; color: string }[];
  gapSize: number;
};

const tryHexagonalPlacement = (
  params: HexagonalPlacementParams
): { x: number; y: number } | null => {
  const { width, height, radius, placedCircles, gapSize } = params;
  const rowHeight = radius * Math.sqrt(3);

  for (let row = 0; row * rowHeight <= height + radius; row++) {
    const y = row * rowHeight + radius;
    const xOffset = (row % 2) * radius; // Offset every other row for hexagonal packing

    for (let col = 0; col * (2 * radius) <= width + 2 * radius; col++) {
      const x = col * (2 * radius) + xOffset + radius;

      // Check boundaries
      if (
        x < radius ||
        x > width - radius ||
        y < radius ||
        y > height - radius
      ) {
        continue;
      }

      if (isValidCirclePosition({ x, y, radius, placedCircles, gapSize })) {
        return { x, y };
      }
    }
  }

  return null;
};

type GridPlacementParams = HexagonalPlacementParams & { stepSize: number };

const tryGridPlacement = (
  params: GridPlacementParams
): { x: number; y: number } | null => {
  const { width, height, radius, placedCircles, gapSize } = params;

  // BASIC GRID SEARCH: Much simpler, more robust for mixed sizes
  const searchStep = Math.max(radius * 0.8, 3); // Larger step for mixed sizes

  for (let x = radius; x <= width - radius; x += searchStep) {
    for (let y = radius; y <= height - radius; y += searchStep) {
      if (isValidCirclePosition({ x, y, radius, placedCircles, gapSize })) {
        return { x, y };
      }
    }
  }

  // FALLBACK: Try corners and center if grid search fails
  const fallbackPositions = [
    { x: radius, y: radius },
    { x: width - radius, y: radius },
    { x: radius, y: height - radius },
    { x: width - radius, y: height - radius },
    { x: width / 2, y: height / 2 },
  ];

  for (const pos of fallbackPositions) {
    if (isValidCirclePosition({ ...pos, radius, placedCircles, gapSize })) {
      return pos;
    }
  }

  return null;
};

const tryPlaceCircle = (params: {
  width: number;
  height: number;
  circle: Circle;
  placedCircles: { x: number; y: number; diameter: number; color: string }[];
  gapSize: number;
  stepSize: number;
}): boolean => {
  const { width, height, circle, placedCircles, gapSize, stepSize } = params;
  const radius = circle.diameter / 2;

  // SIMPLE FIX: Try grid placement first for mixed circle sizes
  const gridPosition = tryGridPlacement({
    width,
    height,
    radius,
    placedCircles,
    gapSize,
    stepSize,
  });

  if (gridPosition) {
    placedCircles.push({
      x: gridPosition.x,
      y: gridPosition.y,
      diameter: circle.diameter,
      color: circle.color,
    });
    return true;
  }

  // Fallback to hexagonal placement for better efficiency with similar sizes
  const position = tryHexagonalPlacement({
    width,
    height,
    radius,
    placedCircles,
    gapSize,
  });

  if (position) {
    placedCircles.push({
      x: position.x,
      y: position.y,
      diameter: circle.diameter,
      color: circle.color,
    });
    return true;
  }

  return false;
};

const groupCirclesByType = (params: {
  sortedCircles: Circle[];
  placedCircles: { x: number; y: number; diameter: number; color: string }[];
}): {
  diameter: number;
  color: string;
  count: number;
  positions: { x: number; y: number }[];
}[] => {
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

type MultipleAttemptsParams = {
  width: number;
  height: number;
  circles: Circle[];
  gapSize: number;
  attempts: number;
  timeoutMs: number;
};

// Multiple attempts strategy to find the best distribution
const runMultipleAttempts = (
  params: MultipleAttemptsParams
): MaxCirclesResult => {
  const { width, height, circles, gapSize, attempts, timeoutMs } = params;
  let bestResult: MaxCirclesResult | null = null;
  let bestScore = -1;
  const startTime = Date.now();

  for (let attempt = 0; attempt < attempts; attempt++) {
    // Check overall timeout
    if (Date.now() - startTime > timeoutMs) {
      break;
    }

    const result = calculateMaxCirclesForSingleAttempt({
      width,
      height,
      circles,
      gapSize,
      timeoutMs: timeoutMs - (Date.now() - startTime),
    });
    const score = evaluateResult(result);

    if (score > bestScore) {
      bestScore = score;
      bestResult = result;
    }
  }

  return (
    bestResult ?? {
      totalCount: 0,
      circlesByType: circles.map((circle) => ({
        diameter: circle.diameter,
        color: circle.color,
        count: 0,
        positions: [],
      })),
    }
  );
};

// Enhanced evaluation system that strongly rewards optimal distributions
const evaluateResult = (result: MaxCirclesResult): number => {
  const counts = result.circlesByType.map((c) => c.count);
  const totalCount = result.totalCount;

  if (totalCount === 0) {
    return 0;
  }

  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  const balanceGap = maxCount - minCount;

  // Base score from total circles
  let score = totalCount * 10;

  // Massive bonus for perfect or near-perfect distributions
  if (balanceGap === 0) {
    // Perfect balance (e.g., 3-3-3-3)
    score += 1000;
  } else if (balanceGap === 1 && totalCount >= 12) {
    // Near-perfect balance (e.g., 3-3-3-4 or 3-3-4-4)
    score += 500;
  } else if (balanceGap === 2 && totalCount >= 12) {
    // Good balance
    score += 200;
  }

  // Heavier penalty for very unbalanced distributions
  const balancePenalty = balanceGap * balanceGap * (balanceGap >= 3 ? 5 : 2);
  score -= balancePenalty;

  // Bonus for having at least some circles of each type
  const typesWithCircles = counts.filter((count) => count > 0).length;
  if (typesWithCircles === counts.length) {
    score += 100; // Bonus for using all circle types
  }

  return score;
};

type SingleAttemptParams = {
  width: number;
  height: number;
  circles: Circle[];
  gapSize: number;
  timeoutMs: number;
};

// Single attempt calculation with improved sequence generation
const calculateMaxCirclesForSingleAttempt = (
  params: SingleAttemptParams
): MaxCirclesResult => {
  const { width, height, circles, gapSize, timeoutMs } = params;
  const computationStartTime = Date.now();
  const placedCircles: {
    x: number;
    y: number;
    diameter: number;
    color: string;
  }[] = [];
  const sortedCircles = [...circles].sort((a, b) => b.diameter - a.diameter);

  // Optimize: Use adaptive step size based on smallest circle for better space efficiency
  const minDiameter = Math.min(...sortedCircles.map((c) => c.diameter));
  // FIX: Use minimum step size to avoid floating-point precision issues with small circles
  const stepSize = Math.max(minDiameter * 0.25, 2.0); // Minimum 2.0 step size regardless of circle diameter

  // SIZE-AWARE TARGET: Adaptive based on circle size diversity
  const maxDiameter = Math.max(...sortedCircles.map((c) => c.diameter));
  const sizeRatio = maxDiameter / minDiameter;

  // Calculate theoretical maximum circles based on smallest circle
  const maxPossibleCircles = Math.floor(
    (width * height) / (Math.PI * (minDiameter / 2) ** 2)
  );

  let targetAttempts: number;
  if (sizeRatio > 3) {
    // Very mixed sizes (10cm with 40cm+) - conservative
    const conservativeEstimate = Math.floor(maxPossibleCircles * 0.15);
    targetAttempts = Math.min(conservativeEstimate, 30);
  } else if (sizeRatio > 2) {
    // Moderately mixed sizes - medium
    const mediumEstimate = Math.floor(maxPossibleCircles * 0.5);
    targetAttempts = Math.min(mediumEstimate, 100);
  } else {
    // Similar sizes - generous (preserve original behavior)
    const generousEstimate = Math.floor(maxPossibleCircles * 2);
    targetAttempts = Math.min(generousEstimate, 300);
  }

  const circleSequence = createPrioritizedCircleSequence(
    sortedCircles,
    targetAttempts,
    timeoutMs
  );

  let consecutiveFailures = 0;
  // FIX: Allow more attempts when dealing with many different circle sizes to avoid premature termination
  const maxConsecutiveFailures = Math.max(sortedCircles.length * 10, 50); // Increased threshold for mixed circle sizes

  for (const currentCircle of circleSequence) {
    // Check for timeout
    if (Date.now() - computationStartTime > timeoutMs) {
      return {
        totalCount: placedCircles.length,
        circlesByType: groupCirclesByType({ sortedCircles, placedCircles }),
        timeout: true,
      };
    }

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

    // FIX: More aggressive early termination to avoid trying too many failed attempts
    // Break if we have some success OR if we're failing too much with no success
    if (
      placedCircles.length === 0 &&
      consecutiveFailures >= Math.min(maxConsecutiveFailures, 50)
    ) {
      // If we haven't placed any circles yet and failing too much, try a different strategy
      break;
    }
    if (
      placedCircles.length > 0 &&
      consecutiveFailures >= maxConsecutiveFailures
    ) {
      // If we have placed some circles but keep failing, stop
      break;
    }
  }

  return {
    totalCount: placedCircles.length,
    circlesByType: groupCirclesByType({ sortedCircles, placedCircles }),
  };
};

// DEFINITIVE FIX: Size-aware prioritization that respects geometric constraints
const createPrioritizedCircleSequence = (
  circles: Circle[],
  targetCount: number,
  seed: number = Date.now()
): Circle[] => {
  const sortedCircles = [...circles].sort((a, b) => a.diameter - b.diameter);
  const prioritizedSequence: Circle[] = [];

  // Deterministic pseudo-random number generator
  let randomState = seed;
  const deterministicRandom = () => {
    randomState = (randomState * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return randomState / 4_294_967_296;
  };

  // Group circles by geometric compatibility (size ratios)
  const sizeGroups: number[][] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < sortedCircles.length; i++) {
    if (usedIndices.has(i)) continue;

    const group = [i];
    usedIndices.add(i);

    for (let j = i + 1; j < sortedCircles.length; j++) {
      if (usedIndices.has(j)) continue;

      const ratio = sortedCircles[j].diameter / sortedCircles[i].diameter;
      // Geomtrically compatible if diameter ratio ≤ 1.5 (more restrictive)
      if (ratio <= 1.5) {
        group.push(j);
        usedIndices.add(j);
      }
    }
    sizeGroups.push(group);
  }

  // Create sequence respecting geometric compatibility
  for (let i = 0; i < targetCount; i++) {
    // First, try to place circles within their size groups
    const allCounts = new Array(sortedCircles.length).fill(0);
    sizeGroups.forEach((group) => {
      group.forEach((index) => {
        // Count how many circles of each type we've placed
        allCounts[index] = prioritizedSequence.filter(
          (c) => Math.abs(c.diameter - sortedCircles[index].diameter) < 0.1
        ).length;
      });
    });

    const groupMinCounts = sizeGroups.map((group) =>
      Math.min(...group.map((index) => allCounts[index]))
    );

    // Find the most underrepresented size group
    const minGroupCount = Math.min(...groupMinCounts);
    const underrepresentedGroups = sizeGroups
      .map((group, groupIndex) => ({
        group,
        groupIndex,
        count: groupMinCounts[groupIndex],
      }))
      .filter((item) => item.count === minGroupCount);

    // Pick a random circle from the most underrepresented group
    const selectedGroup =
      underrepresentedGroups[
        Math.floor(deterministicRandom() * underrepresentedGroups.length)
      ].group;
    const selectedIndex =
      selectedGroup[Math.floor(deterministicRandom() * selectedGroup.length)];

    const selectedCircle = sortedCircles[selectedIndex];
    prioritizedSequence.push({ ...selectedCircle });
  }

  return prioritizedSequence;
};

type CalculateMaxCirclesParams = {
  width: number;
  height: number;
  circlesToFit: Circle[];
  gapSize: number;
  options?: {
    attempts?: number; // Number of attempts to run (higher = better distribution, slower)
    timeoutMs?: number; // Timeout in milliseconds
  };
};

export const calculateMaxCirclesForAll = (
  params: CalculateMaxCirclesParams
): MaxCirclesResult => {
  const { width, height, circlesToFit, gapSize, options } = params;

  // Use multiple attempts to find the best distribution
  // This significantly increases our chances of finding optimal placements
  return runMultipleAttempts({
    width,
    height,
    circles: circlesToFit,
    gapSize,
    attempts: options?.attempts ?? 15, // Default 15 attempts
    timeoutMs: options?.timeoutMs ?? COMPUTATION_TIMEOUT_MS,
  });
};
