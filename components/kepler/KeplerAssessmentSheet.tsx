"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Sparkles } from "lucide-react";

import {
  getAgentSummary,
  peekCachedAgentSummary,
  type AgentSummary,
} from "@/lib/kepler/api/agentRuns";
import { ApiError } from "@/lib/kepler/api/client";
import type { EvidenceListItem } from "@/lib/kepler/api/evidence";
import {
  buildAssessmentSections,
  formatAssessmentDeltaHeader,
  matchEvidenceReviewed,
  summaryFetchErrorMessage,
} from "@/lib/kepler/agentSummaryPresentation";

export type KeplerAssessmentDeltaContext = {
  planItemLabel: string;
  plannedValue: number;
  actualValue: number;
  difference: number;
  percentDifference: number | null;
  unit: string;
};

type KeplerAssessmentSheetProps = {
  open: boolean;
  projectId: string;
  summaryId: string | null;
  isActualOwner: boolean;
  deltaContext: KeplerAssessmentDeltaContext | null;
  evidence: EvidenceListItem[] | null;
  returnFocusRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
};

export default function KeplerAssessmentSheet({
  open,
  projectId,
  summaryId,
  isActualOwner,
  deltaContext,
  evidence,
  returnFocusRef,
  onClose,
}: KeplerAssessmentSheetProps) {
  const titleId = useId();
  const descriptionId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  const [summary, setSummary] = useState<AgentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const sid = summaryId?.trim() ?? "";
    if (!open || !isActualOwner || !sid) {
      return;
    }

    const cached = peekCachedAgentSummary(projectId, sid);
    if (cached) {
      setSummary(cached);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loaded = await getAgentSummary(projectId, sid);
      setSummary(loaded);
    } catch (err: unknown) {
      setSummary(null);
      setError(summaryFetchErrorMessage(err));
      if (err instanceof ApiError && err.status === 404) {
        // Hidden-existence 404 — do not retry automatically.
      }
    } finally {
      setLoading(false);
    }
  }, [open, isActualOwner, projectId, summaryId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    void load();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      closeRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, load]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      return;
    }
    const node = returnFocusRef.current;
    if (node) {
      window.setTimeout(() => node.focus(), 0);
    }
  }, [open, returnFocusRef]);

  if (!open) {
    return null;
  }

  const sections = summary ? buildAssessmentSections(summary) : [];
  const reviewed = summary
    ? matchEvidenceReviewed(summary.sourceRefs.evidenceIds, evidence)
    : null;
  const canRetry = Boolean(error && error !== "Assessment is unavailable.");

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(16,24,40,0.28)]"
        aria-label="Dismiss Kepler assessment"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative flex h-full w-full max-w-[440px] flex-col border-l border-[var(--kepler-border)] bg-[var(--kepler-surface)] shadow-[-12px_0_40px_rgba(16,24,40,0.08)]"
      >
        <div className="border-b border-[var(--kepler-border)] px-5 py-4">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--kepler-muted)]">
            <Sparkles
              className="h-3.5 w-3.5 text-[var(--kepler-navy)]"
              aria-hidden
            />
            Kepler assessment
          </p>
          <h2
            id={titleId}
            className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-[var(--kepler-ink)]"
          >
            {deltaContext?.planItemLabel ?? "Field variance"}
          </h2>
          <p
            id={descriptionId}
            className="mt-1 text-[13px] text-[var(--kepler-secondary)]"
          >
            Completed
          </p>
        </div>

        {deltaContext ? (
          <div className="border-b border-[var(--kepler-border)] bg-[var(--kepler-background)] px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--kepler-muted)]">
              Delta
            </p>
            <p className="mt-1 text-[13px] leading-snug text-[var(--kepler-secondary)]">
              {formatAssessmentDeltaHeader(deltaContext)}
            </p>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <p className="text-[13px] text-[var(--kepler-secondary)]" aria-live="polite">
              Loading assessment…
            </p>
          ) : null}

          {error ? (
            <div role="alert">
              <p className="text-[13px] leading-snug text-[var(--kepler-secondary)]">
                {error}
              </p>
              {canRetry ? (
                <button
                  type="button"
                  className="mt-3 inline-flex min-h-10 items-center justify-center rounded-[4px] border border-[var(--kepler-border)] bg-white px-3.5 text-[13px] font-semibold text-[var(--kepler-navy)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-2"
                  onClick={() => {
                    void load();
                  }}
                >
                  Retry
                </button>
              ) : null}
            </div>
          ) : null}

          {!loading && !error && summary ? (
            <div className="max-w-[36rem] space-y-0">
              {sections.map((section) => (
                <section
                  key={section.id}
                  className="border-b border-[var(--kepler-border)] py-4 first:pt-0 last:border-b-0"
                >
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--kepler-muted)]">
                    {section.eyebrow}
                  </h3>
                  <p className="mt-2 break-words text-[14px] leading-relaxed text-[var(--kepler-ink)]">
                    {section.body}
                  </p>
                </section>
              ))}

              {reviewed && reviewed.matchedCount > 0 ? (
                <section className="border-b border-[var(--kepler-border)] py-4 last:border-b-0">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--kepler-muted)]">
                    Evidence reviewed
                  </h3>
                  <p className="mt-2 text-[13px] text-[var(--kepler-secondary)]">
                    {reviewed.matchedCount}{" "}
                    {reviewed.matchedCount === 1 ? "photo" : "photos"}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {reviewed.rows.map((row, index) => (
                      <li
                        key={`${row.kindLabel}-${index}`}
                        className="text-[13px] text-[var(--kepler-ink)]"
                      >
                        {row.kindLabel}
                        {row.whenLabel ? ` · ${row.whenLabel}` : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : reviewed &&
                reviewed.matchedCount === 0 &&
                reviewed.unmatchedCount > 0 ? (
                <section className="py-4">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--kepler-muted)]">
                    Evidence reviewed
                  </h3>
                  <p className="mt-2 text-[13px] text-[var(--kepler-secondary)]">
                    {reviewed.unmatchedCount}{" "}
                    {reviewed.unmatchedCount === 1 ? "item" : "items"}
                  </p>
                </section>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="border-t border-[var(--kepler-border)] px-5 py-4">
          <button
            ref={closeRef}
            type="button"
            className="inline-flex h-11 w-full items-center justify-center rounded-[4px] border border-[var(--kepler-border)] bg-white px-4 text-[14px] font-semibold text-[var(--kepler-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-2"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
