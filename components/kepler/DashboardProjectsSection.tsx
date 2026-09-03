"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import ProjectList from "@/components/kepler/ProjectList";
import { useMyProjects } from "@/lib/kepler/hooks/useMyProjects";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--kepler-muted)]">
      {children}
    </p>
  );
}

export default function DashboardProjectsSection() {
  const { data, loading, error, refresh } = useMyProjects();
  const preview = data?.slice(0, 4) ?? [];

  return (
    <section
      aria-labelledby="projects-heading"
      className="border-b border-[var(--kepler-border)] pb-8 sm:pb-10"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-xl">
          <SectionLabel>Projects</SectionLabel>
          <h2
            id="projects-heading"
            className="mt-2 text-[17px] font-semibold tracking-[-0.02em] text-[var(--kepler-ink)]"
          >
            Your project portfolio
          </h2>
          {!loading && !error && data && data.length === 0 && (
            <p className="mt-2 text-[14px] leading-relaxed text-[var(--kepler-secondary)]">
              Projects you create or join will appear here.
            </p>
          )}
          {!loading && !error && data && data.length > 0 && (
            <p className="mt-2 text-[14px] leading-relaxed text-[var(--kepler-secondary)]">
              {data.length === 1
                ? "1 project in your workspace."
                : `${data.length} projects in your workspace.`}
            </p>
          )}
        </div>

        <div className="flex flex-col items-start gap-1.5 sm:items-end">
          <button
            type="button"
            disabled
            aria-label="Create project (coming next)"
            title="Coming next"
            className="
              inline-flex
              min-h-11
              items-center
              gap-2
              rounded-[6px]
              border
              border-[var(--kepler-border)]
              bg-[var(--kepler-surface)]
              px-3.5
              text-[13px]
              font-medium
              text-[var(--kepler-ink)]
              outline-none
              focus-visible:ring-2
              focus-visible:ring-[var(--kepler-navy)]/30
              disabled:cursor-default
              disabled:opacity-70
            "
          >
            <Plus size={15} strokeWidth={2} aria-hidden="true" />
            Create project
          </button>
          <span className="text-[11px] text-[var(--kepler-muted)]">
            Coming next
          </span>
        </div>
      </div>

      <div className="mt-6">
        {loading && (
          <div className="space-y-3" aria-busy="true" aria-label="Loading projects">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-14 animate-pulse rounded-[6px] bg-black/[0.04]"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-wrap items-center justify-between gap-3 border border-[var(--kepler-border)] bg-[var(--kepler-surface)] px-4 py-3">
            <p className="text-[13px] text-[var(--kepler-secondary)]">
              Unable to load projects
            </p>
            <button
              type="button"
              onClick={refresh}
              className="
                min-h-10
                rounded-[6px]
                border
                border-[var(--kepler-border)]
                px-3
                text-[12px]
                font-semibold
                text-[var(--kepler-navy)]
                outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--kepler-navy)]/30
              "
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && data && data.length === 0 && (
          <div className="border-t border-[var(--kepler-border)] pt-5">
            <p className="text-[14px] font-medium text-[var(--kepler-ink)]">
              No projects yet
            </p>
            <p className="mt-1 text-[13px] text-[var(--kepler-secondary)]">
              Projects you create or join will appear here.
            </p>
          </div>
        )}

        {!loading && !error && preview.length > 0 && (
          <>
            <ProjectList projects={preview} compact navigable />
            <div className="mt-4">
              <Link
                href="/projects"
                className="
                  text-[13px]
                  font-semibold
                  text-[var(--kepler-navy)]
                  outline-none
                  hover:underline
                  focus-visible:underline
                "
              >
                View all projects
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
