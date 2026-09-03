"use client";

import WorkspaceSectionHeader from "@/components/kepler/WorkspaceSectionHeader";
import WorkspaceSectionState from "@/components/kepler/WorkspaceSectionState";
import {
  effectiveMeasurementReviewStatus,
  formatMeasurementReviewLabel,
  type MeasurementReviewStatus,
} from "@/lib/kepler/api/measurements";
import { formatPlanItemTypeLabel } from "@/lib/kepler/api/planItems";
import { formatQuantity } from "@/lib/kepler/formatQuantity";
import { useProjectMeasurements } from "@/lib/kepler/hooks/useProjectMeasurements";
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

function reviewClass(status: MeasurementReviewStatus): string {
  switch (status) {
    case "pending":
      return "border-[var(--kepler-navy)]/20 bg-[var(--kepler-navy)]/[0.05] text-[var(--kepler-navy)]";
    case "rejected":
      return "border-[var(--kepler-red)]/25 text-[var(--kepler-red)]";
    default:
      return "border-[var(--kepler-border)] text-[var(--kepler-secondary)]";
  }
}

export default function ProjectFieldPage() {
  const { unavailable, loading: workspaceLoading } = useProjectWorkspace();
  const { data, loading, error, refresh } = useProjectMeasurements();

  if (unavailable || workspaceLoading) {
    return null;
  }

  return (
    <section aria-labelledby="field-heading">
      <WorkspaceSectionHeader
        eyebrow="Field"
        title="Field measurements"
        count={data && data.length > 0 ? data.length : null}
        countLabel={data?.length === 1 ? "record" : "records"}
      />
      <h2 id="field-heading" className="sr-only">
        Field measurements
      </h2>

      <WorkspaceSectionState
        loading={loading}
        error={error}
        onRetry={refresh}
        empty={!loading && !error && data !== null && data.length === 0}
        emptyTitle="No field measurements yet"
        resourceLabel="measurements"
        skeleton="table"
        skeletonRows={7}
      >
        {data && data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-t border-[var(--kepler-border)] text-left text-[13px]">
              <thead>
                <tr className="border-b border-[var(--kepler-border)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--kepler-muted)]">
                  <th className="py-2.5 pr-4 font-semibold">Measurement</th>
                  <th className="py-2.5 pr-4 text-right font-semibold">
                    Value
                  </th>
                  <th className="py-2.5 pr-4 font-semibold">Review</th>
                  <th className="py-2.5 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => {
                  const review = effectiveMeasurementReviewStatus(item);
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-[var(--kepler-border)] transition-colors hover:bg-black/[0.018]"
                    >
                      <td className="max-w-[300px] py-3 pr-4">
                        <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-[var(--kepler-ink)]">
                          {item.label}
                        </p>
                        <p className="mt-0.5 text-[12px] text-[var(--kepler-muted)]">
                          {formatPlanItemTypeLabel(item.type)}
                        </p>
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4 text-right">
                        <span className="tabular-nums text-[14px] font-semibold text-[var(--kepler-ink)]">
                          {formatQuantity(item.value)}
                        </span>
                        <span className="ml-1 text-[12px] text-[var(--kepler-secondary)]">
                          {item.unit}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex rounded-[3px] border px-2 py-0.5 text-[11px] font-medium ${reviewClass(review)}`}
                        >
                          {formatMeasurementReviewLabel(review)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-3 text-[12px] text-[var(--kepler-muted)]">
                        {formatTimestamp(item.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </WorkspaceSectionState>
    </section>
  );
}
