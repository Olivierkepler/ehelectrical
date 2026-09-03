"use client";

import { Fragment, Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

import AddDeltaEvidenceSheet from "@/components/kepler/AddDeltaEvidenceSheet";
import DeltaKeplerAiPanel from "@/components/kepler/DeltaKeplerAiPanel";
import WorkspaceSectionHeader from "@/components/kepler/WorkspaceSectionHeader";
import WorkspaceSectionState from "@/components/kepler/WorkspaceSectionState";
import {
  formatDeltaStatusLabel,
  type Delta,
  type DeltaStatus,
} from "@/lib/kepler/api/deltas";
import type { PlanItem } from "@/lib/kepler/api/planItems";
import { useAuth } from "@/lib/kepler/AuthProvider";
import {
  formatQuantity,
  formatSignedPercent1,
  formatSignedQuantity,
} from "@/lib/kepler/formatQuantity";
import { useProjectAgentRuns } from "@/lib/kepler/hooks/useProjectAgentRuns";
import { useProjectDeltas } from "@/lib/kepler/hooks/useProjectDeltas";
import { useProjectEvidence } from "@/lib/kepler/hooks/useProjectEvidence";
import { useProjectPlanItems } from "@/lib/kepler/hooks/useProjectPlanItems";
import { useProjectWorkspace } from "@/lib/kepler/hooks/useProjectWorkspace";
import { resolveDeltaExpandId } from "@/lib/kepler/projectAgentWorkspace";

function statusClass(status: DeltaStatus): string {
  if (status === "open") {
    return "border-[var(--kepler-red)]/25 text-[var(--kepler-red)]";
  }
  return "border-[var(--kepler-border)] text-[var(--kepler-secondary)]";
}

function labelForDeltaItem(
  items: PlanItem[] | null,
  planItemId: string,
): string | null {
  if (!items) {
    return null;
  }
  const match = items.find(
    (item) => item.id === planItemId || item.localPlanItemId === planItemId,
  );
  const label = match?.label?.trim();
  return label || null;
}

export default function ProjectDeltasPage() {
  return (
    <Suspense fallback={null}>
      <ProjectDeltasPageContent />
    </Suspense>
  );
}

function ProjectDeltasPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const {
    projectId,
    project,
    unavailable,
    loading: workspaceLoading,
    invalidateActivity,
    invalidateEvidence,
    invalidateAgentRuns,
    beginAgentRunResumeObservation,
  } = useProjectWorkspace();
  const { data, loading, error, refresh } = useProjectDeltas();
  const { data: planItems, loading: planItemsLoading } = useProjectPlanItems();
  const {
    data: agentRuns,
    loading: agentRunsLoading,
    error: agentRunsError,
    refresh: refreshAgentRuns,
  } = useProjectAgentRuns();
  const { data: evidence } = useProjectEvidence();

  const [expandedDeltaId, setExpandedDeltaId] = useState<string | null>(null);
  const [evidenceDelta, setEvidenceDelta] = useState<Delta | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const addEvidenceTriggerRef = useRef<HTMLElement | null>(null);
  const appliedDeltaQueryRef = useRef<string | null>(null);

  const isActualOwner = Boolean(
    user?.uid && project?.ownerUid && user.uid === project.ownerUid,
  );

  const deltaQuery = searchParams.get("delta");

  useEffect(() => {
    if (!data || !deltaQuery) {
      return;
    }
    const key = `${deltaQuery}::${data.length}`;
    if (appliedDeltaQueryRef.current === key) {
      return;
    }
    const expandId = resolveDeltaExpandId(data, deltaQuery);
    appliedDeltaQueryRef.current = key;
    if (expandId) {
      setExpandedDeltaId(expandId);
    }
  }, [data, deltaQuery]);

  const colSpan = isActualOwner ? 8 : 7;

  function openAddEvidence(delta: Delta, trigger: HTMLElement | null) {
    addEvidenceTriggerRef.current = trigger;
    setEvidenceDelta(delta);
    setSheetOpen(true);
    setSuccessNotice(null);
  }

  function toggleExpand(deltaId: string) {
    setExpandedDeltaId((current) => (current === deltaId ? null : deltaId));
  }

  if (unavailable || workspaceLoading) {
    return null;
  }

  return (
    <section aria-labelledby="deltas-heading">
      <WorkspaceSectionHeader
        eyebrow="Deltas"
        title="Plan vs reality"
        count={data && data.length > 0 ? data.length : null}
        countLabel={data?.length === 1 ? "variance" : "variances"}
      />
      <h2 id="deltas-heading" className="sr-only">
        Plan vs reality
      </h2>

      {successNotice ? (
        <p
          role="status"
          className="mb-4 border border-[var(--kepler-navy)]/20 bg-[var(--kepler-navy)]/[0.04] px-3 py-2 text-[13px] text-[var(--kepler-navy)]"
        >
          {successNotice}
        </p>
      ) : null}

      <WorkspaceSectionState
        loading={loading}
        error={error}
        onRetry={refresh}
        empty={!loading && !error && data !== null && data.length === 0}
        emptyTitle="No variances detected"
        resourceLabel="deltas"
        skeleton="table"
        skeletonRows={7}
      >
        {data && data.length > 0 ? (
          <div className="overflow-x-auto">
            <table
              className={`w-full border-t border-[var(--kepler-border)] text-left text-[13px] ${
                isActualOwner ? "min-w-[960px]" : "min-w-[860px]"
              }`}
            >
              <thead>
                <tr className="border-b border-[var(--kepler-border)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--kepler-muted)]">
                  <th className="w-10 py-2.5 pr-2 font-semibold">
                    <span className="sr-only">Expand</span>
                  </th>
                  <th className="py-2.5 pr-4 font-semibold">Item</th>
                  <th className="py-2.5 pr-4 text-right font-semibold">Plan</th>
                  <th className="py-2.5 pr-4 text-right font-semibold">
                    Field
                  </th>
                  <th className="py-2.5 pr-4 text-right font-semibold">
                    Delta
                  </th>
                  <th className="py-2.5 pr-4 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold">Disposition</th>
                  {isActualOwner ? (
                    <th className="py-2.5 pl-4 text-right font-semibold">
                      Evidence
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {data.map((delta) => {
                  const isOpen = delta.status === "open";
                  const expanded = expandedDeltaId === delta.id;
                  const itemLabel = labelForDeltaItem(
                    planItems,
                    delta.planItemId,
                  );
                  const itemPrimary =
                    itemLabel ??
                    (planItemsLoading
                      ? "—"
                      : `${delta.planItemId.slice(0, 10)}…`);
                  const varianceLabel = `${formatSignedQuantity(delta.difference)} ${delta.unit} (${formatSignedPercent1(delta.percentDifference)})`;

                  return (
                    <Fragment key={delta.id}>
                      <tr
                        className={`border-b border-[var(--kepler-border)] transition-colors ${
                          expanded
                            ? "bg-[var(--kepler-navy)]/[0.03]"
                            : "hover:bg-black/[0.018]"
                        }`}
                      >
                        <td className="py-3 pr-2 align-middle">
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] text-[var(--kepler-secondary)] outline-none transition-colors hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-1"
                            aria-expanded={expanded}
                            aria-controls={`delta-ai-${delta.id}`}
                            aria-label={
                              expanded
                                ? `Collapse Kepler AI for ${itemPrimary}`
                                : `Show Kepler AI for ${itemPrimary}`
                            }
                            onClick={() => toggleExpand(delta.id)}
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                expanded ? "rotate-180" : ""
                              }`}
                              aria-hidden
                            />
                          </button>
                        </td>
                        <td className="max-w-[260px] py-3 pr-4 text-[14px] font-semibold leading-snug text-[var(--kepler-ink)]">
                          <button
                            type="button"
                            className="line-clamp-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-1"
                            aria-expanded={expanded}
                            onClick={() => toggleExpand(delta.id)}
                          >
                            {itemPrimary}
                          </button>
                        </td>
                        <td className="whitespace-nowrap py-3 pr-4 text-right tabular-nums text-[var(--kepler-secondary)]">
                          {formatQuantity(delta.plannedValue)}{" "}
                          <span className="text-[11px]">{delta.unit}</span>
                        </td>
                        <td className="whitespace-nowrap py-3 pr-4 text-right tabular-nums text-[var(--kepler-ink)]">
                          {formatQuantity(delta.actualValue)}{" "}
                          <span className="text-[11px] text-[var(--kepler-secondary)]">
                            {delta.unit}
                          </span>
                        </td>
                        <td
                          className={`whitespace-nowrap py-3 pr-4 text-right ${
                            isOpen
                              ? "text-[var(--kepler-red)]"
                              : "text-[var(--kepler-ink)]"
                          }`}
                        >
                          <span className="text-[14px] font-semibold tabular-nums">
                            {formatSignedQuantity(delta.difference)}
                          </span>
                          <span className="ml-1.5 text-[11px] tabular-nums text-[var(--kepler-muted)]">
                            {formatSignedPercent1(delta.percentDifference)}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex rounded-[3px] border px-2 py-0.5 text-[11px] font-medium ${statusClass(delta.status)}`}
                          >
                            {formatDeltaStatusLabel(delta.status)}
                          </span>
                        </td>
                        <td className="max-w-[200px] py-3 text-[12px] text-[var(--kepler-muted)]">
                          <span className="line-clamp-2">
                            {delta.dispositionReason.trim() || "—"}
                          </span>
                        </td>
                        {isActualOwner ? (
                          <td className="whitespace-nowrap py-3 pl-4 text-right">
                            <button
                              type="button"
                              className="rounded-[3px] border border-[var(--kepler-border)] bg-white px-2.5 py-1 text-[12px] font-semibold text-[var(--kepler-navy)] outline-none transition-colors hover:border-[var(--kepler-navy)]/40 focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-1"
                              onClick={(event) => {
                                openAddEvidence(delta, event.currentTarget);
                              }}
                            >
                              Add evidence
                            </button>
                          </td>
                        ) : null}
                      </tr>
                      {expanded ? (
                        <tr className="border-b border-[var(--kepler-border)] bg-[var(--kepler-background)]/80">
                          <td colSpan={colSpan} className="px-3 py-3 sm:px-4">
                            <div id={`delta-ai-${delta.id}`} className="max-w-3xl">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--kepler-muted)]">
                                Selected variance
                              </p>
                              <p className="mt-1 text-[14px] font-semibold text-[var(--kepler-ink)]">
                                {itemPrimary}
                              </p>
                              <p className="mt-0.5 text-[13px] text-[var(--kepler-secondary)]">
                                Plan {formatQuantity(delta.plannedValue)}{" "}
                                {delta.unit} · Field{" "}
                                {formatQuantity(delta.actualValue)} {delta.unit}{" "}
                                · Variance {varianceLabel}
                              </p>

                              <DeltaKeplerAiPanel
                                localDeltaId={delta.localDeltaId}
                                agentRuns={agentRuns}
                                agentRunsLoading={agentRunsLoading}
                                agentRunsError={agentRunsError}
                                onRetryAgentRuns={refreshAgentRuns}
                                onInvalidateAgentRuns={invalidateAgentRuns}
                                evidence={evidence}
                                isActualOwner={isActualOwner}
                                projectId={projectId}
                                deltaContext={{
                                  planItemLabel: itemPrimary,
                                  plannedValue: delta.plannedValue,
                                  actualValue: delta.actualValue,
                                  difference: delta.difference,
                                  percentDifference: delta.percentDifference,
                                  unit: delta.unit,
                                }}
                                onAddEvidence={() => {
                                  openAddEvidence(delta, null);
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </WorkspaceSectionState>

      <AddDeltaEvidenceSheet
        open={sheetOpen}
        projectId={projectId}
        delta={evidenceDelta}
        planItemLabel={
          evidenceDelta
            ? labelForDeltaItem(planItems, evidenceDelta.planItemId)
            : null
        }
        returnFocusRef={addEvidenceTriggerRef}
        onClose={() => {
          setSheetOpen(false);
          setEvidenceDelta(null);
        }}
        onComplete={(message) => {
          setSuccessNotice(message);
          invalidateEvidence();
          invalidateActivity();
          beginAgentRunResumeObservation();
          refresh();
        }}
      />
    </section>
  );
}
