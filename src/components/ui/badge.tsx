import * as React from "react"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils/cn"
import { badgeVariants } from "./variants/badgeVariants"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge }
