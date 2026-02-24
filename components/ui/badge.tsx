import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] font-bold uppercase tracking-wide",
  {
    variants: {
      variant: {
        // Design system variants
        primary:   "bg-primary/10 text-primary",
        secondary: "bg-secondary text-secondary-foreground",
        success:   "bg-[#DCFCE7] text-[#166534]",
        warning:   "bg-yellow-100 text-yellow-800",
        error:     "bg-[#FEE2E2] text-[#991B1B]",
        info:      "bg-[#DBEAFE] text-[#1E40AF]",
        // Shadcn-compatible aliases
        default:     "border-transparent bg-primary text-primary-foreground",
        destructive: "border-transparent bg-destructive text-white",
        outline:     "text-foreground border border-input",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

const statusPillVariants = cva(
  "inline-block px-3 py-1 rounded-full text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-yellow-100 text-yellow-800",
        success: "bg-[#DCFCE7] text-[#166534]",
        error:   "bg-[#FEE2E2] text-[#991B1B]",
        info:    "bg-[#DBEAFE] text-[#1E40AF]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export interface StatusPillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusPillVariants> {}

const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(statusPillVariants({ variant }), className)}
      {...props}
    />
  )
);
StatusPill.displayName = "StatusPill";

export { Badge, badgeVariants, StatusPill };
