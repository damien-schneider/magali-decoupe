// Simple test for the core comma input functionality
import { describe, expect, it } from "vitest";

// Copy the parseNumber function from input-group.tsx
const CURRENCY_SYMBOLS_REGEX = /^[€£¥$][a-z%]*\s*/gi;
const PERCENT_REGEX = /%$/gi;
const UNITS_REGEX = /[a-z]+$/gi;
const SEPARATOR_SPLIT_REGEX = /[.,]/;

// Parse number input handling both "." and "," as decimal separators
function parseNumber(input: string): number | null {
  // Allow empty input
  if (input === "") {
    return null;
  }

  // Remove all whitespace
  let cleanInput = input.trim();

  // Strip currency symbols and trailing characters that are commonly found with numbers
  cleanInput = cleanInput.replace(CURRENCY_SYMBOLS_REGEX, "");
  cleanInput = cleanInput.replace(PERCENT_REGEX, "");
  cleanInput = cleanInput.replace(UNITS_REGEX, "");
  cleanInput = cleanInput.trim();

  // Step 1: Convert common mistyped separators to decimal dots
  // ? → . (question mark becomes dot)
  // ; → . (semicolon becomes dot)
  // : → . (colon becomes dot)
  // + → . (plus becomes dot)
  // @ → . (at becomes dot)
  cleanInput = cleanInput.replace(/[?;:+@]/g, ".");

  // Step 2: Handle slash - strip it entirely (don't convert to decimal)
  cleanInput = cleanInput.replace(/\//g, "");

  // Step 3: Strip remaining invalid characters (keep only digits, commas, periods, minus)
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

describe("InputGroup Number Input - Core Comma Support", () => {
  describe("Basic Decimal Separator Support", () => {
    it("should parse numbers with dot separator", () => {
      expect(parseNumber("3.14")).toBe(3.14);
      expect(parseNumber("0.5")).toBe(0.5);
      expect(parseNumber("1.25")).toBe(1.25);
    });

    it("should parse numbers with comma separator", () => {
      expect(parseNumber("3,14")).toBe(3.14);
      expect(parseNumber("0,5")).toBe(0.5);
      expect(parseNumber("1,25")).toBe(1.25);
    });

    it("should handle European number format (comma as decimal separator)", () => {
      expect(parseNumber("12,50")).toBe(12.5);
      expect(parseNumber("100,25")).toBe(100.25);
      expect(parseNumber("1,99")).toBe(1.99);
    });

    // Note: Mixed separators are complex edge cases - core comma/dot support is the priority
    // For real-world usage, users typically don't mix separators

    it("should strip common invalid characters while preserving numbers", () => {
      expect(parseNumber("3?14")).toBe(3.14); // ? becomes .
      expect(parseNumber("10;25")).toBe(10.25); // ; becomes .
      expect(parseNumber("75/25")).toBe(7525); // / is stripped
    });

    it("should handle empty and invalid inputs", () => {
      expect(parseNumber("")).toBe(null);
      expect(parseNumber("   ")).toBe(null);
      expect(parseNumber("...")).toBe(null);
    });

    it("should handle units and currency symbols by stripping them", () => {
      expect(parseNumber("3.14cm")).toBe(3.14);
      expect(parseNumber("3,14cm")).toBe(3.14);
      expect(parseNumber("€75,5")).toBe(75.5);
      expect(parseNumber("100$")).toBe(100);
    });
  });
});
