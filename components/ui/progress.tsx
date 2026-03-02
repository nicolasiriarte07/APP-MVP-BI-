'use client'

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  label?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, label, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {label && (
          <div className="flex justify-between items-center mb-2 text-sm font-medium text-foreground">
            <span>{label}</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        )}
        <div className="w-full h-2 bg-primary/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = "Progress";

const Spinner = ({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-4",
  };
  return (
    <div
      className={cn(
        "rounded-full border-muted border-t-primary animate-spin",
        sizeMap[size],
        className
      )}
      style={{ borderStyle: "solid" }}
      role="status"
      aria-label="Loading"
    />
  );
};

const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("animate-pulse rounded bg-muted", className)} {...props} />
);

export { Progress, Spinner, Skeleton };
