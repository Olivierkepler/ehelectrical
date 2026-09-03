"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import ProjectList from "@/components/kepler/ProjectList";
import {
  formatProjectRoleLabel,
  formatProjectStatusLabel,
  type ProjectMemberRole,
  type ProjectStatus,
} from "@/lib/kepler/api/projects";
import { useMyProjects } from "@/lib/kepler/hooks/useMyProjects";

const STATUS_OPTIONS: ProjectStatus[] = [
  "active",
  "planning",
  "completed",
  "on-hold",
];

const ROLE_OPTIONS: ProjectMemberRole[] = [
  "owner",
  "project_admin",
  "contractor",
  "field_member",
  "viewer",
];

export default function ProjectsPageClient() {
  const { data, loading, error, refresh } = useMyProjects();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | ProjectStatus>("");
  const [roleFilter, setRoleFilter] = useState<"" | ProjectMemberRole>("");

  const filtered = useMemo(() => {
    if (!data) return [];

    const needle = query.trim().toLowerCase();

    return data.filter((project) => {
      if (statusFilter && project.status !== statusFilter) return false;
      if (roleFilter && project.membership.role !== roleFilter) return false;

      if (!needle) return true;

      return (
        project.name.toLowerCase().includes(needle) ||
        project.location.toLowerCase().includes(needle)
      );
    });
  }, [data, query, statusFilter, roleFilter]);

  const total = data?.length ?? 0;
  const shown = filtered.length;
  const isFiltered =
    query.trim().length > 0 || statusFilter !== "" || roleFilter !== "";

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <header className="mb-6 sm:mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--kepler-muted)]">
          Projects
        </p>
        <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.025em] text-[var(--kepler-ink)] sm:text-[26px]">
          Project portfolio
        </h1>
        <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-[var(--kepler-secondary)]">
          Projects you own or belong to as an active member.
        </p>
      </header>

      {loading && (
        <div className="space-y-3" aria-busy="true" aria-label="Loading projects">
          {[0, 1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-16 animate-pulse rounded-[6px] bg-black/[0.04]"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-[var(--kepler-border)] bg-[var(--kepler-surface)] px-4 py-4">
          <p className="text-[14px] text-[var(--kepler-secondary)]">
            Unable to load projects
          </p>
          <button
            type="button"
            onClick={refresh}
            className="
              min-h-11
              rounded-[6px]
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
            Retry
          </button>
        </div>
      )}

      {!loading && !error && data && data.length === 0 && (
        <div className="border-t border-[var(--kepler-border)] pt-6">
          <p className="text-[15px] font-medium text-[var(--kepler-ink)]">
            No projects yet
          </p>
          <p className="mt-1.5 text-[14px] text-[var(--kepler-secondary)]">
            Projects you create or join will appear here.
          </p>
        </div>
      )}

      {!loading && !error && data && data.length > 0 && (
        <>
          <div
            className="
              mb-4
              flex
              flex-col
              gap-3
              border-y
              border-[var(--kepler-border)]
              py-3
              sm:flex-row
              sm:flex-wrap
              sm:items-center
              sm:justify-between
            "
          >
            <div className="relative min-w-0 flex-1 sm:max-w-[280px]">
              <Search
                size={15}
                strokeWidth={1.75}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--kepler-muted)]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search projects"
                aria-label="Search projects"
                className="
                  h-10
                  w-full
                  rounded-[6px]
                  border
                  border-[var(--kepler-border)]
                  bg-[var(--kepler-surface)]
                  pl-9
                  pr-3
                  text-[13px]
                  text-[var(--kepler-ink)]
                  outline-none
                  placeholder:text-[var(--kepler-muted)]
                  focus-visible:ring-2
                  focus-visible:ring-[var(--kepler-navy)]/25
                "
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor="project-status-filter">
                Status filter
              </label>
              <select
                id="project-status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "" | ProjectStatus)
                }
                className="
                  h-10
                  rounded-[6px]
                  border
                  border-[var(--kepler-border)]
                  bg-[var(--kepler-surface)]
                  px-2.5
                  text-[13px]
                  text-[var(--kepler-ink)]
                  outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[var(--kepler-navy)]/25
                "
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {formatProjectStatusLabel(status)}
                  </option>
                ))}
              </select>

              <label className="sr-only" htmlFor="project-role-filter">
                Role filter
              </label>
              <select
                id="project-role-filter"
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value as "" | ProjectMemberRole)
                }
                className="
                  h-10
                  rounded-[6px]
                  border
                  border-[var(--kepler-border)]
                  bg-[var(--kepler-surface)]
                  px-2.5
                  text-[13px]
                  text-[var(--kepler-ink)]
                  outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[var(--kepler-navy)]/25
                "
              >
                <option value="">All roles</option>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {formatProjectRoleLabel(role)}
                  </option>
                ))}
              </select>

              <p className="ml-auto text-[12px] text-[var(--kepler-muted)] sm:ml-2">
                {isFiltered
                  ? `${shown} of ${total} projects`
                  : `${total} projects`}
              </p>
            </div>
          </div>

          {shown === 0 ? (
            <div className="border-t border-[var(--kepler-border)] pt-6">
              <p className="text-[15px] font-medium text-[var(--kepler-ink)]">
                No matching projects
              </p>
              <p className="mt-1.5 text-[14px] text-[var(--kepler-secondary)]">
                Try a different search or clear the filters.
              </p>
            </div>
          ) : (
            <ProjectList projects={filtered} navigable />
          )}
        </>
      )}
    </div>
  );
}
