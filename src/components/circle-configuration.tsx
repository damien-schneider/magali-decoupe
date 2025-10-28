"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Circle } from "@/types/circle-fitter";

type CircleConfigurationProps = {
  circles: Circle[];
  onCirclesChange: (circles: Circle[]) => void;
};

export function CircleConfiguration({
  circles,
  onCirclesChange,
}: CircleConfigurationProps) {
  const updateCircleDiameter = (index: number, value: string) => {
    const diameter = Number.parseFloat(value) || 0;
    const newCircles = [...circles];
    newCircles[index] = { ...newCircles[index], diameter };
    onCirclesChange(newCircles);
  };

  return (
    <Card className="border-border/40 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Diamètres des cercles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {circles.map((circle, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <>
          <div className="flex items-center gap-2.5" key={index}>
            <div
              className="h-5 w-5 shrink-0 rounded-full border"
              style={{
                backgroundColor: `${circle.color}60`,
                borderColor: circle.color,
              }}
            />
            <Label className="min-w-[60px] text-sm" htmlFor={`circle-${index}`}>
              Cercle {index + 1}
            </Label>
            <Input
              className="h-9 font-mono shadow-none"
              id={`circle-${index}`}
              min="0.1"
              onChange={(e) => updateCircleDiameter(index, e.target.value)}
              step="1"
              type="number"
              value={circle.diameter}
            />
            <span className="text-muted-foreground text-sm">cm</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
