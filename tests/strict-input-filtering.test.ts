import { describe, expect, it } from "vitest";
import {
  filterToAllowedCharacters,
  validateNumberInput,
} from "../src/utils/input-filtering";

// Define regex at module level for better performance
const INVALID_CHARS_REGEX = /[^0-9,.-]/;

describe("Strict Input Filtering Tests", () => {
  describe("Character Filtering - Only allowed characters should pass through", () => {
    it("should allow only numbers, commas, periods, and minus signs", () => {
      // Numbers should pass through unchanged
      expect(filterToAllowedCharacters("123")).toBe("123");
      expect(filterToAllowedCharacters("3.14")).toBe("3.14");
      expect(filterToAllowedCharacters("3,14")).toBe("3,14");
      expect(filterToAllowedCharacters("-5.5", true)).toBe("-5.5");
      expect(filterToAllowedCharacters("-3,25", true)).toBe("-3,25");
    });

    it("should filter out invalid characters", () => {
      // Invalid characters should be completely removed
      expect(filterToAllowedCharacters("12?5")).toBe("125"); // ? removed
      expect(filterToAllowedCharacters("10;25")).toBe("1025"); // ; removed
      expect(filterToAllowedCharacters("8:5")).toBe("85"); // : removed
      expect(filterToAllowedCharacters("5+10")).toBe("510"); // + removed
      expect(filterToAllowedCharacters("7-2")).toBe("72"); // - removed (not at start)
      expect(filterToAllowedCharacters("3#25")).toBe("325"); // # removed
      expect(filterToAllowedCharacters("1@5")).toBe("15"); // @ removed
      expect(filterToAllowedCharacters("5$50")).toBe("550"); // $ removed
      expect(filterToAllowedCharacters("50%")).toBe("50"); // % removed
      expect(filterToAllowedCharacters("100!")).toBe("100"); // ! removed
    });

    it("should allow control characters for editing", () => {
      // Control characters should be handled by the browser naturally
      const input = "12345";
      expect(filterToAllowedCharacters(input)).toBe(input);
    });
  });

  describe("Number Input Validation - Valid number formats", () => {
    it("should validate dot separator correctly", () => {
      expect(validateNumberInput("3.14").isValid).toBe(true);
      expect(validateNumberInput("3.14").numericValue).toBe(3.14);
      expect(validateNumberInput("0.5").numericValue).toBe(0.5);
      expect(validateNumberInput("1.25").numericValue).toBe(1.25);
      expect(validateNumberInput("10.75").numericValue).toBe(10.75);
      expect(validateNumberInput("100.5").numericValue).toBe(100.5);
      expect(validateNumberInput("250.25").numericValue).toBe(250.25);
    });

    it("should validate comma separator correctly", () => {
      expect(validateNumberInput("3,14").isValid).toBe(true);
      expect(validateNumberInput("3,14").numericValue).toBe(3.14);
      expect(validateNumberInput("0,5").numericValue).toBe(0.5);
      expect(validateNumberInput("1,25").numericValue).toBe(1.25);
      expect(validateNumberInput("10,75").numericValue).toBe(10.75);
      expect(validateNumberInput("100,5").numericValue).toBe(100.5);
      expect(validateNumberInput("250,25").numericValue).toBe(250.25);
    });

    it("should validate European number format", () => {
      expect(validateNumberInput("12,50").numericValue).toBe(12.5);
      expect(validateNumberInput("100,25").numericValue).toBe(100.25);
      expect(validateNumberInput("1,99").numericValue).toBe(1.99);
      expect(validateNumberInput("0,01").numericValue).toBe(0.01);
    });

    it("should validate negative numbers", () => {
      expect(validateNumberInput("-5.5", true).isValid).toBe(true);
      expect(validateNumberInput("-5.5", true).numericValue).toBe(-5.5);
      expect(validateNumberInput("-3,25", true).numericValue).toBe(-3.25);
      expect(validateNumberInput("-0.5", true).numericValue).toBe(-0.5);

      // Without allowNegative flag, negative numbers should be invalid
      expect(validateNumberInput("-5.5").isValid).toBe(false);
      expect(validateNumberInput("-3,25").isValid).toBe(false);
    });

    it("should handle empty and whitespace inputs", () => {
      expect(validateNumberInput("").isValid).toBe(true);
      expect(validateNumberInput("").numericValue).toBe(null);
      expect(validateNumberInput("   ").isValid).toBe(true);
      expect(validateNumberInput("   ").numericValue).toBe(null);
      expect(validateNumberInput("\t\n").isValid).toBe(true);
      expect(validateNumberInput("\t\n").numericValue).toBe(null);
    });
  });

  describe("Invalid Input Handling", () => {
    it("should reject invalid inputs", () => {
      // These are invalid because invalid characters were filtered out during input
      expect(validateNumberInput("3..14").isValid).toBe(false);
      expect(validateNumberInput("3.14.15").isValid).toBe(false);
      expect(validateNumberInput("1,2,3").isValid).toBe(false);
      expect(validateNumberInput("..").isValid).toBe(false);
      expect(validateNumberInput(",,").isValid).toBe(false);
      expect(validateNumberInput(".").isValid).toBe(true); // Empty after normalization
      expect(validateNumberInput(".").numericValue).toBe(null);
      expect(validateNumberInput("-").isValid).toBe(false); // Negative sign without allowNegative
      expect(validateNumberInput("-.").isValid).toBe(false); // Negative sign without allowNegative

      // But valid with allowNegative
      expect(validateNumberInput("-", true).isValid).toBe(true); // Empty after normalization
      expect(validateNumberInput("-", true).numericValue).toBe(null);
      expect(validateNumberInput("-.", true).isValid).toBe(true); // Empty after normalization
      expect(validateNumberInput("-.", true).numericValue).toBe(null);

      // Negative-only inputs should be invalid without allowNegative
      expect(validateNumberInput("-5").isValid).toBe(false);
      expect(validateNumberInput("-5.5").isValid).toBe(false);

      // But valid with allowNegative
      expect(validateNumberInput("-5", true).isValid).toBe(true);
      expect(validateNumberInput("-5.5", true).isValid).toBe(true);
    });

    it("should validate inputs that would have contained invalid characters", () => {
      // With strict filtering, these characters would never have been in the input
      // So they represent invalid states that should be rejected
      expect(validateNumberInput("3?14").isValid).toBe(false); // ? was filtered out
      expect(validateNumberInput("10;25").isValid).toBe(false); // ; was filtered out
      expect(validateNumberInput("8:5").isValid).toBe(false); // : was filtered out
      expect(validateNumberInput("5+10").isValid).toBe(false); // + was filtered out
      expect(validateNumberInput("7-2").isValid).toBe(false); // - was filtered out (not at start)
    });
  });

  describe("Real-world scenarios with strict filtering", () => {
    it("should handle valid number inputs correctly", () => {
      // These are the only types of inputs that would reach the validation
      expect(validateNumberInput("250.5").numericValue).toBe(250.5);
      expect(validateNumberInput("250,5").numericValue).toBe(250.5);
      expect(validateNumberInput("100.25").numericValue).toBe(100.25);
      expect(validateNumberInput("100,75").numericValue).toBe(100.75);
      expect(validateNumberInput("75.25").numericValue).toBe(75.25);
      expect(validateNumberInput("75,25").numericValue).toBe(75.25);
      expect(validateNumberInput("40.5").numericValue).toBe(40.5);
      expect(validateNumberInput("40,5").numericValue).toBe(40.5);
    });

    it("should demonstrate the key difference from permissive filtering", () => {
      // In the old permissive system, these would be valid and converted
      // In strict filtering, these characters never make it to validation

      // Old permissive behavior: "3?14" → "3.14" → 3.14
      // New strict behavior: "3?14" → "314" → 314 (valid integer)
      const filteredInput = filterToAllowedCharacters("3?14");
      expect(filteredInput).toBe("314"); // ? was filtered out completely

      const validation = validateNumberInput("314");
      expect(validation.isValid).toBe(true); // 314 is a valid integer
      expect(validation.numericValue).toBe(314);

      // Another example: "10;25" → "1025" (old system: "10.25")
      const filteredInput2 = filterToAllowedCharacters("10;25");
      expect(filteredInput2).toBe("1025"); // ; was filtered out completely

      const validation2 = validateNumberInput("1025");
      expect(validation2.isValid).toBe(true); // 1025 is a valid integer
      expect(validation2.numericValue).toBe(1025);

      // For comparison, valid inputs with decimals should work
      const validFiltered = filterToAllowedCharacters("3.14");
      expect(validFiltered).toBe("3.14");

      const validValidation = validateNumberInput("3.14");
      expect(validValidation.isValid).toBe(true);
      expect(validValidation.numericValue).toBe(3.14);
    });
  });

  describe("User Experience with Strict Filtering", () => {
    it("should show that invalid characters never appear in the input", () => {
      // This demonstrates the key requirement: invalid characters should
      // not appear in the input at all, not even briefly

      const invalidInputs = ["3?14", "10;25", "8:5", "5+10", "1@5", "12#25"];

      for (const input of invalidInputs) {
        const filtered = filterToAllowedCharacters(input);
        const validation = validateNumberInput(filtered);

        // The filtered input should not contain any invalid characters
        expect(INVALID_CHARS_REGEX.test(filtered)).toBe(false);

        // And it should either be invalid or be a simple number without decimal
        if (filtered.includes(".") || filtered.includes(",")) {
          expect(validation.isValid).toBe(false);
        }
      }
    });
  });
});
