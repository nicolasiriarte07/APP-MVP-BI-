import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold cursor-pointer border border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none",
  {
    variants: {
      variant: {
        // Design system variants
        primary:     "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        secondary:   "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:     "bg-transparent border-input text-foreground hover:bg-accent hover:text-accent-foreground",
        ghost:       "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        link:        "bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto border-0",
        // Shadcn-compatible alias
        default:     "bg-primary text-primary-foreground hover:bg-primary/90",
      },
      size: {
        // Design system sizes
        sm:      "px-4 py-2 text-xs rounded-md",
        md:      "px-6 py-3 text-sm rounded-md",
        lg:      "px-8 py-4 text-base rounded-md",
        icon:    "w-10 h-10 rounded-full p-0",
        "icon-sm": "w-8 h-8 rounded-full p-0 text-xs",
        // Shadcn-compatible aliases
        default: "px-6 py-3 text-sm rounded-md",
        "icon-lg": "w-12 h-12 rounded-full p-0",
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
