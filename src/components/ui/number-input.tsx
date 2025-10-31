import { Minus, Plus } from "lucide-react";
import {
  type ChangeEvent,
  type ComponentProps,
  type FocusEvent,
  useEffect,
  useState,
} from "react";

import { cn } from "@/lib/utils";

interface NumberInputProps extends Omit<ComponentProps<"input">, "type"> {
  /**
   * The step value for increment/decrement
   * @default 1
   */
  step?: number;
  /**
   * Minimum value allowed
   */
  min?: number;
  /**
   * Maximum value allowed
   */
  max?: number;
  /**
   * Whether to show the increment/decrement buttons
   * @default true
   */
  showButtons?: boolean;
}

function NumberInput({
  className,
  step = 1,
  min,
  max,
  showButtons = true,
  value,
  defaultValue,
  onChange,
  ...props
}: NumberInputProps) {
  const [internalValue, setInternalValue] = useState<number>(() => {
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

  // Update internal value when controlled value changes
  useEffect(() => {
    if (typeof value === "number") {
      setInternalValue(value);
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
    const currentValue = isEmpty ? 0 : internalValue;
    const newValue = currentValue + step;
    if (max !== undefined && newValue > max) {
      return;
    }

    const clampedValue = max !== undefined ? Math.min(newValue, max) : newValue;

    if (typeof value === "number") {
      // Controlled component
      onChange?.({
        target: { value: clampedValue.toString() } as HTMLInputElement,
      } as ChangeEvent<HTMLInputElement>);
    } else {
      // Uncontrolled component
      setInternalValue(clampedValue);
      setIsEmpty(false);
      onChange?.({
        target: { value: clampedValue.toString() } as HTMLInputElement,
      } as ChangeEvent<HTMLInputElement>);
    }
  };

  const handleDecrement = () => {
    // Start from 0 if the input is empty
    const currentValue = isEmpty ? 0 : internalValue;
    const newValue = currentValue - step;
    if (min !== undefined && newValue < min) {
      return;
    }

    const clampedValue = min !== undefined ? Math.max(newValue, min) : newValue;

    if (typeof value === "number") {
      // Controlled component
      onChange?.({
        target: { value: clampedValue.toString() } as HTMLInputElement,
      } as ChangeEvent<HTMLInputElement>);
    } else {
      // Uncontrolled component
      setInternalValue(clampedValue);
      setIsEmpty(false);
      onChange?.({
        target: { value: clampedValue.toString() } as HTMLInputElement,
      } as ChangeEvent<HTMLInputElement>);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow empty input or valid number
    if (inputValue === "") {
      if (typeof value !== "number") {
        setIsEmpty(true);
      }
      setIsIntentionallyEmpty(true);
      onChange?.(e);
      return;
    }

    const numValue = Number(inputValue.replace(/,/g, ""));

    if (!Number.isNaN(numValue)) {
      if (typeof value !== "number") {
        setInternalValue(numValue);
        setIsEmpty(false);
      }
      setIsIntentionallyEmpty(false);
      onChange?.(e);
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
        setInternalValue(0);
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

  // Format number with commas for display
  const formatNumber = (num: number) => num.toLocaleString();

  let displayValue: string;
  if (typeof value === "number") {
    // For controlled components, show empty string if intentionally empty and value is 0
    if (isIntentionallyEmpty && value === 0) {
      displayValue = "";
    } else {
      displayValue = formatNumber(value);
    }
  } else if (typeof value === "string") {
    displayValue = value;
  } else {
    // For uncontrolled component, show empty string if isEmpty is true
    displayValue = isEmpty ? "" : formatNumber(internalValue);
  }

  const isDecrementDisabled = min !== undefined && internalValue <= min;
  const isIncrementDisabled = max !== undefined && internalValue >= max;

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
        inputMode="numeric"
        onBlur={handleInputBlur}
        onChange={handleInputChange}
        type="text"
        value={displayValue}
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
