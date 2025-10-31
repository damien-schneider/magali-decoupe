"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import type { FabricDimensions } from "@/types/circle-fitter";

type FabricDimensionsInputProps = {
  dimensions: FabricDimensions;
  onDimensionsChange: (dimensions: FabricDimensions) => void;
};

export function FabricDimensionsInput({
  dimensions,
  onDimensionsChange,
}: FabricDimensionsInputProps) {
  const handleWidthChange = (value: string) => {
    onDimensionsChange({
      ...dimensions,
      width: value === "" ? 0 : Number.parseFloat(value) || 0,
    });
  };

  const handleHeightChange = (value: string) => {
    onDimensionsChange({
      ...dimensions,
      height: value === "" ? 0 : Number.parseFloat(value) || 0,
    });
  };

  const handleGapChange = (value: string) => {
    onDimensionsChange({
      ...dimensions,
      gap: value === "" ? 0 : Number.parseFloat(value) || 0,
    });
  };

  return (
    <Card className="border-border/40 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Dimensions du tissu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm" htmlFor="width">
              Largeur (cm)
            </Label>
            <NumberInput
              className="font-mono shadow-none"
              id="width"
              min={1}
              onChange={(e) => handleWidthChange(e.target.value)}
              value={dimensions.width}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm" htmlFor="height">
              Hauteur (cm)
            </Label>
            <NumberInput
              className="font-mono shadow-none"
              id="height"
              min={1}
              onChange={(e) => handleHeightChange(e.target.value)}
              value={dimensions.height}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm" htmlFor="gap">
            Espacement (cm)
          </Label>
          <NumberInput
            className="font-mono shadow-none"
            id="gap"
            min={0}
            onChange={(e) => handleGapChange(e.target.value)}
            step={1}
            value={dimensions.gap}
          />
        </div>
        <div className="pt-1 text-muted-foreground text-sm">
          Surface :{" "}
          <span className="font-medium font-mono">
            {(dimensions.width * dimensions.height).toFixed(0)} cm²
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
