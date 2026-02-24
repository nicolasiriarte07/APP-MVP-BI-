import * as React from "react";
import { cn } from "@/lib/utils";
import { StatusPill } from "./badge";

interface DiagnosisCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  status?: string;
  statusVariant?: "default" | "success" | "error" | "info";
  date?: string;
  onViewAll?: () => void;
}

const DiagnosisCard = React.forwardRef<HTMLDivElement, DiagnosisCardProps>(
  (
    {
      className,
      title,
      description,
      status,
      statusVariant = "default",
      date,
      onViewAll,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "bg-[var(--accent-purple)] rounded-[var(--radius-lg)] p-5 mt-4",
        className
      )}
      {...props}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold text-[var(--secondary-900)]">{title}</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-[var(--primary-600)] hover:underline font-medium"
          >
            View all
          </button>
        )}
      </div>
      {description && (
        <p className="text-sm text-[var(--secondary-600)] mb-4">{description}</p>
      )}
      <div className="flex justify-between items-center">
        {status && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--secondary-700)]">Status:</span>
            <StatusPill variant={statusVariant}>{status}</StatusPill>
          </div>
        )}
        {date && (
          <span className="text-xs text-[var(--secondary-500)]">{date}</span>
        )}
      </div>
    </div>
  )
);
DiagnosisCard.displayName = "DiagnosisCard";

export { DiagnosisCard };
