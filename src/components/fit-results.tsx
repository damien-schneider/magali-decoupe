"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"
import { FitResult, Circle } from "@/types/circle-fitter"

interface FitResultsProps {
  fitResult: FitResult | null
  circles: Circle[]
  gap: number
  onApplySuggestions: (suggestions: Circle[]) => void
}

export function FitResults({ fitResult, circles, gap, onApplySuggestions }: FitResultsProps) {
  const applySuggestions = () => {
    if (fitResult?.suggestions) {
      onApplySuggestions(fitResult.suggestions)
    }
  }

  if (!fitResult) return null

  return (
    <>
      <Alert variant={fitResult.fits ? "default" : "destructive"} className="shadow-none border-border/40">
        <div className="flex items-start gap-2.5">
          {fitResult.fits ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <AlertDescription className="text-sm font-medium mb-0.5">
              {fitResult.fits ? "Tous les cercles rentrent" : "Les cercles ne rentrent pas"}
            </AlertDescription>
            <AlertDescription className="text-xs">
              {fitResult.fits
                ? `Les quatre cercles rentrent avec ${gap} cm d'espacement.`
                : `Seulement ${fitResult.circles.length} cercle(s) sur 4 peuvent être placés.`}
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {!fitResult.fits && fitResult.suggestions && (
        <Card className="shadow-none border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tailles suggérées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {fitResult.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center gap-2.5 text-sm">
                <div
                  className="w-4 h-4 rounded-full border flex-shrink-0"
                  style={{
                    backgroundColor: suggestion.color + "60",
                    borderColor: suggestion.color,
                  }}
                />
                <span className="min-w-[60px]">Cercle {index + 1} :</span>
                <span className="font-mono font-medium">{suggestion.diameter} cm</span>
                {suggestion.diameter !== circles[index].diameter && (
                  <span className="text-muted-foreground text-xs">(était {circles[index].diameter})</span>
                )}
              </div>
            ))}
            <Button
              onClick={applySuggestions}
              className="w-full mt-2 h-9 shadow-none bg-transparent"
              variant="outline"
            >
              Appliquer les suggestions
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  )
}