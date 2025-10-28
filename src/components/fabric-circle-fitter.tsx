"use client";

import { useState } from "react";
import { CircleConfiguration } from "@/components/circle-configuration";
import { FabricDimensionsInput } from "@/components/fabric-dimensions-input";
import { FitResults } from "@/components/fit-results";
import { MaxCirclesCalculator } from "@/components/max-circles-calculator";
import type {
  Circle,
  FabricDimensions,
  MaxCirclesResult,
} from "@/types/circle-fitter";

export function FabricCircleFitter() {
  const [dimensions, setDimensions] = useState<FabricDimensions>({
    width: 250,
    height: 250,
    gap: 5,
  });
  const [circles, setCircles] = useState<Circle[]>([
    { diameter: 75, color: "oklch(0.5 0.08 240)" },
    { diameter: 60, color: "oklch(0.45 0.08 220)" },
    { diameter: 50, color: "oklch(0.4 0.08 200)" },
    { diameter: 40, color: "oklch(0.35 0.08 180)" },
  ]);
  const [maxCirclesResult, setMaxCirclesResult] =
    useState<MaxCirclesResult | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const applySuggestions = (suggestions: Circle[]) => {
    setCircles(suggestions);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="mt-8 mb-2 text-center font-bold text-3xl">
          Magali Découpe
        </h1>
        <p className="mb-6 text-center text-muted-foreground text-sm">
          Calculateur d&apos;agencement de cercles sur tissu
        </p>
      </div>
      <FabricDimensionsInput
        dimensions={dimensions}
        onDimensionsChange={setDimensions}
      />

      <CircleConfiguration circles={circles} onCirclesChange={setCircles} />

      <FitResults
        circles={circles}
        dimensions={dimensions}
        fitResult={null}
        gap={dimensions.gap}
        maxCirclesResult={maxCirclesResult}
        onApplySuggestions={applySuggestions}
        showPreview={showPreview}
      />

      <MaxCirclesCalculator
        circles={circles}
        dimensions={dimensions}
        onCalculationComplete={() => setShowPreview(true)}
        onResultChange={setMaxCirclesResult}
      />
    </div>
  );
}
