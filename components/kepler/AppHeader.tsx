"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Search, UserRound } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/lib/kepler/AuthProvider";
import { useOwnProfile } from "@/lib/kepler/hooks/useOwnProfile";

type AppHeaderProps = {
  title: string;
};

export default function AppHeader({ title }: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const { data: profile } = useOwnProfile();
  const router = useRouter();
  const [avatarBroken, setAvatarBroken] = useState(false);

  const avatarUrl =
    (!avatarBroken && profile?.avatarUrl?.trim()) ||
    user?.photoURL?.trim() ||
    null;
  const label =
    profile?.displayName?.trim() ||
    user?.displayName?.trim() ||
    profile?.email?.trim() ||
    user?.email?.trim() ||
    "Signed in";

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <header
      className="
        sticky
        top-0
        z-20
        flex
        h-[56px]
        items-center
        justify-between
        gap-4
        border-b
        border-[var(--kepler-border)]
        bg-[var(--kepler-surface)]
        px-4
        sm:px-6
        lg:px-8
      "
    >
      <div className="min-w-0">
        <p className="truncate text-[14px] font-semibold tracking-[-0.015em] text-[var(--kepler-ink)]">
          {title}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled
          aria-label="Search (coming soon)"
          title="Search will be connected later"
          className="
            inline-flex
            h-11
            min-w-11
            items-center
            justify-center
            gap-2
            rounded-[6px]
            px-2.5
            text-[var(--kepler-secondary)]
            outline-none
            transition-colors
            focus-visible:ring-2
            focus-visible:ring-[var(--kepler-navy)]/30
            enabled:hover:bg-black/[0.03]
            disabled:cursor-default
            sm:h-9
            sm:min-w-0
            sm:justify-start
            sm:border
            sm:border-[var(--kepler-border)]
            sm:bg-[var(--kepler-background)]
            sm:px-3
          "
        >
          <Search size={16} strokeWidth={1.75} aria-hidden="true" />
          <span className="hidden text-[12px] text-[var(--kepler-muted)] sm:inline">
            Search
          </span>
        </button>

        <button
          type="button"
          disabled
          aria-label="Notifications (coming soon)"
          title="Notifications will be connected later"
          className="
            grid
            h-11
            w-11
            place-items-center
            rounded-[6px]
            text-[var(--kepler-secondary)]
            outline-none
            transition-colors
            focus-visible:ring-2
            focus-visible:ring-[var(--kepler-navy)]/30
            enabled:hover:bg-black/[0.03]
            disabled:cursor-default
          "
        >
          <Bell size={17} strokeWidth={1.75} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Sign out"
          title="Sign out"
          className="
            grid
            h-11
            w-11
            place-items-center
            rounded-[6px]
            text-[var(--kepler-secondary)]
            outline-none
            transition-colors
            hover:bg-black/[0.03]
            hover:text-[var(--kepler-ink)]
            focus-visible:ring-2
            focus-visible:ring-[var(--kepler-navy)]/30
          "
        >
          <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>

        <span
          className="
            relative
            grid
            h-11
            w-11
            place-items-center
            text-[var(--kepler-navy)]
          "
          aria-hidden="true"
          title={label}
        >
          <span
            className="
              relative
              grid
              h-8
              w-8
              place-items-center
              overflow-hidden
              rounded-full
              border
              border-[var(--kepler-border)]
              bg-[var(--kepler-background)]
            "
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt=""
                width={32}
                height={32}
                className="h-full w-full object-cover"
                unoptimized
                onError={() => setAvatarBroken(true)}
              />
            ) : (
              <UserRound size={15} strokeWidth={1.75} />
            )}
          </span>
        </span>
      </div>
    </header>
  );
}
