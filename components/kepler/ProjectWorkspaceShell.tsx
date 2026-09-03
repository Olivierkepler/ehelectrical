"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  formatProjectRoleLabel,
  formatProjectStatusLabel,
} from "@/lib/kepler/api/projects";
import { useProjectWorkspace } from "@/lib/kepler/hooks/useProjectWorkspace";

const WORKSPACE_SECTIONS = [
  { id: "overview", label: "Overview", href: "", enabled: true },
  { id: "plan", label: "Plan", href: "/plan", enabled: true },
  { id: "field", label: "Field", href: "/field", enabled: true },
  { id: "deltas", label: "Deltas", href: "/deltas", enabled: true },
  { id: "evidence", label: "Evidence", href: "/evidence", enabled: true },
  { id: "team", label: "Team", href: "/team", enabled: true },
  { id: "activity", label: "Activity", href: "/activity", enabled: true },
  { id: "kepler-ai", label: "Kepler AI", href: "/agent", enabled: true },
] as const;

export default function ProjectWorkspaceShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const {
    projectId,
    project,
    membership,
    membershipRole,
    loading,
    unavailable,
    error,
    refresh,
  } = useProjectWorkspace();

  const basePath = `/projects/${encodeURIComponent(projectId)}`;
  const displayName = project?.name ?? membership?.name ?? "Project";
  const displayLocation = project?.location ?? membership?.location ?? "";
  const displayStatus = project?.status ?? membership?.status;

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {loading && (
        <div className="space-y-4" aria-busy="true" aria-label="Loading project">
          <div className="h-3 w-40 animate-pulse rounded-[3px] bg-black/[0.04]" />
          <div className="h-6 w-72 animate-pulse rounded-[3px] bg-black/[0.05]" />
          <div className="h-4 w-44 animate-pulse rounded-[3px] bg-black/[0.04]" />
          <div className="mt-2 h-9 border-b border-[var(--kepler-border)]" />
          <div className="h-24 animate-pulse rounded-[4px] bg-black/[0.035]" />
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-[var(--kepler-border)] px-3.5 py-3">
          <p className="text-[13px] text-[var(--kepler-secondary)]">
            Unable to load project
          </p>
          <button
            type="button"
            onClick={refresh}
            className="
              inline-flex
              h-10
              items-center
              rounded-[5px]
              border
              border-[var(--kepler-border)]
              px-3
              text-[13px]
              font-semibold
              text-[var(--kepler-navy)]
              outline-none
              hover:bg-black/[0.02]
              focus-visible:ring-2
              focus-visible:ring-[var(--kepler-navy)]/30
            "
          >
            Retry
          </button>
        </div>
      )}

      {unavailable && !loading && (
        <div className="border-t border-[var(--kepler-border)] pt-8">
          <p className="text-[18px] font-semibold tracking-[-0.02em] text-[var(--kepler-ink)]">
            Project unavailable
          </p>
          <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-[var(--kepler-secondary)]">
            This project is not in your authorized portfolio, or the link is
            invalid.
          </p>
          <Link
            href="/projects"
            className="
              mt-5
              inline-flex
              h-10
              items-center
              rounded-[5px]
              border
              border-[var(--kepler-border)]
              px-3.5
              text-[13px]
              font-semibold
              text-[var(--kepler-navy)]
              outline-none
              focus-visible:ring-2
              focus-visible:ring-[var(--kepler-navy)]/30
            "
          >
            Back to projects
          </Link>
        </div>
      )}

      {!loading && !error && !unavailable && (project || membership) && (
        <>
          <nav
            aria-label="Breadcrumb"
            className="mb-3 flex min-w-0 items-center gap-1.5 text-[12px] text-[var(--kepler-muted)]"
          >
            <Link
              href="/projects"
              className="shrink-0 outline-none hover:text-[var(--kepler-navy)] focus-visible:text-[var(--kepler-navy)]"
            >
              Projects
            </Link>
            <span aria-hidden="true">/</span>
            <span className="min-w-0 truncate text-[var(--kepler-secondary)]">
              {displayName}
            </span>
          </nav>

          <header className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="truncate text-[20px] font-semibold leading-tight tracking-[-0.022em] text-[var(--kepler-ink)]">
                  {displayName}
                </h1>
                {displayLocation ? (
                  <p className="mt-1 truncate text-[13px] text-[var(--kepler-secondary)]">
                    {displayLocation}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
                {displayStatus ? (
                  <span className="inline-flex rounded-[3px] border border-[var(--kepler-border)] px-2 py-0.5 text-[11px] font-medium text-[var(--kepler-secondary)]">
                    {formatProjectStatusLabel(displayStatus)}
                  </span>
                ) : null}
                {membershipRole ? (
                  <span className="inline-flex rounded-[3px] bg-[var(--kepler-navy)]/[0.06] px-2 py-0.5 text-[11px] font-medium text-[var(--kepler-navy)]">
                    {formatProjectRoleLabel(membershipRole)}
                  </span>
                ) : null}
              </div>
            </div>
          </header>

          <nav
            aria-label="Project workspace"
            className="-mx-1 overflow-x-auto border-b border-[var(--kepler-border)]"
          >
            <ul className="flex min-w-max px-1">
              {WORKSPACE_SECTIONS.map((section) => {
                const href = `${basePath}${section.href}`;
                const isActive =
                  section.enabled &&
                  (section.id === "overview"
                    ? pathname === basePath
                    : pathname === href || pathname.startsWith(`${href}/`));

                if (!section.enabled) {
                  return (
                    <li key={section.id}>
                      <span
                        title="Coming later"
                        aria-disabled="true"
                        className="
                          inline-flex
                          h-9
                          cursor-default
                          items-center
                          gap-1.5
                          px-2.5
                          text-[13px]
                          font-medium
                          text-[var(--kepler-muted)]
                        "
                      >
                        {section.label}
                        <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--kepler-muted)]/80">
                          Soon
                        </span>
                      </span>
                    </li>
                  );
                }

                return (
                  <li key={section.id}>
                    <Link
                      href={href}
                      aria-current={isActive ? "page" : undefined}
                      className={`
                        inline-flex
                        h-9
                        items-center
                        border-b-2
                        px-2.5
                        text-[13px]
                        font-medium
                        outline-none
                        transition-colors
                        focus-visible:bg-black/[0.03]
                        ${
                          isActive
                            ? "border-[var(--kepler-navy)] text-[var(--kepler-navy)]"
                            : "border-transparent text-[var(--kepler-secondary)] hover:text-[var(--kepler-ink)]"
                        }
                      `}
                    >
                      {section.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="pt-6">{children}</div>
        </>
      )}
    </div>
  );
}
