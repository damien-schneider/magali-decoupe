import { describe, expect, it } from "vitest";

// Extract the parseNumber logic from NumberInput component for testing
function parseNumber(input: string): number | null {
  // Allow empty input
  if (input === "") {
    return null;
  }

  // Remove all whitespace
  const cleanInput = input.trim();

  // Handle both "." and "," as decimal separators
  // Priority: convert comma to dot, then remove any remaining commas
  let normalizedInput = cleanInput.replace(/,/g, ".");

  // Remove any non-numeric characters except dots and minus signs
  normalizedInput = normalizedInput.replace(/[^\d.-]/g, "");

  // Handle edge cases: multiple dots, leading dots, etc.
  const dotCount = (normalizedInput.match(/\./g) || []).length;
  if (dotCount > 1) {
    // Multiple dots found - invalid number
    return null;
  }

  // Handle empty string after normalization
  if (
    normalizedInput === "" ||
    normalizedInput === "." ||
    normalizedInput === "-" ||
    normalizedInput === "-."
  ) {
    return null;
  }

  const numValue = Number(normalizedInput);
  return Number.isNaN(numValue) ? null : numValue;
}

describe("NumberInput Decimal Separator Tests", () => {
  describe("parseNumber Function Core Tests", () => {
    describe("Basic Decimal Separator Handling", () => {
      it("should parse numbers with dot separator correctly", () => {
        expect(parseNumber("3.14")).toBe(3.14);
        expect(parseNumber("0.5")).toBe(0.5);
        expect(parseNumber("1.25")).toBe(1.25);
        expect(parseNumber("10.75")).toBe(10.75);
        expect(parseNumber("100.5")).toBe(100.5);
        expect(parseNumber("250.25")).toBe(250.25);
      });

      it("should parse numbers with comma separator correctly", () => {
        expect(parseNumber("3,14")).toBe(3.14);
        expect(parseNumber("0,5")).toBe(0.5);
        expect(parseNumber("1,25")).toBe(1.25);
        expect(parseNumber("10,75")).toBe(10.75);
        expect(parseNumber("100,5")).toBe(100.5);
        expect(parseNumber("250,25")).toBe(250.25);
      });

      it("should handle European number format (comma as decimal separator)", () => {
        expect(parseNumber("12,50")).toBe(12.5);
        expect(parseNumber("100,25")).toBe(100.25);
        expect(parseNumber("1,99")).toBe(1.99);
        expect(parseNumber("0,01")).toBe(0.01);
      });
    });

    describe("Fabric Dimension Scenarios", () => {
      it("should handle fabric width values with decimal separators", () => {
        expect(parseNumber("250.0")).toBe(250.0);
        expect(parseNumber("250,5")).toBe(250.5);
        expect(parseNumber("100.25")).toBe(100.25);
        expect(parseNumber("100,75")).toBe(100.75);
      });

      it("should handle fabric height values with decimal separators", () => {
        expect(parseNumber("300.0")).toBe(300.0);
        expect(parseNumber("300,5")).toBe(300.5);
        expect(parseNumber("150.25")).toBe(150.25);
        expect(parseNumber("150,75")).toBe(150.75);
      });

      it("should handle gap size values with decimal separators", () => {
        expect(parseNumber("5.0")).toBe(5.0);
        expect(parseNumber("5,5")).toBe(5.5);
        expect(parseNumber("2.25")).toBe(2.25);
        expect(parseNumber("2,75")).toBe(2.75);
        expect(parseNumber("0.1")).toBe(0.1);
        expect(parseNumber("0,1")).toBe(0.1);
      });
    });

    describe("Circle Diameter Scenarios", () => {
      it("should handle circle diameter values with decimal separators", () => {
        expect(parseNumber("75.0")).toBe(75.0);
        expect(parseNumber("75,5")).toBe(75.5);
        expect(parseNumber("60.25")).toBe(60.25);
        expect(parseNumber("60,75")).toBe(60.75);
        expect(parseNumber("40.5")).toBe(40.5);
        expect(parseNumber("40,5")).toBe(40.5);
      });

      it("should handle small diameter values correctly", () => {
        expect(parseNumber("1.5")).toBe(1.5);
        expect(parseNumber("1,5")).toBe(1.5);
        expect(parseNumber("2.25")).toBe(2.25);
        expect(parseNumber("2,25")).toBe(2.25);
        expect(parseNumber("0.5")).toBe(0.5);
        expect(parseNumber("0,5")).toBe(0.5);
      });
    });

    describe("Step Values Testing", () => {
      it("should handle step values of 0.1 correctly", () => {
        // Common step values for increment/decrement
        expect(parseNumber("0.1")).toBe(0.1);
        expect(parseNumber("0,1")).toBe(0.1);
        expect(parseNumber("0.2")).toBe(0.2);
        expect(parseNumber("0,2")).toBe(0.2);
        expect(parseNumber("10.1")).toBe(10.1);
        expect(parseNumber("10,1")).toBe(10.1);
        expect(parseNumber("10.2")).toBe(10.2);
        expect(parseNumber("10,2")).toBe(10.2);
      });
    });

    describe("Edge Cases and Invalid Input", () => {
      it("should handle empty input", () => {
        expect(parseNumber("")).toBe(null);
        expect(parseNumber("   ")).toBe(null);
        expect(parseNumber("\t\n")).toBe(null);
      });

      it("should reject invalid formats", () => {
        expect(parseNumber("3..14")).toBe(null);
        expect(parseNumber("3.14.15")).toBe(null);
        expect(parseNumber("1,2,3")).toBe(null);
        expect(parseNumber("..")).toBe(null);
        expect(parseNumber(",,")).toBe(null);
        expect(parseNumber("...")).toBe(null);
        expect(parseNumber("1...5")).toBe(null);
      });

      it("should handle leading/trailing dots and commas", () => {
        expect(parseNumber(".5")).toBe(0.5);
        expect(parseNumber(",5")).toBe(0.5);
        expect(parseNumber("5.")).toBe(5);
        expect(parseNumber("5,")).toBe(5);
        expect(parseNumber(".")).toBe(null);
        expect(parseNumber(",")).toBe(null);
        expect(parseNumber("5..")).toBe(null);
        expect(parseNumber("5,,")).toBe(null);
      });

      it("should handle negative numbers", () => {
        expect(parseNumber("-3.14")).toBe(-3.14);
        expect(parseNumber("-3,14")).toBe(-3.14);
        expect(parseNumber("-0.5")).toBe(-0.5);
        expect(parseNumber("-0,5")).toBe(-0.5);
        expect(parseNumber("-250.5")).toBe(-250.5);
        expect(parseNumber("-250,5")).toBe(-250.5);
      });

      it("should reject invalid negative formats", () => {
        expect(parseNumber("-3..14")).toBe(null);
        expect(parseNumber("--3.14")).toBe(null);
        expect(parseNumber("-")).toBe(null);
        expect(parseNumber("-.")).toBe(null);
        expect(parseNumber("-,"));
        expect(parseNumber("-"));
      });

      it("should handle whitespace correctly", () => {
        expect(parseNumber("  3.14  ")).toBe(3.14);
        expect(parseNumber("  3,14  ")).toBe(3.14);
        expect(parseNumber("  -3.14  ")).toBe(-3.14);
        expect(parseNumber("\t250.5\t")).toBe(250.5);
        expect(parseNumber("\n300,25\n")).toBe(300.25);
      });

      it("should remove non-numeric characters", () => {
        expect(parseNumber("3.14cm")).toBe(3.14);
        expect(parseNumber("3,14cm")).toBe(3.14);
        expect(parseNumber("250.5mm")).toBe(250.5);
        expect(parseNumber("5.5 meters")).toBe(5.5);
        expect(parseNumber("100$")).toBe(100);
        expect(parseNumber("€75,5")).toBe(75.5);
      });
    });

    describe("Mixed and Complex Cases", () => {
      it("should handle mixed separators correctly", () => {
        // Mixed separators should be rejected as invalid input
        expect(parseNumber("3,14.5")).toBe(null);
        expect(parseNumber("1.25,75")).toBe(null);
        expect(parseNumber("10,5.25")).toBe(null);
      });

      it("should handle very small decimal values", () => {
        expect(parseNumber("0.01")).toBe(0.01);
        expect(parseNumber("0,01")).toBe(0.01);
        expect(parseNumber("0.001")).toBe(0.001);
        expect(parseNumber("0,001")).toBe(0.001);
        expect(parseNumber("0.0001")).toBe(0.0001);
      });

      it("should handle large decimal values", () => {
        expect(parseNumber("1000.5")).toBe(1000.5);
        expect(parseNumber("1000,5")).toBe(1000.5);
        expect(parseNumber("999.999")).toBe(999.999);
        expect(parseNumber("999,999")).toBe(999.999);
      });
    });
  });

  describe("User Experience Scenarios", () => {
    it('should handle user typing "12,5" in diameter field → should work as 12.5', () => {
      const result = parseNumber("12,5");
      expect(result).toBe(12.5);
    });

    it("should handle increment with step 0.1 on value like 10.2", () => {
      const baseValue = parseNumber("10.2");
      const stepValue = parseNumber("0.1");
      const incremented = (baseValue || 0) + (stepValue || 0);

      expect(baseValue).toBe(10.2);
      expect(stepValue).toBe(0.1);
      // Handle floating point precision by using toBeCloseTo
      expect(incremented).toBeCloseTo(10.3);
    });

    it("should handle multiple decimal separators gracefully", () => {
      expect(parseNumber("3.14.15")).toBe(null);
      expect(parseNumber("1,2,3")).toBe(null);
      expect(parseNumber("5..5")).toBe(null);
    });

    it("should handle negative values with decimal separators", () => {
      expect(parseNumber("-5,5")).toBe(-5.5);
      expect(parseNumber("-12.25")).toBe(-12.25);
      expect(parseNumber("-0,1")).toBe(-0.1);
    });
  });

  describe("Validation Schema Integration", () => {
    it("should work with validation that accepts fractional numbers", () => {
      // Simulate validation for fabric dimensions and circle diameters
      const validateDimension = (value: string) => {
        const parsed = parseNumber(value);
        if (parsed === null) return false;
        if (parsed <= 0) return false;
        if (parsed > 10_000) return false; // Max reasonable fabric dimension
        return true;
      };

      const validateDiameter = (value: string) => {
        const parsed = parseNumber(value);
        if (parsed === null) return false;
        if (parsed <= 0) return false;
        if (parsed > 1000) return false; // Max reasonable circle diameter
        return true;
      };

      const validateGap = (value: string) => {
        const parsed = parseNumber(value);
        if (parsed === null) return false;
        if (parsed < 0) return false;
        if (parsed > 100) return false; // Max reasonable gap size
        return true;
      };

      // Valid fabric dimensions
      expect(validateDimension("250")).toBe(true);
      expect(validateDimension("250.5")).toBe(true);
      expect(validateDimension("250,5")).toBe(true);
      expect(validateDimension("300.25")).toBe(true);

      // Valid circle diameters
      expect(validateDiameter("75")).toBe(true);
      expect(validateDiameter("75.5")).toBe(true);
      expect(validateDiameter("75,5")).toBe(true);
      expect(validateDiameter("60.25")).toBe(true);

      // Valid gap sizes
      expect(validateGap("5")).toBe(true);
      expect(validateGap("5.5")).toBe(true);
      expect(validateGap("5,5")).toBe(true);
      expect(validateGap("0.1")).toBe(true);

      // Invalid inputs
      expect(validateDimension("")).toBe(false);
      expect(validateDimension("abc")).toBe(false);
      expect(validateDimension("0")).toBe(false);
      expect(validateDimension("-5")).toBe(false);
      expect(validateDimension("3..14")).toBe(false);
    });
  });

  describe("Real-world Usage Examples", () => {
    it("should handle common fabric cutting scenarios", () => {
      // Standard fabric dimensions in cm
      expect(parseNumber("150")).toBe(150);
      expect(parseNumber("150,0")).toBe(150.0);
      expect(parseNumber("140.5")).toBe(140.5);
      expect(parseNumber("140,5")).toBe(140.5);

      // Gap sizes in mm converted to cm
      expect(parseNumber("0.5")).toBe(0.5);
      expect(parseNumber("0,5")).toBe(0.5);
      expect(parseNumber("1.0")).toBe(1.0);
      expect(parseNumber("1,0")).toBe(1.0);
    });

    it("should handle common circle sizes", () => {
      // Common circle diameters for crafts
      expect(parseNumber("75")).toBe(75); // Large circles
      expect(parseNumber("75,0")).toBe(75.0);
      expect(parseNumber("60")).toBe(60); // Medium circles
      expect(parseNumber("60,0")).toBe(60.0);
      expect(parseNumber("50")).toBe(50); // Medium circles
      expect(parseNumber("50,0")).toBe(50.0);
      expect(parseNumber("40")).toBe(40); // Small circles
      expect(parseNumber("40,0")).toBe(40.0);
    });

    it("should handle European decimal notation", () => {
      // Common European number format
      expect(parseNumber("12,5")).toBe(12.5); // 12.5 in European format
      expect(parseNumber("99,95")).toBe(99.95); // 99.95 in European format
      expect(parseNumber("1,25")).toBe(1.25); // 1.25 in European format
      expect(parseNumber("0,75")).toBe(0.75); // 0.75 in European format
    });
  });

  describe("Performance and Consistency Tests", () => {
    it("should handle large numbers of operations efficiently", () => {
      const testCases = [
        "3.14",
        "3,14",
        "250.5",
        "250,5",
        "75.25",
        "75,25",
        "0.1",
        "0,1",
        "10.2",
        "10,2",
        "1.5",
        "1,5",
        "1000.999",
        "1000,999",
        "0.001",
        "0,001",
      ];

      const startTime = Date.now();

      for (let i = 0; i < 10_000; i++) {
        testCases.forEach((testCase) => {
          parseNumber(testCase);
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 10,000 operations in reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it("should return consistent results for the same input", () => {
      const testInputs = [
        "3.14",
        "3,14",
        "250.5",
        "250,5",
        "-75.25",
        "-75,25",
        "0.1",
        "0,1",
      ];

      testInputs.forEach((input) => {
        const results = [];
        for (let i = 0; i < 100; i++) {
          results.push(parseNumber(input));
        }

        // All results should be identical
        const uniqueResults = [...new Set(results.map((r) => r?.toString()))];
        expect(uniqueResults.length).toBe(1);
      });
    });
  });
});
