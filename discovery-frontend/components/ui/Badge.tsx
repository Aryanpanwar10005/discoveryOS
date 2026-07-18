import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type BadgeTone = "purple" | "blue" | "green" | "orange" | "red" | "gray" | "success" | "warning" | "danger" | "info";

const toneStyles: Record<BadgeTone, string> = {
  purple: "bg-brand-100 text-brand-700",
  blue: "bg-info-50 text-info-600",
  green: "bg-success-50 text-success-600",
  orange: "bg-warning-50 text-warning-600",
  red: "bg-danger-50 text-danger-600",
  gray: "bg-ink-100 text-ink-600",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  danger: "bg-danger-50 text-danger-600",
  info: "bg-info-50 text-info-600",
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

export function Badge({ children, tone = "gray", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium leading-none",
        toneStyles[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const impactTone: Record<string, BadgeTone> = {
  "Very High": "green",
  High: "warning",
  Medium: "orange",
  Low: "gray",
};

export function ImpactBadge({ impact }: { impact: string }) {
  return <Badge tone={impactTone[impact] ?? "gray"}>{impact}</Badge>;
}
