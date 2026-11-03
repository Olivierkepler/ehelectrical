"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import AppHeader from "@/components/kepler/AppHeader";
import AppSidebar from "@/components/kepler/AppSidebar";
import KeplerAIChatPanel from "@/components/kepler/KeplerAIChatPanel";
import { useAuth } from "@/lib/kepler/AuthProvider";
import { WorkspaceProjectsProvider } from "@/lib/kepler/hooks/useWorkspaceProjects";
import { useKeplerChat } from "@/lib/kepler/hooks/useKeplerChat";

export default function DashboardShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user } = useAuth();
  return <WorkspaceProjectsProvider key={user?.uid ?? "signed-out"}><WorkspaceShell>{children}</WorkspaceShell></WorkspaceProjectsProvider>;
}

function WorkspaceShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopAI, setDesktopAI] = useState(true);
  const [mobileAI, setMobileAI] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const chat = useKeplerChat(desktop ? desktopAI : mobileAI);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const aiDialogRef = useRef<HTMLDialogElement>(null);
  const title = pathname === "/dashboard" ? "Overview" : pathname.startsWith("/projects") ? "Projects" : "Kepler";

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      setDesktop(query.matches);
      setMobileAI(false);
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const dialog = aiDialogRef.current;
    if (!dialog || !mobileAI || desktop) return;
    const trigger = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    dialog.querySelector<HTMLButtonElement>("button")?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, [mobileAI, desktop]);

  function closeAI() {
    if (desktop) setDesktopAI(false);
    else setMobileAI(false);
    document.getElementById("workspace-ai-toggle")?.focus();
  }

  function toggleAI() {
    if (desktop) setDesktopAI((value) => !value);
    else {
      setMobileOpen(false);
      setMobileAI((value) => !value);
    }
  }

  function trapAIKeyboardFocus(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]')).filter(element => element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }

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
        <AppHeader title={title} collapsed={collapsed} mobileOpen={mobileOpen} aiOpen={desktop ? desktopAI : mobileAI} aiPanelId={desktop ? "workspace-ai-panel" : "workspace-ai-drawer"} onToggleAI={toggleAI} onToggleSidebar={() => setCollapsed((value) => !value)} onOpenMobileSidebar={() => { setMobileAI(false); setMobileOpen(true); }} />
        <div className="flex min-w-0 flex-1 items-start">
          <main id="workspace-content" tabIndex={-1} className={`min-w-0 flex-1 self-stretch outline-none${pathname === "/dashboard" ? "" : " px-4 py-5 sm:px-6 sm:py-7 xl:px-8"}`}>{children}</main>
          <aside id="workspace-ai-panel" aria-labelledby="workspace-ai-title" aria-hidden={!desktopAI} inert={!desktopAI} onKeyDown={(event) => { if (event.key === "Escape" && !event.defaultPrevented) { event.preventDefault(); closeAI(); } }} className={`sticky top-[76px] hidden h-[calc(100dvh-76px)] shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out motion-reduce:transition-none lg:block ${desktopAI ? "w-[380px]" : "w-0"}`}>
            <div className="h-full w-[380px] p-3"><KeplerAIChatPanel titleId="workspace-ai-title" onClose={closeAI} chat={chat} /></div>
          </aside>
        </div>
      </div>
      <dialog ref={aiDialogRef} id="workspace-ai-drawer" aria-labelledby="workspace-ai-mobile-title" onKeyDown={trapAIKeyboardFocus} onCancel={() => setMobileAI(false)} onClose={() => { if (!aiDialogRef.current?.open) setMobileAI(false); }} onClick={(event) => { if (event.target === event.currentTarget) setMobileAI(false); }} className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-dvh w-[min(380px,100vw)] max-w-none rounded-[24px] border-0 bg-transparent p-0 shadow-2xl backdrop:bg-[#0D2343]/45">
        <KeplerAIChatPanel titleId="workspace-ai-mobile-title" onClose={closeAI} chat={chat} />
      </dialog>
    </div>
  );
}
