"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/lib/kepler/AuthProvider";
import {
  getProjectEvidence,
  type EvidenceListItem,
} from "@/lib/kepler/api/evidence";
import { useProjectWorkspace } from "@/lib/kepler/hooks/useProjectWorkspace";

export function useProjectEvidence() {
  const { user, loading: authLoading } = useAuth();
  const { projectId, membership, unavailable, evidenceEpoch } =
    useProjectWorkspace();
  const [data, setData] = useState<EvidenceListItem[] | null>(null);
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

    getProjectEvidence(projectId)
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
            err instanceof Error ? err.message : "Unable to load evidence.",
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
    evidenceEpoch,
  ]);

  return { data, loading, error, refresh };
}
