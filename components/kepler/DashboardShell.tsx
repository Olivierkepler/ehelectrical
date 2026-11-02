"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import AppHeader from "@/components/kepler/AppHeader";
import AppSidebar from "@/components/kepler/AppSidebar";

export default function DashboardShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const title = pathname === "/dashboard" ? "Overview" : pathname.startsWith("/projects") ? "Projects" : "Kepler";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (mobileOpen) {
      if (!dialog.open) dialog.showModal();
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { dialog.close(); document.body.style.overflow = previousOverflow; };
    }
    dialog.close();
  }, [mobileOpen]);

  return (
    <div className="flex min-h-dvh bg-[#F4F6F9] text-[#0D2343] [--kepler-background:#F4F6F9] [--kepler-border:#D9E2EA] [--kepler-ink:#0D2343] [--kepler-muted:#64748B] [--kepler-navy:#0D2343] [--kepler-red:#C8102E] [--kepler-secondary:#64748B] [--kepler-surface:#FFFFFF]">
      <a href="#workspace-content" className="sr-only z-50 rounded-lg bg-white p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to workspace</a>
      <div id="workspace-desktop-navigation" className="sticky top-0 hidden h-dvh shrink-0 lg:block"><AppSidebar collapsed={collapsed} /></div>
      <dialog ref={dialogRef} id="workspace-mobile-navigation" aria-label="Workspace navigation" onCancel={() => setMobileOpen(false)} onClose={() => { if (!dialogRef.current?.open) setMobileOpen(false); }} onClick={(event) => { if (event.target === event.currentTarget) setMobileOpen(false); }} onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), select:not([disabled]), [tabindex="0"]')).filter((element) => element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }} className="fixed inset-y-0 left-0 m-0 h-dvh max-h-dvh w-[min(304px,calc(100vw-32px))] max-w-none border-0 bg-white p-0 text-[#0D2343] shadow-2xl backdrop:bg-[#0D2343]/45">
        <AppSidebar mobile onNavigate={() => setMobileOpen(false)} onClose={() => setMobileOpen(false)} />
      </dialog>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader title={title} collapsed={collapsed} mobileOpen={mobileOpen} onToggleSidebar={() => setCollapsed((value) => !value)} onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main id="workspace-content" tabIndex={-1} className="min-w-0 flex-1 px-4 py-5 outline-none sm:px-6 sm:py-7 xl:px-8">{children}</main>
      </div>
    </div>
  );
}
