import type { ReactNode } from "react";

export const dashboardSurface = "rounded-[22px] border border-[#D9E2EA]/80 bg-white shadow-[6px_8px_24px_-12px_rgba(13,35,67,0.14),-5px_-5px_18px_rgba(255,255,255,0.8)]";
export const dashboardFocus = "outline-none focus-visible:ring-2 focus-visible:ring-[#0D2343]/40 focus-visible:ring-offset-2";

export function DashboardEmptyState({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-[#D9E2EA] bg-[#F4F6F9]/60 px-5 py-8 text-center"><p className="text-[14px] font-semibold text-[#0D2343]">{title}</p><div className="mx-auto mt-2 max-w-sm text-[12px] leading-6 text-[#64748B]">{children}</div></div>;
}

export function DashboardErrorState({ title, onRetry }: { title: string; onRetry: () => void }) {
  return <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#C8102E]/15 bg-[#C8102E]/[0.025] p-4"><p className="text-[12px] text-[#0D2343]">{title}</p><button type="button" onClick={onRetry} className={`min-h-11 rounded-xl border border-[#D9E2EA] bg-white px-4 text-[12px] font-semibold text-[#0D2343] ${dashboardFocus}`}>Try again</button></div>;
}

export function DashboardSkeleton({ label, className = "h-36" }: { label: string; className?: string }) {
  return <div aria-label={label} role="status" aria-busy="true" className={`animate-pulse rounded-2xl bg-[#D9E2EA]/35 motion-reduce:animate-none ${className}`}><span className="sr-only">{label}</span></div>;
}
