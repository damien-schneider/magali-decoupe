import { Circle, FitResult, MaxCirclesResult } from "@/types/circle-fitter"

export const tryFitCircles = (
  width: number,
  height: number,
  circlesToFit: Circle[],
  gapSize: number
): FitResult => {
  const sortedCircles = [...circlesToFit].sort((a, b) => b.diameter - a.diameter)
  const placedCircles: Circle[] = []

  for (const circle of sortedCircles) {
    const radius = circle.diameter / 2
    let placed = false

    for (let x = radius; x <= width - radius && !placed; x += 2) {
      for (let y = radius; y <= height - radius && !placed; y += 2) {
        const isValid = placedCircles.every((other) => {
          const dx = x - other.x!
          const dy = y - other.y!
          const distance = Math.sqrt(dx * dx + dy * dy)
          const minDistance = radius + other.diameter / 2 + gapSize
          return distance >= minDistance - 0.1
        })

        if (isValid) {
          placedCircles.push({ ...circle, x, y })
          placed = true
        }
      }
    }

    if (!placed) {
      const suggestions = generateSuggestions(width, height, circlesToFit)
      return { fits: false, circles: placedCircles, suggestions }
    }
  }

  return { fits: true, circles: placedCircles }
}

export const generateSuggestions = (
  width: number,
  height: number,
  originalCircles: Circle[]
): Circle[] => {
  const totalCircleArea = originalCircles.reduce(
    (sum, c) => sum + Math.PI * (c.diameter / 2) ** 2,
    0
  )
  const fabricArea = width * height

  if (totalCircleArea > fabricArea * 0.7) {
    const scaleFactor = Math.sqrt((fabricArea * 0.6) / totalCircleArea)
    return originalCircles.map((c) => ({
      ...c,
      diameter: Math.round(c.diameter * scaleFactor * 10) / 10,
    }))
  }

  const sorted = [...originalCircles].sort((a, b) => b.diameter - a.diameter)
  return sorted.map((c, i) => ({
    ...c,
    diameter: i < 2 ? Math.round(c.diameter * 0.85 * 10) / 10 : c.diameter,
  }))
}

export const calculateMaxCirclesForAll = (
  width: number,
  height: number,
  circlesToFit: Circle[],
  gapSize: number
): MaxCirclesResult => {
  const placedCircles: { x: number; y: number; diameter: number; color: string }[] = []
  const sortedCircles = [...circlesToFit].sort((a, b) => b.diameter - a.diameter)

  // Optimize: Use larger step size based on smallest circle
  const minDiameter = Math.min(...sortedCircles.map((c) => c.diameter))
  const stepSize = minDiameter * 0.4

  let circleIndex = 0
  let consecutiveFailures = 0
  const maxConsecutiveFailures = sortedCircles.length * 3
  const maxAttempts = 5000 // Reduced from 10000

  while (consecutiveFailures < maxConsecutiveFailures && circleIndex < maxAttempts) {
    const currentCircle = sortedCircles[circleIndex % sortedCircles.length]
    const radius = currentCircle.diameter / 2
    let placed = false

    // Try to find a valid position for this circle
    for (let x = radius; x <= width - radius && !placed; x += stepSize) {
      for (let y = radius; y <= height - radius && !placed; y += stepSize) {
        const isValid = placedCircles.every((other) => {
          const dx = x - other.x
          const dy = y - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const minDistance = radius + other.diameter / 2 + gapSize
          return distance >= minDistance - 0.1
        })

        if (isValid) {
          placedCircles.push({
            x,
            y,
            diameter: currentCircle.diameter,
            color: currentCircle.color,
          })
          placed = true
          consecutiveFailures = 0
        }
      }
    }

    if (!placed) {
      consecutiveFailures++
    }

    circleIndex++
  }

  // Group circles by type
  const circlesByType = sortedCircles.map((circle) => {
    const positions = placedCircles
      .filter((p) => p.diameter === circle.diameter)
      .map((p) => ({ x: p.x, y: p.y }))

    return {
      diameter: circle.diameter,
      color: circle.color,
      count: positions.length,
      positions,
    }
  })

  return {
    totalCount: placedCircles.length,
    circlesByType,
  }
}