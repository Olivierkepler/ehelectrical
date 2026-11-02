"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, ChevronRight, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Search, UserRound } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/kepler/AuthProvider";
import { useOwnProfile } from "@/lib/kepler/hooks/useOwnProfile";

export default function AppHeader({ title, collapsed = false, mobileOpen = false, onToggleSidebar, onOpenMobileSidebar }: {
  title: string; collapsed?: boolean; mobileOpen?: boolean; onToggleSidebar: () => void; onOpenMobileSidebar: () => void;
}) {
  const { user, signOut } = useAuth();
  const { data: profile } = useOwnProfile();
  const router = useRouter();
  const [avatarBroken, setAvatarBroken] = useState(false);
  const avatarUrl = (!avatarBroken && profile?.avatarUrl?.trim()) || user?.photoURL?.trim() || null;
  const label = profile?.displayName?.trim() || user?.displayName?.trim() || profile?.email?.trim() || user?.email?.trim() || "Signed in";
  const iconButton = "grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[#64748B] outline-none transition-colors enabled:hover:bg-[#F4F6F9] focus-visible:ring-2 focus-visible:ring-[#0D2343]/35";

  async function handleSignOut() { await signOut(); router.replace("/login"); }

  return (
    <header className="sticky top-0 z-20 flex h-[76px] shrink-0 items-center justify-between gap-2 border-b border-[#D9E2EA]/70 bg-white/95 px-3 backdrop-blur-md sm:px-5 xl:px-7">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <button type="button" onClick={onOpenMobileSidebar} aria-label="Open navigation" aria-expanded={mobileOpen} aria-controls="workspace-mobile-navigation" className={`${iconButton} lg:hidden`}><Menu size={21} /></button>
        <button type="button" onClick={onToggleSidebar} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} aria-expanded={!collapsed} aria-controls="workspace-desktop-navigation" className={`${iconButton} hidden lg:grid`}>{collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}</button>
        <div className="flex min-w-0 items-center gap-3 text-[12px]">
          <span className="hidden text-[#64748B] sm:inline">Workspace</span><ChevronRight size={13} aria-hidden="true" className="hidden text-[#64748B]/60 sm:block" /><span className="truncate font-semibold text-[#0D2343]">{title}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <button type="button" disabled aria-label="Search (coming soon)" title="Search is not available yet" className="mr-1 hidden h-10 items-center gap-2 rounded-xl border border-[#D9E2EA]/70 bg-[#F4F6F9]/70 px-3 text-[11px] text-[#64748B] md:flex"><Search size={15} /><span>Search workspace</span></button>
        <button type="button" disabled aria-label="Notifications (coming soon)" title="Notifications are not available yet" className={iconButton}><Bell size={18} /></button>
        <button type="button" onClick={handleSignOut} aria-label="Sign out" title="Sign out" className={iconButton}><LogOut size={17} /></button>
        <div className="ml-1 flex items-center gap-3 border-l border-[#D9E2EA]/70 pl-3 sm:ml-2 sm:pl-4">
          <span aria-hidden="true" title={label} className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#D9E2EA] bg-[#F4F6F9] text-[#0D2343]">{avatarUrl ? <Image src={avatarUrl} alt="" width={36} height={36} className="h-full w-full object-cover" unoptimized onError={() => setAvatarBroken(true)} /> : <UserRound size={17} />}</span>
          <span className="hidden max-w-[130px] truncate text-[12px] font-semibold text-[#0D2343] xl:block">{label}</span>
        </div>
      </div>
    </header>
  );
}
