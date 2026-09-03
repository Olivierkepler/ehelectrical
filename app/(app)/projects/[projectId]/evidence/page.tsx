"use client";

import { useState } from "react";
import Image from "next/image";
import { FileText, Image as ImageIcon } from "lucide-react";

import WorkspaceSectionHeader from "@/components/kepler/WorkspaceSectionHeader";
import WorkspaceSectionState from "@/components/kepler/WorkspaceSectionState";
import {
  getEvidenceReadUrl,
  type EvidenceListItem,
} from "@/lib/kepler/api/evidence";
import { useProjectEvidence } from "@/lib/kepler/hooks/useProjectEvidence";
import { useProjectWorkspace } from "@/lib/kepler/hooks/useProjectWorkspace";

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function associationLabel(item: EvidenceListItem): string {
  if (item.localMeasurementId) {
    return "Measurement";
  }
  if (item.localDeltaId) {
    return "Delta";
  }
  return "Unlinked";
}

function EvidencePhotoPreview({
  projectId,
  item,
}: {
  projectId: string;
  item: EvidenceListItem;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [imageBroken, setImageBroken] = useState(false);

  const canPreview = item.type === "photo" && Boolean(item.objectPath);

  async function loadPreview() {
    if (!canPreview || loading) {
      return;
    }
    if (url && !imageBroken) {
      setUrl(null);
      return;
    }
    setLoading(true);
    setFailed(false);
    setImageBroken(false);
    try {
      const result = await getEvidenceReadUrl(projectId, item.id);
      setUrl(result.readUrl);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  const previewLabel = loading
    ? "Loading…"
    : failed || imageBroken
      ? "Preview unavailable"
      : url
        ? "Hide preview"
        : "View preview";

  if (!canPreview) {
    return (
      <div className="grid h-[52px] w-[72px] shrink-0 place-items-center rounded-[4px] border border-[var(--kepler-border)] bg-black/[0.02] text-[var(--kepler-muted)]">
        <ImageIcon size={16} strokeWidth={1.6} aria-hidden="true" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={loadPreview}
      disabled={loading}
      aria-label={previewLabel}
      className="
        relative
        grid
        h-[52px]
        w-[72px]
        shrink-0
        place-items-center
        overflow-hidden
        rounded-[4px]
        border
        border-[var(--kepler-border)]
        bg-black/[0.02]
        text-[var(--kepler-navy)]
        outline-none
        hover:bg-black/[0.03]
        focus-visible:ring-2
        focus-visible:ring-[var(--kepler-navy)]/30
        disabled:opacity-60
      "
    >
      {url && !imageBroken ? (
        <Image
          src={url}
          alt=""
          width={144}
          height={104}
          className="h-full w-full object-cover"
          unoptimized
          onError={() => setImageBroken(true)}
        />
      ) : loading ? (
        <span className="text-[10px] font-medium text-[var(--kepler-muted)]">
          …
        </span>
      ) : (
        <ImageIcon size={16} strokeWidth={1.6} aria-hidden="true" />
      )}
    </button>
  );
}

export default function ProjectEvidencePage() {
  const { projectId, unavailable, loading: workspaceLoading } =
    useProjectWorkspace();
  const { data, loading, error, refresh } = useProjectEvidence();

  if (unavailable || workspaceLoading) {
    return null;
  }

  return (
    <section aria-labelledby="evidence-heading">
      <WorkspaceSectionHeader
        eyebrow="Evidence"
        title="Project evidence"
        count={data && data.length > 0 ? data.length : null}
        countLabel={data?.length === 1 ? "record" : "records"}
      />
      <h2 id="evidence-heading" className="sr-only">
        Project evidence
      </h2>

      <WorkspaceSectionState
        loading={loading}
        error={error}
        onRetry={refresh}
        empty={!loading && !error && data !== null && data.length === 0}
        emptyTitle="No evidence yet"
        resourceLabel="evidence"
        skeleton="media"
        skeletonRows={6}
      >
        {data && data.length > 0 ? (
          <ul className="border-t border-[var(--kepler-border)]">
            {data.map((item) => {
              const isPhoto = item.type === "photo";
              return (
                <li
                  key={item.id}
                  className="flex items-start gap-3 border-b border-[var(--kepler-border)] py-2.5"
                >
                  {isPhoto ? (
                    <EvidencePhotoPreview projectId={projectId} item={item} />
                  ) : (
                    <div className="grid h-[52px] w-[72px] shrink-0 place-items-center rounded-[4px] bg-black/[0.03] text-[var(--kepler-muted)]">
                      <FileText size={16} strokeWidth={1.6} aria-hidden="true" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--kepler-ink)]">
                        {item.type}
                      </p>
                      <span className="text-[12px] text-[var(--kepler-muted)]">
                        {associationLabel(item)}
                      </span>
                    </div>
                    {item.note.trim() ? (
                      <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-[var(--kepler-secondary)]">
                        {item.note}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[12px] text-[var(--kepler-muted)]">
                      {formatTimestamp(item.createdAt)}
                      {isPhoto && item.objectPath ? (
                        <span className="ml-2 text-[var(--kepler-navy)]">
                          View preview
                        </span>
                      ) : null}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </WorkspaceSectionState>
    </section>
  );
}
