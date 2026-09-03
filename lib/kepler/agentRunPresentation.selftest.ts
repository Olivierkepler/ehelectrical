/**
 * Pure presentation fixtures for Phase 2H-B / 2H-C / 2H-D.1.
 * Run: npx tsx lib/kepler/agentRunPresentation.selftest.ts
 */
import type { AgentRunSummary, AgentSummary } from "./api/agentRuns";
import { ApiError, NotAuthenticatedError } from "./api/client";
import type { EvidenceListItem } from "./api/evidence";
import {
  buildAgentRunPresentation,
  mapAgentRunRecoveryError,
  recoveryActionLabel,
  recoveryBusyLabel,
  resolveOwnerRecoveryAction,
  shouldPollAgentRun,
} from "./agentRunPresentation";
import {
  buildAssessmentSections,
  canViewAgentSummary,
  matchEvidenceReviewed,
  summaryFetchErrorMessage,
} from "./agentSummaryPresentation";

function base(overrides: Partial<AgentRunSummary> = {}): AgentRunSummary {
  return {
    id: "field-variance:test",
    workflowType: "field_variance",
    status: "queued",
    currentStep: "queued",
    pendingRequest: null,
    outcome: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    completedAt: null,
    lastEvidenceId: null,
    deltaContext: {
      localDeltaId: "delta-local-1",
      remoteDeltaId: "delta-remote-1",
      localMeasurementId: "meas-1",
      remotePlanItemId: "plan-1",
    },
    canRecoverEvidence: false,
    canRecoverStickyRequestEvidence: false,
    ...overrides,
  };
}

function check(condition: boolean, label: string) {
  if (!condition) {
    throw new Error(`FAIL: ${label}`);
  }
  console.log(`PASS: ${label}`);
}

const queued = buildAgentRunPresentation(base());
check(queued.label === "Queued for analysis", "queued label");
check(queued.isBusy === true, "queued busy");
check(queued.primaryAction === null, "queued no action");
check(shouldPollAgentRun(base()) === true, "poll queued");

const checking = buildAgentRunPresentation(
  base({ status: "running", currentStep: "check_evidence_policy" }),
);
check(checking.label === "Checking evidence", "checking label");
check(checking.isBusy === true, "checking busy");

const analyzing = buildAgentRunPresentation(
  base({ status: "running", currentStep: "analyze_evidence" }),
);
check(analyzing.label === "Analyzing evidence", "analyzing label");

const assessing = buildAgentRunPresentation(
  base({ status: "running", currentStep: "assess_variance" }),
);
check(assessing.label === "Assessing variance", "assessing label");

const preparing = buildAgentRunPresentation(
  base({ status: "running", currentStep: "prepare_summary" }),
);
check(preparing.label === "Preparing assessment", "preparing label");

const waitingMessage =
  "Add a field photo or note documenting this difference.";
const waitingRun = base({
  status: "waiting_for_evidence",
  currentStep: "waiting_for_evidence",
  pendingRequest: {
    kind: "delta_evidence",
    message: waitingMessage,
    requestedAt: "2026-01-01T00:00:00.000Z",
    requestedProjectMemberId: null,
  },
  lastEvidenceId: "ev-1",
});
const waiting = buildAgentRunPresentation(waitingRun);
check(waiting.label === "Needs more evidence", "waiting label");
check(waiting.message === waitingMessage, "waiting exact message");
check(waiting.primaryAction === "add_evidence", "waiting add evidence");
check(shouldPollAgentRun(waitingRun) === false, "do not poll waiting");
check(
  resolveOwnerRecoveryAction(true, waitingRun) === null,
  "O production waiting — no recovery CTA",
);

const completedRun = base({
  status: "completed",
  currentStep: "completed",
  outcome: {
    kind: "summary_ready",
    summaryId: "agent-summary:x",
    userVisibleRationale: "Variance documented.",
  },
  completedAt: "2026-01-01T01:00:00.000Z",
});
const completed = buildAgentRunPresentation(completedRun);
check(completed.label === "Assessment complete", "completed label");
check(completed.message === "Variance documented.", "completed rationale");
check(completed.primaryAction === "view_assessment", "completed view");
check(shouldPollAgentRun(completedRun) === false, "do not poll completed");

const completedNoSummary = buildAgentRunPresentation(
  base({
    status: "completed",
    currentStep: "completed",
    outcome: {
      kind: "summary_ready",
      summaryId: null,
      userVisibleRationale: "Variance documented.",
    },
  }),
);
check(completedNoSummary.label === "Assessment complete", "completed no id label");
check(completedNoSummary.primaryAction === null, "completed missing summaryId no CTA");

const escalated = buildAgentRunPresentation(
  base({
    status: "escalated",
    currentStep: "escalated",
    outcome: {
      kind: "escalated",
      summaryId: null,
      userVisibleRationale: "Needs superintendent review.",
    },
  }),
);
check(escalated.label === "Human review required", "escalated label");
check(
  escalated.message === "Needs superintendent review.",
  "escalated rationale",
);

const failedRecoverableRun = base({
  status: "failed",
  currentStep: "failed",
  canRecoverEvidence: true,
});
const failedRecoverable = buildAgentRunPresentation(failedRecoverableRun);
check(
  failedRecoverable.label === "Could not analyze photo",
  "failed recoverable label",
);
check(
  resolveOwnerRecoveryAction(true, failedRecoverableRun) === "try_another_photo",
  "A owner + canRecoverEvidence → Try another photo",
);
check(
  recoveryActionLabel("try_another_photo") === "Try another photo",
  "A media CTA label",
);
check(
  resolveOwnerRecoveryAction(false, failedRecoverableRun) === null,
  "B non-owner + canRecoverEvidence → no CTA",
);

const failedTerminal = buildAgentRunPresentation(
  base({
    status: "failed",
    currentStep: "failed",
    canRecoverEvidence: false,
    outcome: {
      kind: "failed",
      summaryId: null,
      userVisibleRationale: "Review could not finish.",
    },
  }),
);
check(
  failedTerminal.label === "Kepler could not complete this assessment",
  "failed terminal label",
);

const stickyRun = base({
  status: "running",
  currentStep: "assess_variance",
  canRecoverStickyRequestEvidence: true,
  lastEvidenceId: "ev-1",
});
const sticky = buildAgentRunPresentation(stickyRun);
check(sticky.label === "Needs attention", "sticky attention");
check(
  resolveOwnerRecoveryAction(true, stickyRun) === "continue_evidence_request",
  "C owner sticky flag → Continue evidence request",
);
check(
  recoveryActionLabel("continue_evidence_request") ===
    "Continue evidence request",
  "C sticky CTA label",
);
check(
  resolveOwnerRecoveryAction(false, stickyRun) === null,
  "D non-owner sticky flag → no CTA",
);
check(
  recoveryBusyLabel("continue_evidence_request") === "Continuing…",
  "H sticky busy label",
);
check(recoveryBusyLabel("try_another_photo") === "Preparing…", "H media busy label");

check(
  resolveOwnerRecoveryAction(
    true,
    base({
      status: "failed",
      currentStep: "failed",
      canRecoverEvidence: false,
      canRecoverStickyRequestEvidence: false,
    }),
  ) === null,
  "E both flags false → no recovery CTA",
);

// Do NOT infer recovery from status alone (failed without flag).
check(
  resolveOwnerRecoveryAction(
    true,
    base({ status: "failed", currentStep: "failed", canRecoverEvidence: false }),
  ) === null,
  "no status-text recovery inference (failed)",
);
check(
  resolveOwnerRecoveryAction(
    true,
    base({
      status: "running",
      currentStep: "assess_variance",
      canRecoverStickyRequestEvidence: false,
      lastEvidenceId: "ev-1",
    }),
  ) === null,
  "no status-text recovery inference (running assess)",
);

const recoveredWaiting = base({
  status: "waiting_for_evidence",
  currentStep: "waiting_for_evidence",
  pendingRequest: {
    kind: "delta_evidence",
    message:
      "The submitted photo could not be analyzed. Capture a clear replacement photo and try again.",
    requestedAt: "2026-01-01T00:00:00.000Z",
    requestedProjectMemberId: null,
  },
  canRecoverEvidence: false,
  canRecoverStickyRequestEvidence: false,
});
const recoveredPresentation = buildAgentRunPresentation(recoveredWaiting);
check(
  recoveredPresentation.label === "Needs more evidence",
  "F recovered response → waiting presentation",
);
check(
  recoveredPresentation.primaryAction === "add_evidence",
  "F recovered → Add evidence available",
);
check(
  shouldPollAgentRun(recoveredWaiting) === false,
  "N successful recovery → no polling while waiting",
);

const existingWaiting = buildAgentRunPresentation(recoveredWaiting);
check(
  existingWaiting.label === "Needs more evidence",
  "G existing response → waiting presentation",
);

check(
  mapAgentRunRecoveryError(new ApiError("delta missing", 400)) ===
    "This recovery is no longer available.",
  "I 400 safe unavailable",
);
check(
  mapAgentRunRecoveryError(new ApiError("not found", 404)) ===
    "This Kepler analysis is unavailable.",
  "J 404 safe unavailable",
);
check(
  mapAgentRunRecoveryError(new NotAuthenticatedError()) ===
    "Your session could not be authenticated.",
  "401 session message",
);
check(
  mapAgentRunRecoveryError(new ApiError("boom", 500)) ===
    "Unable to continue this assessment.",
  "K network/500 safe continue failure",
);
check(
  mapAgentRunRecoveryError(new Error("network")) ===
    "Unable to continue this assessment.",
  "K generic network safe",
);

// M: recovery success must not imply auto-open — presentation only exposes add_evidence.
check(
  recoveredPresentation.primaryAction === "add_evidence",
  "M success exposes Add evidence (caller must not auto-open sheet)",
);

const unknownStep = buildAgentRunPresentation(
  base({ status: "running", currentStep: "future_step_xyz" }),
);
check(unknownStep.label === "Analyzing", "unknown running step degrades");
check(unknownStep.isBusy === true, "unknown running still busy");

check(
  canViewAgentSummary(true, completedRun) === true,
  "A owner completed+summary_ready can view",
);
check(
  canViewAgentSummary(false, completedRun) === false,
  "B non-owner cannot view assessment",
);
check(
  canViewAgentSummary(true, base({ status: "completed", currentStep: "completed" })) ===
    false,
  "D missing summaryId cannot view",
);

function emptyImpact(): AgentSummary["documentedImpact"] {
  return {
    plannedValue: null,
    actualValue: null,
    difference: null,
    percentDifference: null,
    costImpact: null,
    laborImpactHours: null,
    scheduleImpactDays: null,
  };
}

const fullSummary: AgentSummary = {
  id: "agent-summary:x",
  agentRunId: "field-variance:test",
  projectId: "p1",
  createdAt: "2026-01-01T01:00:00.000Z",
  varianceSummary: "Wall is short of plan.",
  documentationSummary: "Photo shows unfinished framing.",
  evidenceAssessment: {
    evidenceId: "ev-photo-1",
    evidenceType: "photo",
    relevance: "relevant",
    userVisibleRationale: "Shows the measured wall.",
  },
  documentedImpact: {
    plannedValue: 40,
    actualValue: 25,
    difference: -15,
    percentDifference: -37.5,
    costImpact: -120,
    laborImpactHours: -2,
    scheduleImpactDays: -1,
  },
  recommendedHumanNextStep: "Confirm remaining work with the superintendent.",
  sourceRefs: { evidenceIds: ["ev-photo-1", "ev-unknown"] },
};

const fullSections = buildAssessmentSections(fullSummary);
check(
  fullSections.map((s) => s.id).join(",") ===
    "variance,evidence,documentation,documented_impact,recommended_next_step",
  "E full fields all sections",
);
check(
  fullSections.some((s) => s.eyebrow === "Recommended next step"),
  "E recommended next step wording",
);

const partialSummary: AgentSummary = {
  ...fullSummary,
  varianceSummary: "   ",
  documentationSummary: "",
  recommendedHumanNextStep: null,
  evidenceAssessment: {
    evidenceId: null,
    evidenceType: null,
    relevance: null,
    userVisibleRationale: null,
  },
  documentedImpact: emptyImpact(),
};
const partialSections = buildAssessmentSections(partialSummary);
check(partialSections.length === 0, "F empty sections omitted");

const evidenceRows: EvidenceListItem[] = [
  {
    id: "ev-photo-1",
    projectId: "p1",
    localEvidenceId: "local-1",
    type: "photo",
    note: "",
    objectPath: null,
    contentType: "image/jpeg",
    createdAt: "2026-09-03T06:24:00.000Z",
    localMeasurementId: null,
    localDeltaId: "delta-local-1",
  },
];
const matched = matchEvidenceReviewed(fullSummary.sourceRefs.evidenceIds, evidenceRows);
check(matched.matchedCount === 1, "I matched evidence row");
check(matched.unmatchedCount === 1, "J unknown evidence id ignored from rows");
check(matched.rows[0]?.kindLabel === "Photo", "I photo label no id");
check(!JSON.stringify(matched.rows).includes("ev-"), "I no raw evidence ids");

check(
  summaryFetchErrorMessage(new ApiError("nope", 404)) ===
    "Assessment is unavailable.",
  "H 404 safe message",
);
check(
  summaryFetchErrorMessage(new Error("boom")) === "Unable to load assessment",
  "H generic error safe",
);

console.log("ALL PRESENTATION SELFTESTS PASSED");
