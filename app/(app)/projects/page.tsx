import type { Metadata } from "next";

import ProjectsPageClient from "./ProjectsPageClient";

export const metadata: Metadata = {
  title: "Projects | Kepler",
  description: "Kepler project portfolio",
};

export default function ProjectsPage() {
  return <ProjectsPageClient />;
}
