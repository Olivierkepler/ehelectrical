"use client";

import Link from "next/link";
import { ArrowUpRight, Building2, MapPin } from "lucide-react";
import { formatProjectRoleLabel, formatProjectStatusLabel, type DiscoveredProject } from "@/lib/kepler/api/projects";
import { dashboardFocus, dashboardSurface } from "./DashboardSurface";
import { dashboardProgress, useDashboardProjectDetail } from "./useDashboardProjectDetail";

export default function DashboardProjectCard({ project }: { project: DiscoveredProject }) {
  const { data, loading, error, refresh } = useDashboardProjectDetail(project);
  const percent = data ? dashboardProgress(data.progress) : null;
  const href = `/projects/${encodeURIComponent(project.id)}`;
  return <article className={`${dashboardSurface} flex min-w-0 flex-col p-5 transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(13,35,67,0.22)]`}>
    <div className="flex flex-wrap items-center justify-between gap-2"><span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-2xl border border-[#D9E2EA]/60 bg-[#F4F6F9] text-[#0D2343]"><Building2 size={23} strokeWidth={1.4} /></span><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${project.status === "active" ? "border-[#0D2343]/10 bg-[#0D2343]/[0.04] text-[#0D2343]" : "border-[#D9E2EA]/80 bg-[#F4F6F9]/70 text-[#64748B]"}`}><span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${project.status === "active" ? "bg-[#C8102E]" : "bg-[#64748B]/60"}`} />{formatProjectStatusLabel(project.status)}</span></div>
    <h3 className="mt-4 break-words text-[16px] font-semibold leading-snug tracking-[-0.025em]"><Link href={href} className={`rounded-sm hover:text-[#C8102E] ${dashboardFocus}`}>{project.name || "Untitled project"}</Link></h3>
    <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-5 text-[#64748B]"><MapPin size={13} className="mt-0.5 shrink-0" aria-hidden="true" /><span className="break-words">{project.location || "Location not provided"}</span></p>
    <div className="mt-5">
      {loading ? <div aria-label={`Loading progress for ${project.name}`} aria-busy="true" className="h-9 animate-pulse rounded-lg bg-[#F4F6F9] motion-reduce:animate-none" /> : error ? <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]"><span className="text-[#64748B]">Project details unavailable</span><button type="button" onClick={refresh} className={`min-h-9 rounded-md px-2 font-semibold text-[#0D2343] underline-offset-4 hover:underline ${dashboardFocus}`}>Retry</button></div> : percent !== null ? <><div className="flex items-center justify-between text-[10px]"><span className="text-[#64748B]">Project progress</span><span className="font-semibold text-[#0D2343] tabular-nums">{percent}%</span></div><div role="progressbar" aria-label={`Progress for ${project.name}`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#D9E2EA]/55"><div className="h-full rounded-full bg-[#0D2343]" style={{ width: `${percent}%` }} /></div></> : null}
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#D9E2EA]/60 pt-4"><span className="rounded-lg bg-[#F4F6F9] px-2 py-1 text-[10px] text-[#64748B]">{formatProjectRoleLabel(project.membership.role)}</span><Link href={href} className={`inline-flex min-h-9 items-center gap-1 rounded-lg px-1 text-[11px] font-semibold text-[#0D2343] ${dashboardFocus}`}>Open workspace<ArrowUpRight size={14} aria-hidden="true" /></Link></div>
  </article>;
}
