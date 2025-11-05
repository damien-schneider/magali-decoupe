import { describe, expect, it } from "vitest";
import { calculateMaxCirclesForAll } from "../src/utils/circle-fitting";

describe("Simple Circle Test", () => {
  it("should test the absolute basics", () => {
    const width = 250;
    const height = 250;
    const gapSize = 5;

    // Test the absolute simplest case: just try to place 1 circle of each type
    console.log("\n=== SIMPLE TEST: Place 1 circle each ===");

    const result = calculateMaxCirclesForAll({
      width,
      height,
      circlesToFit: [
        { diameter: 10, color: "#ff6b6b" },
        { diameter: 40, color: "#96ceb4" },
      ],
      gapSize,
      options: {
        attempts: 1, // Just 1 attempt
        timeoutMs: 5000, // Short timeout
      },
    });

    console.log("Result:", result);
    console.log("Total count:", result.totalCount);

    // This should definitely work - just place 2 circles
    expect(result.totalCount).toBeGreaterThan(0);

    // If it works, then the issue is with the prioritization logic creating too many circles
    // If it fails, then the issue is fundamental to mixed circle placement
  });
});
