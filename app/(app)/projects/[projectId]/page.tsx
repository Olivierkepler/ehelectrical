"use client";

import WorkspaceSectionHeader from "@/components/kepler/WorkspaceSectionHeader";
import {
  formatProjectRoleLabel,
  formatProjectStatusLabel,
} from "@/lib/kepler/api/projects";
import { useProjectWorkspace } from "@/lib/kepler/hooks/useProjectWorkspace";

function progressRatio(progress: number): number {
  if (progress >= 0 && progress <= 1) {
    return progress;
  }
  if (progress > 1 && progress <= 100) {
    return progress / 100;
  }
  return Math.max(0, Math.min(1, progress));
}

function formatProgress(progress: number): string {
  if (progress >= 0 && progress <= 1) {
    return `${Math.round(progress * 100)}%`;
  }
  return `${progress}%`;
}

export default function ProjectOverviewSection() {
  const { project, membershipRole } = useProjectWorkspace();

  if (!project) {
    return null;
  }

  const ratio = progressRatio(project.progress);
  const openNeedsAttention = project.openDeltas > 0;

  return (
    <section aria-labelledby="workspace-overview-heading">
      <WorkspaceSectionHeader
        eyebrow="Overview"
        title="Project summary"
      />

      <div className="grid grid-cols-1 border-y border-[var(--kepler-border)] sm:grid-cols-3">
        <div className="py-4 sm:pr-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--kepler-muted)]">
            Progress
          </p>
          <p
            id="workspace-overview-heading"
            className="mt-1.5 text-[22px] font-semibold tabular-nums tracking-[-0.03em] text-[var(--kepler-ink)]"
          >
            {formatProgress(project.progress)}
          </p>
          <div
            className="mt-3 h-[3px] overflow-hidden bg-black/[0.06]"
            role="progressbar"
            aria-valuenow={Math.round(ratio * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Project progress"
          >
            <div
              className="h-full bg-[var(--kepler-navy)]"
              style={{ width: `${Math.round(ratio * 100)}%` }}
            />
          </div>
        </div>

        <div className="border-t border-[var(--kepler-border)] py-4 sm:border-t-0 sm:border-l sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--kepler-muted)]">
            Open deltas
          </p>
          <p
            className={`mt-1.5 text-[22px] font-semibold tabular-nums tracking-[-0.03em] ${
              openNeedsAttention
                ? "text-[var(--kepler-red)]"
                : "text-[var(--kepler-ink)]"
            }`}
          >
            {project.openDeltas}
          </p>
        </div>

        <div className="border-t border-[var(--kepler-border)] py-4 sm:border-t-0 sm:border-l sm:pl-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--kepler-muted)]">
            Assigned tasks
          </p>
          <p className="mt-1.5 text-[22px] font-semibold tabular-nums tracking-[-0.03em] text-[var(--kepler-ink)]">
            {project.assignedTasks}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--kepler-muted)]">
          Project information
        </p>
        <dl className="mt-3 border-t border-[var(--kepler-border)]">
          {project.location.trim() ? (
            <div className="flex items-baseline justify-between gap-6 border-b border-[var(--kepler-border)] py-2.5">
              <dt className="shrink-0 text-[12px] text-[var(--kepler-muted)]">
                Location
              </dt>
              <dd className="min-w-0 truncate text-right text-[13px] text-[var(--kepler-ink)]">
                {project.location.trim()}
              </dd>
            </div>
          ) : null}
          <div className="flex items-baseline justify-between gap-6 border-b border-[var(--kepler-border)] py-2.5">
            <dt className="shrink-0 text-[12px] text-[var(--kepler-muted)]">
              Status
            </dt>
            <dd className="min-w-0 truncate text-right text-[13px] text-[var(--kepler-ink)]">
              {formatProjectStatusLabel(project.status)}
            </dd>
          </div>
          {membershipRole ? (
            <div className="flex items-baseline justify-between gap-6 border-b border-[var(--kepler-border)] py-2.5">
              <dt className="shrink-0 text-[12px] text-[var(--kepler-muted)]">
                Role
              </dt>
              <dd className="min-w-0 truncate text-right text-[13px] text-[var(--kepler-ink)]">
                {formatProjectRoleLabel(membershipRole)}
              </dd>
            </div>
          ) : null}
          {project.localProjectId.trim() ? (
            <div className="flex items-baseline justify-between gap-6 border-b border-[var(--kepler-border)] py-2.5">
              <dt className="shrink-0 text-[12px] text-[var(--kepler-muted)]">
                Local ID
              </dt>
              <dd className="min-w-0 truncate text-right text-[13px] tabular-nums text-[var(--kepler-ink)]">
                {project.localProjectId.trim()}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </section>
  );
}
