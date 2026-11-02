"use client";

import { useState } from "react";
import DashboardProjectsSection from "@/components/kepler/DashboardProjectsSection";
import { useMyProjects } from "@/lib/kepler/hooks/useMyProjects";
import DashboardHero from "./DashboardHero";
import DashboardSummaryCards from "./DashboardSummaryCards";
import DashboardProjectPulse from "./DashboardProjectPulse";
import { DashboardErrorState, DashboardSkeleton, dashboardSurface } from "./DashboardSurface";

export default function DashboardOverview() {
  const { data, loading, error, refresh } = useMyProjects();
  const [focusedId, setFocusedId] = useState("");
  const projects = !loading && !error ? data ?? [] : [];
  const selected = projects.find((project) => project.id === focusedId) ?? projects[0] ?? null;
  return <div className="mx-auto w-full max-w-[1440px] space-y-6">
    <DashboardHero project={selected} />
    <DashboardSummaryCards projects={data} loading={loading} error={Boolean(error)} />
    <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.55fr)]">
      <DashboardProjectsSection projects={projects} loading={loading} error={Boolean(error)} onRetry={refresh} />
      {loading ? <div className={`${dashboardSurface} p-6`}><DashboardSkeleton label="Loading project updates" className="h-80" /></div> : error ? <div className={`${dashboardSurface} p-5`}><DashboardErrorState title="Project updates are unavailable." onRetry={refresh} /></div> : <DashboardProjectPulse projects={projects} selected={selected} onSelect={setFocusedId} />}
    </div>
  </div>;
}
