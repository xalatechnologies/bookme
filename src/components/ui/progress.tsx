"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface IProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly value?: number;
  readonly max?: number;
  readonly className?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, IProgressProps>(
  ({ value = 0, max = 100, className, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700",
          className
        )}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-blue-600 transition-all duration-300 ease-in-out"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";
