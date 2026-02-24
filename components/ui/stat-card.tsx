import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  label: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  icon?: React.ReactNode;
  accentColor?: string;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, value, label, trend, icon, accentColor, ...props }, ref) => (
    <Card
      ref={ref}
      className={cn("p-6 text-center", className)}
      {...props}
    >
      {icon && (
        <div
          className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center mx-auto mb-3"
          style={{ background: accentColor || "var(--primary-50)" }}
        >
          {icon}
        </div>
      )}
      <div
        className="text-4xl font-extrabold leading-none mb-1"
        style={{ color: accentColor ? undefined : "var(--primary-600)" }}
      >
        {value}
      </div>
      <div className="text-sm text-[var(--secondary-500)]">{label}</div>
      {trend && (
        <div
          className={cn(
            "mt-2 text-xs font-medium",
            trend.positive !== false ? "text-[var(--success)]" : "text-[var(--error)]"
          )}
        >
          {trend.positive !== false ? "↑" : "↓"} {trend.value}
        </div>
      )}
    </Card>
  )
);
StatCard.displayName = "StatCard";

export { StatCard };
