"use client";

import { Bell, HelpCircle, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProjectSwitcher } from "@/components/project-switcher";
import type { ReactNode } from "react";
import {useState} from "react"

interface TopbarProps {
  breadcrumb: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
  onAction?: () => void;
  rightSlot?: ReactNode;
}

export function Topbar({
  breadcrumb,
  actionLabel = "Upload Research",
  actionIcon = <Plus size={16} />,
  onAction,
  rightSlot,
}: TopbarProps) {

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-ink-100 bg-white/80 px-6 backdrop-blur-sm">
      <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[14.5px] font-semibold text-ink-900 transition-colors hover:bg-ink-50">
        {breadcrumb}
        <ChevronDown size={16} className="text-ink-400" />
      </button>

      <div className="flex items-center gap-3">
        {rightSlot}
        {actionLabel && onAction && (
          <Button size="md" icon={actionIcon} onClick={onAction}>
            {actionLabel}
          </Button>
        )}

        <button
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-800"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger-500" />
        </button>
        <button
          aria-label="Help"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-800"
        >
          <HelpCircle size={18} />
        </button>
        <button
          aria-label="Account"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-800 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          A
        </button>
      </div>
    </header>
  );
}
