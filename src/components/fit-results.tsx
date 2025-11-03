"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { MaxCirclesCanvas } from "@/components/circle-canvas";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type {
  Circle,
  FabricDimensions,
  FitResult,
  MaxCirclesResult,
} from "@/types/circle-fitter";

type FitResultsProps = {
  fitResult: FitResult | null;
  circles: Circle[];
  gap: number;
  onApplySuggestions: (suggestions: Circle[]) => void;
  showPreview: boolean;
  maxCirclesResult: MaxCirclesResult | null;
  dimensions: FabricDimensions;
  computedDimensions?: FabricDimensions;
};

export function FitResults({
  fitResult,
  circles,
  gap,
  onApplySuggestions,
  showPreview,
  maxCirclesResult,
  dimensions,
  computedDimensions,
}: FitResultsProps) {
  const applySuggestions = () => {
    if (fitResult?.suggestions) {
      onApplySuggestions(fitResult.suggestions);
    }
  };

  // Allow the component to render when either fitResult or maxCirclesResult is available
  if (!(fitResult || maxCirclesResult)) {
    return null;
  }

  return (
    <>
      {fitResult?.timeout && (
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

      {showPreview && maxCirclesResult && (
        <div className="space-y-3">
          {/* Alert title above preview */}
          {fitResult && (
            <Alert
              className="border-border/40 shadow-none"
              variant={fitResult.fits ? "default" : "destructive"}
            >
              {fitResult.fits ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <div className="flex-1">
                <AlertDescription className="mb-0.5 font-medium text-sm">
                  {fitResult.fits
                    ? "Tous les cercles rentrent"
                    : "Les cercles ne rentrent pas"}
                </AlertDescription>
                <AlertDescription className="text-xs">
                  {fitResult.fits
                    ? `Les quatre cercles rentrent avec ${gap} cm d'espacement.`
                    : `Seulement ${fitResult.circles.length} cercle(s) sur 4 peuvent être placés.`}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Canvas Preview text above canvas */}
          <div className="text-center font-medium text-green-600 text-sm">
            Aperçu Canvas : {maxCirclesResult.totalCount} cercles calculés
          </div>

          {/* Full width canvas */}
          <div className="w-full rounded bg-muted/30 p-3">
            <MaxCirclesCanvas
              fabricHeight={dimensions.height}
              fabricWidth={dimensions.width}
              gap={dimensions.gap}
              result={maxCirclesResult}
              computedDimensions={computedDimensions}
            />
          </div>
        </div>
      )}

      {fitResult && !fitResult.fits && fitResult.suggestions && (
        <div className="space-y-3">
          <h3 className="font-medium text-base">Tailles suggérées</h3>
          <Separator className="my-2" />
          <div className="space-y-2.5">
            {fitResult.suggestions.map((suggestion, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <>
              <div className="flex items-center gap-2.5 text-sm" key={index}>
                <div
                  className="h-4 w-4 shrink-0 rounded-full border"
                  style={{
                    backgroundColor: `${suggestion.color}60`,
                    borderColor: suggestion.color,
                  }}
                />
                <span className="min-w-[60px]">Cercle {index + 1} :</span>
                <span className="font-medium font-mono">
                  {suggestion.diameter} cm
                </span>
                {suggestion.diameter !== circles[index].diameter && (
                  <span className="text-muted-foreground text-xs">
                    (était {circles[index].diameter})
                  </span>
                )}
              </div>
            ))}
            <Separator className="my-3" />
            <Button
              className="h-9 w-full bg-transparent shadow-none"
              onClick={applySuggestions}
              variant="outline"
            >
              Appliquer les suggestions
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
