"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  InputGroup,
  InputGroupAddon,
  NumberInputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { validateCircles } from "@/lib/validation";
import type { Circle } from "@/types/circle-fitter";

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

  const updateCircleDiameter = (
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const diameter = Number(e.target.value) || 0;
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
          <Alert
            className="mb-4 border-border/40 shadow-none"
            variant="destructive"
          >
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
              className="h-5 w-5 shrink-0 rounded-full border-4"
              style={{
                backgroundColor: `${circle.color}60`,
                borderColor: circle.color,
              }}
            />
            <Label className="min-w-[60px] text-sm" htmlFor={`circle-${index}`}>
              Cercle {index + 1}
            </Label>
            <InputGroup>
              <NumberInputGroupInput
                className="text-center font-mono"
                id={`circle-${index}`}
                min={0.1}
                onChange={(e) => updateCircleDiameter(index, e)}
                step={0.1}
                value={circle.diameter}
              />
              <InputGroupAddon align="inline-end">cm</InputGroupAddon>
            </InputGroup>
          </div>
        ))}
      </div>
    </div>
  );
}
