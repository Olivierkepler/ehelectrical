import { authenticatedJson } from "@/lib/kepler/api/client";
import { dedupeAsync } from "@/lib/kepler/api/dedupe";

export type AgentRunStatus =
  | "queued"
  | "running"
  | "waiting_for_evidence"
  | "completed"
  | "failed"
  | "escalated";

export type AgentRunStep =
  | "queued"
  | "load_context"
  | "assess_variance"
  | "check_evidence_policy"
  | "request_evidence"
  | "waiting_for_evidence"
  | "analyze_evidence"
  | "prepare_summary"
  | "record_outcome"
  | "completed"
  | "failed"
  | "escalated"
  | string;

export type AgentRunPendingRequest = {
  kind: "delta_evidence";
  message: string;
  requestedAt: string;
  /** Canonical ProjectMember.id when uniquely targeted; null = owner fallback. */
  requestedProjectMemberId: string | null;
};

export type AgentRunOutcome = {
  kind: "summary_ready" | "escalated" | "failed";
  summaryId: string | null;
  userVisibleRationale: string;
};

export type AgentRunDeltaContext = {
  localDeltaId: string;
  remoteDeltaId: string;
  localMeasurementId: string;
  remotePlanItemId: string;
};

/** Public AgentRunSummaryDTO from GET agent-runs. */
export type AgentRunSummary = {
  id: string;
  workflowType: "field_variance";
  status: AgentRunStatus;
  currentStep: AgentRunStep;
  pendingRequest: AgentRunPendingRequest | null;
  outcome: AgentRunOutcome | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  lastEvidenceId: string | null;
  deltaContext: AgentRunDeltaContext;
  canRecoverEvidence: boolean;
  canRecoverStickyRequestEvidence: boolean;
};

export type AgentSummaryEvidenceAssessment = {
  evidenceId: string | null;
  evidenceType: "photo" | "note" | null;
  relevance: string | null;
  userVisibleRationale: string | null;
};

export type AgentSummaryDocumentedImpact = {
  plannedValue: number | null;
  actualValue: number | null;
  difference: number | null;
  percentDifference: number | null;
  costImpact: number | null;
  laborImpactHours: number | null;
  scheduleImpactDays: number | null;
};

/** Owner-only AgentSummaryDTO. */
export type AgentSummary = {
  id: string;
  agentRunId: string;
  projectId: string;
  createdAt: string;
  varianceSummary: string;
  documentationSummary: string;
  evidenceAssessment: AgentSummaryEvidenceAssessment;
  documentedImpact: AgentSummaryDocumentedImpact;
  recommendedHumanNextStep: string | null;
  sourceRefs: {
    evidenceIds: string[];
  };
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isAgentRunStatus(value: unknown): value is AgentRunStatus {
  return (
    value === "queued" ||
    value === "running" ||
    value === "waiting_for_evidence" ||
    value === "completed" ||
    value === "failed" ||
    value === "escalated"
  );
}

function isPendingRequest(
  value: unknown,
): value is AgentRunPendingRequest | null {
  if (value === null) {
    return true;
  }
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    record.kind === "delta_evidence" &&
    isNonEmptyString(record.message) &&
    isNonEmptyString(record.requestedAt) &&
    (record.requestedProjectMemberId === null ||
      typeof record.requestedProjectMemberId === "string")
  );
}

function isOutcome(value: unknown): value is AgentRunOutcome | null {
  if (value === null) {
    return true;
  }
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    (record.kind === "summary_ready" ||
      record.kind === "escalated" ||
      record.kind === "failed") &&
    (record.summaryId === null || typeof record.summaryId === "string") &&
    typeof record.userVisibleRationale === "string"
  );
}

function isDeltaContext(value: unknown): value is AgentRunDeltaContext {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    isNonEmptyString(record.localDeltaId) &&
    isNonEmptyString(record.remoteDeltaId) &&
    typeof record.localMeasurementId === "string" &&
    typeof record.remotePlanItemId === "string"
  );
}

function isAgentRunSummary(value: unknown): value is AgentRunSummary {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  if (
    !isNonEmptyString(record.id) ||
    record.workflowType !== "field_variance" ||
    !isAgentRunStatus(record.status) ||
    typeof record.currentStep !== "string" ||
    !isPendingRequest(record.pendingRequest) ||
    !isOutcome(record.outcome) ||
    !isNonEmptyString(record.createdAt) ||
    !isNonEmptyString(record.updatedAt) ||
    (record.completedAt !== null && typeof record.completedAt !== "string") ||
    (record.lastEvidenceId !== null &&
      typeof record.lastEvidenceId !== "string") ||
    !isDeltaContext(record.deltaContext)
  ) {
    return false;
  }

  // Additive recovery flags — default false if absent for older payloads.
  if (
    record.canRecoverEvidence !== undefined &&
    typeof record.canRecoverEvidence !== "boolean"
  ) {
    return false;
  }
  if (
    record.canRecoverStickyRequestEvidence !== undefined &&
    typeof record.canRecoverStickyRequestEvidence !== "boolean"
  ) {
    return false;
  }

  return true;
}

function normalizeAgentRunSummary(value: AgentRunSummary): AgentRunSummary {
  return {
    ...value,
    canRecoverEvidence: value.canRecoverEvidence === true,
    canRecoverStickyRequestEvidence:
      value.canRecoverStickyRequestEvidence === true,
  };
}

function parseAgentRunList(value: unknown): AgentRunSummary[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const items: AgentRunSummary[] = [];
  for (const item of value) {
    if (!isAgentRunSummary(item)) {
      return null;
    }
    items.push(normalizeAgentRunSummary(item));
  }
  return items;
}

function parseAgentRun(value: unknown): AgentRunSummary | null {
  if (!isAgentRunSummary(value)) {
    return null;
  }
  return normalizeAgentRunSummary(value);
}

function isAgentSummary(value: unknown): value is AgentSummary {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  if (
    !isNonEmptyString(record.id) ||
    !isNonEmptyString(record.agentRunId) ||
    !isNonEmptyString(record.projectId) ||
    !isNonEmptyString(record.createdAt) ||
    typeof record.varianceSummary !== "string" ||
    typeof record.documentationSummary !== "string" ||
    typeof record.evidenceAssessment !== "object" ||
    record.evidenceAssessment === null ||
    typeof record.documentedImpact !== "object" ||
    record.documentedImpact === null ||
    (record.recommendedHumanNextStep !== null &&
      typeof record.recommendedHumanNextStep !== "string") ||
    typeof record.sourceRefs !== "object" ||
    record.sourceRefs === null
  ) {
    return false;
  }
  const refs = record.sourceRefs as Record<string, unknown>;
  return Array.isArray(refs.evidenceIds);
}

/** GET /api/projects/:projectId/agent-runs */
export async function listProjectAgentRuns(
  projectId: string,
): Promise<AgentRunSummary[]> {
  const id = projectId.trim();
  if (!id) {
    throw new Error("projectId is required");
  }

  return dedupeAsync(`GET /api/projects/${id}/agent-runs`, () =>
    authenticatedJson(
      `/api/projects/${encodeURIComponent(id)}/agent-runs`,
      {},
      parseAgentRunList,
    ),
  );
}

/** GET /api/projects/:projectId/agent-runs/:agentRunId */
export async function getProjectAgentRun(
  projectId: string,
  agentRunId: string,
): Promise<AgentRunSummary> {
  const pid = projectId.trim();
  const rid = agentRunId.trim();
  if (!pid || !rid) {
    throw new Error("projectId and agentRunId are required");
  }

  return authenticatedJson(
    `/api/projects/${encodeURIComponent(pid)}/agent-runs/${encodeURIComponent(rid)}`,
    {},
    parseAgentRun,
  );
}

const agentSummaryMemory = new Map<string, AgentSummary>();

function agentSummaryCacheKey(projectId: string, summaryId: string): string {
  return `${projectId.trim()}::${summaryId.trim()}`;
}

export function peekCachedAgentSummary(
  projectId: string,
  summaryId: string,
): AgentSummary | null {
  return agentSummaryMemory.get(agentSummaryCacheKey(projectId, summaryId)) ?? null;
}

/** GET /api/projects/:projectId/agent-summaries/:summaryId — owner only */
export async function getAgentSummary(
  projectId: string,
  summaryId: string,
): Promise<AgentSummary> {
  const pid = projectId.trim();
  const sid = summaryId.trim();
  if (!pid || !sid) {
    throw new Error("projectId and summaryId are required");
  }

  const cached = peekCachedAgentSummary(pid, sid);
  if (cached) {
    return cached;
  }

  const loaded = await authenticatedJson(
    `/api/projects/${encodeURIComponent(pid)}/agent-summaries/${encodeURIComponent(sid)}`,
    {},
    (value) => (isAgentSummary(value) ? value : null),
  );
  agentSummaryMemory.set(agentSummaryCacheKey(pid, sid), loaded);
  return loaded;
}

export function findFieldVarianceAgentRunForDelta(
  runs: AgentRunSummary[] | null | undefined,
  localDeltaId: string,
): AgentRunSummary | null {
  const localId = localDeltaId.trim();
  if (!runs || !localId) {
    return null;
  }

  return (
    runs.find(
      (run) =>
        run.workflowType === "field_variance" &&
        run.deltaContext.localDeltaId === localId,
    ) ?? null
  );
}

export type AgentRunRecoveryOutcome = "recovered" | "existing";

/** Success body from recover-evidence / recover-request-evidence. */
export type AgentRunRecoveryResponse = {
  outcome: AgentRunRecoveryOutcome;
  agentRun: AgentRunSummary;
};

export type RecoveryResponse = AgentRunRecoveryResponse;

function parseRecoveryResponse(
  value: unknown,
): AgentRunRecoveryResponse | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (record.outcome !== "recovered" && record.outcome !== "existing") {
    return null;
  }
  if (!isAgentRunSummary(record.agentRun)) {
    return null;
  }
  return {
    outcome: record.outcome,
    agentRun: normalizeAgentRunSummary(record.agentRun),
  };
}

/**
 * POST /api/projects/:projectId/agent-runs/:agentRunId/recover-evidence
 * Owner-only. Server loads canonical state — no client recovery body.
 */
export async function recoverAgentRunEvidence(
  projectId: string,
  agentRunId: string,
): Promise<AgentRunRecoveryResponse> {
  const pid = projectId.trim();
  const rid = agentRunId.trim();
  if (!pid || !rid) {
    throw new Error("projectId and agentRunId are required");
  }

  return authenticatedJson(
    `/api/projects/${encodeURIComponent(pid)}/agent-runs/${encodeURIComponent(rid)}/recover-evidence`,
    { method: "POST" },
    parseRecoveryResponse,
  );
}

/**
 * POST /api/projects/:projectId/agent-runs/:agentRunId/recover-request-evidence
 * Owner-only sticky request-evidence recovery. No client recovery body.
 */
export async function recoverStickyRequestEvidence(
  projectId: string,
  agentRunId: string,
): Promise<AgentRunRecoveryResponse> {
  const pid = projectId.trim();
  const rid = agentRunId.trim();
  if (!pid || !rid) {
    throw new Error("projectId and agentRunId are required");
  }

  return authenticatedJson(
    `/api/projects/${encodeURIComponent(pid)}/agent-runs/${encodeURIComponent(rid)}/recover-request-evidence`,
    { method: "POST" },
    parseRecoveryResponse,
  );
}
