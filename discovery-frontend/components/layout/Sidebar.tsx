"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Layers,
  Target,
  Users2,
  FileSearch,
  FileText,
  Bot,
  ChevronDown,
  CheckCircle2,
  UploadCloud,
} from "lucide-react";
import { cn } from "@/lib/cn";

const primaryNav = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Insights", href: "/insights", icon: BarChart3 },

  { label: "Opportunities", href: "/opportunities", icon: Target },

  { label: "Upload History", href: "/uploads", icon: UploadCloud },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "AI Agents", href: "/ai-agents", icon: Bot },
];

const projects = [
  { name: "FitWardrobe", href: "/", active: true },
  { name: "StudyBuddy", href: "#" },
  { name: "MealMate", href: "#" },
  { name: "WorkFlowPro", href: "#" },
];

const agentStatus = [
  "Ingestion Agent",
  "Insight Agent",
  "Theme Agent",
  "Prioritization Agent",
  "Report Agent",
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-[248px] shrink-0 flex-col border-r border-ink-100 bg-white lg:flex">
      <div className="flex items-center gap-2 px-5 pt-5 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="8" cy="8" r="6" fill="white" fillOpacity="0.9" />
            <circle cx="16" cy="16" r="6" fill="white" fillOpacity="0.55" />
          </svg>
        </div>
        <span className="text-[15px] font-bold tracking-tight text-ink-900">DiscoveryOS</span>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-none px-3">
        <ul className="flex flex-col gap-0.5">
          {primaryNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                  )}
                >
                  <Icon
                    size={17}
                    strokeWidth={2}
                    className={cn(isActive ? "text-brand-600" : "text-ink-400 group-hover:text-ink-600")}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 px-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Projects</p>
          <ul className="flex flex-col gap-0.5">
            {projects.map((project) => (
              <li key={project.name}>
                <Link
                  href={project.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13.5px] transition-colors",
                    project.active
                      ? "bg-brand-50 font-medium text-brand-700"
                      : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      project.active ? "bg-brand-600" : "bg-ink-300"
                    )}
                  />
                  {project.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="border-t border-ink-100 px-4 py-4">
        <div className="rounded-xl bg-ink-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[12px] font-semibold text-ink-800">AI Agents Status</p>
          </div>
          <p className="mb-2 text-[11px] text-success-600">All agents are active</p>
          <ul className="flex flex-col gap-1.5">
            {agentStatus.map((name) => (
              <li key={name} className="flex items-center gap-1.5 text-[12px] text-ink-600">
                <CheckCircle2 size={13} className="text-success-500" />
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button className="flex items-center gap-2.5 border-t border-ink-100 px-4 py-3.5 text-left transition-colors hover:bg-ink-50">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-800 text-[12px] font-semibold text-white">
          A
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-ink-900">Ananya</p>
          <p className="text-[11.5px] text-ink-500">Product Manager</p>
        </div>
        <ChevronDown size={15} className="text-ink-400" />
      </button>
    </aside>
  );
}