import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";
import { buttonVariants } from "./variants/buttonVariants";

export interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // Default to the primary variant with default size if not specified
    const defaultVariant = variant || "primary";
    const defaultSize = size || "default";
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant: defaultVariant, size: defaultSize, className })
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
PrimaryButton.displayName = "PrimaryButton";

export { PrimaryButton };