"use client";

type SkeletonKind = "table" | "timeline" | "media" | "rows" | "roster";

type SectionStateProps = {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  empty?: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  resourceLabel: string;
  skeleton?: SkeletonKind;
  skeletonRows?: number;
  children: React.ReactNode;
};

function TableSkeleton({ rows }: { rows: number }) {
  return (
    <div className="overflow-hidden border-t border-[var(--kepler-border)]">
      <div className="flex gap-4 border-b border-[var(--kepler-border)] py-2.5">
        <div className="h-3 w-28 animate-pulse rounded-[3px] bg-black/[0.05]" />
        <div className="h-3 w-16 animate-pulse rounded-[3px] bg-black/[0.05]" />
        <div className="ml-auto h-3 w-20 animate-pulse rounded-[3px] bg-black/[0.05]" />
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-[var(--kepler-border)] py-3.5"
        >
          <div className="h-3.5 w-[42%] animate-pulse rounded-[3px] bg-black/[0.045]" />
          <div className="h-3 w-16 animate-pulse rounded-[3px] bg-black/[0.04]" />
          <div className="ml-auto h-3.5 w-14 animate-pulse rounded-[3px] bg-black/[0.045]" />
        </div>
      ))}
    </div>
  );
}

function TimelineSkeleton({ rows }: { rows: number }) {
  return (
    <div className="border-t border-[var(--kepler-border)]">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-3 border-b border-[var(--kepler-border)] py-3.5"
        >
          <div className="mt-0.5 h-6 w-6 shrink-0 animate-pulse rounded-[4px] bg-black/[0.045]" />
          <div className="min-w-0 flex-1">
            <div className="h-3.5 w-40 animate-pulse rounded-[3px] bg-black/[0.05]" />
            <div className="mt-2 h-3 w-24 animate-pulse rounded-[3px] bg-black/[0.04]" />
          </div>
          <div className="h-3 w-28 shrink-0 animate-pulse rounded-[3px] bg-black/[0.04]" />
        </div>
      ))}
    </div>
  );
}

function MediaSkeleton({ rows }: { rows: number }) {
  return (
    <div className="border-t border-[var(--kepler-border)]">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-3.5 border-b border-[var(--kepler-border)] py-3.5"
        >
          <div className="h-[52px] w-[72px] shrink-0 animate-pulse rounded-[4px] bg-black/[0.05]" />
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="h-3.5 w-24 animate-pulse rounded-[3px] bg-black/[0.05]" />
            <div className="mt-2 h-3 w-48 animate-pulse rounded-[3px] bg-black/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RowsSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-12 animate-pulse rounded-[4px] bg-black/[0.04]"
        />
      ))}
    </div>
  );
}

function RosterSkeleton({ rows }: { rows: number }) {
  return (
    <div className="overflow-hidden border-t border-[var(--kepler-border)]">
      <div className="flex gap-4 border-b border-[var(--kepler-border)] py-2.5">
        <div className="h-3 w-16 animate-pulse rounded-[3px] bg-black/[0.05]" />
        <div className="ml-auto h-3 w-12 animate-pulse rounded-[3px] bg-black/[0.05]" />
        <div className="h-3 w-12 animate-pulse rounded-[3px] bg-black/[0.05]" />
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-2.5 border-b border-[var(--kepler-border)] py-2.5"
        >
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-black/[0.05]" />
          <div className="min-w-0 flex-1">
            <div className="h-3.5 w-36 animate-pulse rounded-[3px] bg-black/[0.05]" />
            <div className="mt-1.5 h-3 w-24 animate-pulse rounded-[3px] bg-black/[0.04]" />
          </div>
          <div className="h-5 w-16 shrink-0 animate-pulse rounded-[3px] bg-black/[0.04]" />
        </div>
      ))}
    </div>
  );
}

export default function WorkspaceSectionState({
  loading,
  error,
  onRetry,
  empty,
  emptyTitle,
  emptyDescription,
  resourceLabel,
  skeleton = "table",
  skeletonRows = 6,
  children,
}: SectionStateProps) {
  if (loading) {
    return (
      <div aria-busy="true" aria-label={`Loading ${resourceLabel}`}>
        {skeleton === "timeline" ? (
          <TimelineSkeleton rows={skeletonRows} />
        ) : skeleton === "media" ? (
          <MediaSkeleton rows={skeletonRows} />
        ) : skeleton === "rows" ? (
          <RowsSkeleton rows={skeletonRows} />
        ) : skeleton === "roster" ? (
          <RosterSkeleton rows={skeletonRows} />
        ) : (
          <TableSkeleton rows={skeletonRows} />
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border border-[var(--kepler-border)] px-3.5 py-3">
        <p className="text-[13px] text-[var(--kepler-secondary)]">
          Unable to load {resourceLabel}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="
              inline-flex
              h-10
              min-w-11
              items-center
              rounded-[5px]
              border
              border-[var(--kepler-border)]
              px-3
              text-[13px]
              font-semibold
              text-[var(--kepler-navy)]
              outline-none
              hover:bg-black/[0.02]
              focus-visible:ring-2
              focus-visible:ring-[var(--kepler-navy)]/30
            "
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="border-t border-[var(--kepler-border)] py-7">
        <p className="text-[14px] font-medium text-[var(--kepler-ink)]">
          {emptyTitle}
        </p>
        {emptyDescription ? (
          <p className="mt-1 text-[13px] text-[var(--kepler-secondary)]">
            {emptyDescription}
          </p>
        ) : null}
      </div>
    );
  }

  return <>{children}</>;
}
