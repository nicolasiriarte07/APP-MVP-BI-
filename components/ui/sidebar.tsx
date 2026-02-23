"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  items: NavItem[];
  brand?: string;
  className?: string;
}

const Sidebar = ({ items, brand = "MedicalSystem", className }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "w-[260px] bg-[var(--bg-surface)] border-r border-[var(--secondary-200)] h-screen fixed overflow-y-auto flex flex-col gap-4 z-40",
        className
      )}
      style={{ padding: "var(--space-6)" }}
    >
      <div
        className="flex items-center gap-2 text-[20px] font-bold mb-4"
        style={{ color: "var(--primary-600)" }}
      >
        <Activity size={22} strokeWidth={2} />
        {brand}
      </div>

      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-[var(--radius-sm)] font-medium text-sm transition-all duration-200",
                isActive
                  ? "bg-[var(--primary-50)] text-[var(--primary-600)]"
                  : "text-[var(--secondary-600)] hover:bg-[var(--primary-50)] hover:text-[var(--primary-600)]"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export { Sidebar };
export type { NavItem };
