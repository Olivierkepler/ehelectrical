"use client";

import {
  Activity,
  Bot,
  ClipboardCheck,
  FilePenLine,
  GitCompareArrows,
  Ruler,
  UserMinus,
  UserPlus,
} from "lucide-react";

import WorkspaceSectionHeader from "@/components/kepler/WorkspaceSectionHeader";
import WorkspaceSectionState from "@/components/kepler/WorkspaceSectionState";
import { formatActivityEventLabel } from "@/lib/kepler/api/activity";
import { useProjectActivity } from "@/lib/kepler/hooks/useProjectActivity";
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

function EventIcon({ type }: { type: string }) {
  const className = "text-[var(--kepler-muted)]";
  const props = { size: 14, strokeWidth: 1.7, className, "aria-hidden": true as const };

  if (type.startsWith("measurement_")) return <Ruler {...props} />;
  if (type.startsWith("delta_")) return <GitCompareArrows {...props} />;
  if (type.startsWith("assignment_")) return <ClipboardCheck {...props} />;
  if (type.startsWith("agent_")) return <Bot {...props} />;
  if (type === "invitation_created" || type === "invitation_accepted") {
    return <UserPlus {...props} />;
  }
  if (type === "member_removed") return <UserMinus {...props} />;
  if (type.startsWith("feed_post_")) return <FilePenLine {...props} />;
  return <Activity {...props} />;
}

export default function ProjectActivityPage() {
  const { unavailable, loading: workspaceLoading } = useProjectWorkspace();
  const {
    data,
    loading,
    loadingMore,
    error,
    nextCursor,
    refresh,
    loadMore,
  } = useProjectActivity();

  if (unavailable || workspaceLoading) {
    return null;
  }

  return (
    <section aria-labelledby="activity-heading">
      <WorkspaceSectionHeader
        eyebrow="Activity"
        title="Operational timeline"
        count={data.length > 0 ? data.length : null}
        countLabel={data.length === 1 ? "event" : "events"}
      />
      <h2 id="activity-heading" className="sr-only">
        Operational timeline
      </h2>

      <WorkspaceSectionState
        loading={loading}
        error={error && data.length === 0 ? error : null}
        onRetry={refresh}
        empty={!loading && !error && data.length === 0}
        emptyTitle="No project activity yet"
        resourceLabel="activity"
        skeleton="timeline"
        skeletonRows={7}
      >
        {data.length > 0 ? (
          <>
            <ol className="border-t border-[var(--kepler-border)]">
              {data.map((event) => (
                <li
                  key={event.id}
                  className="flex items-start gap-3 border-b border-[var(--kepler-border)] py-3"
                >
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center">
                    <EventIcon type={event.type} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium leading-snug text-[var(--kepler-ink)]">
                      {formatActivityEventLabel(event.type)}
                    </p>
                    <p className="mt-0.5 text-[12px] capitalize text-[var(--kepler-muted)]">
                      {event.actorType}
                    </p>
                  </div>
                  <time
                    dateTime={event.createdAt}
                    className="shrink-0 pt-0.5 text-[12px] text-[var(--kepler-muted)]"
                  >
                    {formatTimestamp(event.createdAt)}
                  </time>
                </li>
              ))}
            </ol>

            {error ? (
              <p className="mt-3 text-[13px] text-[var(--kepler-secondary)]">
                Unable to load more activity
              </p>
            ) : null}

            {nextCursor ? (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="
                    inline-flex
                    h-10
                    items-center
                    rounded-[5px]
                    border
                    border-[var(--kepler-border)]
                    px-3.5
                    text-[13px]
                    font-semibold
                    text-[var(--kepler-navy)]
                    outline-none
                    hover:bg-black/[0.02]
                    focus-visible:ring-2
                    focus-visible:ring-[var(--kepler-navy)]/30
                    disabled:opacity-60
                  "
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </WorkspaceSectionState>
    </section>
  );
}
