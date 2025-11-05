"use client";

import { Clock } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type {
  Circle,
  FabricDimensions,
  FitResult,
  MaxCirclesResult,
} from "@/types/circle-fitter";
import {
  calculateMaxCirclesForAll,
  tryFitCircles,
} from "@/utils/circle-fitting";

type MaxCirclesCalculatorProps = {
  dimensions: FabricDimensions;
  circles: Circle[];
  isValidConfiguration: boolean;
  onResultChange: (result: MaxCirclesResult | null) => void;
  onFitResultChange?: (result: FitResult | null) => void;
  onCalculationComplete?: () => void;
  onComputedDimensionsChange?: (dimensions: FabricDimensions) => void;
};

export function MaxCirclesCalculator({
  dimensions,
  circles,
  isValidConfiguration,
  onResultChange,
  onFitResultChange,
  onCalculationComplete,
  onComputedDimensionsChange,
}: MaxCirclesCalculatorProps) {
  const [isComputingMax, setIsComputingMax] = useState(false);
  const [maxCirclesResult, setMaxCirclesResult] =
    useState<MaxCirclesResult | null>(null);

  const computeMaxCircles = () => {
    setIsComputingMax(true);
    // Capture current dimensions for canvas to use
    const computedDimensions = { ...dimensions };
    onComputedDimensionsChange?.(computedDimensions);

    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      // Run both calculations simultaneously
      const maxResult = calculateMaxCirclesForAll({
        width: dimensions.width,
        height: dimensions.height,
        circlesToFit: circles,
        gapSize: dimensions.gap,
        options: {
          attempts: 25, // Increase attempts for better chance of perfect distribution
        },
      });
      const fitResultValue = tryFitCircles(
        dimensions.width,
        dimensions.height,
        circles,
        dimensions.gap
      );

      setMaxCirclesResult(maxResult);
      onResultChange(maxResult);
      onFitResultChange?.(fitResultValue);
      setIsComputingMax(false);
      onCalculationComplete?.();
    }, 50);
  };

  return (
    <div className="sticky bottom-0 space-y-3 bg-linear-to-t from-background/95 via-background/95 to-background/0 pt-2 pb-4">
      <Button
        className="h-9 w-full shadow-none"
        disabled={isComputingMax || !isValidConfiguration}
        onClick={computeMaxCircles}
        variant="default"
      >
        {isComputingMax
          ? "Calcul en cours..."
          : "Calculer l'agencement maximal"}
      </Button>
      {maxCirclesResult?.timeout && (
        <Alert className="border-border/40 shadow-none" variant="destructive">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Le calcul a pris trop de temps et a été arrêté. Les résultats
              ci-dessus sont partiels.
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
}
