import { describe, expect, it } from "vitest";

// Copy the exact parseNumber logic from src/components/ui/input-group.tsx

// Constants for the parsing logic
const TRAILING_PERCENT_REGEX = /%$/;
const UNITS_REGEX = /[a-z]+$/gi;
const SEPARATOR_SPLIT_REGEX = /[.,]/;

function parseNumber(input: string): number | null {
  // Allow empty input
  if (input === "") {
    return null;
  }

  // Remove all whitespace
  let cleanInput = input.trim();

  // Step 1: Strip common copy-paste characters and units
  cleanInput = cleanInput.replace(/^[€£¥$][a-z%]*\s*/gi, ""); // Leading currency symbols
  cleanInput = cleanInput.replace(UNITS_REGEX, ""); // Trailing units (cm, mm, meters, etc.)
  cleanInput = cleanInput.replace(TRAILING_PERCENT_REGEX, ""); // Trailing %
  cleanInput = cleanInput.replace(/[$]+$/g, ""); // Trailing $
  cleanInput = cleanInput.trim();

  // Step 2: Character conversion - convert mistyped separators to dots
  cleanInput = cleanInput.replace(/[?;:+@]/g, ".");

  // Step 3: Strip invalid characters (keep only digits, commas, periods, minus)
  cleanInput = cleanInput.replace(/[^0-9,.-]/g, "");

  // Step 4: Handle mixed separators - prefer the last one as decimal separator
  const dotCount = (cleanInput.match(/\./g) || []).length;
  const commaCount = (cleanInput.match(/,/g) || []).length;

  if (dotCount > 0 && commaCount > 0) {
    // Find the last separator position
    const lastDotIndex = cleanInput.lastIndexOf(".");
    const lastCommaIndex = cleanInput.lastIndexOf(",");
    const lastSeparator = lastDotIndex > lastCommaIndex ? "." : ",";

    // Split by all separators first
    const allParts = cleanInput.split(SEPARATOR_SPLIT_REGEX);

    // Reconstruct: join all parts except the last, then add the last separator + last part
    // This preserves the decimal structure properly
    const lastPart = allParts.pop() || "";
    const joinedParts = allParts.join("");

    cleanInput = joinedParts + lastSeparator + lastPart;
  }

  // Step 5: Normalize to dot decimal separator
  cleanInput = cleanInput.replace(/,/g, ".");

  // Handle edge cases: multiple dots, leading dots, etc.
  const finalDotCount = (cleanInput.match(/\./g) || []).length;
  if (finalDotCount > 1) {
    // Multiple dots found - invalid number
    return null;
  }

  // Handle empty string after normalization
  if (
    cleanInput === "" ||
    cleanInput === "." ||
    cleanInput === "-" ||
    cleanInput === "-."
  ) {
    return null;
  }

  const numValue = Number(cleanInput);
  return Number.isNaN(numValue) ? null : numValue;
}

describe("InputGroup Number Input Decimal Separator Tests", () => {
  describe("Core Decimal Separator Handling - Only comma and period should be accepted", () => {
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

    it("should strip invalid characters but preserve valid numbers", () => {
      // Special characters are stripped, leaving valid number parts
      expect(parseNumber("3?14")).toBe(3.14); // ? becomes .
      expect(parseNumber("1,5?")).toBe(1.5); // ? is stripped
      expect(parseNumber("10;25")).toBe(10.25); // ; becomes .
      expect(parseNumber("12:5")).toBe(12.5); // : becomes .
      expect(parseNumber("8.5/9")).toBe(85.9); // / is stripped, becomes 8.59
      expect(parseNumber("5+10")).toBe(5.1); // + becomes .
      expect(parseNumber("7-2")).toBe(7.2); // - becomes .
    });

    it("should handle European number format (comma as decimal separator)", () => {
      expect(parseNumber("12,50")).toBe(12.5);
      expect(parseNumber("100,25")).toBe(100.25);
      expect(parseNumber("1,99")).toBe(1.99);
      expect(parseNumber("0,01")).toBe(0.01);
    });
  });

  describe("Input Validation - Only Numbers and Decimal Separators", () => {
    it("should accept only numbers, commas, periods, and minus signs", () => {
      expect(parseNumber("123")).toBe(123);
      expect(parseNumber("3.14")).toBe(3.14);
      expect(parseNumber("3,14")).toBe(3.14);
      expect(parseNumber("-5.5")).toBe(-5.5);
      expect(parseNumber("-3,25")).toBe(-3.25);
    });

    it("should strip invalid characters while preserving valid number parts", () => {
      expect(parseNumber("3?14")).toBe(3.14); // Question mark becomes decimal separator
      expect(parseNumber("3#25")).toBe(325); // Hash is stripped
      expect(parseNumber("1@5")).toBe(1.5); // At sign becomes decimal separator
      expect(parseNumber("5$50")).toBe(550); // Dollar sign is stripped (trailing)
      expect(parseNumber("50%")).toBe(50); // Percent sign is stripped (trailing)
      expect(parseNumber("100!")).toBe(100); // Exclamation mark is stripped
    });

    it("should handle mixed separators gracefully - prefer last separator", () => {
      // Mixed separators: keep the last one as decimal, remove others
      expect(parseNumber("3,14.5")).toBe(3.145); // Last dot is kept, comma stripped
      expect(parseNumber("1.25,75")).toBe(1.2575); // Last comma is kept, dot stripped
      expect(parseNumber("10,5.25")).toBe(10.525); // Last dot is kept, comma stripped
    });
  });

  describe("User Experience Tests - Real World Scenarios", () => {
    it("should handle fabric dimensions with proper decimal separators", () => {
      // Valid inputs
      expect(parseNumber("250.5")).toBe(250.5);
      expect(parseNumber("250,5")).toBe(250.5);
      expect(parseNumber("100.25")).toBe(100.25);
      expect(parseNumber("100,75")).toBe(100.75);

      // Invalid special character usage
      expect(parseNumber("250?5")).toBe(250.5); // ? is stripped, becomes 250.5
      expect(parseNumber("250.5;25")).toBe(250.525); // ; becomes .
    });

    it("should handle circle diameters with proper decimal separators", () => {
      // Valid inputs
      expect(parseNumber("75.25")).toBe(75.25);
      expect(parseNumber("75,25")).toBe(75.25);
      expect(parseNumber("40.5")).toBe(40.5);
      expect(parseNumber("40,5")).toBe(40.5);

      // Invalid special character usage - stripped but preserve numbers
      expect(parseNumber("75?25")).toBe(75.25); // ? becomes .
      expect(parseNumber("75/25")).toBe(7525); // Slash is stripped
    });

    it("should handle user typing mistakes correctly", () => {
      // User accidentally types wrong separator - prefer last one
      expect(parseNumber("12,5.25")).toBe(12.525); // Last dot kept
      expect(parseNumber("1.25,75")).toBe(1.2575); // Last comma kept

      // User types valid formats
      expect(parseNumber("12,5")).toBe(12.5);
      expect(parseNumber("1.25")).toBe(1.25);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle empty and whitespace inputs", () => {
      expect(parseNumber("")).toBe(null);
      expect(parseNumber("   ")).toBe(null);
      expect(parseNumber("\t\n")).toBe(null);
    });

    it("should handle multiple decimal separators correctly", () => {
      expect(parseNumber("3..14")).toBe(null);
      expect(parseNumber("3.14.15")).toBe(null);
      expect(parseNumber("1,2,3")).toBe(null);
      expect(parseNumber("..")).toBe(null);
      expect(parseNumber(",,")).toBe(null);
    });

    it("should remove non-numeric characters while preserving decimal separators", () => {
      expect(parseNumber("3.14cm")).toBe(3.14);
      expect(parseNumber("3,14cm")).toBe(3.14);
      expect(parseNumber("250.5mm")).toBe(250.5);
      expect(parseNumber("5.5 meters")).toBe(5.5);

      // These characters should be removed, but only commas and periods should be kept as separators
      expect(parseNumber("100$")).toBe(100);
      expect(parseNumber("€75,5")).toBe(75.5);
      expect(parseNumber("12%")).toBe(12);

      // Special characters are stripped while preserving valid numbers
      expect(parseNumber("12?")).toBe(12); // ? is stripped
      expect(parseNumber("#25")).toBe(25); // # is stripped
      expect(parseNumber("50@")).toBe(50); // @ is stripped
    });
  });
});
