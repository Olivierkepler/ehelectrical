/**
 * Pure fixtures for Phase 2I-B project Kepler AI workspace.
 * Run: npx tsx lib/kepler/projectAgentWorkspace.selftest.ts
 */
import type { AgentRunSummary } from "./api/agentRuns";
import type { Delta } from "./api/deltas";
import type { PlanItem } from "./api/planItems";
import {
  assignProjectAgentBucket,
  buildProjectAgentBuckets,
  compareNeedsAttention,
  findAuthorizedDeltaForAgentRun,
  findAuthorizedPlanItemForDelta,
  joinAgentRunContext,
  resolveDeltaExpandId,
  resolveProjectAgentRowAction,
} from "./projectAgentWorkspace";

function baseRun(overrides: Partial<AgentRunSummary> = {}): AgentRunSummary {
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
      remotePlanItemId: "plan-remote-1",
    },
    canRecoverEvidence: false,
    canRecoverStickyRequestEvidence: false,
    ...overrides,
  };
}

function baseDelta(overrides: Partial<Delta> = {}): Delta {
  return {
    id: "delta-remote-1",
    localDeltaId: "delta-local-1",
    projectId: "p1",
    planItemId: "plan-remote-1",
    measurementId: "meas-remote-1",
    type: "length",
    plannedValue: 40,
    actualValue: 25,
    difference: -15,
    percentDifference: -37.5,
    unit: "ft",
    unitCost: 10,
    costImpact: -150,
    productionRatePerDay: 1,
    scheduleImpactDays: -1,
    laborHoursPerUnit: 1,
    laborImpactHours: -15,
    status: "open",
    dispositionReason: "",
    disposedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function basePlan(overrides: Partial<PlanItem> = {}): PlanItem {
  return {
    id: "plan-remote-1",
    localPlanItemId: "plan-local-1",
    projectId: "p1",
    type: "length",
    label: "Conference room wall",
    plannedValue: 40,
    unit: "ft",
    unitCost: 10,
    productionRatePerDay: 1,
    laborHoursPerUnit: 1,
    ...overrides,
  };
}

function check(condition: boolean, label: string) {
  if (!condition) {
    throw new Error(`FAIL: ${label}`);
  }
  console.log(`PASS: ${label}`);
}

// --- Bucketing ---
check(
  assignProjectAgentBucket(baseRun({ status: "escalated", currentStep: "escalated" })) ===
    "escalated",
  "A escalated → Escalated",
);
check(
  assignProjectAgentBucket(
    baseRun({
      status: "waiting_for_evidence",
      currentStep: "waiting_for_evidence",
      pendingRequest: {
        kind: "delta_evidence",
        message: "Add a field photo or note documenting this difference.",
        requestedAt: "2026-01-01T00:00:00.000Z",
        requestedProjectMemberId: null,
      },
    }),
  ) === "needs_attention",
  "B waiting → Needs attention",
);
check(
  assignProjectAgentBucket(
    baseRun({
      status: "failed",
      currentStep: "failed",
      canRecoverEvidence: true,
    }),
  ) === "needs_attention",
  "C recoverable failed → Needs attention",
);
check(
  assignProjectAgentBucket(
    baseRun({
      status: "running",
      currentStep: "assess_variance",
      canRecoverStickyRequestEvidence: true,
      lastEvidenceId: "ev-1",
    }),
  ) === "needs_attention",
  "D sticky running → Needs attention",
);
check(
  assignProjectAgentBucket(
    baseRun({
      status: "failed",
      currentStep: "failed",
      canRecoverEvidence: false,
    }),
  ) === "needs_attention",
  "E terminal failed → Needs attention",
);
check(
  assignProjectAgentBucket(baseRun({ status: "queued", currentStep: "queued" })) ===
    "analyzing",
  "F queued → Analyzing",
);
check(
  assignProjectAgentBucket(
    baseRun({ status: "running", currentStep: "analyze_evidence" }),
  ) === "analyzing",
  "G normal running → Analyzing",
);
check(
  assignProjectAgentBucket(
    baseRun({
      status: "completed",
      currentStep: "completed",
      outcome: {
        kind: "summary_ready",
        summaryId: "agent-summary:x",
        userVisibleRationale: "Variance documented.",
      },
    }),
  ) === "assessments_ready",
  "H completed → Assessments ready",
);

const sticky = baseRun({
  id: "run-sticky",
  status: "running",
  currentStep: "assess_variance",
  canRecoverStickyRequestEvidence: true,
  updatedAt: "2026-01-02T00:00:00.000Z",
});
const bucketsOnce = buildProjectAgentBuckets([sticky], [baseDelta()], [basePlan()], true);
check(
  bucketsOnce.needsAttention.length === 1 &&
    bucketsOnce.analyzing.length === 0 &&
    bucketsOnce.escalated.length === 0 &&
    bucketsOnce.assessmentsReady.length === 0,
  "I one run appears in exactly one bucket",
);

check(
  assignProjectAgentBucket({
    ...baseRun(),
    workflowType: "field_variance",
  } as AgentRunSummary) === "analyzing",
  "field_variance accepted",
);
// Non-field-variance ignored via cast of alternate workflow for filter test.
const foreign = {
  ...baseRun({ id: "other" }),
  workflowType: "other_workflow",
} as unknown as AgentRunSummary;
check(assignProjectAgentBucket(foreign) === null, "J non-field-variance ignored");
const foreignBuckets = buildProjectAgentBuckets(
  [foreign],
  [baseDelta()],
  [basePlan()],
  true,
);
check(foreignBuckets.analyzing.length === 0, "J foreign not listed");

// --- Sorting ---
const stickyEarly = baseRun({
  id: "a-sticky",
  status: "running",
  currentStep: "assess_variance",
  canRecoverStickyRequestEvidence: true,
  updatedAt: "2026-01-01T00:00:00.000Z",
});
const recoverableLate = baseRun({
  id: "b-recoverable",
  status: "failed",
  currentStep: "failed",
  canRecoverEvidence: true,
  updatedAt: "2026-01-05T00:00:00.000Z",
});
const waitingMid = baseRun({
  id: "c-waiting",
  status: "waiting_for_evidence",
  currentStep: "waiting_for_evidence",
  pendingRequest: {
    kind: "delta_evidence",
    message: "Need photo",
    requestedAt: "2026-01-01T00:00:00.000Z",
    requestedProjectMemberId: null,
  },
  updatedAt: "2026-01-04T00:00:00.000Z",
});
const terminalOld = baseRun({
  id: "d-terminal",
  status: "failed",
  currentStep: "failed",
  canRecoverEvidence: false,
  updatedAt: "2026-01-06T00:00:00.000Z",
});
const needsSorted = [terminalOld, waitingMid, recoverableLate, stickyEarly].sort(
  compareNeedsAttention,
);
check(
  needsSorted.map((r) => r.id).join(",") ===
    "a-sticky,b-recoverable,c-waiting,d-terminal",
  "Needs attention precedence sticky→recoverable→waiting→terminal",
);

const waitNew = baseRun({
  id: "wait-new",
  status: "waiting_for_evidence",
  currentStep: "waiting_for_evidence",
  pendingRequest: {
    kind: "delta_evidence",
    message: "Need photo",
    requestedAt: "2026-01-01T00:00:00.000Z",
    requestedProjectMemberId: null,
  },
  updatedAt: "2026-01-10T00:00:00.000Z",
});
const waitOld = baseRun({
  id: "wait-old",
  status: "waiting_for_evidence",
  currentStep: "waiting_for_evidence",
  pendingRequest: {
    kind: "delta_evidence",
    message: "Need photo",
    requestedAt: "2026-01-01T00:00:00.000Z",
    requestedProjectMemberId: null,
  },
  updatedAt: "2026-01-01T00:00:00.000Z",
});
check(
  compareNeedsAttention(waitNew, waitOld) < 0,
  "Needs attention same priority → updatedAt desc",
);

const completedBuckets = buildProjectAgentBuckets(
  [
    baseRun({
      id: "completed-old",
      status: "completed",
      currentStep: "completed",
      updatedAt: "2026-01-01T00:00:00.000Z",
      outcome: {
        kind: "summary_ready",
        summaryId: "s1",
        userVisibleRationale: "Old",
      },
    }),
    baseRun({
      id: "completed-new",
      status: "completed",
      currentStep: "completed",
      updatedAt: "2026-01-05T00:00:00.000Z",
      outcome: {
        kind: "summary_ready",
        summaryId: "s2",
        userVisibleRationale: "New",
      },
    }),
  ],
  [baseDelta()],
  [basePlan()],
  true,
);
check(
  completedBuckets.assessmentsReady.map((r) => r.run.id).join(",") ===
    "completed-new,completed-old",
  "Assessments ready updatedAt desc",
);

// --- Joins ---
const joinedLocal = findAuthorizedDeltaForAgentRun(baseRun(), [baseDelta()]);
check(joinedLocal?.localDeltaId === "delta-local-1", "join matching localDeltaId");

const joinedRemote = findAuthorizedDeltaForAgentRun(
  baseRun({
    deltaContext: {
      localDeltaId: "missing-local",
      remoteDeltaId: "delta-remote-1",
      localMeasurementId: "",
      remotePlanItemId: "plan-remote-1",
    },
  }),
  [baseDelta()],
);
check(joinedRemote?.id === "delta-remote-1", "fallback remoteDeltaId join");

const missingDelta = findAuthorizedDeltaForAgentRun(baseRun(), []);
check(missingDelta === null, "missing Delta → null");
const missingJoin = joinAgentRunContext(baseRun(), [], [basePlan()]);
check(missingJoin.planLabel === "Field variance", "missing Delta → generic Field variance");
check(missingJoin.deltaMagnitude === null, "missing Delta → no magnitude");

const plan = findAuthorizedPlanItemForDelta(baseDelta(), [basePlan()], baseRun());
check(plan?.label === "Conference room wall", "Delta + Plan Item → label");

const noPlan = findAuthorizedPlanItemForDelta(baseDelta(), [], baseRun());
check(noPlan === null, "missing Plan Item → null");
const noPlanJoin = joinAgentRunContext(baseRun(), [baseDelta()], []);
check(noPlanJoin.planLabel === "Field variance", "missing Plan → generic label");

// --- Owner actions ---
const completedReady = baseRun({
  status: "completed",
  currentStep: "completed",
  outcome: {
    kind: "summary_ready",
    summaryId: "agent-summary:x",
    userVisibleRationale: "Variance documented.",
  },
});
const joinOk = joinAgentRunContext(completedReady, [baseDelta()], [basePlan()]);
check(
  resolveProjectAgentRowAction(true, completedReady, joinOk) === "view_assessment",
  "owner completed summary_ready → View assessment",
);
check(
  resolveProjectAgentRowAction(false, completedReady, joinOk) === "review",
  "non-owner completed summary_ready → Review (no assessment CTA)",
);

const waiting = baseRun({
  status: "waiting_for_evidence",
  currentStep: "waiting_for_evidence",
  pendingRequest: {
    kind: "delta_evidence",
    message: "Add a field photo or note documenting this difference.",
    requestedAt: "2026-01-01T00:00:00.000Z",
    requestedProjectMemberId: null,
  },
});
check(
  resolveProjectAgentRowAction(true, waiting, joinAgentRunContext(waiting, [baseDelta()], [basePlan()])) ===
    "review",
  "owner waiting → Review",
);

const recoverable = baseRun({
  status: "failed",
  currentStep: "failed",
  canRecoverEvidence: true,
});
check(
  resolveProjectAgentRowAction(
    true,
    recoverable,
    joinAgentRunContext(recoverable, [baseDelta()], [basePlan()]),
  ) === "review",
  "owner recoverable → Review, NOT Try another photo",
);

const stickyRun = baseRun({
  status: "running",
  currentStep: "assess_variance",
  canRecoverStickyRequestEvidence: true,
});
check(
  resolveProjectAgentRowAction(
    true,
    stickyRun,
    joinAgentRunContext(stickyRun, [baseDelta()], [basePlan()]),
  ) === "review",
  "owner sticky → Review, NOT Continue evidence request",
);

// Scoped: AgentRun without matching authorized Delta
const scopedJoin = joinAgentRunContext(waiting, [], []);
check(scopedJoin.planLabel === "Field variance", "scoped missing Delta → Field variance");
check(
  resolveProjectAgentRowAction(false, waiting, scopedJoin) === null,
  "scoped missing Delta → omit Review (no misleading nav)",
);

// Deep-link
check(
  resolveDeltaExpandId([baseDelta()], "delta-local-1") === "delta-remote-1",
  "deep-link localDeltaId match",
);
check(
  resolveDeltaExpandId([baseDelta()], "delta-remote-1") === "delta-remote-1",
  "deep-link remote id match",
);
check(
  resolveDeltaExpandId([baseDelta()], "unknown-id") === null,
  "deep-link unknown id → no expansion",
);

console.log("ALL PROJECT AGENT WORKSPACE SELFTESTS PASSED");
