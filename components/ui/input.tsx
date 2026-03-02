import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, rightIcon, ...props }, ref) => {
    const baseClass = cn(
      "w-full px-4 py-3 border rounded-md text-sm bg-background text-foreground transition-colors duration-200 placeholder:text-muted-foreground outline-none",
      "border-input focus:border-ring focus:ring-2 focus:ring-ring/20",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted",
      error && "border-destructive focus:border-destructive focus:ring-destructive/20",
      className
    );

    if (leftIcon || rightIcon) {
      return (
        <div className="relative w-full">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            type={type}
            className={cn(baseClass, leftIcon && "pl-10", rightIcon && "pr-10")}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </span>
          )}
        </div>
      );
    }

    return <input type={type} className={baseClass} ref={ref} {...props} />;
  }
);
Input.displayName = "Input";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("block mb-1.5 text-sm font-medium text-foreground", className)}
    {...props}
  />
));
Label.displayName = "Label";

const HelperText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { error?: boolean }
>(({ className, error, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("mt-1 text-xs", error ? "text-destructive" : "text-muted-foreground", className)}
    {...props}
  />
));
HelperText.displayName = "HelperText";

const FormGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col w-full mb-4", className)} {...props} />
));
FormGroup.displayName = "FormGroup";

export { Input, Label, HelperText, FormGroup };
