"use client";

import { Calculator, Clock } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type {
  Circle,
  FabricDimensions,
  FitResult,
  MaxCirclesResult,
} from "@/types/circle-fitter";
import { calculateMaxCirclesForAll, tryFitCircles } from "@/utils/circle-fitting";

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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Calculator className="h-4 w-4" />
        <h3 className="font-medium text-base">Cercles maximum</h3>
      </div>
      <Separator className="my-2" />
      <div className="space-y-3">
        <Button
          className="h-9 w-full shadow-none"
          disabled={isComputingMax || !isValidConfiguration}
          onClick={computeMaxCircles}
          variant="default"
        >
          {isComputingMax ? "Calculating..." : "Calculate Maximum Circles"}
        </Button>
        {maxCirclesResult && (
          <>
            {maxCirclesResult.timeout && (
              <Alert className="mb-4 border-border/40 shadow-none" variant="destructive">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Le calcul a pris trop de temps et a été arrêté. Les résultats ci-dessus sont partiels.
                  </AlertDescription>
                </div>
              </Alert>
            )}
            <div className="text-sm">
              <div className="mb-1 font-medium">
                Total : {maxCirclesResult.totalCount} cercles
              </div>
              <div className="text-muted-foreground text-xs">
                Dans {dimensions.width} × {dimensions.height} cm avec{" "}
                {dimensions.gap} cm d'espacement
              </div>
            </div>
            <Separator className="my-2" />
            <div className="space-y-2">
              {maxCirclesResult.circlesByType.map((circleType, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <>
                <div className="flex items-center gap-2.5 text-sm" key={index}>
                  <div
                    className="h-4 w-4 shrink-0 rounded-full border"
                    style={{
                      backgroundColor: `${circleType.color}60`,
                      borderColor: circleType.color,
                    }}
                  />
                  <span className="min-w-[60px]">Cercle {index + 1} :</span>
                  <span className="font-medium font-mono">
                    {circleType.count}×
                  </span>
                  <span className="text-muted-foreground text-xs">
                    ({circleType.diameter} cm)
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
