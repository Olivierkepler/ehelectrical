"use client";

type WorkspaceSectionHeaderProps = {
  eyebrow: string;
  title: string;
  count?: number | null;
  countLabel?: string;
};

export default function WorkspaceSectionHeader({
  eyebrow,
  title,
  count,
  countLabel,
}: WorkspaceSectionHeaderProps) {
  const countText =
    typeof count === "number"
      ? `${count} ${countLabel ?? (count === 1 ? "item" : "items")}`
      : null;

  return (
    <header className="mb-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--kepler-muted)]">
        {eyebrow}
      </p>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[var(--kepler-ink)]">
          {title}
        </h2>
        {countText ? (
          <p className="text-[13px] text-[var(--kepler-muted)]">{countText}</p>
        ) : null}
      </div>
    </header>
  );
}
