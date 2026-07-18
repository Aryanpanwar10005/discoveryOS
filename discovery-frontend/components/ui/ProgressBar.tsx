import { cn } from "@/lib/cn";

interface ProgressBarProps {
  value: number;
  max: number;
  tone?: "brand" | "danger" | "warning" | "success";
  className?: string;
}

const toneStyles: Record<string, string> = {
  brand: "bg-gradient-to-r from-brand-500 to-brand-600",
  danger: "bg-danger-500",
  warning: "bg-warning-500",
  success: "bg-success-500",
};

export function ProgressBar({ value, max, tone = "brand", className }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-ink-100", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500 ease-out", toneStyles[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
