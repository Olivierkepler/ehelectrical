import type { Metadata } from "next";

import ProjectWorkspaceLayoutClient from "./layout-client";

export const metadata: Metadata = {
  title: "Project | Kepler",
  description: "Kepler project workspace",
};

export default function ProjectWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProjectWorkspaceLayoutClient>{children}</ProjectWorkspaceLayoutClient>;
}
