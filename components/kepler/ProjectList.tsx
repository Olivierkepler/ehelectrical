"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import {
  formatProjectRoleLabel,
  formatProjectStatusLabel,
  type DiscoveredProject,
} from "@/lib/kepler/api/projects";

type ProjectListProps = {
  projects: DiscoveredProject[];
  compact?: boolean;
  navigable?: boolean;
};

export default function ProjectList({
  projects,
  compact = false,
  navigable = false,
}: ProjectListProps) {
  return (
    <ul className="divide-y divide-[var(--kepler-border)] border-t border-[var(--kepler-border)]">
      {projects.map((project) => {
        const content = (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold tracking-[-0.015em] text-[var(--kepler-ink)]">
                {project.name}
              </p>
              <p className="mt-1 truncate text-[13px] text-[var(--kepler-secondary)]">
                {project.location}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span
                className="
                  inline-flex
                  rounded-[4px]
                  border
                  border-[var(--kepler-border)]
                  bg-[var(--kepler-surface)]
                  px-2
                  py-1
                  text-[11px]
                  font-medium
                  text-[var(--kepler-secondary)]
                "
              >
                {formatProjectStatusLabel(project.status)}
              </span>
              <span
                className="
                  inline-flex
                  rounded-[4px]
                  bg-[var(--kepler-navy)]/[0.06]
                  px-2
                  py-1
                  text-[11px]
                  font-medium
                  text-[var(--kepler-navy)]
                "
              >
                {formatProjectRoleLabel(project.membership.role)}
              </span>
              {navigable && (
                <ChevronRight
                  size={16}
                  strokeWidth={1.75}
                  className="text-[var(--kepler-muted)]"
                  aria-hidden="true"
                />
              )}
            </div>
          </>
        );

        const rowClass = `
          flex
          flex-col
          gap-2
          py-4
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:gap-6
          ${compact ? "first:pt-3" : "first:pt-4"}
        `;

        return (
          <li key={project.id}>
            {navigable ? (
              <Link
                href={`/projects/${encodeURIComponent(project.id)}`}
                className={`
                  ${rowClass}
                  outline-none
                  transition-colors
                  hover:bg-black/[0.015]
                  focus-visible:bg-black/[0.02]
                  focus-visible:ring-2
                  focus-visible:ring-inset
                  focus-visible:ring-[var(--kepler-navy)]/25
                `}
              >
                {content}
              </Link>
            ) : (
              <div className={rowClass}>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
