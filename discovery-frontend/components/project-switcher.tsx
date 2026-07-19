"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllProjects, useCurrentProject } from "@/lib/project-context";
import { ChevronDown } from "lucide-react";

export function ProjectSwitcher() {
  const { projectId, project, switchProject } = useCurrentProject();
  const projects = getAllProjects();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentProject = projects.find(p => p.id === projectId);

  return (
    <Select
      value={projectId.toString()}
      onValueChange={(value) => switchProject(parseInt(value))}
    >
      <SelectTrigger className="flex items-center gap-2.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-900 transition-all duration-150 hover:border-ink-300 focus:outline-none focus:ring-2 focus:ring-brand-500">
        {currentProject && (
          <>
            <div
              className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${currentProject.color}`}
            />
            <span className="text-sm font-medium text-ink-900">
              {currentProject.name}
            </span>
          </>
        )}
        <ChevronDown size={16} className="ml-auto text-ink-400" />
      </SelectTrigger>
      <SelectContent className="min-w-[200px]">
        {projects.map((proj) => (
          <SelectItem key={proj.id} value={proj.id.toString()}>
            <div className="flex items-center gap-2.5">
              <div
                className={`h-2 w-2 rounded-full bg-gradient-to-r ${proj.color}`}
              />
              <span className="text-sm font-medium">{proj.name}</span>
              {proj.description && (
                <span className="text-xs text-ink-400 ml-2">
                  {proj.description}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
