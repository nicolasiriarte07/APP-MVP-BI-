import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold cursor-pointer border border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--primary-600)] text-white hover:bg-[var(--primary-700)] active:bg-[var(--primary-800)]",
        secondary:
          "bg-[var(--secondary-100)] text-[var(--secondary-900)] hover:bg-[var(--secondary-200)] active:bg-[var(--secondary-300)]",
        outline:
          "bg-transparent border-[var(--secondary-300)] text-[var(--secondary-700)] hover:border-[var(--secondary-900)] hover:text-[var(--secondary-900)]",
        ghost:
          "bg-transparent text-[var(--secondary-600)] hover:bg-[var(--secondary-50)] active:bg-[var(--secondary-100)]",
        destructive:
          "bg-[var(--error)] text-white hover:opacity-90 active:opacity-80",
        link: "bg-transparent text-[var(--primary-600)] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "px-4 py-2 text-xs rounded-[var(--radius-sm)]",
        md: "px-6 py-3 text-sm rounded-[var(--radius-md)]",
        lg: "px-8 py-4 text-base rounded-[var(--radius-md)]",
        icon: "w-10 h-10 rounded-full p-0",
        "icon-sm": "w-8 h-8 rounded-full p-0 text-xs",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
