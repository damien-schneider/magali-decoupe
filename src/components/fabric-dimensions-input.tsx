"use client";

import type { ChangeEvent } from "react";
import {
  InputGroup,
  InputGroupAddon,
  NumberInputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { FabricDimensions } from "@/types/circle-fitter";

type FabricDimensionsInputProps = {
  dimensions: FabricDimensions;
  onDimensionsChange: (dimensions: FabricDimensions) => void;
};

export function FabricDimensionsInput({
  dimensions,
  onDimensionsChange,
}: FabricDimensionsInputProps) {
  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const width = Number(e.target.value) || 0;
    onDimensionsChange({
      ...dimensions,
      width,
    });
  };

  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const height = Number(e.target.value) || 0;
    onDimensionsChange({
      ...dimensions,
      height,
    });
  };

  const handleGapChange = (e: ChangeEvent<HTMLInputElement>) => {
    const gap = Number(e.target.value) || 0;
    onDimensionsChange({
      ...dimensions,
      gap,
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-base">Dimensions du tissu</h3>
      <Separator className="my-2" />
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm" htmlFor="width">
              Largeur
            </Label>
            <InputGroup>
              <NumberInputGroupInput
                className="text-center font-mono"
                id="width"
                min={1}
                onChange={(e) => handleWidthChange(e)}
                step={0.1}
                value={dimensions.width}
              />
              <InputGroupAddon align="inline-end">cm</InputGroupAddon>
            </InputGroup>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm" htmlFor="height">
              Hauteur
            </Label>
            <InputGroup>
              <NumberInputGroupInput
                className="text-center font-mono"
                id="height"
                min={1}
                onChange={(e) => handleHeightChange(e)}
                step={0.1}
                value={dimensions.height}
              />
              <InputGroupAddon align="inline-end">cm</InputGroupAddon>
            </InputGroup>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm" htmlFor="gap">
            Espacement
          </Label>
          <InputGroup>
            <NumberInputGroupInput
              className="text-center font-mono"
              id="gap"
              min={0}
              onChange={(e) => handleGapChange(e)}
              step={0.1}
              value={dimensions.gap}
            />
            <InputGroupAddon align="inline-end">cm</InputGroupAddon>
          </InputGroup>
        </div>
        <Separator className="my-2" />
        <div className="pt-1 text-muted-foreground text-sm">
          Surface :{" "}
          <span className="font-medium font-mono">
            {(dimensions.width * dimensions.height).toFixed(0)} cm²
          </span>
        </div>
      </div>
    </div>
  );
}
