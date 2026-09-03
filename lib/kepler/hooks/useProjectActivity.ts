"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/lib/kepler/AuthProvider";
import {
  getProjectActivity,
  type ActivityEvent,
} from "@/lib/kepler/api/activity";
import { useProjectWorkspace } from "@/lib/kepler/hooks/useProjectWorkspace";

const PAGE_LIMIT = 50;

export function useProjectActivity() {
  const { user, loading: authLoading } = useAuth();
  const { projectId, membership, unavailable, activityEpoch } =
    useProjectWorkspace();
  const [items, setItems] = useState<ActivityEvent[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
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
      setItems([]);
      setNextCursor(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getProjectActivity(projectId, { limit: PAGE_LIMIT })
      .then((page) => {
        if (!cancelled) {
          setItems(page.items);
          setNextCursor(page.nextCursor);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setItems([]);
          setNextCursor(null);
          setError(
            err instanceof Error ? err.message : "Unable to load activity.",
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, membership, unavailable, projectId, reloadKey, activityEpoch]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore || !membership || unavailable) {
      return;
    }

    setLoadingMore(true);
    try {
      const page = await getProjectActivity(projectId, {
        limit: PAGE_LIMIT,
        cursor: nextCursor,
      });
      setItems((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to load activity.",
      );
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, membership, unavailable, projectId]);

  return {
    data: items,
    loading,
    loadingMore,
    error,
    nextCursor,
    refresh,
    loadMore,
  };
}
