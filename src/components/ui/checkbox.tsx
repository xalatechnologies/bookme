import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // base
      "peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 bg-white",
      // focus/hover
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 hover:border-blue-400",
      // disabled
      "disabled:cursor-not-allowed disabled:opacity-50",
      // radix state
      "data-[state=checked]:bg-white data-[state=checked]:text-primary data-[state=checked]:border-primary",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center">
      <Check className="h-3 w-3 stroke-[3] text-primary" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = "Checkbox";

export { Checkbox };