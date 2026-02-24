import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  label: string;
  status: "completed" | "active" | "pending";
}

interface StepperProps {
  steps: Step[];
  className?: string;
}

const Stepper = ({ steps, className }: StepperProps) => (
  <div className={cn("flex items-center justify-between", className)}>
    {steps.map((step, i) => (
      <React.Fragment key={step.label}>
        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
              step.status === "completed" &&
                "bg-[var(--primary-600)] text-white",
              step.status === "active" &&
                "bg-[var(--primary-600)] text-white",
              step.status === "pending" &&
                "bg-[var(--secondary-200)] text-[var(--secondary-500)]"
            )}
          >
            {step.status === "completed" ? <Check size={14} /> : i + 1}
          </div>
          <span
            className={cn(
              "text-xs",
              step.status === "active" && "font-semibold text-[var(--secondary-900)]",
              step.status === "completed" && "text-[var(--secondary-600)]",
              step.status === "pending" && "text-[var(--secondary-400)]"
            )}
          >
            {step.label}
          </span>
        </div>

        {i < steps.length - 1 && (
          <div
            className="flex-1 h-0.5 mx-2 mb-5 transition-all"
            style={{
              background:
                steps[i + 1].status === "pending"
                  ? "var(--secondary-200)"
                  : "var(--primary-600)",
            }}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

export { Stepper };
export type { Step };
