import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, rightIcon, ...props }, ref) => {
    if (leftIcon || rightIcon) {
      return (
        <div className="relative w-full">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary-400)] pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            type={type}
            className={cn(
              "w-full px-4 py-3 border rounded-[var(--radius-md)] text-sm text-[var(--secondary-900)] bg-[var(--bg-surface)] transition-colors duration-200 placeholder:text-[var(--secondary-400)]",
              "border-[var(--secondary-200)] focus:outline-none focus:border-[var(--primary-600)] focus:ring-2 focus:ring-[var(--primary-100)]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--secondary-50)]",
              error && "border-[var(--error)] focus:border-[var(--error)] focus:ring-[#FEE2E2]",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--secondary-400)]">
              {rightIcon}
            </span>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          "w-full px-4 py-3 border rounded-[var(--radius-md)] text-sm text-[var(--secondary-900)] bg-[var(--bg-surface)] transition-colors duration-200 placeholder:text-[var(--secondary-400)]",
          "border-[var(--secondary-200)] focus:outline-none focus:border-[var(--primary-600)] focus:ring-2 focus:ring-[var(--primary-100)]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--secondary-50)]",
          error && "border-[var(--error)] focus:border-[var(--error)] focus:ring-[#FEE2E2]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "block mb-1.5 text-sm font-medium text-[var(--secondary-700)]",
      className
    )}
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
    className={cn(
      "mt-1 text-xs",
      error ? "text-[var(--error)]" : "text-[var(--secondary-500)]",
      className
    )}
    {...props}
  />
));
HelperText.displayName = "HelperText";

const FormGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col w-full mb-4", className)}
    {...props}
  />
));
FormGroup.displayName = "FormGroup";

export { Input, Label, HelperText, FormGroup };
