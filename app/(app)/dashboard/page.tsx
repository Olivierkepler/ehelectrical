import type { Metadata } from "next";
import { AlertCircle, GitCompareArrows } from "lucide-react";

import DashboardProjectsSection from "@/components/kepler/DashboardProjectsSection";

export const metadata: Metadata = {
  title: "Overview | Kepler",
  description: "Kepler workspace overview",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--kepler-muted)]">
      {children}
    </p>
  );
}

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <header className="mb-8 sm:mb-10">
        <h1 className="text-[24px] font-semibold tracking-[-0.025em] text-[var(--kepler-ink)] sm:text-[26px]">
          Overview
        </h1>
        <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-[var(--kepler-secondary)] sm:text-[15px]">
          Here&apos;s what&apos;s happening across your projects.
        </p>
      </header>

      <DashboardProjectsSection />

      <section
        aria-label="Operational areas"
        className="grid gap-0 border-b border-[var(--kepler-border)] py-8 sm:py-10 md:grid-cols-2 md:gap-10 lg:gap-14"
      >
        <div className="border-b border-[var(--kepler-border)] pb-8 md:border-b-0 md:border-r md:pb-0 md:pr-10 lg:pr-14">
          <div className="flex items-start gap-3">
            <span
              className="
                mt-0.5
                grid
                h-8
                w-8
                shrink-0
                place-items-center
                rounded-[6px]
                bg-[var(--kepler-navy)]/[0.06]
                text-[var(--kepler-navy)]
              "
              aria-hidden="true"
            >
              <GitCompareArrows size={16} strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <SectionLabel>Plan vs Reality</SectionLabel>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--kepler-secondary)]">
                Field measurements and evidence will be compared with your
                project plan here.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 md:pt-0">
          <div className="flex items-start gap-3">
            <span
              className="
                mt-0.5
                grid
                h-8
                w-8
                shrink-0
                place-items-center
                rounded-[6px]
                bg-[var(--kepler-navy)]/[0.06]
                text-[var(--kepler-navy)]
              "
              aria-hidden="true"
            >
              <AlertCircle size={16} strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <SectionLabel>Needs attention</SectionLabel>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--kepler-secondary)]">
                Variances and items requiring review will appear here.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="recent-activity-heading"
        className="pt-8 sm:pt-10"
      >
        <SectionLabel>Recent activity</SectionLabel>
        <h2
          id="recent-activity-heading"
          className="mt-2 text-[17px] font-semibold tracking-[-0.02em] text-[var(--kepler-ink)]"
        >
          Updates
        </h2>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-[var(--kepler-secondary)]">
          Project and field activity will appear here.
        </p>
      </section>
    </div>
  );
}
