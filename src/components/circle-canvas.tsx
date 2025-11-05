"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Ruler } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MaxCirclesResult } from "@/types/circle-fitter";

type MaxCirclesCanvasProps = {
  result: MaxCirclesResult | null;
  fabricWidth: number;
  fabricHeight: number;
  gap: number;
  computedDimensions?: { width: number; height: number };
};

type HoverInfo = {
  circleData: {
    diameter: number;
    color: string;
    count: number;
    positions: { x: number; y: number }[];
  };
  positionIndex: number;
  position: { x: number; y: number };
  mousePosition: { x: number; y: number };
  circleIndex: number;
};

export function MaxCirclesCanvas({
  result,
  fabricWidth,
  fabricHeight,
  computedDimensions,
}: MaxCirclesCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [displayedHoverInfo, setDisplayedHoverInfo] =
    useState<HoverInfo | null>(null);

  // Use computed dimensions if available, otherwise use current dimensions
  const displayWidth = computedDimensions?.width || fabricWidth;
  const displayHeight = computedDimensions?.height || fabricHeight;

  const realToCanvas = useCallback(
    (x: number, y: number, scale: number) => ({ x: x * scale, y: y * scale }),
    []
  );

  const canvasToReal = useCallback(
    (x: number, y: number, scale: number) => ({ x: x / scale, y: y / scale }),
    []
  );

  // Hit detection algorithm
  const detectHoveredCircle = useCallback(
    (mouseX: number, mouseY: number, scale: number) => {
      // Early return if result is null
      if (!result) {
        return null;
      }

      let globalIndex = 1;

      for (const circleType of result.circlesByType) {
        const radiusCanvas = (circleType.diameter / 2) * scale;

        for (
          let positionIndex = 0;
          positionIndex < circleType.positions.length;
          positionIndex++
        ) {
          const position = circleType.positions[positionIndex];
          const centerCanvas = realToCanvas(position.x, position.y, scale);
          const distance = Math.sqrt(
            (mouseX - centerCanvas.x) ** 2 + (mouseY - centerCanvas.y) ** 2
          );

          if (distance <= radiusCanvas) {
            return {
              circleData: circleType,
              positionIndex,
              position,
              mousePosition: canvasToReal(mouseX, mouseY, scale),
              circleIndex: globalIndex,
            };
          }
          globalIndex++;
        }
      }
      return null;
    },
    [result, realToCanvas, canvasToReal]
  );

  // Mouse event handlers
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      if (!result) {
        setHoverInfo(null);
        setDisplayedHoverInfo(null);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const scale = Math.min(600 / fabricWidth, 400 / fabricHeight, 3);

      // Calculate mouse position relative to canvas CSS pixels
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const detected = detectHoveredCircle(
        mouseX * (window.devicePixelRatio || 1),
        mouseY * (window.devicePixelRatio || 1),
        scale
      );
      setHoverInfo(detected);

      // Update displayed hover info to show circle details in the grid
      if (detected) {
        setDisplayedHoverInfo(detected);
      }
    },
    [result, fabricWidth, fabricHeight, detectHoveredCircle]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverInfo(null);
  }, []);

  const drawBackgroundAndGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
      scale: number
    ) => {
      ctx.fillStyle = "oklch(0.97 0.005 240)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "oklch(0.6 0.02 240)";
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "oklch(0.85 0.005 240)";
      ctx.lineWidth = 0.5;
      const gridSize = 20 * scale;
      for (let x = gridSize; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = gridSize; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    },
    []
  );

  const drawHoverEffects = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      scale: number,
      canvas: HTMLCanvasElement
    ) => {
      if (!hoverInfo) {
        return;
      }

      const centerCanvas = realToCanvas(
        hoverInfo.position.x,
        hoverInfo.position.y,
        scale
      );

      // Draw dashed lines from center to fabric borders
      ctx.strokeStyle = "oklch(0.8 0.02 240)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);

      // Top border
      ctx.beginPath();
      ctx.moveTo(centerCanvas.x, centerCanvas.y);
      ctx.lineTo(centerCanvas.x, 0);
      ctx.stroke();

      // Right border
      ctx.beginPath();
      ctx.moveTo(centerCanvas.x, centerCanvas.y);
      ctx.lineTo(canvas.width, centerCanvas.y);
      ctx.stroke();

      // Bottom border
      ctx.beginPath();
      ctx.moveTo(centerCanvas.x, centerCanvas.y);
      ctx.lineTo(centerCanvas.x, canvas.height);
      ctx.stroke();

      // Left border
      ctx.beginPath();
      ctx.moveTo(centerCanvas.x, centerCanvas.y);
      ctx.lineTo(0, centerCanvas.y);
      ctx.stroke();

      ctx.setLineDash([]); // Reset line dash
    },
    [hoverInfo, realToCanvas]
  );

  const drawMaxCirclesCanvas = useCallback(
    (maxCirclesResult: MaxCirclesResult | null) => {
      const canvas = canvasRef.current;
      if (!(canvas && maxCirclesResult)) {
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }

      const maxCanvasWidth = 600;
      const maxCanvasHeight = 400;

      // Calculate separate scales for width and height to maintain aspect ratio
      const widthScale = maxCanvasWidth / displayWidth;
      const heightScale = maxCanvasHeight / displayHeight;
      // Use the smaller scale to ensure the entire fabric fits within the canvas
      const scale = Math.min(widthScale, heightScale, 3);

      // Calculate canvas dimensions to maintain aspect ratio
      const canvasWidth = displayWidth * scale;
      const canvasHeight = displayHeight * scale;

      // Set canvas internal size (actual drawing buffer)
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Set display size (CSS pixels) - same as internal size to prevent stretching
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawBackgroundAndGrid(ctx, canvas, scale);

      for (const circleType of maxCirclesResult.circlesByType) {
        for (const pos of circleType.positions) {
          const centerCanvas = realToCanvas(pos.x, pos.y, scale);
          const radiusCanvas = (circleType.diameter / 2) * scale;

          // Check if this circle is being hovered
          const isHovered =
            hoverInfo &&
            hoverInfo.circleData === circleType &&
            hoverInfo.positionIndex === circleType.positions.indexOf(pos);

          ctx.beginPath();
          ctx.arc(centerCanvas.x, centerCanvas.y, radiusCanvas, 0, Math.PI * 2);

          // Transparent fill (only border)
          ctx.fillStyle = "transparent";
          ctx.fill();

          // Stroke with circle's color
          ctx.strokeStyle = circleType.color;
          ctx.lineWidth = isHovered ? 2.5 : 1.5;
          ctx.stroke();
        }
      }

      drawHoverEffects(ctx, scale, canvas);
    },
    [
      displayWidth,
      displayHeight,
      hoverInfo,
      realToCanvas,
      drawBackgroundAndGrid,
      drawHoverEffects,
    ]
  );

  useEffect(() => {
    drawMaxCirclesCanvas(result);
  }, [result, drawMaxCirclesCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Canvas Preview */}
      <div className="flex flex-col items-center">
        <div className="relative flex w-full max-w-[600px] items-center justify-center">
          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height: "auto",
              // maxWidth: "600px",
              // maxHeight: "500px",
            }}
          />
          {/* Dimensions label outside canvas */}
          <div className="-bottom-8 absolute left-0 rounded-full border bg-card px-2 py-1 text-muted-foreground text-xs">
            {displayWidth} × {displayHeight} cm
          </div>
        </div>
      </div>

      {/* Circle Details Panel */}
      <div className="w-full rounded-lg border bg-card p-4">
        {displayedHoverInfo ? (
          <div className="space-y-2">
            <h3 className="mb-3 font-medium text-base text-foreground">
              Détails du cercle
            </h3>
            <div className="space-y-1 text-sm">
              <div className="wrap-break-words font-medium text-foreground">
                Cercle #{displayedHoverInfo.circleIndex}:{" "}
                {displayedHoverInfo.circleData.diameter.toFixed(1)} cm de
                diamètre
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Ruler className="h-4 w-4 shrink-0 text-purple-500" />
                <span>Rayon:</span>
                <span className="shrink-0 font-mono text-foreground">
                  {(displayedHoverInfo.circleData.diameter / 2).toFixed(1)} cm
                </span>
              </div>
              <div className="mt-3 font-medium text-muted-foreground">
                Distance des bords:
              </div>
              <div className="space-y-2 text-muted-foreground text-xs">
                <div className="flex items-center gap-2">
                  <ArrowUp className="h-3 w-3 shrink-0 text-blue-500" />
                  <span className="shrink-0 font-medium">Haut:</span>
                  <span className="shrink-0 font-mono text-foreground">
                    {displayedHoverInfo.position.y.toFixed(1)} cm
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 shrink-0 text-green-500" />
                  <span className="shrink-0 font-medium">Droite:</span>
                  <span className="shrink-0 font-mono text-foreground">
                    {(fabricWidth - displayedHoverInfo.position.x).toFixed(1)}{" "}
                    cm
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowDown className="h-3 w-3 shrink-0 text-red-500" />
                  <span className="shrink-0 font-medium">Bas:</span>
                  <span className="shrink-0 font-mono text-foreground">
                    {(fabricHeight - displayedHoverInfo.position.y).toFixed(1)}{" "}
                    cm
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowLeft className="h-3 w-3 shrink-0 text-orange-500" />
                  <span className="shrink-0 font-medium">Gauche:</span>
                  <span className="shrink-0 font-mono text-foreground">
                    {displayedHoverInfo.position.x.toFixed(1)} cm
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground text-sm">
            Survolez un cercle pour voir les détails
          </div>
        )}
      </div>
    </div>
  );
}
