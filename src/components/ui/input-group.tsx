/** biome-ignore-all lint/a11y/useSemanticElements: <> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <> */
/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: <> */
"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import {
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  useEffect,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/text-area";
import { cn } from "@/lib/utils";
import {
  filterToAllowedCharacters,
  validateNumberInput,
} from "@/utils/input-filtering";
import { Input } from "./input";

// Define regex at module level for better performance
const NUMBER_REGEX = /[0-9]/;

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "group/input-group relative flex w-full items-center rounded-md border border-input bg-input/30 shadow-xs outline-none transition-[color,box-shadow] dark:bg-input/30",
        "h-9 min-w-0 has-[>textarea]:h-auto",

        // Variants based on alignment.
        "has-[>[data-align=inline-start]]:[&>input]:pl-2",
        "has-[>[data-align=inline-end]]:[&>input]:pr-2",
        "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",

        // Focus state.
        "has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-[3px] has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50",

        // Error state.
        "has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",

        className
      )}
      data-slot="input-group"
      role="group"
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text select-none items-center justify-center gap-2 py-1.5 font-medium text-muted-foreground text-sm group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start":
          "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
        "inline-end":
          "order-last pr-3 has-[>button]:mr-[-0.45rem] has-[>kbd]:mr-[-0.35rem]",
        "block-start":
          "order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5 [.border-b]:pb-3",
        "block-end":
          "order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5 [.border-t]:pt-3",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
);

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      className={cn(inputGroupAddonVariants({ align }), className)}
      data-align={align}
      data-slot="input-group-addon"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return;
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus();
      }}
      role="group"
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva(
  "flex items-center gap-2 text-sm shadow-none",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5",
        "icon-xs":
          "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  }
);

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      className={cn(inputGroupButtonVariants({ size }), className)}
      data-size={size}
      type={type}
      variant={variant}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-muted-foreground text-sm [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
        className
      )}
      {...props}
    />
  );
}

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

// Enhanced NumberInput for InputGroup with strict character filtering
interface NumberInputGroupInputProps extends React.ComponentProps<"input"> {
  onValueChange?: (value: number) => void;
  /**
   * Whether to allow negative numbers
   * @default false
   */
  allowNegative?: boolean;
}

function NumberInputGroupInput({
  className,
  value,
  onChange,
  onValueChange,
  allowNegative = false,
  ...props
}: NumberInputGroupInputProps) {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    if (typeof value === "number") {
      return value.toString();
    }
    if (typeof value === "string") {
      return value;
    }
    return "";
  });

  // Update values when controlled value changes
  useEffect(() => {
    if (typeof value === "number") {
      setDisplayValue(value.toString());
    } else if (typeof value === "string") {
      setDisplayValue(value);
    }
  }, [value]);

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

      // Update the input value directly
      input.value = newValue;

      // Validate the new value
      const validation = validateNumberInput(newValue, allowNegative);

      // Call the number value change callback
      if (validation.isValid && validation.numericValue !== null) {
        onValueChange?.(validation.numericValue);
      }
    }

    e.preventDefault();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Always update display value to preserve user input
    setDisplayValue(inputValue);

    // Parse the value to handle decimal separators
    const validation = validateNumberInput(inputValue, allowNegative);

    // Create a new event with the parsed number if valid, otherwise preserve input
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value:
          validation.isValid && validation.numericValue !== null
            ? validation.numericValue.toString()
            : inputValue,
      },
    };

    // Call original onChange
    onChange?.(newEvent);

    // Call the number value change callback
    if (validation.isValid && validation.numericValue !== null) {
      onValueChange?.(validation.numericValue);
    }
  };

  return (
    <Input
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent",
        className
      )}
      data-slot="input-group-control"
      inputMode="decimal"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      type="text"
      value={displayValue}
      {...props}
    />
  );
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent",
        className
      )}
      data-slot="input-group-control"
      {...props}
    />
  );
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent",
        className
      )}
      data-slot="input-group-control"
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  NumberInputGroupInput,
  InputGroupTextarea,
  parseNumber,
};
