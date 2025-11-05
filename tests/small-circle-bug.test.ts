import { describe, expect, it } from "vitest";
import type { Circle } from "../src/types/circle-fitter";
import { calculateMaxCirclesForAll } from "../src/utils/circle-fitting";

describe("Small Circle Bug Reproduction", () => {
  it("should reproduce the small circle bug (10cm circle outputs 0)", () => {
    // Test case that should work but currently outputs 0 circles
    const width = 250;
    const height = 250;
    const gapSize = 5;

    const circles: Circle[] = [
      { diameter: 10, color: "#ff6b6b" }, // Small circle - this might be the issue
      { diameter: 60, color: "#4ecdc4" },
      { diameter: 50, color: "#45b7d1" },
      { diameter: 40, color: "#96ceb4" },
    ];

    const result = calculateMaxCirclesForAll({
      width,
      height,
      circlesToFit: circles,
      gapSize,
      options: {
        attempts: 10, // Lower attempts for faster debugging
      },
    });

    // This test will FAIL if the bug exists (result.totalCount === 0)
    expect(result.totalCount).toBeGreaterThan(0);
  });

  it("should isolate the problem with just 10cm circle", () => {
    const width = 250;
    const height = 250;
    const gapSize = 5;

    const result = calculateMaxCirclesForAll({
      width,
      height,
      circlesToFit: [{ diameter: 10, color: "#ff6b6b" }],
      gapSize,
      options: { attempts: 5 },
    });

    // Should be able to fit at least some 10cm circles
    expect(result.totalCount).toBeGreaterThan(0);
  });

  it("should work with slightly larger circles", () => {
    const width = 250;
    const height = 250;
    const gapSize = 5;

    const result = calculateMaxCirclesForAll({
      width,
      height,
      circlesToFit: [{ diameter: 15, color: "#ff6b6b" }],
      gapSize,
      options: { attempts: 5 },
    });

    // Should be able to fit at least some 15cm circles
    expect(result.totalCount).toBeGreaterThan(0);
  });
});
