"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import type { PlanItem } from "@/lib/kepler/api/planItems";
import type { MeasurementReconcileResult } from "@/lib/kepler/api/measurements";
import {
  feetAndInchesToFeet,
  validateFeetInchesInput,
} from "@/lib/kepler/feetInches";
import { formatQuantity } from "@/lib/kepler/formatQuantity";
import { useOwnerFieldMeasurementMutation } from "@/lib/kepler/hooks/useOwnerFieldMeasurementMutation";

type MeasureFieldSheetProps = {
  open: boolean;
  projectId: string;
  planItem: PlanItem | null;
  onClose: () => void;
  onComplete: (summary: string) => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
};

type SuccessView = {
  title: string;
  detail: string;
  showFieldLink: boolean;
};

function successCopy(reconcile: MeasurementReconcileResult): SuccessView {
  if (reconcile.outcome === "created") {
    return {
      title: "Measurement recorded",
      detail: "Variance detected. Open Deltas to review the comparison.",
      showFieldLink: true,
    };
  }
  if (reconcile.outcome === "existing") {
    return {
      title: "Measurement recorded",
      detail: "Variance already available.",
      showFieldLink: true,
    };
  }
  return {
    title: "Measurement recorded",
    detail: "No variance detected.",
    showFieldLink: true,
  };
}

export default function MeasureFieldSheet({
  open,
  projectId,
  planItem,
  onClose,
  onComplete,
  returnFocusRef,
}: MeasureFieldSheetProps) {
  const titleId = useId();
  const descriptionId = useId();
  const feetId = useId();
  const inchesId = useId();
  const errorId = useId();

  const panelRef = useRef<HTMLDivElement>(null);
  const feetInputRef = useRef<HTMLInputElement>(null);
  const { recordAndReconcile, retryReconcile } =
    useOwnerFieldMeasurementMutation();

  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessView | null>(null);
  const [partialMeasurementId, setPartialMeasurementId] = useState<
    string | null
  >(null);
  const [partialMessage, setPartialMessage] = useState<string | null>(null);
  const [canRetryAnalysis, setCanRetryAnalysis] = useState(false);

  const resetForm = useCallback(() => {
    setFeet("");
    setInches("");
    setSubmitting(false);
    setError(null);
    setSuccess(null);
    setPartialMeasurementId(null);
    setPartialMessage(null);
    setCanRetryAnalysis(false);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    resetForm();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      feetInputRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, planItem?.id, resetForm]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, submitting]);

  useEffect(() => {
    if (open) {
      return;
    }

    const trigger = returnFocusRef.current;
    if (trigger) {
      window.setTimeout(() => trigger.focus(), 0);
    }
  }, [open, returnFocusRef]);

  if (!open || !planItem) {
    return null;
  }

  const previewFeet = Number(feet || 0);
  const previewInches = Number(inches || 0);
  const previewValue =
    Number.isFinite(previewFeet) && Number.isFinite(previewInches)
      ? feetAndInchesToFeet(previewFeet, previewInches)
      : 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting || success || !planItem) {
      return;
    }

    const selected = planItem;
    const validated = validateFeetInchesInput(feet, inches);
    if (!validated.ok) {
      setError(validated.message);
      return;
    }

    setSubmitting(true);
    setError(null);
    setPartialMeasurementId(null);
    setPartialMessage(null);

    const result = await recordAndReconcile({
      planItem: selected,
      value: validated.value,
    });

    if (result.status === "measurement_failed") {
      setError(result.message);
      setSubmitting(false);
      return;
    }

    if (result.status === "reconcile_failed") {
      setPartialMeasurementId(result.measurement.id);
      setPartialMessage(result.message);
      setCanRetryAnalysis(result.canRetryAnalysis);
      setSubmitting(false);
      onComplete("Measurement recorded. Variance analysis could not complete.");
      return;
    }

    const copy = successCopy(result.reconcile);
    setSuccess(copy);
    setSubmitting(false);
    onComplete(`${copy.title}. ${copy.detail}`);
  }

  async function handleRetryAnalysis() {
    if (!partialMeasurementId || submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await retryReconcile(partialMeasurementId);

    if (result.status === "reconcile_failed") {
      setPartialMessage(result.message);
      setCanRetryAnalysis(result.canRetryAnalysis);
      setSubmitting(false);
      return;
    }

    const copy = successCopy(result.reconcile);
    setPartialMeasurementId(null);
    setPartialMessage(null);
    setSuccess(copy);
    setSubmitting(false);
    onComplete(`${copy.title}. ${copy.detail}`);
  }

  const showPartial = Boolean(partialMeasurementId && !success);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(16,24,40,0.28)]"
        aria-label="Dismiss measurement sheet"
        disabled={submitting}
        onClick={() => {
          if (!submitting) onClose();
        }}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative flex h-full w-full max-w-[420px] flex-col border-l border-[var(--kepler-border)] bg-[var(--kepler-surface)] shadow-[-12px_0_40px_rgba(16,24,40,0.08)]"
      >
        <div className="border-b border-[var(--kepler-border)] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--kepler-muted)]">
            Field measurement
          </p>
          <h2
            id={titleId}
            className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-[var(--kepler-ink)]"
          >
            Measure field condition
          </h2>
          <p
            id={descriptionId}
            className="mt-1 text-[13px] leading-snug text-[var(--kepler-secondary)]"
          >
            Record length against this plan quantity. Variance is calculated
            on the server.
          </p>
        </div>

        <div className="border-b border-[var(--kepler-border)] bg-[var(--kepler-background)] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--kepler-muted)]">
            Plan item
          </p>
          <p className="mt-1 text-[15px] font-semibold leading-snug text-[var(--kepler-ink)]">
            {planItem.label}
          </p>
          <p className="mt-1 text-[13px] text-[var(--kepler-secondary)]">
            Planned {formatQuantity(planItem.plannedValue)} {planItem.unit}
          </p>
        </div>

        {success ? (
          <div className="flex flex-1 flex-col px-5 py-6">
            <p
              className="text-[15px] font-semibold text-[var(--kepler-navy)]"
              role="status"
            >
              {success.title}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--kepler-secondary)]">
              {success.detail}
            </p>
            <div className="mt-auto flex flex-col gap-2 pb-2">
              {success.showFieldLink ? (
                <Link
                  href={`/projects/${encodeURIComponent(projectId)}/field`}
                  className="inline-flex h-11 items-center justify-center rounded-[4px] bg-[var(--kepler-navy)] px-4 text-[14px] font-semibold text-white outline-none transition-colors hover:bg-[#001a4d] focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-2"
                  onClick={onClose}
                >
                  View in Field
                </Link>
              ) : null}
              <Link
                href={`/projects/${encodeURIComponent(projectId)}/deltas`}
                className="inline-flex h-11 items-center justify-center rounded-[4px] border border-[var(--kepler-border)] bg-white px-4 text-[14px] font-semibold text-[var(--kepler-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-2"
                onClick={onClose}
              >
                View Deltas
              </Link>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-[4px] border border-[var(--kepler-border)] bg-white px-4 text-[14px] font-semibold text-[var(--kepler-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-2"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        ) : showPartial ? (
          <div className="flex flex-1 flex-col px-5 py-6">
            <p
              className="text-[15px] font-semibold text-[var(--kepler-navy)]"
              role="status"
            >
              Measurement recorded
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--kepler-secondary)]">
              {partialMessage ?? "Variance analysis could not complete."}
            </p>
            <div className="mt-auto flex flex-col gap-2 pb-2">
              {canRetryAnalysis ? (
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-[4px] bg-[var(--kepler-navy)] px-4 text-[14px] font-semibold text-white outline-none transition-colors hover:bg-[#001a4d] focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-2 disabled:opacity-70"
                  disabled={submitting}
                  aria-busy={submitting}
                  onClick={() => {
                    void handleRetryAnalysis();
                  }}
                >
                  {submitting ? "Retrying…" : "Retry analysis"}
                </button>
              ) : null}
              <Link
                href={`/projects/${encodeURIComponent(projectId)}/field`}
                className="inline-flex h-11 items-center justify-center rounded-[4px] border border-[var(--kepler-border)] bg-white px-4 text-[14px] font-semibold text-[var(--kepler-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-2"
                onClick={onClose}
              >
                View in Field
              </Link>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-[4px] border border-[var(--kepler-border)] bg-white px-4 text-[14px] font-semibold text-[var(--kepler-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-2"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form
            className="flex flex-1 flex-col"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="flex-1 space-y-5 px-5 py-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={feetId}
                    className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--kepler-muted)]"
                  >
                    Feet
                  </label>
                  <input
                    ref={feetInputRef}
                    id={feetId}
                    name="feet"
                    inputMode="numeric"
                    autoComplete="off"
                    value={feet}
                    disabled={submitting}
                    onChange={(event) => {
                      setFeet(event.target.value);
                      if (error) setError(null);
                    }}
                    className="mt-2 h-11 w-full rounded-[4px] border border-[var(--kepler-border)] bg-white px-3 text-[16px] font-medium tabular-nums text-[var(--kepler-ink)] outline-none focus:border-[var(--kepler-navy)] focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)]/25 disabled:opacity-60"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                  />
                </div>
                <div>
                  <label
                    htmlFor={inchesId}
                    className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--kepler-muted)]"
                  >
                    Inches
                  </label>
                  <input
                    id={inchesId}
                    name="inches"
                    inputMode="numeric"
                    autoComplete="off"
                    value={inches}
                    disabled={submitting}
                    onChange={(event) => {
                      setInches(event.target.value);
                      if (error) setError(null);
                    }}
                    className="mt-2 h-11 w-full rounded-[4px] border border-[var(--kepler-border)] bg-white px-3 text-[16px] font-medium tabular-nums text-[var(--kepler-ink)] outline-none focus:border-[var(--kepler-navy)] focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)]/25 disabled:opacity-60"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                  />
                </div>
              </div>

              <div className="border-t border-[var(--kepler-border)] pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--kepler-muted)]">
                  Normalized length
                </p>
                <p className="mt-1 text-[22px] font-semibold tabular-nums tracking-[-0.02em] text-[var(--kepler-ink)]">
                  {formatQuantity(previewValue, 4)}{" "}
                  <span className="text-[14px] font-medium text-[var(--kepler-secondary)]">
                    {planItem.unit}
                  </span>
                </p>
                <p className="mt-1 text-[12px] text-[var(--kepler-muted)]">
                  Submitted value keeps full precision; display may round.
                </p>
              </div>

              {error ? (
                <p
                  id={errorId}
                  role="alert"
                  className="border border-[var(--kepler-red)]/25 bg-[var(--kepler-red)]/[0.04] px-3 py-2 text-[13px] leading-snug text-[var(--kepler-red)]"
                >
                  {error}
                </p>
              ) : null}
            </div>

            <div className="flex gap-2 border-t border-[var(--kepler-border)] px-5 py-4">
              <button
                type="button"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-[4px] border border-[var(--kepler-border)] bg-white px-4 text-[14px] font-semibold text-[var(--kepler-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-2 disabled:opacity-50"
                disabled={submitting}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex h-11 flex-[1.4] items-center justify-center rounded-[4px] bg-[var(--kepler-navy)] px-4 text-[14px] font-semibold text-white outline-none transition-colors hover:bg-[#001a4d] focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting ? "Recording…" : "Record measurement"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
