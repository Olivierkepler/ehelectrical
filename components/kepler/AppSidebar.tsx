"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Users,
  UserRound,
} from "lucide-react";
import { useState } from "react";

import KeplerLogo from "@/components/kepler/KeplerLogo";
import { useAuth } from "@/lib/kepler/AuthProvider";
import { useOwnProfile } from "@/lib/kepler/hooks/useOwnProfile";

const primaryNav = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, enabled: true, ai: false },
  { label: "Projects", href: "/projects", icon: FolderKanban, enabled: true, ai: false },
  { label: "Activity", href: "#", icon: Activity, enabled: false, ai: false },
  { label: "Team", href: "#", icon: Users, enabled: false, ai: false },
  { label: "Kepler AI", href: "#", icon: Sparkles, enabled: false, ai: true },
] as const;

function userLabel(displayName: string | null, email: string | null): string {
  const name = displayName?.trim();
  if (name) return name;
  const mail = email?.trim();
  if (mail) return mail;
  return "Signed in";
}

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: profile } = useOwnProfile();
  const [avatarBroken, setAvatarBroken] = useState(false);

  const label = userLabel(
    profile?.displayName || user?.displayName || null,
    profile?.email || user?.email || null,
  );
  const email = (profile?.email || user?.email || "").trim();
  const avatarUrl =
    (!avatarBroken && profile?.avatarUrl?.trim()) ||
    user?.photoURL?.trim() ||
    null;

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <aside
      className="
        hidden
        h-dvh
        w-[240px]
        shrink-0
        flex-col
        border-r
        border-[var(--kepler-border)]
        bg-[var(--kepler-surface)]
        lg:flex
      "
      aria-label="Kepler application"
    >
      <div className="flex h-14 shrink-0 items-center px-5">
        <Link
          href="/dashboard"
          className="outline-none focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)]/30"
        >
          <KeplerLogo />
        </Link>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 pt-1"
        aria-label="Primary"
      >
        {primaryNav.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.enabled &&
            (pathname === item.href ||
              (item.href === "/projects" && pathname.startsWith("/projects")));

          if (!item.enabled) {
            return (
              <span
                key={item.label}
                title="Coming next"
                aria-disabled="true"
                className="
                  flex
                  cursor-default
                  items-center
                  gap-2.5
                  rounded-[6px]
                  px-2.5
                  py-2
                  text-[13px]
                  font-medium
                  text-[var(--kepler-secondary)]
                "
              >
                <Icon
                  size={17}
                  strokeWidth={item.ai ? 1.9 : 1.75}
                  className={
                    item.ai
                      ? "text-[var(--kepler-navy)]/70"
                      : "text-[var(--kepler-muted)]"
                  }
                  aria-hidden="true"
                />
                <span className="flex-1">{item.label}</span>
              </span>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`
                flex
                items-center
                gap-2.5
                rounded-[6px]
                px-2.5
                py-2
                text-[13px]
                font-medium
                transition-colors
                duration-150
                outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--kepler-navy)]/30
                ${
                  isActive
                    ? "bg-[var(--kepler-navy)]/[0.07] text-[var(--kepler-navy)]"
                    : "text-[var(--kepler-secondary)] hover:bg-black/[0.025] hover:text-[var(--kepler-ink)]"
                }
              `}
            >
              <Icon size={17} strokeWidth={1.75} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="isolate z-0 shrink-0 overflow-hidden border-t border-[var(--kepler-border)] px-2.5 py-2">
        <div className="flex min-w-0 items-center gap-2.5 px-2.5 py-1.5">
          <span
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-full
              border
              border-[var(--kepler-border)]
              bg-[var(--kepler-background)]
              text-[var(--kepler-navy)]
            "
            aria-hidden="true"
          >
            {avatarUrl ? (
              // Native img: next/image wrappers can paint an extra overlay in this slot.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 object-cover"
                onError={() => setAvatarBroken(true)}
              />
            ) : (
              <UserRound size={15} strokeWidth={1.75} />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium leading-snug text-[var(--kepler-ink)]">
              {label}
            </span>
            <span className="mt-0.5 block truncate text-[11px] leading-snug text-[var(--kepler-muted)]">
              {email && label !== email ? email : "Signed in"}
            </span>
          </span>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="
            mt-0.5
            flex
            h-9
            w-full
            shrink-0
            items-center
            gap-2.5
            rounded-[6px]
            px-2.5
            text-left
            text-[13px]
            font-medium
            text-[var(--kepler-secondary)]
            outline-none
            transition-colors
            hover:bg-black/[0.025]
            hover:text-[var(--kepler-ink)]
            focus-visible:ring-2
            focus-visible:ring-[var(--kepler-navy)]/30
          "
        >
          <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
