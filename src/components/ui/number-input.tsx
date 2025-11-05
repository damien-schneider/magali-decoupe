import { Minus, Plus } from "lucide-react";
import {
  type ChangeEvent,
  type ClipboardEvent,
  type ComponentProps,
  type FocusEvent,
  type KeyboardEvent,
  useEffect,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import {
  filterToAllowedCharacters,
  validateNumberInput,
} from "@/utils/input-filtering";

// Define regex at module level for better performance
const NUMBER_REGEX = /[0-9]/;

interface NumberInputProps extends Omit<ComponentProps<"input">, "type"> {
  /**
   * The step value for increment/decrement (supports decimal values)
   * @default 1
   */
  step?: number;
  /**
   * Minimum value allowed (supports decimal values)
   */
  min?: number;
  /**
   * Maximum value allowed (supports decimal values)
   */
  max?: number;
  /**
   * Whether to show the increment/decrement buttons
   * @default true
   */
  showButtons?: boolean;
  /**
   * Whether to allow negative numbers
   * @default false
   */
  allowNegative?: boolean;
}

function NumberInput({
  className,
  step = 1,
  min,
  max,
  showButtons = true,
  allowNegative = false,
  value,
  defaultValue,
  onChange,
  ...props
}: NumberInputProps) {
  // Store the actual user input string to preserve formatting (including commas)
  const [displayValue, setDisplayValue] = useState<string>(() => {
    if (typeof value === "number") {
      return value.toString();
    }
    if (typeof defaultValue === "number") {
      return defaultValue.toString();
    }
    return "";
  });

  // Store parsed numeric value for calculations
  const [numericValue, setNumericValue] = useState<number>(() => {
    if (typeof value === "number") {
      return value;
    }
    if (typeof defaultValue === "number") {
      return defaultValue;
    }
    return 0;
  });

  // Track if the input is currently empty
  const [isEmpty, setIsEmpty] = useState(false);

  // Track if the input is intentionally empty by user action
  const [isIntentionallyEmpty, setIsIntentionallyEmpty] = useState(false);

  // Update display value when controlled value changes
  useEffect(() => {
    if (typeof value === "number") {
      setDisplayValue(value.toString());
      setNumericValue(value);
      setIsEmpty(false);
      // Only reset intentionally empty if the value is not 0
      // This preserves the empty state when parent sets value to 0 on blur
      if (value !== 0) {
        setIsIntentionallyEmpty(false);
      }
    }
  }, [value]);

  const handleIncrement = () => {
    // Start from 0 if the input is empty
    const currentValue = isEmpty ? 0 : numericValue;
    const newValue = currentValue + step;
    if (max !== undefined && newValue > max) {
      return;
    }

    const clampedValue = max !== undefined ? Math.min(newValue, max) : newValue;
    const clampedStringValue = clampedValue.toString();

    if (typeof value === "number") {
      // Controlled component - let parent handle the value update
      onChange?.({
        target: { value: clampedStringValue } as HTMLInputElement,
      } as ChangeEvent<HTMLInputElement>);
    } else {
      // Uncontrolled component - update internally
      setDisplayValue(clampedStringValue);
      setNumericValue(clampedValue);
      setIsEmpty(false);
      setIsIntentionallyEmpty(false);
      onChange?.({
        target: { value: clampedStringValue } as HTMLInputElement,
      } as ChangeEvent<HTMLInputElement>);
    }
  };

  const handleDecrement = () => {
    // Start from 0 if the input is empty
    const currentValue = isEmpty ? 0 : numericValue;
    const newValue = currentValue - step;
    if (min !== undefined && newValue < min) {
      return;
    }

    const clampedValue = min !== undefined ? Math.max(newValue, min) : newValue;
    const clampedStringValue = clampedValue.toString();

    if (typeof value === "number") {
      // Controlled component - let parent handle the value update
      onChange?.({
        target: { value: clampedStringValue } as HTMLInputElement,
      } as ChangeEvent<HTMLInputElement>);
    } else {
      // Uncontrolled component - update internally
      setDisplayValue(clampedStringValue);
      setNumericValue(clampedValue);
      setIsEmpty(false);
      setIsIntentionallyEmpty(false);
      onChange?.({
        target: { value: clampedStringValue } as HTMLInputElement,
      } as ChangeEvent<HTMLInputElement>);
    }
  };

  // Strict input validation and filtering
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Allow control keys and navigation
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    // Only allow numbers, decimal separators, minus sign, and control characters
    const char = e.key;

    // Check if character is allowed
    const isNumber = NUMBER_REGEX.test(char);
    const isDecimal = char === "." || char === ",";
    const isNegative = allowNegative && char === "-";
    const isControl =
      char === "Backspace" ||
      char === "Delete" ||
      char === "Tab" ||
      char === "ArrowLeft" ||
      char === "ArrowRight" ||
      char === "ArrowUp" ||
      char === "ArrowDown" ||
      char === "Home" ||
      char === "End" ||
      char === "Insert";

    const allowed = isNumber || isDecimal || isNegative || isControl;

    if (!allowed) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData("text");
    const filteredData = filterToAllowedCharacters(pastedData, allowNegative);

    if (filteredData !== pastedData) {
      // Insert the filtered text at the cursor position
      const input = e.currentTarget;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const currentValue = input.value;

      const newValue =
        currentValue.substring(0, start) +
        filteredData +
        currentValue.substring(end);

      setDisplayValue(newValue);

      // Validate the new value
      const validation = validateNumberInput(newValue, allowNegative);

      if (validation.isValid) {
        if (typeof value !== "number") {
          setNumericValue(validation.numericValue || 0);
          setIsEmpty(validation.numericValue === null);
        }
        setIsIntentionallyEmpty(validation.numericValue === null);

        // Create and dispatch the change event
        const newEvent: ChangeEvent<HTMLInputElement> = {
          ...e,
          target: {
            ...e.target,
            value: newValue,
          },
        };
        onChange?.(newEvent);
      }
    }

    e.preventDefault();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Always update display value to preserve user input
    setDisplayValue(inputValue);

    // Allow empty input
    if (inputValue === "") {
      if (typeof value !== "number") {
        setIsEmpty(true);
      }
      setIsIntentionallyEmpty(true);
      setNumericValue(0);
      onChange?.(e);
      return;
    }

    const validation = validateNumberInput(inputValue, allowNegative);

    if (validation.isValid) {
      if (typeof value !== "number") {
        setNumericValue(validation.numericValue || 0);
        setIsEmpty(validation.numericValue === null);
      }
      setIsIntentionallyEmpty(validation.numericValue === null);
      onChange?.(e);
    } else {
      // If invalid, we can choose to prevent the change or allow it to be filtered
      // For strict filtering, we'll revert to the last valid value
      setDisplayValue(displayValue);
    }
  };

  const handleInputBlur = (e: FocusEvent<HTMLInputElement>) => {
    // If the input is empty when it loses focus, set the value to 0
    if (e.target.value === "") {
      const zeroValue = "0";

      if (typeof value === "number") {
        // Controlled component
        setIsIntentionallyEmpty(false);
        onChange?.({
          target: { value: zeroValue } as HTMLInputElement,
        } as ChangeEvent<HTMLInputElement>);
      } else {
        // Uncontrolled component
        setDisplayValue(zeroValue);
        setNumericValue(0);
        setIsEmpty(false);
        setIsIntentionallyEmpty(false);
        onChange?.({
          target: { value: zeroValue } as HTMLInputElement,
        } as ChangeEvent<HTMLInputElement>);
      }
    } else {
      // Reset the intentionally empty flag when input is not empty on blur
      setIsIntentionallyEmpty(false);
    }

    // Call the original onBlur handler if it exists
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  // Determine what value to display
  let currentDisplayValue: string;
  if (typeof value === "number") {
    // For controlled components, show empty string if intentionally empty and value is 0
    if (isIntentionallyEmpty && value === 0) {
      currentDisplayValue = "";
    } else {
      currentDisplayValue = value.toString();
    }
  } else if (typeof value === "string") {
    currentDisplayValue = value;
  } else {
    // For uncontrolled component, show empty string if isEmpty is true
    currentDisplayValue = isEmpty ? "" : displayValue;
  }

  const isDecrementDisabled = min !== undefined && numericValue <= min;
  const isIncrementDisabled = max !== undefined && numericValue >= max;

  return (
    <div
      className={cn(
        "flex h-9 w-full items-center overflow-hidden rounded-md border border-input bg-background text-sm shadow-sm transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
        className
      )}
      data-slot="number-input"
    >
      <input
        aria-label="Number input"
        className={cn(
          "h-full w-full bg-transparent px-3 py-1 text-center tabular-nums outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          showButtons ? "px-3" : "px-3"
        )}
        inputMode="decimal"
        onBlur={handleInputBlur}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        type="text"
        value={currentDisplayValue}
        {...props}
      />
      {showButtons && (
        <>
          <button
            aria-label="Decrease value"
            className="-me-px flex aspect-square h-[inherit] items-center justify-center border border-input bg-background text-muted-foreground text-sm transition-[color,box-shadow] hover:cursor-pointer hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isDecrementDisabled}
            onClick={handleDecrement}
            tabIndex={-1}
            type="button"
          >
            <Minus className="size-4" />
            <span className="sr-only">Decrease value</span>
          </button>
          <button
            aria-label="Increase value"
            className="-me-px flex aspect-square h-[inherit] items-center justify-center rounded-r-md border border-input bg-background text-muted-foreground text-sm transition-[color,box-shadow] hover:cursor-pointer hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isIncrementDisabled}
            onClick={handleIncrement}
            tabIndex={-1}
            type="button"
          >
            <Plus className="size-4" />
            <span className="sr-only">Increase value</span>
          </button>
        </>
      )}
    </div>
  );
}

export { NumberInput };
