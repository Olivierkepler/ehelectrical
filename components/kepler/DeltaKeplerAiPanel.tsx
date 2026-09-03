"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Sparkles } from "lucide-react";

import KeplerAssessmentSheet, {
  type KeplerAssessmentDeltaContext,
} from "@/components/kepler/KeplerAssessmentSheet";
import {
  findFieldVarianceAgentRunForDelta,
  recoverAgentRunEvidence,
  recoverStickyRequestEvidence,
} from "@/lib/kepler/api/agentRuns";
import type { AgentRunSummary } from "@/lib/kepler/api/agentRuns";
import type { EvidenceListItem } from "@/lib/kepler/api/evidence";
import {
  buildAgentRunPresentation,
  mapAgentRunRecoveryError,
  recoveryActionLabel,
  recoveryBusyLabel,
  resolveOwnerRecoveryAction,
  type AgentRunRecoveryAction,
  type AgentRunTone,
} from "@/lib/kepler/agentRunPresentation";
import {
  canViewAgentSummary,
  formatEvidenceWhen,
} from "@/lib/kepler/agentSummaryPresentation";

type DeltaKeplerAiPanelProps = {
  localDeltaId: string;
  agentRuns: AgentRunSummary[] | null;
  agentRunsLoading: boolean;
  agentRunsError: string | null;
  onRetryAgentRuns: () => void;
  onInvalidateAgentRuns: () => void;
  evidence: EvidenceListItem[] | null;
  isActualOwner: boolean;
  projectId: string;
  onAddEvidence: () => void;
  deltaContext: KeplerAssessmentDeltaContext | null;
};

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

export default function DeltaKeplerAiPanel({
  localDeltaId,
  agentRuns,
  agentRunsLoading,
  agentRunsError,
  onRetryAgentRuns,
  onInvalidateAgentRuns,
  evidence,
  isActualOwner,
  projectId,
  onAddEvidence,
  deltaContext,
}: DeltaKeplerAiPanelProps) {
  const titleId = useId();
  const viewAssessmentRef = useRef<HTMLButtonElement>(null);
  const recoveryInFlightRef = useRef(false);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [recoveryPending, setRecoveryPending] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [runOverride, setRunOverride] = useState<AgentRunSummary | null>(null);

  const listRun = findFieldVarianceAgentRunForDelta(agentRuns, localDeltaId);
  const listRunIdentity = listRun
    ? `${listRun.id}:${listRun.status}:${listRun.updatedAt}:${String(listRun.canRecoverEvidence)}:${String(listRun.canRecoverStickyRequestEvidence)}`
    : "";

  useEffect(() => {
    setRunOverride(null);
    setRecoveryError(null);
    setRecoveryPending(false);
    recoveryInFlightRef.current = false;
  }, [localDeltaId]);

  useEffect(() => {
    if (!listRunIdentity) {
      return;
    }
    // Authoritative AgentRun change: drop stale recovery error.
    // Uncertain POST + refetch to waiting_for_evidence is treated as success.
    setRecoveryError(null);
  }, [listRunIdentity]);

  useEffect(() => {
    if (!runOverride || !listRun) {
      return;
    }
    if (listRun.id !== runOverride.id) {
      setRunOverride(null);
      return;
    }
    // Drop override only after shared list reflects recovered waiting —
    // do not clear while list still holds the pre-recovery snapshot.
    if (
      listRun.status === "waiting_for_evidence" &&
      runOverride.status === "waiting_for_evidence"
    ) {
      setRunOverride(null);
    }
  }, [listRun, runOverride]);

  const agentRun =
    runOverride && (!listRun || listRun.id === runOverride.id)
      ? runOverride
      : listRun;

  if (agentRunsLoading && !agentRuns && !runOverride) {
    return (
      <div
        className="mt-3 border border-[var(--kepler-border)] bg-[var(--kepler-background)] px-4 py-3"
        aria-busy="true"
      >
        <div className="h-3 w-24 animate-pulse rounded-[2px] bg-black/[0.06]" />
        <div className="mt-2 h-4 w-40 animate-pulse rounded-[2px] bg-black/[0.06]" />
        <div className="mt-2 h-3 w-full max-w-md animate-pulse rounded-[2px] bg-black/[0.05]" />
      </div>
    );
  }

  if (agentRunsError && !agentRuns && !runOverride) {
    return (
      <div className="mt-3 border border-[var(--kepler-border)] bg-[var(--kepler-background)] px-4 py-3">
        <p className="text-[13px] text-[var(--kepler-secondary)]">
          Unable to load Kepler AI status
        </p>
        <button
          type="button"
          className="mt-2 text-[12px] font-semibold text-[var(--kepler-navy)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-1"
          onClick={onRetryAgentRuns}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!agentRun) {
    return (
      <div className="mt-3 border border-[var(--kepler-border)] bg-[var(--kepler-background)] px-4 py-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--kepler-muted)]">
          <Sparkles className="h-3.5 w-3.5 text-[var(--kepler-navy)]" aria-hidden />
          Kepler AI
        </div>
        <p className="mt-1.5 text-[13px] text-[var(--kepler-secondary)]">
          No Kepler analysis yet
        </p>
      </div>
    );
  }

  const presentation = buildAgentRunPresentation(agentRun);
  const recoveryAction = resolveOwnerRecoveryAction(isActualOwner, agentRun);
  const recoveryLabel = recoveryActionLabel(recoveryAction);
  const latestEvidence =
    agentRun.lastEvidenceId && evidence
      ? (evidence.find((item) => item.id === agentRun.lastEvidenceId) ?? null)
      : null;
  const showAddEvidence =
    isActualOwner && presentation.primaryAction === "add_evidence";
  const showViewAssessment = canViewAgentSummary(isActualOwner, agentRun);
  const summaryId = agentRun.outcome?.summaryId?.trim() || null;
  const latestWhen = latestEvidence
    ? formatEvidenceWhen(latestEvidence.createdAt)
    : null;

  async function runRecovery(action: AgentRunRecoveryAction) {
    if (
      !action ||
      !agentRun ||
      recoveryInFlightRef.current ||
      recoveryPending
    ) {
      return;
    }

    recoveryInFlightRef.current = true;
    setRecoveryPending(true);
    setRecoveryError(null);

    try {
      const response =
        action === "try_another_photo"
          ? await recoverAgentRunEvidence(projectId, agentRun.id)
          : await recoverStickyRequestEvidence(projectId, agentRun.id);

      // recovered and existing are both success — apply returned AgentRun.
      setRunOverride(response.agentRun);
      onInvalidateAgentRuns();
    } catch (error) {
      setRecoveryError(mapAgentRunRecoveryError(error));
      // Uncertain / rejected: refetch authoritative state; never auto-retry POST.
      onInvalidateAgentRuns();
    } finally {
      recoveryInFlightRef.current = false;
      setRecoveryPending(false);
    }
  }

  return (
    <>
      <div
        className="mt-3 border border-[var(--kepler-border)] bg-[var(--kepler-background)] px-4 py-3"
        aria-labelledby={titleId}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div
              id={titleId}
              className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--kepler-muted)]"
            >
              <Sparkles
                className="h-3.5 w-3.5 shrink-0 text-[var(--kepler-navy)]"
                aria-hidden
              />
              Kepler AI
            </div>

            <p
              className={`mt-2 inline-flex rounded-[3px] border px-2 py-0.5 text-[11px] font-semibold ${toneClass(presentation.tone)}`}
            >
              {presentation.label}
            </p>

            <p
              className="mt-2 text-[13px] leading-snug text-[var(--kepler-ink)]"
              aria-live={presentation.isBusy || recoveryPending ? "polite" : undefined}
            >
              {presentation.message}
            </p>

            {latestEvidence ? (
              <p className="mt-2 text-[12px] text-[var(--kepler-muted)]">
                Latest evidence ·{" "}
                {latestEvidence.type === "photo" ? "Photo" : "Note"}
                {latestWhen ? ` · ${latestWhen}` : null}
              </p>
            ) : null}

            {recoveryError ? (
              <p
                className="mt-2 text-[12px] font-medium text-[var(--kepler-red)]"
                role="alert"
                aria-live="assertive"
              >
                {recoveryError}
              </p>
            ) : null}
          </div>

          <div className="flex w-full shrink-0 flex-col items-stretch gap-2 sm:w-auto sm:items-end">
            {recoveryAction && recoveryLabel ? (
              <button
                type="button"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-[4px] bg-[var(--kepler-navy)] px-3.5 text-[13px] font-semibold text-white outline-none transition-colors hover:bg-[#001a4d] focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                disabled={recoveryPending}
                aria-busy={recoveryPending}
                aria-label={
                  recoveryPending
                    ? recoveryBusyLabel(recoveryAction)
                    : recoveryLabel
                }
                onClick={() => {
                  void runRecovery(recoveryAction);
                }}
              >
                {recoveryPending
                  ? recoveryBusyLabel(recoveryAction)
                  : recoveryLabel}
              </button>
            ) : null}

            {showAddEvidence ? (
              <button
                type="button"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-[4px] bg-[var(--kepler-navy)] px-3.5 text-[13px] font-semibold text-white outline-none transition-colors hover:bg-[#001a4d] focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-2 sm:w-auto"
                onClick={onAddEvidence}
              >
                Add evidence
              </button>
            ) : null}

            {showViewAssessment ? (
              <button
                ref={viewAssessmentRef}
                type="button"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-[4px] border border-[var(--kepler-border)] bg-white px-3.5 text-[13px] font-semibold text-[var(--kepler-navy)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-2 sm:w-auto"
                aria-expanded={assessmentOpen}
                aria-haspopup="dialog"
                onClick={() => {
                  setAssessmentOpen(true);
                }}
              >
                View assessment
              </button>
            ) : null}

            {presentation.primaryAction === "review_escalation" ? (
              <p className="text-[12px] font-medium text-[var(--kepler-secondary)]">
                Review escalation
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <KeplerAssessmentSheet
        open={assessmentOpen}
        projectId={projectId}
        summaryId={showViewAssessment ? summaryId : null}
        isActualOwner={isActualOwner}
        deltaContext={deltaContext}
        evidence={evidence}
        returnFocusRef={viewAssessmentRef}
        onClose={() => {
          setAssessmentOpen(false);
        }}
      />
    </>
  );
}
