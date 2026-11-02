"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, FolderKanban, LayoutDashboard, LogOut, Sparkles, Users, UserRound, X } from "lucide-react";
import { useState } from "react";
import KeplerAnimatedLogo from "@/components/branding/KeplerAnimatedLogo";
import KeplerWordmark from "@/components/branding/KeplerWordmark";
import { useAuth } from "@/lib/kepler/AuthProvider";
import { useOwnProfile } from "@/lib/kepler/hooks/useOwnProfile";

const primaryNav = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, enabled: true },
  { label: "Projects", href: "/projects", icon: FolderKanban, enabled: true },
  { label: "Activity", href: "#", icon: Activity, enabled: false },
  { label: "Team", href: "#", icon: Users, enabled: false },
  { label: "Kepler AI", href: "#", icon: Sparkles, enabled: false },
] as const;

export default function AppSidebar({ collapsed = false, mobile = false, onNavigate, onClose }: {
  collapsed?: boolean; mobile?: boolean; onNavigate?: () => void; onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: profile } = useOwnProfile();
  const [avatarBroken, setAvatarBroken] = useState(false);
  const label = profile?.displayName?.trim() || user?.displayName?.trim() || profile?.email?.trim() || user?.email?.trim() || "Signed in";
  const email = (profile?.email || user?.email || "").trim();
  const avatarUrl = (!avatarBroken && profile?.avatarUrl?.trim()) || user?.photoURL?.trim() || null;

  async function handleSignOut() {
    await signOut();
    onNavigate?.();
    router.replace("/login");
  }

  return (
    <aside aria-label="Kepler application" className={`flex h-dvh flex-col border-r border-[#D9E2EA]/80 bg-white ${mobile ? "w-full" : collapsed ? "w-[88px]" : "w-[244px]"}`}>
      <div className={`flex h-[112px] shrink-0 items-center ${collapsed ? "justify-center px-2" : "justify-between px-6"}`}>
        <Link href="/dashboard" onClick={onNavigate} aria-label="Kepler overview" className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#0D2343]/40">
          {collapsed ? <KeplerWordmark width={58} height={18} color="#0D2343" /> : <KeplerAnimatedLogo width={174} height={71} autoPlay={false} wordmarkColor="#0D2343" taglineColor="#64748B" showTagline />}
        </Link>
        {mobile && <button type="button" onClick={onClose} aria-label="Close navigation" className="-mr-3 grid h-11 w-11 shrink-0 place-items-center rounded-xl outline-none hover:bg-[#F4F6F9] focus-visible:ring-2 focus-visible:ring-[#0D2343]/40"><X size={19} /></button>}
      </div>
      {!collapsed && <p className="mb-3 px-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Workspace</p>}
      <nav aria-label="Primary" className={`min-h-0 overflow-y-auto ${collapsed ? "px-3" : "px-4"}`}>
        <ul className="space-y-1.5">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const active = item.enabled && (pathname === item.href || (item.href === "/projects" && pathname.startsWith("/projects")));
            const contents = <><Icon size={19} strokeWidth={1.7} aria-hidden="true" className="shrink-0" />{!collapsed && <span className="min-w-0 flex-1">{item.label}</span>}{!item.enabled && !collapsed && <span className="rounded-md bg-[#F4F6F9] px-1.5 py-0.5 text-[9px] font-medium text-[#64748B]">Soon</span>}</>;
            const classes = `relative flex min-h-12 items-center gap-3 rounded-xl px-3 text-[13px] font-medium ${collapsed ? "justify-center" : ""} ${active ? "bg-[#C8102E]/[0.055] font-semibold text-[#0D2343] before:absolute before:inset-y-3 before:left-0 before:w-[3px] before:rounded-full before:bg-[#C8102E]" : "text-[#0D2343]"}`;
            return <li key={item.label}>{item.enabled ? (
              <Link href={item.href} onClick={onNavigate} title={collapsed ? item.label : undefined} aria-label={collapsed ? item.label : undefined} aria-current={active ? "page" : undefined} className={`${classes} outline-none transition-colors hover:bg-[#F4F6F9] focus-visible:ring-2 focus-visible:ring-[#0D2343]/35`}>{contents}</Link>
            ) : <span aria-disabled="true" title={`${item.label} — coming soon`} aria-label={collapsed ? `${item.label} (coming soon)` : undefined} className={`${classes} cursor-default opacity-55`}>{contents}</span>}</li>;
          })}
        </ul>
      </nav>
      <div className="min-h-4 flex-1" />
      {!collapsed && <div aria-hidden="true" className="relative mt-5 h-[118px] shrink-0"><Image src="/dashboard/sidebarBotoom.png" alt="" fill sizes="304px" className="pointer-events-none object-cover object-bottom" /></div>}
      <div className={`shrink-0 border-t border-[#D9E2EA]/70 py-4 ${collapsed ? "px-3" : "px-5"}`}>
        <div className={`mb-2 flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#D9E2EA] bg-[#F4F6F9] text-[#0D2343]">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" width={36} height={36} className="h-full w-full object-cover" onError={() => setAvatarBroken(true)} />
            ) : <UserRound size={17} />}
          </span>
          {!collapsed && <span className="min-w-0"><span className="block truncate text-[12px] font-semibold">{label}</span><span className="mt-0.5 block truncate text-[10px] text-[#64748B]">{email && label !== email ? email : "Kepler workspace"}</span></span>}
        </div>
        <button type="button" onClick={handleSignOut} title="Sign out" aria-label="Sign out" className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-[12px] font-medium text-[#64748B] outline-none hover:bg-[#F4F6F9] hover:text-[#0D2343] focus-visible:ring-2 focus-visible:ring-[#0D2343]/35 ${collapsed ? "justify-center" : ""}`}><LogOut size={17} />{!collapsed && "Sign out"}</button>
      </div>
    </aside>
  );
}
