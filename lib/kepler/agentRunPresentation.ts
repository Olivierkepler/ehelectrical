import type {
  AgentRunStep,
  AgentRunSummary,
} from "@/lib/kepler/api/agentRuns";
import { ApiError, NotAuthenticatedError } from "@/lib/kepler/api/client";

export type AgentRunTone =
  | "neutral"
  | "busy"
  | "waiting"
  | "complete"
  | "attention"
  | "escalated";

export type AgentRunPrimaryAction =
  | "add_evidence"
  | "view_assessment"
  | "review_escalation"
  | null;

/** Owner recovery CTA — gated only by DTO flags + actual owner (not status text). */
export type AgentRunRecoveryAction =
  | "try_another_photo"
  | "continue_evidence_request"
  | null;

export type AgentRunPresentation = {
  label: string;
  message: string;
  tone: AgentRunTone;
  isBusy: boolean;
  primaryAction: AgentRunPrimaryAction;
};

const CHECKING_STEPS: ReadonlySet<string> = new Set([
  "load_context",
  "check_evidence_policy",
  "request_evidence",
]);

/**
 * Maps authoritative AgentRunSummary → compact Kepler AI panel presentation.
 * Does not invent status from Activity, Evidence counts, or timers.
 */
export function buildAgentRunPresentation(
  run: AgentRunSummary,
): AgentRunPresentation {
  const status = run.status;
  const step = run.currentStep;

  if (status === "queued") {
    return {
      label: "Queued for analysis",
      message: "Kepler will review this field variance.",
      tone: "neutral",
      isBusy: true,
      primaryAction: null,
    };
  }

  if (status === "waiting_for_evidence") {
    const message =
      run.pendingRequest?.kind === "delta_evidence"
        ? run.pendingRequest.message
        : "Add a field photo or note documenting this difference.";
    return {
      label: "Needs more evidence",
      message,
      tone: "waiting",
      isBusy: false,
      primaryAction:
        run.pendingRequest?.kind === "delta_evidence" ? "add_evidence" : null,
    };
  }

  if (status === "escalated") {
    return {
      label: "Human review required",
      message:
        run.outcome?.userVisibleRationale?.trim() ||
        "Escalated for human review.",
      tone: "escalated",
      isBusy: false,
      primaryAction: "review_escalation",
    };
  }

  if (status === "completed") {
    return {
      label: "Assessment complete",
      message:
        run.outcome?.userVisibleRationale?.trim() ||
        "Agent summary ready for review.",
      tone: "complete",
      isBusy: false,
      primaryAction:
        run.outcome?.kind === "summary_ready" && run.outcome.summaryId
          ? "view_assessment"
          : null,
    };
  }

  if (status === "failed") {
    if (run.canRecoverEvidence) {
      return {
        label: "Could not analyze photo",
        message:
          "Kepler needs a different evidence photo before continuing.",
        tone: "attention",
        isBusy: false,
        primaryAction: null,
      };
    }
    return {
      label: "Kepler could not complete this assessment",
      message:
        run.outcome?.userVisibleRationale?.trim() ||
        "The automated review could not be completed.",
      tone: "attention",
      isBusy: false,
      primaryAction: null,
    };
  }

  if (status === "running") {
    if (run.canRecoverStickyRequestEvidence) {
      return {
        label: "Needs attention",
        message: "Capture another clear photo showing the affected work.",
        tone: "attention",
        isBusy: false,
        primaryAction: null,
      };
    }

    if (step === "analyze_evidence") {
      return {
        label: "Analyzing evidence",
        message: "Kepler is reviewing submitted field evidence.",
        tone: "busy",
        isBusy: true,
        primaryAction: null,
      };
    }

    if (step === "assess_variance") {
      return {
        label: "Assessing variance",
        message: "Kepler is evaluating the field difference.",
        tone: "busy",
        isBusy: true,
        primaryAction: null,
      };
    }

    if (step === "prepare_summary" || step === "record_outcome") {
      return {
        label: "Preparing assessment",
        message: "Kepler is preparing the variance assessment.",
        tone: "busy",
        isBusy: true,
        primaryAction: null,
      };
    }

    if (CHECKING_STEPS.has(step) || step === "queued") {
      return {
        label: "Checking evidence",
        message: "Kepler is reviewing project context and evidence policy.",
        tone: "busy",
        isBusy: true,
        primaryAction: null,
      };
    }

    // Unknown running step — degrade gracefully.
    return {
      label: "Analyzing",
      message: "Kepler is reviewing this field variance.",
      tone: "busy",
      isBusy: true,
      primaryAction: null,
    };
  }

  // Unknown status — safe fallback.
  return {
    label: "Kepler AI",
    message: "Reviewing field variance workflow.",
    tone: "neutral",
    isBusy: false,
    primaryAction: null,
  };
}

export function shouldPollAgentRun(run: AgentRunSummary | null): boolean {
  if (!run) {
    return false;
  }
  return run.status === "queued" || run.status === "running";
}

export function shouldPollAnyAgentRun(runs: AgentRunSummary[] | null): boolean {
  if (!runs || runs.length === 0) {
    return false;
  }
  return runs.some((run) => shouldPollAgentRun(run));
}

export function formatAgentRunStepForDiagnostics(step: AgentRunStep): string {
  return String(step);
}

/**
 * Authoritative recovery CTA eligibility.
 * Uses server flags + actual owner only — never status/step/error text.
 */
export function resolveOwnerRecoveryAction(
  isActualOwner: boolean,
  run: AgentRunSummary | null,
): AgentRunRecoveryAction {
  if (!isActualOwner || !run) {
    return null;
  }
  if (run.canRecoverEvidence === true) {
    return "try_another_photo";
  }
  if (run.canRecoverStickyRequestEvidence === true) {
    return "continue_evidence_request";
  }
  return null;
}

export function recoveryActionLabel(action: AgentRunRecoveryAction): string | null {
  if (action === "try_another_photo") {
    return "Try another photo";
  }
  if (action === "continue_evidence_request") {
    return "Continue evidence request";
  }
  return null;
}

export function recoveryBusyLabel(action: AgentRunRecoveryAction): string {
  if (action === "continue_evidence_request") {
    return "Continuing…";
  }
  return "Preparing…";
}

/** Safe user-facing recovery mutation errors. Never expose server internals. */
export function mapAgentRunRecoveryError(error: unknown): string {
  if (
    error instanceof NotAuthenticatedError ||
    (error instanceof ApiError && error.status === 401)
  ) {
    return "Your session could not be authenticated.";
  }

  if (error instanceof ApiError) {
    if (error.status === 400) {
      return "This recovery is no longer available.";
    }
    if (error.status === 404) {
      return "This Kepler analysis is unavailable.";
    }
  }

  return "Unable to continue this assessment.";
}
