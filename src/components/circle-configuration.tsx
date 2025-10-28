"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Circle } from "@/types/circle-fitter"

interface CircleConfigurationProps {
  circles: Circle[]
  onCirclesChange: (circles: Circle[]) => void
}

export function CircleConfiguration({ circles, onCirclesChange }: CircleConfigurationProps) {
  const updateCircleDiameter = (index: number, value: string) => {
    const diameter = Number.parseFloat(value) || 0
    const newCircles = [...circles]
    newCircles[index] = { ...newCircles[index], diameter }
    onCirclesChange(newCircles)
  }

  return (
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
  )
}