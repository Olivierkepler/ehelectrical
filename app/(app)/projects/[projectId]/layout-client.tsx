"use client";

import { useParams } from "next/navigation";

import ProjectWorkspaceShell from "@/components/kepler/ProjectWorkspaceShell";
import { ProjectWorkspaceProvider } from "@/lib/kepler/hooks/useProjectWorkspace";

export default function ProjectWorkspaceLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ projectId: string }>();
  const projectId = decodeURIComponent(params.projectId ?? "");

  return (
    <ProjectWorkspaceProvider projectId={projectId}>
      <ProjectWorkspaceShell>{children}</ProjectWorkspaceShell>
    </ProjectWorkspaceProvider>
  );
}
