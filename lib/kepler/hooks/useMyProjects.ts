"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/lib/kepler/AuthProvider";
import {
  getMyDiscoveredProjects,
  type DiscoveredProject,
} from "@/lib/kepler/api/projects";

export function useMyProjects() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DiscoveredProject[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!user) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    getMyDiscoveredProjects()
      .then((projects) => {
        if (!cancelled) {
          setData(projects);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setData(null);
          setError(
            err instanceof Error ? err.message : "Unable to load projects.",
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, reloadKey]);

  return { data, loading, error, refresh };
}
