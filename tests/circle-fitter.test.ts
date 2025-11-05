import { describe, expect, it } from "vitest";
import type { Circle } from "../src/types/circle-fitter";
import { calculateMaxCirclesForAll } from "../src/utils/circle-fitting";

describe("Circle Fitter Algorithm", () => {
  describe("Stress Test for Consistent Results", () => {
    it("should consistently achieve optimal distribution over 50 iterations", () => {
      // Test configuration from user feedback
      const width = 250;
      const height = 250;
      const gapSize = 5;

      // Define the 4 different circle types
      const circles: Circle[] = [
        { diameter: 75, color: "#ff6b6b" }, // Circle 1
        { diameter: 60, color: "#4ecdc4" }, // Circle 2
        { diameter: 50, color: "#45b7d1" }, // Circle 3
        { diameter: 40, color: "#96ceb4" }, // Circle 4
      ];

      const iterations = 50;
      const results: Array<{
        totalCount: number;
        counts: { [key: string]: number };
        isOptimal: boolean;
      }> = [];
      let optimalCount = 0;

      console.log(`Running ${iterations} iterations to test consistency...`);

      for (let i = 0; i < iterations; i++) {
        // Calculate maximum circles with high attempt count
        const result = calculateMaxCirclesForAll({
          width,
          height,
          circlesToFit: circles,
          gapSize,
          options: {
            attempts: 40, // High attempts for best chance of optimal distribution
          },
        });

        // Get counts by diameter
        const circle1Count =
          result.circlesByType.find((c) => c.diameter === 75)?.count || 0;
        const circle2Count =
          result.circlesByType.find((c) => c.diameter === 60)?.count || 0;
        const circle3Count =
          result.circlesByType.find((c) => c.diameter === 50)?.count || 0;
        const circle4Count =
          result.circlesByType.find((c) => c.diameter === 40)?.count || 0;

        const counts = {
          "75cm": circle1Count,
          "60cm": circle2Count,
          "50cm": circle3Count,
          "40cm": circle4Count,
        };

        const maxCount = Math.max(
          circle1Count,
          circle2Count,
          circle3Count,
          circle4Count
        );
        const minCount = Math.min(
          circle1Count,
          circle2Count,
          circle3Count,
          circle4Count
        );
        const balanceGap = maxCount - minCount;

        // Check if this is an optimal result (perfect balance or near-perfect)
        const isOptimal =
          // Perfect 3-3-3-3 distribution (12 total) or 3-3-4-4 (14 total)
          (circle1Count === 3 &&
            circle2Count === 3 &&
            circle3Count === 3 &&
            circle4Count === 3) ||
          (circle1Count === 3 &&
            circle2Count === 3 &&
            circle3Count === 4 &&
            circle4Count === 4) ||
          // Or very well balanced distributions
          (balanceGap <= 1 && result.totalCount >= 12);

        results.push({
          totalCount: result.totalCount,
          counts,
          isOptimal,
        });

        if (isOptimal) {
          optimalCount++;
        }
      }

      console.log("\n=== STRESS TEST RESULTS ===");
      console.log("Total iterations:", iterations);
      console.log("Optimal results:", optimalCount);
      console.log(
        "Success rate:",
        ((optimalCount / iterations) * 100).toFixed(1),
        "%"
      );

      // Show some example results
      const optimalResults = results.filter((r) => r.isOptimal).slice(0, 5);
      console.log("\nExample optimal distributions:");
      optimalResults.forEach((result, index) => {
        console.log(
          `${index + 1}: ${result.counts["75cm"]}-${result.counts["60cm"]}-${result.counts["50cm"]}-${result.counts["40cm"]} (${result.totalCount} total)`
        );
      });

      // REQUIREMENT: Algorithm must achieve optimal distribution at least 80% of the time
      // Since user manually achieved it 3/3 times, the algorithm should be very consistent
      expect(optimalCount / iterations).toBeGreaterThanOrEqual(0.8);

      console.log(
        `\nTest PASSED: Algorithm achieves ${((optimalCount / iterations) * 100).toFixed(1)}% optimal results`
      );
    });
  });

  describe("Balanced Distribution Test", () => {
    it("should achieve better distribution for 14 circles in 250×250 with 5cm spacing", () => {
      // Test configuration from user feedback
      const width = 250;
      const height = 250;
      const gapSize = 5;

      // Define the 4 different circle types
      const circles: Circle[] = [
        { diameter: 75, color: "#ff6b6b" }, // Circle 1
        { diameter: 60, color: "#4ecdc4" }, // Circle 2
        { diameter: 50, color: "#45b7d1" }, // Circle 3
        { diameter: 40, color: "#96ceb4" }, // Circle 4
      ];

      // Calculate maximum circles with high attempt count for best distribution
      const result = calculateMaxCirclesForAll({
        width,
        height,
        circlesToFit: circles,
        gapSize,
        options: {
          attempts: 40, // Higher attempts to maximize chance of perfect 3-3-3-3 distribution
        },
      });

      console.log("Test Result:", {
        totalCount: result.totalCount,
        circlesByType: result.circlesByType,
      });

      // We expect at least 8 circles to fit (2 of each type)
      expect(result.totalCount).toBeGreaterThanOrEqual(8);

      // Get counts by diameter
      const circle1Count =
        result.circlesByType.find((c) => c.diameter === 75)?.count || 0;
      const circle2Count =
        result.circlesByType.find((c) => c.diameter === 60)?.count || 0;
      const circle3Count =
        result.circlesByType.find((c) => c.diameter === 50)?.count || 0;
      const circle4Count =
        result.circlesByType.find((c) => c.diameter === 40)?.count || 0;

      console.log("Distribution:", {
        "75cm": circle1Count,
        "60cm": circle2Count,
        "50cm": circle3Count,
        "40cm": circle4Count,
      });

      // The algorithm should achieve a more balanced distribution
      // Instead of 1-3-4-6, we should see closer to 2-2-2-2 or similar balanced pattern
      // Smallest circles (40cm) should not overwhelmingly dominate
      const maxCount = Math.max(
        circle1Count,
        circle2Count,
        circle3Count,
        circle4Count
      );
      const minCount = Math.min(
        circle1Count,
        circle2Count,
        circle3Count,
        circle4Count
      );

      // The difference between max and min should not be too extreme
      // We want more balanced distribution
      expect(maxCount - minCount).toBeLessThanOrEqual(4);

      // The 40cm circles (smallest) should not be more than 3x any other type
      // This ensures we're not overly prioritizing the smallest circles
      const expectedBalance =
        circle4Count <= Math.max(circle1Count, circle2Count, circle3Count) * 3;
      expect(expectedBalance).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle single circle configuration", () => {
      const width = 100;
      const height = 100;
      const gapSize = 5;
      const circles: Circle[] = [{ diameter: 50, color: "#ff6b6b" }];

      const result = calculateMaxCirclesForAll({
        width,
        height,
        circlesToFit: circles,
        gapSize,
      });

      expect(result.totalCount).toBeGreaterThanOrEqual(1);
      expect(result.circlesByType[0].count).toBeGreaterThanOrEqual(1);
    });

    it("should handle 10 circles configuration", () => {
      const width = 200;
      const height = 200;
      const gapSize = 2;
      const circles: Circle[] = [
        { diameter: 30, color: "#ff6b6b" },
        { diameter: 25, color: "#4ecdc4" },
        { diameter: 20, color: "#45b7d1" },
      ];

      const result = calculateMaxCirclesForAll({
        width,
        height,
        circlesToFit: circles,
        gapSize,
      });

      // Should be able to fit multiple circles
      expect(result.totalCount).toBeGreaterThanOrEqual(3);
    });
  });
});
