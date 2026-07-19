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

export function ProjectSwitcher() {
  const { projectId, project, switchProject } = useCurrentProject();
  const projects = getAllProjects();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600">Project:</span>
      <Select
        value={projectId.toString()}
        onValueChange={(value) => switchProject(parseInt(value))}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((proj) => (
            <SelectItem key={proj.id} value={proj.id.toString()}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full bg-gradient-to-r ${proj.color}`}
                />
                {proj.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
