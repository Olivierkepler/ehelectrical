"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/lib/kepler/AuthProvider";
import {
  getProjectMeasurements,
  type Measurement,
} from "@/lib/kepler/api/measurements";
import { useProjectWorkspace } from "@/lib/kepler/hooks/useProjectWorkspace";

export function useProjectMeasurements() {
  const { user, loading: authLoading } = useAuth();
  const { projectId, membership, unavailable, measurementsEpoch } =
    useProjectWorkspace();
  const [data, setData] = useState<Measurement[] | null>(null);
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

    if (!user || !membership || unavailable) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getProjectMeasurements(projectId)
      .then((items) => {
        if (!cancelled) {
          setData(items);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setData(null);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load measurements.",
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    user,
    membership,
    unavailable,
    projectId,
    reloadKey,
    measurementsEpoch,
  ]);

  return { data, loading, error, refresh };
}
