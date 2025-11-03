"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import type { Circle } from "@/types/circle-fitter";
import { validateCircles } from "@/lib/validation";
import { useState } from "react";

type CircleConfigurationProps = {
  circles: Circle[];
  onCirclesChange: (circles: Circle[]) => void;
  onValidationChange?: (isValid: boolean) => void;
};

export function CircleConfiguration({
  circles,
  onCirclesChange,
  onValidationChange,
}: CircleConfigurationProps) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const updateCircleDiameter = (index: number, value: string) => {
    const diameter = value === "" ? 0 : Number.parseFloat(value) || 0;
    const newCircles = [...circles];
    newCircles[index] = { ...newCircles[index], diameter };
    
    // Always update the parent component to allow empty inputs
    onCirclesChange(newCircles);
    
    // Validate the updated circles and show errors if any
    const validation = validateCircles(newCircles);
    setValidationErrors(validation.errors);
    onValidationChange?.(validation.isValid);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-base">Diamètres des cercles</h3>
      <Separator className="my-2" />
      <div className="space-y-2.5">
        {validationErrors.length > 0 && (
          <Alert className="mb-4 border-border/40 shadow-none" variant="destructive">
            <AlertDescription>
              {validationErrors.map((error) => (
                <div key={error}>{error}</div>
              ))}
            </AlertDescription>
          </Alert>
        )}
        {circles.map((circle, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <>
          <div className="flex items-center gap-2.5" key={`circle-${index}`}>
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
            <NumberInput
              className="font-mono shadow-none"
              id={`circle-${index}`}
              min={0.1}
              onChange={(e) => updateCircleDiameter(index, e.target.value)}
              step={1}
              value={circle.diameter}
            />
            <span className="text-muted-foreground text-sm">cm</span>
          </div>
        ))}
      </div>
    </div>
  );
}
