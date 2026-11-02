"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { DiscoveredProject } from "@/lib/kepler/api/projects";
import DashboardProjectCard from "@/components/kepler/dashboard/DashboardProjectCard";
import { DashboardEmptyState, DashboardErrorState, DashboardSkeleton, dashboardFocus } from "@/components/kepler/dashboard/DashboardSurface";

export default function DashboardProjectsSection({ projects, loading, error, onRetry }: { projects: DiscoveredProject[]; loading: boolean; error: boolean; onRetry: () => void }) {
  return <section aria-labelledby="projects-heading" className="min-w-0">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div><h2 id="projects-heading" className="text-[18px] font-semibold tracking-[-0.025em]">Your projects</h2><p className="mt-1 text-[11px] leading-5 text-[#64748B]">Your portfolio, from the plans to the field.</p></div>
      <Link href="/projects" className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[#D9E2EA] bg-white px-3 text-[11px] font-semibold text-[#0D2343] ${dashboardFocus}`}>View all projects<ArrowUpRight size={14} /></Link>
    </div>
    {loading ? <div className="grid gap-4 sm:grid-cols-2">{[0, 1, 2, 3].map((key) => <DashboardSkeleton key={key} label="Loading project" className="h-[270px]" />)}</div> : error ? <DashboardErrorState title="Unable to load your projects." onRetry={onRetry} /> : projects.length ? <div className="grid gap-4 sm:grid-cols-2">{projects.slice(0, 4).map((project) => <DashboardProjectCard key={project.id} project={project} />)}</div> : <DashboardEmptyState title="Your next project starts here">Projects you own or join will appear in your workspace. Project creation is not available here yet.</DashboardEmptyState>}
  </section>;
}
