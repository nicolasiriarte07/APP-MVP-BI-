import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "./avatar";
import { Badge, StatusPill } from "./badge";
import { ChevronRight, Clock } from "lucide-react";

interface PatientRowProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  time?: string;
  avatarSrc?: string;
  status?: string;
  statusVariant?: "default" | "success" | "error" | "info";
  showChevron?: boolean;
}

const PatientRow = React.forwardRef<HTMLDivElement, PatientRowProps>(
  (
    {
      className,
      name,
      time,
      avatarSrc,
      status,
      statusVariant = "default",
      showChevron = true,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between bg-[var(--bg-surface)] p-4 rounded-[var(--radius-lg)] mb-3 shadow-[var(--shadow-sm)] transition-all duration-200 hover:shadow-[var(--shadow-md)] cursor-pointer",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <Avatar src={avatarSrc} alt={name} size="md" fallback={name.slice(0, 2)} />
        <div>
          <div className="font-semibold text-[var(--secondary-900)]">{name}</div>
          {time && (
            <div className="flex items-center gap-1 text-xs text-[var(--secondary-500)]">
              <Clock size={12} />
              {time}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {status && <StatusPill variant={statusVariant}>{status}</StatusPill>}
        {showChevron && (
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--secondary-400)] hover:bg-[var(--secondary-50)] transition-colors">
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
);
PatientRow.displayName = "PatientRow";

export { PatientRow };
