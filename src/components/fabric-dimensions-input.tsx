"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FabricDimensions } from "@/types/circle-fitter"

interface FabricDimensionsInputProps {
  dimensions: FabricDimensions
  onDimensionsChange: (dimensions: FabricDimensions) => void
}

export function FabricDimensionsInput({ dimensions, onDimensionsChange }: FabricDimensionsInputProps) {
  const handleWidthChange = (value: string) => {
    onDimensionsChange({
      ...dimensions,
      width: Number.parseFloat(value) || 0,
    })
  }

  const handleHeightChange = (value: string) => {
    onDimensionsChange({
      ...dimensions,
      height: Number.parseFloat(value) || 0,
    })
  }

  const handleGapChange = (value: string) => {
    onDimensionsChange({
      ...dimensions,
      gap: Number.parseFloat(value) || 0,
    })
  }

  return (
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
              value={dimensions.width}
              onChange={(e) => handleWidthChange(e.target.value)}
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
              value={dimensions.height}
              onChange={(e) => handleHeightChange(e.target.value)}
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
            value={dimensions.gap}
            onChange={(e) => handleGapChange(e.target.value)}
            className="font-mono h-9 shadow-none"
          />
        </div>
        <div className="text-sm text-muted-foreground pt-1">
          Surface :{" "}
          <span className="font-mono font-medium">
            {(dimensions.width * dimensions.height).toFixed(0)} cm²
          </span>
        </div>
      </CardContent>
    </Card>
  )
}