"use client";

import { useState } from "react";
import { CircleConfiguration } from "@/components/circle-configuration";
import { FabricDimensionsInput } from "@/components/fabric-dimensions-input";
import { FitResults } from "@/components/fit-results";
import { MaxCirclesCalculator } from "@/components/max-circles-calculator";
import type {
  Circle,
  FabricDimensions,
  FitResult,
  MaxCirclesResult,
} from "@/types/circle-fitter";

export function FabricCircleFitter() {
  const [dimensions, setDimensions] = useState<FabricDimensions>({
    width: 250,
    height: 250,
    gap: 5,
  });
  const [computedDimensions, setComputedDimensions] =
    useState<FabricDimensions>({
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
  const [fitResult, setFitResult] = useState<FitResult | null>(null);
  const [isValidConfiguration, setIsValidConfiguration] =
    useState<boolean>(true);

  const handleComputedDimensionsChange = (dims: FabricDimensions) => {
    setComputedDimensions(dims);
  };

  const applySuggestions = (suggestions: Circle[]) => {
    setCircles(suggestions);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-20 px-4 py-12">
      {/* Brand Header */}
      <div className="space-y-6 text-center">
        <div className="mb-6 flex items-center justify-center">
          <div className="mr-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary shadow-lg">
            <svg
              aria-label="Magali Découpe Logo"
              className="text-primary-foreground"
              fill="none"
              height="32"
              viewBox="0 0 32 32"
              width="32"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Magali Découpe Logo</title>
              <circle cx="16" cy="16" fill="currentColor" r="12" />
              <circle cx="16" cy="16" fill="var(--background)" r="8" />
              <path
                d="M8 16a8 8 0 1 1 16 0v2h-2v-2a6 6 0 1 0-12 0v2H8v-2z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1 className="font-bold text-4xl text-foreground tracking-tight">
            Magali Découpe
          </h1>
        </div>
        <p className="mx-auto max-w-2xl font-medium text-lg text-muted-foreground">
          Calculateur d'agencement de cercles sur tissu
        </p>
        <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-primary via-accent to-primary" />
        <p className="text-muted-foreground/80 text-sm">
          Optimisez vos découpes de tissu • Minimisez le gaspillage • Maximisez
          l'efficacité
        </p>
      </div>
      <FabricDimensionsInput
        dimensions={dimensions}
        onDimensionsChange={setDimensions}
      />

      <CircleConfiguration
        circles={circles}
        onCirclesChange={setCircles}
        onValidationChange={setIsValidConfiguration}
      />

      <FitResults
        circles={circles}
        computedDimensions={computedDimensions}
        dimensions={dimensions}
        fitResult={fitResult}
        gap={dimensions.gap}
        maxCirclesResult={maxCirclesResult}
        onApplySuggestions={applySuggestions}
        showPreview={showPreview}
      />

      <MaxCirclesCalculator
        circles={circles}
        dimensions={dimensions}
        isValidConfiguration={isValidConfiguration}
        onCalculationComplete={() => setShowPreview(true)}
        onComputedDimensionsChange={handleComputedDimensionsChange}
        onFitResultChange={setFitResult}
        onResultChange={setMaxCirclesResult}
      />
    </div>
  );
}
