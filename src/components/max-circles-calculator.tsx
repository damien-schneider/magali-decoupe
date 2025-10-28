"use client";

import { Calculator } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  Circle,
  FabricDimensions,
  MaxCirclesResult,
} from "@/types/circle-fitter";
import { calculateMaxCirclesForAll } from "@/utils/circle-fitting";

type MaxCirclesCalculatorProps = {
  dimensions: FabricDimensions;
  circles: Circle[];
  onResultChange: (result: MaxCirclesResult | null) => void;
  onCalculationComplete?: () => void;
};

export function MaxCirclesCalculator({
  dimensions,
  circles,
  onResultChange,
  onCalculationComplete,
}: MaxCirclesCalculatorProps) {
  const [isComputingMax, setIsComputingMax] = useState(false);
  const [maxCirclesResult, setMaxCirclesResult] =
    useState<MaxCirclesResult | null>(null);

  const computeMaxCircles = () => {
    setIsComputingMax(true);
    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      const result = calculateMaxCirclesForAll(
        dimensions.width,
        dimensions.height,
        circles,
        dimensions.gap
      );
      setMaxCirclesResult(result);
      onResultChange(result);
      setIsComputingMax(false);
      onCalculationComplete?.();
    }, 50);
  };

  return (
    <Card className="border-border/40 shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          <CardTitle className="text-base">Cercles maximum</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          className="h-9 w-full shadow-none"
          disabled={isComputingMax}
          onClick={computeMaxCircles}
          variant="default"
        >
          {isComputingMax ? "Calculating..." : "Calculate Maximum Circles"}
        </Button>
        {maxCirclesResult && (
          <>
            <div className="text-sm">
              <div className="mb-1 font-medium">
                Total : {maxCirclesResult.totalCount} cercles
              </div>
              <div className="text-muted-foreground text-xs">
                Dans {dimensions.width} × {dimensions.height} cm avec{" "}
                {dimensions.gap} cm d'espacement
              </div>
            </div>
            <div className="space-y-2 border-t pt-1">
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
      </CardContent>
    </Card>
  );
}
