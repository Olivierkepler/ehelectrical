"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowUpRight, CheckCheck, GitCompareArrows, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/kepler/AuthProvider";
import { formatActivityEventLabel, getProjectActivity, type ActivityEvent } from "@/lib/kepler/api/activity";
import type { DiscoveredProject } from "@/lib/kepler/api/projects";
import { DashboardEmptyState, DashboardErrorState, DashboardSkeleton, dashboardFocus, dashboardSurface } from "./DashboardSurface";
import { useDashboardProjectDetail } from "./useDashboardProjectDetail";

function ProjectActivity({ project }: { project: DiscoveredProject }) {
  const { user } = useAuth();
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ id: string; items: ActivityEvent[]; error: boolean } | null>(null);
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setResult(null);
    getProjectActivity(project.id, { limit: 4 }).then((page) => {
      if (!cancelled) setResult({ id: project.id, items: page.items, error: false });
    }).catch(() => { if (!cancelled) setResult({ id: project.id, items: [], error: true }); });
    return () => { cancelled = true; };
  }, [user, project.id, revision]);
  const current = result?.id === project.id ? result : null;

  if (!current) return <DashboardSkeleton label="Loading recent activity" className="h-48" />;
  if (current.error) return <DashboardErrorState title="Activity could not be loaded." onRetry={() => setRevision((value) => value + 1)} />;
  if (!current.items.length) return <DashboardEmptyState title="No activity yet">Field updates and project events will appear here.</DashboardEmptyState>;
  return <ul className="divide-y divide-[#D9E2EA]/60">{current.items.map((event) => {
    const Icon = event.actorType === "agent" ? Sparkles : Activity;
    const date = new Date(event.createdAt);
    return <li key={event.id} className="flex gap-3 py-4 first:pt-0 last:pb-0"><span aria-hidden="true" className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#F4F6F9] text-[#0D2343]"><Icon size={14} /></span><div className="min-w-0"><p className="break-words text-[11px] font-medium leading-5 text-[#0D2343]">{formatActivityEventLabel(event.type)}</p><p className="mt-1 text-[10px] text-[#64748B]">{Number.isNaN(date.getTime()) ? "Date unavailable" : <time dateTime={event.createdAt}>{date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</time>}</p></div></li>;
  })}</ul>;
}

export default function DashboardProjectPulse({ projects, selected, onSelect }: { projects: DiscoveredProject[]; selected: DiscoveredProject | null; onSelect: (id: string) => void }) {
  const { data, loading, error, refresh } = useDashboardProjectDetail(selected);
  return <aside aria-label="Selected project updates" className={`${dashboardSurface} min-w-0 self-start p-5 sm:p-6`}>
    <div className="flex items-center gap-2"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#C8102E]" /><h2 className="text-[15px] font-semibold tracking-[-0.02em]">Project pulse</h2></div>
    <p className="mt-2 text-[11px] leading-5 text-[#64748B]">A closer look at your selected project.</p>
    {selected ? <>
      <label htmlFor="dashboard-project-focus" className="mb-2 mt-5 block text-[10px] font-medium uppercase tracking-[0.1em] text-[#64748B]">Project focus</label>
      <select id="dashboard-project-focus" value={selected.id} onChange={(event) => onSelect(event.target.value)} className={`min-h-11 w-full min-w-0 truncate rounded-xl border border-[#D9E2EA] bg-[#F4F6F9]/70 px-3 text-[11px] text-[#0D2343] ${dashboardFocus}`}>{projects.map((project) => <option value={project.id} key={project.id}>{project.name || "Untitled project"}</option>)}</select>
      <p className="mt-2 text-[10px] leading-5 text-[#64748B]">Also used for the Kepler AI shortcut.</p>
      <div className="my-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[#D9E2EA]/60 bg-[#F4F6F9]/50 p-3"><CheckCheck size={16} aria-hidden="true" className="text-[#0D2343]" /><p className="mt-2 text-[22px] font-semibold tabular-nums">{loading || error ? "—" : data?.assignedTasks ?? "—"}</p><p className="mt-1 text-[10px] text-[#64748B]">Assigned tasks</p></div>
        <Link href={`/projects/${encodeURIComponent(selected.id)}/deltas`} className={`rounded-xl border border-[#D9E2EA]/60 bg-[#F4F6F9]/50 p-3 ${dashboardFocus}`}><GitCompareArrows size={16} aria-hidden="true" className="text-[#C8102E]" /><p className={`mt-2 text-[22px] font-semibold tabular-nums ${data && data.openDeltas > 0 ? "text-[#C8102E]" : ""}`}>{loading || error ? "—" : data?.openDeltas ?? "—"}</p><p className="mt-1 text-[10px] text-[#64748B]">Open deltas</p></Link>
      </div>
      {error && <div className="mb-5"><DashboardErrorState title="Project details unavailable." onRetry={refresh} /></div>}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#D9E2EA]/70 pt-5"><h3 className="text-[12px] font-semibold">Recent activity</h3><Link href={`/projects/${encodeURIComponent(selected.id)}/activity`} className={`inline-flex min-h-9 items-center gap-1 rounded-md text-[10px] font-semibold ${dashboardFocus}`}>View all<ArrowUpRight size={12} /></Link></div>
      <ProjectActivity project={selected} />
    </> : <div className="mt-5"><DashboardEmptyState title="Ready when you are">Select an available project to see its tasks, open deltas, and recent activity.</DashboardEmptyState></div>}
  </aside>;
}
