"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plus, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/kepler/AuthProvider";
import { useOwnProfile } from "@/lib/kepler/hooks/useOwnProfile";
import type { DiscoveredProject } from "@/lib/kepler/api/projects";

export default function DashboardHero({ project }: { project: DiscoveredProject | null }) {
  const { user } = useAuth();
  const { data: profile } = useOwnProfile();
  const name = profile?.displayName?.trim() || user?.displayName?.trim();
  return (
    <header className="relative isolate overflow-hidden rounded-[26px] bg-[#0D2343] px-6 py-8 text-white shadow-[0_10px_30px_-15px_rgba(13,35,67,0.45)] sm:px-9 sm:py-9">
      <Image src="/dashboard/dashboardHeader.png" alt="" fill priority sizes="(min-width: 1024px) 85vw, 100vw" className="-z-20 object-cover object-[65%_center]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(95deg,rgba(13,35,67,0.98)_0%,rgba(13,35,67,0.87)_44%,rgba(13,35,67,0.24)_100%)]" />
      <div aria-hidden="true" className="absolute -bottom-24 right-14 -z-10 h-72 w-20 -skew-x-[24deg] bg-white/[0.055]" />
      <div aria-hidden="true" className="absolute -bottom-24 right-7 -z-10 h-72 w-1.5 -skew-x-[24deg] bg-[#C8102E]/70" />
      <p className="flex items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/75"><span aria-hidden="true" className="h-0.5 w-6 bg-[#C8102E]" />Your workspace. Connected.</p>
      <h1 className="mt-4 max-w-[640px] break-words text-[28px] font-semibold leading-[1.2] tracking-[-0.04em] sm:text-[34px] xl:text-[38px]">Welcome back{name ? `, ${name}` : ""}.</h1>
      <p className="mt-3 max-w-[460px] text-[12px] leading-6 text-white/80 sm:text-[13px]">Plan, manage, and deliver construction projects with the power of AI.</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" disabled title="Project creation is not available in this workspace yet" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-[12px] font-semibold text-[#0D2343]/65 disabled:cursor-not-allowed"><Plus size={16} />New Project<span className="ml-1 rounded bg-[#F4F6F9] px-1.5 py-0.5 text-[9px] text-[#64748B]">Soon</span></button>
        {project ? <Link href={`/projects/${encodeURIComponent(project.id)}/agent`} title={`Open the Kepler AI workspace for ${project.name}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-[12px] font-semibold text-white outline-none transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D2343]"><Sparkles size={15} className="text-white/85" />Ask Kepler AI<ArrowUpRight size={14} /></Link> : <button type="button" disabled title="Select an available project to open its AI workspace" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-4 text-[12px] font-semibold text-white/55 disabled:cursor-not-allowed"><Sparkles size={15} />Ask Kepler AI</button>}
      </div>
      {project && <p className="mt-3 max-w-[460px] break-words text-[10px] leading-5 text-white/65">AI workspace: {project.name || "Untitled project"}</p>}
    </header>
  );
}
