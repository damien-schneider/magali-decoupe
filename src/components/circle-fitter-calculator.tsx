"use client";

import { Calculator, Clock } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  Circle,
  FabricDimensions,
  FitResult,
} from "@/types/circle-fitter";
import { tryFitCircles } from "@/utils/circle-fitting";

type CircleFitterCalculatorProps = {
  dimensions: FabricDimensions;
  circles: Circle[];
  onResultChange: (result: FitResult | null) => void;
};

export function CircleFitterCalculator({
  dimensions,
  circles,
  onResultChange,
}: CircleFitterCalculatorProps) {
  const [isComputing, setIsComputing] = useState(false);
  const [fitResult, setFitResult] = useState<FitResult | null>(null);

  const computeFit = () => {
    setIsComputing(true);
    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      const result = tryFitCircles(
        dimensions.width,
        dimensions.height,
        circles,
        dimensions.gap
      );
      setFitResult(result);
      onResultChange(result);
      setIsComputing(false);
    }, 50);
  };

  return (
    <Card className="border-border/40 shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          <CardTitle className="text-base">Ajustement des cercles</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          className="h-9 w-full shadow-none"
          disabled={isComputing}
          onClick={computeFit}
          variant="default"
        >
          {isComputing ? "Calculating..." : "Vérifier l'ajustement"}
        </Button>
        {fitResult && (
          <>
            {fitResult.timeout && (
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
                {fitResult.fits ? "Tous les cercles rentrent" : "Les cercles ne rentrent pas"}
              </div>
              <div className="text-muted-foreground text-xs">
                {fitResult.fits
                  ? `Les ${circles.length} cercles rentrent avec ${dimensions.gap} cm d'espacement.`
                  : `Seulement ${fitResult.circles.length} cercle(s) sur ${circles.length} peuvent être placés.`}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}