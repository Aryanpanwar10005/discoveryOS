"use client";

import { Calendar, ChevronDown } from "lucide-react";

export function SprintSelector({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2 text-[13.5px] font-medium text-ink-700 shadow-card transition-colors hover:bg-ink-50">
      <Calendar size={15} className="text-ink-400" />
      {label}
      <ChevronDown size={15} className="text-ink-400" />
    </button>
  );
}
