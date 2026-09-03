"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  FolderKanban,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

import AppHeader from "@/components/kepler/AppHeader";
import AppSidebar from "@/components/kepler/AppSidebar";
import KeplerLogo from "@/components/kepler/KeplerLogo";

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/projects": "Projects",
};

const mobileNav = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, enabled: true, ai: false },
  { label: "Projects", href: "/projects", icon: FolderKanban, enabled: true, ai: false },
  { label: "Activity", href: "#", icon: Activity, enabled: false, ai: false },
  { label: "Kepler AI", href: "#", icon: Sparkles, enabled: false, ai: true },
] as const;

export default function DashboardShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const title =
    pageTitles[pathname] ??
    (pathname.startsWith("/projects") ? "Projects" : "Kepler");

  return (
    <div className="flex min-h-dvh bg-[var(--kepler-background)] text-[var(--kepler-ink)]">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col pb-[68px] lg:pb-0">
        <div className="flex h-[52px] items-center border-b border-[var(--kepler-border)] bg-[var(--kepler-surface)] px-4 lg:hidden">
          <Link
            href="/dashboard"
            className="outline-none focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)]/30"
          >
            <KeplerLogo compact />
          </Link>
        </div>

        <AppHeader title={title} />

        <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
          {children}
        </main>

        <nav
          aria-label="Mobile"
          className="
            fixed
            inset-x-0
            bottom-0
            z-20
            border-t
            border-[var(--kepler-border)]
            bg-[var(--kepler-surface)]
            lg:hidden
          "
        >
          <ul className="grid grid-cols-4 px-1 py-1.5">
            {mobileNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.enabled &&
                (pathname === item.href ||
                  (item.href === "/projects" &&
                    pathname.startsWith("/projects")));

              if (!item.enabled) {
                return (
                  <li key={item.label}>
                    <span
                      title="Coming next"
                      aria-disabled="true"
                      className="
                        flex
                        min-h-11
                        cursor-default
                        flex-col
                        items-center
                        justify-center
                        gap-0.5
                        px-1
                        text-[10px]
                        font-medium
                        text-[var(--kepler-secondary)]
                      "
                    >
                      <Icon
                        size={18}
                        strokeWidth={item.ai ? 1.9 : 1.75}
                        className={
                          item.ai
                            ? "text-[var(--kepler-navy)]/70"
                            : undefined
                        }
                        aria-hidden="true"
                      />
                      {item.label}
                    </span>
                  </li>
                );
              }

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`
                      flex
                      min-h-11
                      flex-col
                      items-center
                      justify-center
                      gap-0.5
                      px-1
                      text-[10px]
                      font-medium
                      outline-none
                      transition-colors
                      focus-visible:ring-2
                      focus-visible:ring-[var(--kepler-navy)]/30
                      ${
                        isActive
                          ? "text-[var(--kepler-navy)]"
                          : "text-[var(--kepler-secondary)]"
                      }
                    `}
                  >
                    <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
