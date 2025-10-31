"use client";

import { useCallback, useEffect, useRef } from "react";
import type { FitResult, MaxCirclesResult } from "@/types/circle-fitter";

type CircleCanvasProps = {
  result: FitResult | null;
  fabricWidth: number;
  fabricHeight: number;
  gap: number;
};

export function CircleCanvas({
  result,
  fabricWidth,
  fabricHeight,
}: CircleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCanvas = useCallback((fitResult: FitResult | null) => {
    const canvas = canvasRef.current;
    if (!(canvas && fitResult)) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const maxCanvasWidth = 600;
    const maxCanvasHeight = 400;
    const scale = Math.min(
      maxCanvasWidth / fabricWidth,
      maxCanvasHeight / fabricHeight,
      3
    );

    canvas.width = fabricWidth * scale;
    canvas.height = fabricHeight * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = fitResult.fits
      ? "oklch(0.97 0.01 140)"
      : "oklch(0.97 0.01 20)";
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

    for (const circle of fitResult.circles) {
      if (circle.x !== undefined && circle.y !== undefined) {
        ctx.beginPath();
        ctx.arc(
          circle.x * scale,
          circle.y * scale,
          (circle.diameter / 2) * scale,
          0,
          Math.PI * 2
        );
        // Fill with semi-transparent color
        ctx.fillStyle = `${circle.color}60`;
        ctx.fill();
        // Stroke with solid color
        ctx.strokeStyle = circle.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "oklch(0.3 0.02 240)";
        ctx.font = `${12 * Math.min(scale, 1.5)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${circle.diameter}`, circle.x * scale, circle.y * scale);
      }
    }

    ctx.fillStyle = "oklch(0.4 0.02 240)";
    ctx.font = `${11 * Math.min(scale, 1.5)}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(
      `${fabricWidth} × ${fabricHeight} cm`,
      canvas.width / 2,
      canvas.height - 8
    );
  }, [fabricWidth, fabricHeight]);

  useEffect(() => {
    drawCanvas(result);
  }, [result, drawCanvas]);

  return (
    <div className="flex items-center justify-center rounded bg-muted/30 p-3">
      <canvas
        className="h-auto max-w-full rounded border border-border/40"
        ref={canvasRef}
      />
    </div>
  );
}

type MaxCirclesCanvasProps = {
  result: MaxCirclesResult | null;
  fabricWidth: number;
  fabricHeight: number;
  gap: number;
};

export function MaxCirclesCanvas({
  result,
  fabricWidth,
  fabricHeight,
}: MaxCirclesCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawMaxCirclesCanvas = useCallback((maxCirclesResult: MaxCirclesResult | null) => {
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
    const scale = Math.min(
      maxCanvasWidth / fabricWidth,
      maxCanvasHeight / fabricHeight,
      3
    );

    canvas.width = fabricWidth * scale;
    canvas.height = fabricHeight * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    let globalIndex = 1;
    for (const circleType of maxCirclesResult.circlesByType) {
      for (const pos of circleType.positions) {
        ctx.beginPath();
        ctx.arc(
          pos.x * scale,
          pos.y * scale,
          (circleType.diameter / 2) * scale,
          0,
          Math.PI * 2
        );
        // Fill with semi-transparent color
        ctx.fillStyle = `${circleType.color}60`;
        ctx.fill();
        // Stroke with solid color
        ctx.strokeStyle = circleType.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "oklch(0.3 0.02 240)";
        ctx.font = `${Math.min(11 * Math.min(scale, 1.5), circleType.diameter * scale * 0.35)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${globalIndex}`, pos.x * scale, pos.y * scale);
        globalIndex++;
      }
    }

    ctx.fillStyle = "oklch(0.4 0.02 240)";
    ctx.font = `${11 * Math.min(scale, 1.5)}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(
      `${fabricWidth} × ${fabricHeight} cm`,
      canvas.width / 2,
      canvas.height - 8
    );
  }, [fabricWidth, fabricHeight]);

  useEffect(() => {
    drawMaxCirclesCanvas(result);
  }, [result, drawMaxCirclesCanvas]);

  return (
    <div className="flex items-center justify-center rounded bg-muted/30 p-3">
      <canvas
        className="h-auto max-w-full rounded border border-border/40"
        ref={canvasRef}
      />
    </div>
  );
}
