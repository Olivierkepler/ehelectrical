"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import KeplerAssessmentSheet from "@/components/kepler/KeplerAssessmentSheet";
import WorkspaceSectionHeader from "@/components/kepler/WorkspaceSectionHeader";
import WorkspaceSectionState from "@/components/kepler/WorkspaceSectionState";
import { useAuth } from "@/lib/kepler/AuthProvider";
import type { AgentRunTone } from "@/lib/kepler/agentRunPresentation";
import { useProjectAgentRuns } from "@/lib/kepler/hooks/useProjectAgentRuns";
import { useProjectDeltas } from "@/lib/kepler/hooks/useProjectDeltas";
import { useProjectPlanItems } from "@/lib/kepler/hooks/useProjectPlanItems";
import { useProjectWorkspace } from "@/lib/kepler/hooks/useProjectWorkspace";
import {
  buildDeltaReviewHref,
  buildProjectAgentBuckets,
  countProjectAgentBuckets,
  formatAgentRunUpdatedAt,
  type ProjectAgentRow,
} from "@/lib/kepler/projectAgentWorkspace";

function toneClass(tone: AgentRunTone): string {
  switch (tone) {
    case "busy":
      return "border-[var(--kepler-navy)]/20 text-[var(--kepler-navy)]";
    case "waiting":
      return "border-amber-700/25 text-amber-900";
    case "complete":
      return "border-[var(--kepler-navy)]/20 text-[var(--kepler-navy)]";
    case "escalated":
    case "attention":
      return "border-[var(--kepler-red)]/25 text-[var(--kepler-red)]";
    default:
      return "border-[var(--kepler-border)] text-[var(--kepler-secondary)]";
  }
}

function CountChip({
  label,
  count,
  emphasize,
}: {
  label: string;
  count: number;
  emphasize?: boolean;
}) {
  return (
    <div className="min-w-0 flex-1 border border-[var(--kepler-border)] px-3 py-2.5 sm:flex-none sm:min-w-[7.5rem]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--kepler-muted)]">
        {label}
      </p>
      <p
        className={`mt-1 text-[18px] font-semibold tabular-nums tracking-[-0.02em] ${
          emphasize && count > 0
            ? "text-[var(--kepler-red)]"
            : "text-[var(--kepler-ink)]"
        }`}
      >
        {count}
      </p>
    </div>
  );
}

function AgentRunRow({
  row,
  projectId,
  onViewAssessment,
}: {
  row: ProjectAgentRow;
  projectId: string;
  onViewAssessment: (summaryId: string, button: HTMLButtonElement) => void;
}) {
  const reviewHref = buildDeltaReviewHref(projectId, row.reviewLocalDeltaId);
  const summaryId = row.run.outcome?.summaryId?.trim() || null;
  const updated = formatAgentRunUpdatedAt(row.run.updatedAt);

  return (
    <li className="border-b border-[var(--kepler-border)] py-3.5 last:border-b-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-[var(--kepler-ink)]">
            {row.join.planLabel}
          </p>
          {row.join.deltaMagnitude ? (
            <p className="mt-0.5 text-[13px] tabular-nums text-[var(--kepler-secondary)]">
              {row.join.deltaMagnitude}
            </p>
          ) : null}

          <p
            className={`mt-2 inline-flex rounded-[3px] border px-2 py-0.5 text-[11px] font-semibold ${toneClass(row.presentation.tone)}`}
          >
            {row.presentation.label}
          </p>

          <p
            className="mt-2 text-[13px] leading-snug text-[var(--kepler-ink)]"
            aria-live={row.presentation.isBusy ? "polite" : undefined}
          >
            {row.presentation.message}
          </p>

          <p className="mt-1.5 text-[12px] text-[var(--kepler-muted)]">
            Updated {updated}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          {row.action === "view_assessment" && summaryId ? (
            <button
              type="button"
              className="inline-flex min-h-10 w-full items-center justify-center rounded-[4px] border border-[var(--kepler-border)] bg-white px-3.5 text-[13px] font-semibold text-[var(--kepler-navy)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-2 sm:w-auto"
              onClick={(event) => {
                onViewAssessment(summaryId, event.currentTarget);
              }}
            >
              View assessment
            </button>
          ) : null}

          {row.action === "review" && reviewHref ? (
            <Link
              href={reviewHref}
              className="inline-flex min-h-10 w-full items-center justify-center rounded-[4px] bg-[var(--kepler-navy)] px-3.5 text-[13px] font-semibold text-white outline-none transition-colors hover:bg-[#001a4d] focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-2 sm:w-auto"
            >
              Review
            </Link>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function BucketSection({
  headingId,
  title,
  rows,
  projectId,
  onViewAssessment,
}: {
  headingId: string;
  title: string;
  rows: ProjectAgentRow[];
  projectId: string;
  onViewAssessment: (summaryId: string, button: HTMLButtonElement) => void;
}) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby={headingId} className="mt-8">
      <div className="flex items-baseline justify-between gap-3 border-b border-[var(--kepler-border)] pb-2">
        <h3
          id={headingId}
          className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--kepler-muted)]"
        >
          {title}
        </h3>
        <p className="text-[12px] tabular-nums text-[var(--kepler-muted)]">
          {rows.length}
        </p>
      </div>
      <ul className="border-b border-[var(--kepler-border)]">
        {rows.map((row) => (
          <AgentRunRow
            key={row.run.id}
            row={row}
            projectId={projectId}
            onViewAssessment={onViewAssessment}
          />
        ))}
      </ul>
    </section>
  );
}

export default function ProjectKeplerAiPage() {
  const { user } = useAuth();
  const {
    projectId,
    project,
    unavailable,
    loading: workspaceLoading,
  } = useProjectWorkspace();
  const {
    data: agentRuns,
    loading: agentRunsLoading,
    error: agentRunsError,
    refresh: refreshAgentRuns,
  } = useProjectAgentRuns();
  const { data: deltas } = useProjectDeltas();
  const { data: planItems } = useProjectPlanItems();

  const assessmentTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [assessmentSummaryId, setAssessmentSummaryId] = useState<string | null>(
    null,
  );

  const isActualOwner = Boolean(
    user?.uid && project?.ownerUid && user.uid === project.ownerUid,
  );

  if (unavailable || workspaceLoading) {
    return null;
  }

  const buckets = buildProjectAgentBuckets(
    agentRuns,
    deltas,
    planItems,
    isActualOwner,
  );
  const counts = countProjectAgentBuckets(buckets);
  const showZeroState =
    !agentRunsLoading && !agentRunsError && counts.total === 0;
  const showNoAttention =
    !agentRunsLoading &&
    !agentRunsError &&
    counts.total > 0 &&
    counts.needsAttention === 0 &&
    counts.escalated === 0;

  function openAssessment(summaryId: string, button: HTMLButtonElement) {
    assessmentTriggerRef.current = button;
    setAssessmentSummaryId(summaryId);
    setAssessmentOpen(true);
  }

  const assessmentDeltaContext =
    assessmentSummaryId && buckets.assessmentsReady.length > 0
      ? (() => {
          const row = buckets.assessmentsReady.find(
            (item) => item.run.outcome?.summaryId === assessmentSummaryId,
          );
          if (!row?.join.delta) {
            return null;
          }
          const delta = row.join.delta;
          return {
            planItemLabel: row.join.planLabel,
            plannedValue: delta.plannedValue,
            actualValue: delta.actualValue,
            difference: delta.difference,
            percentDifference: delta.percentDifference,
            unit: delta.unit,
          };
        })()
      : null;

  return (
    <section aria-labelledby="kepler-ai-heading">
      <WorkspaceSectionHeader
        eyebrow="Kepler AI"
        title="Field variance intelligence"
      />
      <h2 id="kepler-ai-heading" className="sr-only">
        Field variance intelligence
      </h2>
      <p className="-mt-3 mb-5 max-w-2xl text-[13px] leading-relaxed text-[var(--kepler-secondary)]">
        Plan-vs-field workflows that need a decision or more evidence.
      </p>

      <WorkspaceSectionState
        loading={agentRunsLoading && !agentRuns}
        error={agentRunsError && !agentRuns ? agentRunsError : null}
        onRetry={refreshAgentRuns}
        empty={showZeroState}
        emptyTitle="Kepler starts when a field variance is recorded."
        emptyDescription="Field variances that need analysis will appear here."
        resourceLabel="Kepler analyses"
        skeleton="rows"
        skeletonRows={5}
      >
        {!showZeroState ? (
          <>
            <div
              className="flex flex-wrap gap-2"
              aria-label="Kepler analysis counts"
            >
              <CountChip
                label="Needs attention"
                count={counts.needsAttention}
                emphasize
              />
              <CountChip label="Analyzing" count={counts.analyzing} />
              <CountChip
                label="Assessments ready"
                count={counts.assessmentsReady}
              />
              <CountChip
                label="Escalated"
                count={counts.escalated}
                emphasize
              />
            </div>

            {showNoAttention ? (
              <p className="mt-5 text-[13px] text-[var(--kepler-secondary)]">
                No Kepler analyses currently need your attention.
              </p>
            ) : null}

            <BucketSection
              headingId="kepler-escalated"
              title="Escalated"
              rows={buckets.escalated}
              projectId={projectId}
              onViewAssessment={openAssessment}
            />
            <BucketSection
              headingId="kepler-needs-attention"
              title="Needs attention"
              rows={buckets.needsAttention}
              projectId={projectId}
              onViewAssessment={openAssessment}
            />
            <BucketSection
              headingId="kepler-analyzing"
              title="Analyzing"
              rows={buckets.analyzing}
              projectId={projectId}
              onViewAssessment={openAssessment}
            />
            <BucketSection
              headingId="kepler-assessments"
              title="Assessments ready"
              rows={buckets.assessmentsReady}
              projectId={projectId}
              onViewAssessment={openAssessment}
            />
          </>
        ) : null}
      </WorkspaceSectionState>

      <KeplerAssessmentSheet
        open={assessmentOpen}
        projectId={projectId}
        summaryId={assessmentSummaryId}
        isActualOwner={isActualOwner}
        deltaContext={assessmentDeltaContext}
        evidence={null}
        returnFocusRef={assessmentTriggerRef}
        onClose={() => {
          setAssessmentOpen(false);
          setAssessmentSummaryId(null);
        }}
      />
    </section>
  );
}
