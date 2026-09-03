"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import type { Delta } from "@/lib/kepler/api/deltas";
import { createLocalEvidenceId } from "@/lib/kepler/api/evidence";
import {
  formatSignedPercent1,
  formatSignedQuantity,
} from "@/lib/kepler/formatQuantity";
import {
  formatEvidenceFileSize,
  uploadDeltaLinkedPhotoEvidence,
  validateDeltaEvidencePhotoFile,
  type DeltaEvidenceUploadPhase,
} from "@/lib/kepler/uploadDeltaEvidence";

type AddDeltaEvidenceSheetProps = {
  open: boolean;
  projectId: string;
  delta: Delta | null;
  planItemLabel: string | null;
  onClose: () => void;
  onComplete: (message: string) => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
};

export default function AddDeltaEvidenceSheet({
  open,
  projectId,
  delta,
  planItemLabel,
  onClose,
  onComplete,
  returnFocusRef,
}: AddDeltaEvidenceSheetProps) {
  const titleId = useId();
  const descriptionId = useId();
  const fileInputId = useId();
  const errorId = useId();

  const panelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<DeltaEvidenceUploadPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [localEvidenceId, setLocalEvidenceId] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [uploadedObject, setUploadedObject] = useState<{
    objectPath: string;
    contentType: string;
  } | null>(null);

  const submitting = phase !== "idle";

  const resetForm = useCallback(() => {
    setFile(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPhase("idle");
    setError(null);
    setLocalEvidenceId(null);
    setCreatedAt(null);
    setUploadedObject(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    resetForm();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      fileInputRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, delta?.id, resetForm]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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
    const node = returnFocusRef.current;
    if (node) {
      window.setTimeout(() => node.focus(), 0);
    }
  }, [open, returnFocusRef]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    setError(null);
    setUploadedObject(null);
    setLocalEvidenceId(null);
    setCreatedAt(null);

    if (!next) {
      setFile(null);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }

    const validation = validateDeltaEvidencePhotoFile(next);
    if (!validation.ok) {
      setFile(null);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setError(validation.message);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setFile(next);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(next);
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!delta || submitting) {
      return;
    }

    const validation = validateDeltaEvidencePhotoFile(file);
    if (!validation.ok || !file) {
      setError(validation.ok ? "Select a photo to continue." : validation.message);
      return;
    }

    setError(null);

    const attemptId = localEvidenceId ?? createLocalEvidenceId();
    const attemptCreatedAt = createdAt ?? new Date().toISOString();
    setLocalEvidenceId(attemptId);
    setCreatedAt(attemptCreatedAt);

    try {
      const outcome = await uploadDeltaLinkedPhotoEvidence({
        projectId,
        localDeltaId: delta.localDeltaId,
        file,
        localEvidenceId: attemptId,
        committedObject: uploadedObject,
        createdAt: attemptCreatedAt,
        onPhase: setPhase,
        onPutSuccess: (uploaded) => {
          setUploadedObject(uploaded);
        },
      });

      setUploadedObject(outcome.uploadedObject);
      setPhase("idle");

      const message = outcome.result.created
        ? "Evidence uploaded. Kepler will evaluate it."
        : "Evidence already saved. Kepler will evaluate it.";
      onComplete(message);
      onClose();
    } catch (err) {
      setPhase("idle");
      setError(
        err instanceof Error ? err.message : "Unable to upload evidence.",
      );
    }
  }

  if (!open || !delta) {
    return null;
  }

  const itemLabel =
    planItemLabel?.trim() ||
    `${delta.planItemId.slice(0, 12)}…`;
  const varianceLabel = `${formatSignedQuantity(delta.difference)} ${delta.unit} (${formatSignedPercent1(delta.percentDifference)})`;

  const primaryLabel =
    phase === "preparing"
      ? "Preparing…"
      : phase === "uploading"
        ? "Uploading…"
        : phase === "committing"
          ? "Saving…"
          : uploadedObject
            ? "Retry save"
            : "Upload evidence";

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(16,24,40,0.28)]"
        aria-label="Dismiss evidence sheet"
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
            Evidence
          </p>
          <h2
            id={titleId}
            className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-[var(--kepler-ink)]"
          >
            Add evidence
          </h2>
          <p
            id={descriptionId}
            className="mt-1 text-[13px] leading-snug text-[var(--kepler-secondary)]"
          >
            Attach one photo documenting this variance. Kepler evaluates it
            automatically.
          </p>
        </div>

        <div className="border-b border-[var(--kepler-border)] bg-[var(--kepler-background)] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--kepler-muted)]">
            Delta
          </p>
          <p className="mt-1 text-[15px] font-semibold leading-snug text-[var(--kepler-ink)]">
            {itemLabel}
          </p>
          <p className="mt-1 text-[13px] text-[var(--kepler-secondary)]">
            Variance {varianceLabel}
          </p>
        </div>

        <form className="flex flex-1 flex-col" onSubmit={handleSubmit} noValidate>
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <div>
              <label
                htmlFor={fileInputId}
                className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--kepler-muted)]"
              >
                Photo
              </label>
              <input
                ref={fileInputRef}
                id={fileInputId}
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                disabled={submitting}
                onChange={handleFileChange}
                className="mt-2 block w-full text-[13px] text-[var(--kepler-secondary)] file:mr-3 file:rounded-[4px] file:border file:border-[var(--kepler-border)] file:bg-white file:px-3 file:py-2 file:text-[13px] file:font-semibold file:text-[var(--kepler-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)]/25 disabled:opacity-60"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
              />
              <p className="mt-2 text-[12px] text-[var(--kepler-muted)]">
                JPEG, PNG, or WebP. One photo. Max 8 MB.
              </p>
            </div>

            {file ? (
              <div className="border border-[var(--kepler-border)] bg-white p-3">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt={`Selected photo preview: ${file.name}`}
                    className="mb-3 max-h-48 w-full object-contain bg-[var(--kepler-background)]"
                  />
                ) : null}
                <p className="truncate text-[13px] font-medium text-[var(--kepler-ink)]">
                  {file.name}
                </p>
                <p className="mt-0.5 text-[12px] text-[var(--kepler-muted)]">
                  {formatEvidenceFileSize(file.size)}
                </p>
              </div>
            ) : null}

            {error ? (
              <p
                id={errorId}
                role="alert"
                className="text-[13px] leading-snug text-[var(--kepler-red)]"
              >
                {error}
              </p>
            ) : null}

            {uploadedObject && !submitting ? (
              <p className="text-[12px] leading-snug text-[var(--kepler-secondary)]">
                Photo bytes were uploaded. Retry save to finish without
                re-uploading.
              </p>
            ) : null}
          </div>

          <div className="mt-auto flex flex-col gap-2 border-t border-[var(--kepler-border)] px-5 py-4">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-[4px] bg-[var(--kepler-navy)] px-4 text-[14px] font-semibold text-white outline-none transition-colors hover:bg-[#001a4d] focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-2 disabled:opacity-70"
              disabled={submitting || !file}
              aria-busy={submitting}
            >
              {primaryLabel}
            </button>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-[4px] border border-[var(--kepler-border)] bg-white px-4 text-[14px] font-semibold text-[var(--kepler-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-2 disabled:opacity-70"
              disabled={submitting}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
