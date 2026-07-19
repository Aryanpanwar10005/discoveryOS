"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Wraps children in a fade + slide-up entrance animation.
 * Purely presentational — no effect on data, state, or logic of what's inside.
 */
export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const style: CSSProperties = {
    animationDelay: `${delay}ms`,
    animationFillMode: "backwards",
  };
  return (
    <div className={cn("animate-slide-up", className)} style={style}>
      {children}
    </div>
  );
}