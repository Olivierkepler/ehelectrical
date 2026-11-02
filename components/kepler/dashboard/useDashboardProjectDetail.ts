"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/kepler/AuthProvider";
import { getProjectDetail, type ProjectDetail } from "@/lib/kepler/api/projectDetail";
import type { DiscoveredProject } from "@/lib/kepler/api/projects";

/** Reads the existing membership-aware endpoint for a project from the authorized portfolio. */
export function useDashboardProjectDetail(project: DiscoveredProject | null) {
  const { user } = useAuth();
  const projectId = project?.id;
  const [result, setResult] = useState<{ id: string; data: ProjectDetail | null; error: boolean } | null>(null);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !projectId) { setResult(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setResult(null);
    getProjectDetail(projectId).then((data) => {
      if (!cancelled) { setResult({ id: projectId, data, error: false }); setLoading(false); }
    }).catch(() => {
      if (!cancelled) { setResult({ id: projectId, data: null, error: true }); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [user, projectId, revision]);

  const current = result?.id === projectId ? result : null;
  return { data: current?.data ?? null, error: current?.error ?? false, loading: Boolean(projectId) && (loading || !current), refresh: () => setRevision((value) => value + 1) };
}

/** Mirrors the existing project overview's fractional / percentage progress convention. */
export function dashboardProgress(progress: number) {
  return Math.round(Math.max(0, Math.min(100, progress >= 0 && progress <= 1 ? progress * 100 : progress)));
}
