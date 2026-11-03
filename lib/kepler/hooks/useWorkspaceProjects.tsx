"use client";

import { createContext, useContext } from "react";
import { useMyProjects } from "./useMyProjects";

const WorkspaceProjects = createContext<ReturnType<typeof useMyProjects> | null>(null);

/** Mounted once per authenticated user; dashboard and AI reuse the same discovery result. */
export function WorkspaceProjectsProvider({ children }: { children: React.ReactNode }) {
  const projects = useMyProjects();
  return <WorkspaceProjects.Provider value={projects}>{children}</WorkspaceProjects.Provider>;
}
export function useWorkspaceProjects() {
  const value = useContext(WorkspaceProjects);
  if (!value) throw new Error("WorkspaceProjectsProvider is required");
  return value;
}
