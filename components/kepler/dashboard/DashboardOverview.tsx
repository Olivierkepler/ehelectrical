"use client";

import { useState } from "react";
import DashboardProjectsSection from "@/components/kepler/DashboardProjectsSection";
import { useWorkspaceProjects } from "@/lib/kepler/hooks/useWorkspaceProjects";
import DashboardHero from "./DashboardHero";
import DashboardSummaryCards from "./DashboardSummaryCards";
import DashboardProjectPulse from "./DashboardProjectPulse";
import { DashboardErrorState, DashboardSkeleton, dashboardSurface } from "./DashboardSurface";

export default function DashboardOverview() {
  const { data, loading, error, refresh } = useWorkspaceProjects();
  const [focusedId, setFocusedId] = useState("");
  const projects = !loading && !error ? data ?? [] : [];
  const selected = projects.find((project) => project.id === focusedId) ?? projects[0] ?? null;
  return <div className="w-full min-w-0">
    <DashboardHero project={selected} />
    <div className="px-4 pb-5 pt-6 sm:px-6 sm:pb-7 xl:px-8">
      <div className="mx-auto w-full max-w-[1440px] space-y-6">
        <DashboardSummaryCards projects={data} loading={loading} error={Boolean(error)} />
        <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.55fr)]">
          <DashboardProjectsSection projects={projects} loading={loading} error={Boolean(error)} onRetry={refresh} />
          {loading ? <div className={`${dashboardSurface} p-6`}><DashboardSkeleton label="Loading project updates" className="h-80" /></div> : error ? <div className={`${dashboardSurface} p-5`}><DashboardErrorState title="Project updates are unavailable." onRetry={refresh} /></div> : <DashboardProjectPulse projects={projects} selected={selected} onSelect={setFocusedId} />}
        </div>
      </div>
    </div>
  </div>;
}
