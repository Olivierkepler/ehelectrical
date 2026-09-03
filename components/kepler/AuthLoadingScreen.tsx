"use client";

import KeplerLogo from "@/components/kepler/KeplerLogo";

/** Restrained full-viewport loading while Firebase auth state resolves. */
export default function AuthLoadingScreen() {
  return (
    <div
      className="
        flex
        min-h-dvh
        items-center
        justify-center
        bg-[var(--kepler-background)]
        px-6
      "
      role="status"
      aria-live="polite"
      aria-label="Loading Kepler"
    >
      <div className="flex flex-col items-center gap-4">
        <KeplerLogo />
        <p className="text-[13px] text-[var(--kepler-muted)]">
          Loading your workspace…
        </p>
      </div>
    </div>
  );
}
