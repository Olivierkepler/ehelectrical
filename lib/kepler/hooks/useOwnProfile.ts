"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/lib/kepler/AuthProvider";
import {
  getOwnUserProfile,
  type UserProfile,
} from "@/lib/kepler/api/profile";

export function useOwnProfile() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<UserProfile | null>(null);
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

    getOwnUserProfile()
      .then((profile) => {
        if (!cancelled) {
          setData(profile);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setData(null);
          setError(
            err instanceof Error ? err.message : "Unable to load profile.",
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
