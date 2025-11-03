"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface SeparatorProps extends ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <div
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      role={decorative ? "none" : "separator"}
      data-orientation={orientation}
      data-slot="separator"
      {...props}
    />
  );
}

export { Separator };