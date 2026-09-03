/**
 * Project-level Kepler AI workspace: bucketing, joins, actions.
 * Presentation-only. Does not invent AgentRun state or Delta arithmetic.
 */
import type { AgentRunSummary } from "@/lib/kepler/api/agentRuns";
import type { Delta } from "@/lib/kepler/api/deltas";
import type { PlanItem } from "@/lib/kepler/api/planItems";
import {
  buildAgentRunPresentation,
  type AgentRunPresentation,
} from "@/lib/kepler/agentRunPresentation";
import { canViewAgentSummary } from "@/lib/kepler/agentSummaryPresentation";
import {
  formatSignedPercent1,
  formatSignedQuantity,
} from "@/lib/kepler/formatQuantity";

export type ProjectAgentBucket =
  | "escalated"
  | "needs_attention"
  | "analyzing"
  | "assessments_ready";

export type ProjectAgentRowAction = "review" | "view_assessment" | null;

export type ProjectAgentJoinedContext = {
  delta: Delta | null;
  planItem: PlanItem | null;
  planLabel: string;
  deltaMagnitude: string | null;
};

export type ProjectAgentRow = {
  run: AgentRunSummary;
  bucket: ProjectAgentBucket;
  presentation: AgentRunPresentation;
  join: ProjectAgentJoinedContext;
  action: ProjectAgentRowAction;
  reviewLocalDeltaId: string | null;
};

export type ProjectAgentBuckets = {
  escalated: ProjectAgentRow[];
  needsAttention: ProjectAgentRow[];
  analyzing: ProjectAgentRow[];
  assessmentsReady: ProjectAgentRow[];
};

export type ProjectAgentCounts = {
  escalated: number;
  needsAttention: number;
  analyzing: number;
  assessmentsReady: number;
  total: number;
};

const GENERIC_LABEL = "Field variance";

export function isFieldVarianceAgentRun(run: AgentRunSummary): boolean {
  return run.workflowType === "field_variance";
}

/**
 * Deterministic single-bucket assignment.
 * Sticky running belongs in needs_attention, not analyzing.
 */
export function assignProjectAgentBucket(
  run: AgentRunSummary,
): ProjectAgentBucket | null {
  if (!isFieldVarianceAgentRun(run)) {
    return null;
  }

  if (run.status === "escalated") {
    return "escalated";
  }

  if (
    run.canRecoverEvidence === true ||
    run.canRecoverStickyRequestEvidence === true ||
    run.status === "waiting_for_evidence" ||
    run.status === "failed"
  ) {
    return "needs_attention";
  }

  // Sticky running already returned above; remaining running is analyzing.
  if (run.status === "queued" || run.status === "running") {
    return "analyzing";
  }

  if (run.status === "completed") {
    return "assessments_ready";
  }

  return null;
}

function compareUpdatedAtDesc(a: AgentRunSummary, b: AgentRunSummary): number {
  const diff = Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
  if (diff !== 0) {
    return diff;
  }
  return b.id.localeCompare(a.id);
}

/** Needs-attention priority: sticky → recoverable → waiting → terminal failed. */
export function needsAttentionPriority(run: AgentRunSummary): number {
  if (run.canRecoverStickyRequestEvidence === true) {
    return 0;
  }
  if (run.canRecoverEvidence === true) {
    return 1;
  }
  if (run.status === "waiting_for_evidence") {
    return 2;
  }
  if (run.status === "failed") {
    return 3;
  }
  return 4;
}

export function compareNeedsAttention(
  a: AgentRunSummary,
  b: AgentRunSummary,
): number {
  const priorityDiff = needsAttentionPriority(a) - needsAttentionPriority(b);
  if (priorityDiff !== 0) {
    return priorityDiff;
  }
  return compareUpdatedAtDesc(a, b);
}

export function findAuthorizedDeltaForAgentRun(
  run: AgentRunSummary,
  deltas: readonly Delta[] | null | undefined,
): Delta | null {
  if (!deltas || deltas.length === 0) {
    return null;
  }

  const localId = run.deltaContext.localDeltaId.trim();
  if (localId) {
    const byLocal = deltas.find((delta) => delta.localDeltaId === localId);
    if (byLocal) {
      return byLocal;
    }
  }

  const remoteId = run.deltaContext.remoteDeltaId.trim();
  if (remoteId) {
    const byRemote = deltas.find((delta) => delta.id === remoteId);
    if (byRemote) {
      return byRemote;
    }
  }

  return null;
}

export function findAuthorizedPlanItemForDelta(
  delta: Delta | null,
  planItems: readonly PlanItem[] | null | undefined,
  run: AgentRunSummary,
): PlanItem | null {
  if (!delta || !planItems || planItems.length === 0) {
    return null;
  }

  const planItemId = delta.planItemId.trim();
  if (planItemId) {
    const match = planItems.find(
      (item) =>
        item.id === planItemId || item.localPlanItemId === planItemId,
    );
    if (match) {
      return match;
    }
  }

  const remotePlanItemId = run.deltaContext.remotePlanItemId.trim();
  if (remotePlanItemId) {
    const match = planItems.find(
      (item) =>
        item.id === remotePlanItemId ||
        item.localPlanItemId === remotePlanItemId,
    );
    if (match) {
      return match;
    }
  }

  return null;
}

export function formatDeltaMagnitude(delta: Delta | null): string | null {
  if (!delta) {
    return null;
  }

  const unit = delta.unit.trim();
  const signed = formatSignedQuantity(delta.difference);
  const percent = formatSignedPercent1(delta.percentDifference);
  const magnitude = unit ? `${signed} ${unit}` : signed;

  if (percent !== "—") {
    return `${magnitude} · ${percent}`;
  }
  return magnitude;
}

export function joinAgentRunContext(
  run: AgentRunSummary,
  deltas: readonly Delta[] | null | undefined,
  planItems: readonly PlanItem[] | null | undefined,
): ProjectAgentJoinedContext {
  const delta = findAuthorizedDeltaForAgentRun(run, deltas);
  const planItem = findAuthorizedPlanItemForDelta(delta, planItems, run);
  const label = planItem?.label?.trim();

  return {
    delta,
    planItem,
    planLabel: label && label.length > 0 ? label : GENERIC_LABEL,
    deltaMagnitude: formatDeltaMagnitude(delta),
  };
}

/**
 * Project-page actions. Never exposes recovery / add-evidence mutations.
 */
export function resolveProjectAgentRowAction(
  isActualOwner: boolean,
  run: AgentRunSummary,
  join: ProjectAgentJoinedContext,
): ProjectAgentRowAction {
  if (canViewAgentSummary(isActualOwner, run)) {
    return "view_assessment";
  }

  if (join.delta) {
    return "review";
  }

  return null;
}

export function buildProjectAgentRow(
  run: AgentRunSummary,
  deltas: readonly Delta[] | null | undefined,
  planItems: readonly PlanItem[] | null | undefined,
  isActualOwner: boolean,
): ProjectAgentRow | null {
  const bucket = assignProjectAgentBucket(run);
  if (!bucket) {
    return null;
  }

  const join = joinAgentRunContext(run, deltas, planItems);
  const presentation = buildAgentRunPresentation(run);
  const action = resolveProjectAgentRowAction(isActualOwner, run, join);

  return {
    run,
    bucket,
    presentation,
    join,
    action,
    reviewLocalDeltaId: join.delta?.localDeltaId?.trim() || null,
  };
}

export function buildProjectAgentBuckets(
  runs: readonly AgentRunSummary[] | null | undefined,
  deltas: readonly Delta[] | null | undefined,
  planItems: readonly PlanItem[] | null | undefined,
  isActualOwner: boolean,
): ProjectAgentBuckets {
  const escalated: ProjectAgentRow[] = [];
  const needsAttention: ProjectAgentRow[] = [];
  const analyzing: ProjectAgentRow[] = [];
  const assessmentsReady: ProjectAgentRow[] = [];

  if (!runs) {
    return { escalated, needsAttention, analyzing, assessmentsReady };
  }

  for (const run of runs) {
    const row = buildProjectAgentRow(run, deltas, planItems, isActualOwner);
    if (!row) {
      continue;
    }
    switch (row.bucket) {
      case "escalated":
        escalated.push(row);
        break;
      case "needs_attention":
        needsAttention.push(row);
        break;
      case "analyzing":
        analyzing.push(row);
        break;
      case "assessments_ready":
        assessmentsReady.push(row);
        break;
    }
  }

  escalated.sort((a, b) => compareUpdatedAtDesc(a.run, b.run));
  needsAttention.sort((a, b) => compareNeedsAttention(a.run, b.run));
  analyzing.sort((a, b) => compareUpdatedAtDesc(a.run, b.run));
  assessmentsReady.sort((a, b) => compareUpdatedAtDesc(a.run, b.run));

  return { escalated, needsAttention, analyzing, assessmentsReady };
}

export function countProjectAgentBuckets(
  buckets: ProjectAgentBuckets,
): ProjectAgentCounts {
  return {
    escalated: buckets.escalated.length,
    needsAttention: buckets.needsAttention.length,
    analyzing: buckets.analyzing.length,
    assessmentsReady: buckets.assessmentsReady.length,
    total:
      buckets.escalated.length +
      buckets.needsAttention.length +
      buckets.analyzing.length +
      buckets.assessmentsReady.length,
  };
}

export function formatAgentRunUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function buildDeltaReviewHref(
  projectId: string,
  localDeltaId: string | null,
): string | null {
  const pid = projectId.trim();
  if (!pid) {
    return null;
  }
  const base = `/projects/${encodeURIComponent(pid)}/deltas`;
  const deltaId = localDeltaId?.trim();
  if (!deltaId) {
    return null;
  }
  return `${base}?delta=${encodeURIComponent(deltaId)}`;
}

/**
 * Resolve ?delta= against authorized Delta list only.
 * Returns remote delta.id for expandedDeltaId, or null.
 */
export function resolveDeltaExpandId(
  deltas: readonly Delta[] | null | undefined,
  queryValue: string | null | undefined,
): string | null {
  const identifier = queryValue?.trim() ?? "";
  if (!identifier || !deltas || deltas.length === 0) {
    return null;
  }

  const match = deltas.find(
    (delta) =>
      delta.localDeltaId === identifier || delta.id === identifier,
  );
  return match?.id ?? null;
}
