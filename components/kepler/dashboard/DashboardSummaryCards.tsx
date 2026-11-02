import { Building2, CircleCheck, HardHat, Ruler } from "lucide-react";
import type { DiscoveredProject } from "@/lib/kepler/api/projects";
import { dashboardSurface } from "./DashboardSurface";

export default function DashboardSummaryCards({ projects, loading, error }: { projects: DiscoveredProject[] | null; loading: boolean; error: boolean }) {
  const available = !loading && !error && projects !== null;
  const cards = [
    { label: "Total projects", value: projects?.length, detail: "In your workspace", icon: Building2, accent: false },
    { label: "Active projects", value: projects?.filter((project) => project.status === "active").length, detail: "Currently active", icon: HardHat, accent: true },
    { label: "In planning", value: projects?.filter((project) => project.status === "planning").length, detail: "Preparing for delivery", icon: Ruler, accent: false },
    { label: "Completed", value: projects?.filter((project) => project.status === "completed").length, detail: "Completed projects", icon: CircleCheck, accent: false },
  ];
  return <section aria-label="Project portfolio summary" aria-busy={loading} className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">{cards.map(({ label, value, detail, icon: Icon, accent }) => (
    <div key={label} className={`${dashboardSurface} relative min-w-0 overflow-hidden p-4 sm:p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-2"><p className="pt-1 text-[11px] font-medium text-[#64748B]">{label}</p><span aria-hidden="true" className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${accent ? "bg-[#C8102E]/[0.07] text-[#C8102E]" : "bg-[#F4F6F9] text-[#0D2343]"}`}><Icon size={17} strokeWidth={1.7} /></span></div>
      {loading ? <div className="mt-2 h-9 w-12 animate-pulse rounded-lg bg-[#D9E2EA]/40 motion-reduce:animate-none"><span className="sr-only">Loading</span></div> : <p className="mt-2 text-[30px] font-semibold leading-tight tracking-[-0.04em] text-[#0D2343] tabular-nums">{available ? value : "—"}</p>}
      <p className="mt-1.5 text-[10px] leading-5 text-[#64748B]">{error ? "Temporarily unavailable" : detail}</p>
    </div>
  ))}</section>;
}
