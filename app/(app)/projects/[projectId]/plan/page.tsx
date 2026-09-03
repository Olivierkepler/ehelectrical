"use client";

import { useMemo, useRef, useState } from "react";

import MeasureFieldSheet from "@/components/kepler/MeasureFieldSheet";
import WorkspaceSectionHeader from "@/components/kepler/WorkspaceSectionHeader";
import WorkspaceSectionState from "@/components/kepler/WorkspaceSectionState";
import {
  formatPlanItemOriginLabel,
  formatPlanItemTypeLabel,
  type PlanItem,
} from "@/lib/kepler/api/planItems";
import { useAuth } from "@/lib/kepler/AuthProvider";
import { isLengthFeetPlanItem } from "@/lib/kepler/feetInches";
import { formatQuantity } from "@/lib/kepler/formatQuantity";
import { useProjectPlanItems } from "@/lib/kepler/hooks/useProjectPlanItems";
import { useProjectWorkspace } from "@/lib/kepler/hooks/useProjectWorkspace";

export default function ProjectPlanPage() {
  const { user } = useAuth();
  const {
    projectId,
    project,
    unavailable,
    loading: workspaceLoading,
  } = useProjectWorkspace();
  const { data, loading, error, refresh } = useProjectPlanItems();

  const [measureItem, setMeasureItem] = useState<PlanItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const measureTriggerRef = useRef<HTMLElement | null>(null);

  const isActualOwner = Boolean(
    user?.uid && project?.ownerUid && user.uid === project.ownerUid,
  );

  const showMeasureActions = useMemo(() => {
    if (!isActualOwner || !data) {
      return false;
    }
    return data.some(isLengthFeetPlanItem);
  }, [isActualOwner, data]);

  if (unavailable || workspaceLoading) {
    return null;
  }

  return (
    <section aria-labelledby="plan-heading">
      <WorkspaceSectionHeader
        eyebrow="Plan"
        title="Project plan"
        count={data && data.length > 0 ? data.length : null}
        countLabel={data?.length === 1 ? "item" : "items"}
      />
      <h2 id="plan-heading" className="sr-only">
        Project plan
      </h2>

      {successNotice ? (
        <p
          role="status"
          className="mb-4 border border-[var(--kepler-navy)]/20 bg-[var(--kepler-navy)]/[0.04] px-3 py-2 text-[13px] text-[var(--kepler-navy)]"
        >
          {successNotice}
        </p>
      ) : null}

      <WorkspaceSectionState
        loading={loading}
        error={error}
        onRetry={refresh}
        empty={!loading && !error && data !== null && data.length === 0}
        emptyTitle="No plan items yet"
        resourceLabel="plan items"
        skeleton="table"
        skeletonRows={8}
      >
        {data && data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-t border-[var(--kepler-border)] text-left text-[13px]">
              <thead>
                <tr className="border-b border-[var(--kepler-border)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--kepler-muted)]">
                  <th className="py-2.5 pr-4 font-semibold">Item</th>
                  <th className="py-2.5 pr-4 font-semibold">Type</th>
                  <th className="py-2.5 pr-4 text-right font-semibold">
                    Planned
                  </th>
                  <th className="py-2.5 pr-4 font-semibold">Unit</th>
                  <th
                    className={`py-2.5 font-semibold ${showMeasureActions ? "pr-4" : ""}`}
                  >
                    Origin
                  </th>
                  {showMeasureActions ? (
                    <th className="py-2.5 text-right font-semibold">Action</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {data.map((item) => {
                  const canMeasure =
                    showMeasureActions && isLengthFeetPlanItem(item);

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-[var(--kepler-border)] transition-colors hover:bg-black/[0.018]"
                    >
                      <td className="max-w-[280px] py-3 pr-4 text-[14px] font-semibold leading-snug text-[var(--kepler-ink)]">
                        <span className="line-clamp-2">{item.label}</span>
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4 text-[var(--kepler-secondary)]">
                        {formatPlanItemTypeLabel(item.type)}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums text-[var(--kepler-ink)]">
                        {formatQuantity(item.plannedValue)}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4 text-[var(--kepler-secondary)]">
                        {item.unit}
                      </td>
                      <td
                        className={`whitespace-nowrap py-3 text-[var(--kepler-muted)] ${showMeasureActions ? "pr-4" : ""}`}
                      >
                        {item.origin
                          ? formatPlanItemOriginLabel(item.origin)
                          : "—"}
                      </td>
                      {showMeasureActions ? (
                        <td className="whitespace-nowrap py-3 text-right">
                          {canMeasure ? (
                            <button
                              type="button"
                              className="rounded-[3px] px-2 py-1 text-[12px] font-semibold text-[var(--kepler-navy)] outline-none hover:bg-[var(--kepler-navy)]/[0.06] focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-1"
                              aria-label={`Measure against ${item.label}`}
                              onClick={(event) => {
                                measureTriggerRef.current = event.currentTarget;
                                setMeasureItem(item);
                                setSheetOpen(true);
                                setSuccessNotice(null);
                              }}
                            >
                              Measure
                            </button>
                          ) : (
                            <span className="sr-only">No action</span>
                          )}
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </WorkspaceSectionState>

      <MeasureFieldSheet
        open={sheetOpen}
        projectId={projectId}
        planItem={measureItem}
        returnFocusRef={measureTriggerRef}
        onClose={() => {
          setSheetOpen(false);
          setMeasureItem(null);
        }}
        onComplete={(summary) => {
          setSuccessNotice(summary);
        }}
      />
    </section>
  );
}
