import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] font-bold uppercase tracking-wide",
  {
    variants: {
      variant: {
        primary: "bg-[var(--primary-100)] text-[var(--primary-700)]",
        secondary: "bg-[var(--secondary-100)] text-[var(--secondary-600)]",
        success: "bg-[#DCFCE7] text-[#166534]",
        warning: "bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)]",
        error: "bg-[#FEE2E2] text-[#991B1B]",
        info: "bg-[#DBEAFE] text-[#1E40AF]",
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
        default: "bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)]",
        success: "bg-[#DCFCE7] text-[#166534]",
        error: "bg-[#FEE2E2] text-[#991B1B]",
        info: "bg-[var(--primary-100)] text-[var(--primary-700)]",
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
