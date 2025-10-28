"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Calculator } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Circle {
  diameter: number
  x?: number
  y?: number
  color: string
}

interface FitResult {
  fits: boolean
  circles: Circle[]
  suggestions?: Circle[]
}

interface MaxCirclesResult {
  totalCount: number
  circlesByType: {
    diameter: number
    color: string
    count: number
    positions: { x: number; y: number }[]
  }[]
}

export function FabricCircleFitter() {
  const [fabricWidth, setFabricWidth] = useState(250)
  const [fabricHeight, setFabricHeight] = useState(250)
  const [gap, setGap] = useState(5)
  const [circles, setCircles] = useState<Circle[]>([
    { diameter: 75, color: "oklch(0.5 0.08 240)" },
    { diameter: 60, color: "oklch(0.45 0.08 220)" },
    { diameter: 50, color: "oklch(0.4 0.08 200)" },
    { diameter: 40, color: "oklch(0.35 0.08 180)" },
  ])
  const [fitResult, setFitResult] = useState<FitResult | null>(null)
  const [maxCirclesResult, setMaxCirclesResult] = useState<MaxCirclesResult | null>(null)
  const [isComputingMax, setIsComputingMax] = useState(false)
  const [activeTab, setActiveTab] = useState("four-circles")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const maxCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const result = tryFitCircles(fabricWidth, fabricHeight, circles, gap)
    setFitResult(result)
    drawCanvas(result)
  }, [fabricWidth, fabricHeight, circles, gap])

  useEffect(() => {
    if (activeTab === "max-circles" && maxCirclesResult) {
      drawMaxCirclesCanvas(maxCirclesResult)
    }
  }, [activeTab, maxCirclesResult])

  const computeMaxCircles = () => {
    setIsComputingMax(true)
    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      const result = calculateMaxCirclesForAll(fabricWidth, fabricHeight, circles, gap)
      setMaxCirclesResult(result)
      drawMaxCirclesCanvas(result)
      setIsComputingMax(false)
    }, 50)
  }

  const tryFitCircles = (width: number, height: number, circlesToFit: Circle[], gapSize: number): FitResult => {
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

  const generateSuggestions = (width: number, height: number, originalCircles: Circle[]): Circle[] => {
    const totalCircleArea = originalCircles.reduce((sum, c) => sum + Math.PI * (c.diameter / 2) ** 2, 0)
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

  const calculateMaxCirclesForAll = (
    width: number,
    height: number,
    circlesToFit: Circle[],
    gapSize: number,
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
      const positions = placedCircles.filter((p) => p.diameter === circle.diameter).map((p) => ({ x: p.x, y: p.y }))

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

  const drawMaxCirclesCanvas = (result: MaxCirclesResult | null) => {
    const canvas = maxCanvasRef.current
    if (!canvas || !result) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const maxCanvasWidth = 600
    const maxCanvasHeight = 400
    const scale = Math.min(maxCanvasWidth / fabricWidth, maxCanvasHeight / fabricHeight, 3)

    canvas.width = fabricWidth * scale
    canvas.height = fabricHeight * scale

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = "oklch(0.97 0.005 240)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = "oklch(0.6 0.02 240)"
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = "oklch(0.85 0.005 240)"
    ctx.lineWidth = 0.5
    const gridSize = 20 * scale
    for (let x = gridSize; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = gridSize; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    let globalIndex = 1
    result.circlesByType.forEach((circleType) => {
      circleType.positions.forEach((pos) => {
        ctx.beginPath()
        ctx.arc(pos.x * scale, pos.y * scale, (circleType.diameter / 2) * scale, 0, Math.PI * 2)
        // Fill with semi-transparent color
        ctx.fillStyle = circleType.color + "60"
        ctx.fill()
        // Stroke with solid color
        ctx.strokeStyle = circleType.color
        ctx.lineWidth = 1.5
        ctx.stroke()

        ctx.fillStyle = "oklch(0.3 0.02 240)"
        ctx.font = `${Math.min(11 * Math.min(scale, 1.5), circleType.diameter * scale * 0.35)}px sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(`${globalIndex}`, pos.x * scale, pos.y * scale)
        globalIndex++
      })
    })

    ctx.fillStyle = "oklch(0.4 0.02 240)"
    ctx.font = `${11 * Math.min(scale, 1.5)}px monospace`
    ctx.textAlign = "center"
    ctx.fillText(`${fabricWidth} × ${fabricHeight} cm`, canvas.width / 2, canvas.height - 8)
  }

  const drawCanvas = (result: FitResult | null) => {
    const canvas = canvasRef.current
    if (!canvas || !result) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const maxCanvasWidth = 600
    const maxCanvasHeight = 400
    const scale = Math.min(maxCanvasWidth / fabricWidth, maxCanvasHeight / fabricHeight, 3)

    canvas.width = fabricWidth * scale
    canvas.height = fabricHeight * scale

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = result.fits ? "oklch(0.97 0.01 140)" : "oklch(0.97 0.01 20)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = "oklch(0.6 0.02 240)"
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = "oklch(0.85 0.005 240)"
    ctx.lineWidth = 0.5
    const gridSize = 20 * scale
    for (let x = gridSize; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = gridSize; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    result.circles.forEach((circle, index) => {
      if (circle.x !== undefined && circle.y !== undefined) {
        ctx.beginPath()
        ctx.arc(circle.x * scale, circle.y * scale, (circle.diameter / 2) * scale, 0, Math.PI * 2)
        // Fill with semi-transparent color
        ctx.fillStyle = circle.color + "60"
        ctx.fill()
        // Stroke with solid color
        ctx.strokeStyle = circle.color
        ctx.lineWidth = 1.5
        ctx.stroke()

        ctx.fillStyle = "oklch(0.3 0.02 240)"
        ctx.font = `${12 * Math.min(scale, 1.5)}px sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(`${circle.diameter}`, circle.x * scale, circle.y * scale)
      }
    })

    ctx.fillStyle = "oklch(0.4 0.02 240)"
    ctx.font = `${11 * Math.min(scale, 1.5)}px monospace`
    ctx.textAlign = "center"
    ctx.fillText(`${fabricWidth} × ${fabricHeight} cm`, canvas.width / 2, canvas.height - 8)
  }

  const updateCircleDiameter = (index: number, value: string) => {
    const diameter = Number.parseFloat(value) || 0
    const newCircles = [...circles]
    newCircles[index] = { ...newCircles[index], diameter }
    setCircles(newCircles)
  }

  const applySuggestions = () => {
    if (fitResult?.suggestions) {
      setCircles(fitResult.suggestions)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="space-y-4">
        <Card className="shadow-none border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dimensions du tissu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="width" className="text-sm">
                  Largeur (cm)
                </Label>
                <Input
                  id="width"
                  type="number"
                  min="1"
                  value={fabricWidth}
                  onChange={(e) => setFabricWidth(Number.parseFloat(e.target.value) || 0)}
                  className="font-mono h-9 shadow-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="height" className="text-sm">
                  Hauteur (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  min="1"
                  value={fabricHeight}
                  onChange={(e) => setFabricHeight(Number.parseFloat(e.target.value) || 0)}
                  className="font-mono h-9 shadow-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gap" className="text-sm">
                Espacement (cm)
              </Label>
              <Input
                id="gap"
                type="number"
                min="0"
                step="1"
                value={gap}
                onChange={(e) => setGap(Number.parseFloat(e.target.value) || 0)}
                className="font-mono h-9 shadow-none"
              />
            </div>
            <div className="text-sm text-muted-foreground pt-1">
              Surface : <span className="font-mono font-medium">{(fabricWidth * fabricHeight).toFixed(0)} cm²</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Diamètres des cercles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {circles.map((circle, index) => (
              <div key={index} className="flex items-center gap-2.5">
                <div
                  className="w-5 h-5 rounded-full border flex-shrink-0"
                  style={{
                    backgroundColor: circle.color + "60",
                    borderColor: circle.color,
                  }}
                />
                <Label htmlFor={`circle-${index}`} className="min-w-[60px] text-sm">
                  Cercle {index + 1}
                </Label>
                <Input
                  id={`circle-${index}`}
                  type="number"
                  min="0.1"
                  step="1"
                  value={circle.diameter}
                  onChange={(e) => updateCircleDiameter(index, e.target.value)}
                  className="font-mono h-9 shadow-none"
                />
                <span className="text-sm text-muted-foreground">cm</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {fitResult && (
          <Alert variant={fitResult.fits ? "default" : "destructive"} className="shadow-none border-border/40">
            <div className="flex items-start gap-2.5">
              {fitResult.fits ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <AlertDescription className="text-sm font-medium mb-0.5">
                  {fitResult.fits ? "Tous les cercles rentrent" : "Les cercles ne rentrent pas"}
                </AlertDescription>
                <AlertDescription className="text-xs">
                  {fitResult.fits
                    ? `Les quatre cercles rentrent avec ${gap} cm d'espacement.`
                    : `Seulement ${fitResult.circles.length} cercle(s) sur 4 peuvent être placés.`}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {fitResult && !fitResult.fits && fitResult.suggestions && (
          <Card className="shadow-none border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tailles suggérées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {fitResult.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center gap-2.5 text-sm">
                  <div
                    className="w-4 h-4 rounded-full border flex-shrink-0"
                    style={{
                      backgroundColor: suggestion.color + "60",
                      borderColor: suggestion.color,
                    }}
                  />
                  <span className="min-w-[60px]">Cercle {index + 1} :</span>
                  <span className="font-mono font-medium">{suggestion.diameter} cm</span>
                  {suggestion.diameter !== circles[index].diameter && (
                    <span className="text-muted-foreground text-xs">(était {circles[index].diameter})</span>
                  )}
                </div>
              ))}
              <Button
                onClick={applySuggestions}
                className="w-full mt-2 h-9 shadow-none bg-transparent"
                variant="outline"
              >
                Appliquer les suggestions
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-none border-border/40">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <CardTitle className="text-base">Cercles maximum</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={computeMaxCircles}
              disabled={isComputingMax}
              className="w-full h-9 shadow-none"
              variant="default"
            >
              {isComputingMax ? "Calcul en cours..." : "Calculer cercles max"}
            </Button>
            {maxCirclesResult && (
              <>
                <div className="text-sm">
                  <div className="font-medium mb-1">Total : {maxCirclesResult.totalCount} cercles</div>
                  <div className="text-xs text-muted-foreground">
                    Dans {fabricWidth} × {fabricHeight} cm avec {gap} cm d'espacement
                  </div>
                </div>
                <div className="space-y-2 pt-1 border-t">
                  {maxCirclesResult.circlesByType.map((circleType, index) => (
                    <div key={index} className="flex items-center gap-2.5 text-sm">
                      <div
                        className="w-4 h-4 rounded-full border flex-shrink-0"
                        style={{
                          backgroundColor: circleType.color + "60",
                          borderColor: circleType.color,
                        }}
                      />
                      <span className="min-w-[60px]">Cercle {index + 1} :</span>
                      <span className="font-mono font-medium">{circleType.count}×</span>
                      <span className="text-muted-foreground text-xs">({circleType.diameter} cm)</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="sticky top-4 shadow-none border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Prévisualisation</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <Tabs defaultValue="four-circles" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-3 h-9 shadow-none">
                <TabsTrigger value="four-circles" className="text-sm">
                  4 cercles
                </TabsTrigger>
                <TabsTrigger value="max-circles" className="text-sm">
                  Cercles max
                </TabsTrigger>
              </TabsList>
              <TabsContent value="four-circles" className="mt-0">
                <div className="flex justify-center items-center bg-muted/30 rounded p-3">
                  <canvas ref={canvasRef} className="max-w-full h-auto border border-border/40 rounded" />
                </div>
              </TabsContent>
              <TabsContent value="max-circles" className="mt-0">
                <div className="flex justify-center items-center bg-muted/30 rounded p-3">
                  <canvas ref={maxCanvasRef} className="max-w-full h-auto border border-border/40 rounded" />
                </div>
                {maxCirclesResult && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    {maxCirclesResult.totalCount} cercles avec {gap} cm d'espacement
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
