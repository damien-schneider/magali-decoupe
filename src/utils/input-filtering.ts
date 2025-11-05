/**
 * Strict input filtering utilities for number inputs
 * Only allow numbers (0-9), commas (,), periods (.), minus signs (-), and control characters
 */

/**
 * Check if a character is allowed for number input
 */
// Define regex at module level for better performance
const NUMBER_REGEX = /[0-9]/;

export function isAllowedCharacter(char: string, isNegativeAllowed = false) {
  // Control characters are always allowed
  if (char === "") {
    return true;
  }

  // Numbers 0-9
  if (NUMBER_REGEX.test(char)) {
    return true;
  }

  // Decimal separators
  if (char === "." || char === ",") {
    return true;
  }

  // Negative sign (only if negative numbers are allowed)
  if (isNegativeAllowed && char === "-") {
    return true;
  }

  return false;
}

/**
 * Filter input value to only contain allowed characters
 */
export function filterToAllowedCharacters(
  input: string,
  isNegativeAllowed = false
) {
  const allowedChars: string[] = [];

  for (const char of input) {
    if (isAllowedCharacter(char, isNegativeAllowed)) {
      allowedChars.push(char);
    }
  }

  return allowedChars.join("");
}

/**
 * Handle keydown event to prevent invalid characters from being entered
 */
export function handleKeyDown(
  e: React.KeyboardEvent<HTMLInputElement>,
  isNegativeAllowed = false
) {
  const char = e.key;
  const ctrlOrCmd = e.ctrlKey || e.metaKey;

  // Allow control keys
  if (ctrlOrCmd) {
    return true;
  }

  // Allow control characters like Backspace, Delete, Tab, Arrow keys
  if (
    char === "Backspace" ||
    char === "Delete" ||
    char === "Tab" ||
    char === "ArrowLeft" ||
    char === "ArrowRight" ||
    char === "ArrowUp" ||
    char === "ArrowDown" ||
    char === "Home" ||
    char === "End" ||
    char === "Insert"
  ) {
    return true;
  }

  // Check if character is allowed
  if (isAllowedCharacter(char, isNegativeAllowed)) {
    return true;
  }

  // Prevent invalid character from being entered
  e.preventDefault();
  return false;
}

/**
 * Handle paste event to clean pasted content
 */
export function handlePaste(
  e: React.ClipboardEvent<HTMLInputElement>,
  isNegativeAllowed = false
) {
  const pastedData = e.clipboardData.getData("text");
  const filteredData = filterToAllowedCharacters(pastedData, isNegativeAllowed);

  return filteredData;
}

/**
 * Clean input value to only contain allowed characters
 * Returns the cleaned value and whether it was modified
 */
export function cleanInputValue(input: string, isNegativeAllowed = false) {
  const filteredValue = filterToAllowedCharacters(input, isNegativeAllowed);

  return {
    value: filteredValue,
    wasModified: filteredValue !== input,
  };
}

/**
 * Validate input value for valid number format
 * Returns validation result with cleaned value
 */
export function validateNumberInput(input: string, isNegativeAllowed = false) {
  // Allow empty input
  if (input.trim() === "") {
    return {
      isValid: true,
      cleanedValue: "",
      numericValue: null,
    };
  }

  // Check if input contains any invalid characters
  const { value: cleanedValue, wasModified } = cleanInputValue(
    input,
    isNegativeAllowed
  );

  // If input was modified during filtering, it's invalid
  // This ensures strict filtering: invalid characters never reach validation
  if (wasModified) {
    return {
      isValid: false,
      cleanedValue,
      numericValue: null,
    };
  }

  // Handle empty string after cleaning
  if (
    cleanedValue === "" ||
    cleanedValue === "." ||
    cleanedValue === "-" ||
    cleanedValue === "-."
  ) {
    return {
      isValid: true,
      cleanedValue,
      numericValue: null,
    };
  }

  // Convert comma to dot for parsing
  const parsedInput = cleanedValue.replace(/,/g, ".");

  // Check for multiple dots
  const dotCount = (parsedInput.match(/\./g) || []).length;
  if (dotCount > 1) {
    return {
      isValid: false,
      cleanedValue,
      numericValue: null,
    };
  }

  // Validate negative sign placement
  if (cleanedValue.startsWith("-")) {
    // Negative sign must be at the beginning
    if (!isNegativeAllowed) {
      return {
        isValid: false,
        cleanedValue,
        numericValue: null,
      };
    }

    // Check if negative sign is followed by a valid number
    const negativePart = parsedInput.substring(1);
    if (!negativePart || negativePart === "." || negativePart === "-") {
      return {
        isValid: false,
        cleanedValue,
        numericValue: null,
      };
    }
  }

  // Parse the number
  const numValue = Number(parsedInput);
  if (Number.isNaN(numValue)) {
    return {
      isValid: false,
      cleanedValue,
      numericValue: null,
    };
  }

  const numericValue = numValue;

  return {
    isValid: true,
    cleanedValue,
    numericValue,
  };
}
