/**
 * Temporary text-only Kepler wordmark.
 * Replace with the official Kepler web logo asset when available.
 * Do not use the EH Electric logo here.
 */
export default function KeplerLogo({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col justify-center leading-none">
      <span
        className="
          text-[13px]
          font-semibold
          tracking-[0.18em]
          text-[var(--kepler-navy)]
        "
      >
        KEPLER
      </span>
      {!compact && (
        <span
          className="
            mt-1.5
            text-[9px]
            font-medium
            tracking-[0.2em]
            text-[var(--kepler-navy)]/55
          "
        >
          BUILD SMARTER
        </span>
      )}
    </div>
  );
}
