"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/lib/kepler/AuthProvider";
import {
  listProjectAgentRuns,
  type AgentRunSummary,
} from "@/lib/kepler/api/agentRuns";
import { shouldPollAnyAgentRun } from "@/lib/kepler/agentRunPresentation";
import { useProjectWorkspace } from "@/lib/kepler/hooks/useProjectWorkspace";

const POLL_INTERVAL_MS = 4000;
const RESUME_POLL_DURATION_MS = 30000;

/**
 * One project AgentRun list + bounded polling while queued/running
 * (or during a short post-evidence resume window).
 */
export function useProjectAgentRuns() {
  const { user, loading: authLoading } = useAuth();
  const {
    projectId,
    membership,
    unavailable,
    agentRunsEpoch,
    resumeObservationUntil,
  } = useProjectWorkspace();

  const [data, setData] = useState<AgentRunSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [nowTick, setNowTick] = useState(0);
  const silentRef = useRef(false);

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
    if (!silentRef.current) {
      setLoading(true);
    }
    setError(null);

    listProjectAgentRuns(projectId)
      .then((items) => {
        if (!cancelled) {
          setData(items);
          setLoading(false);
          silentRef.current = false;
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setData(null);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load Kepler AI status.",
          );
          setLoading(false);
          silentRef.current = false;
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
    agentRunsEpoch,
  ]);

  const inResumeWindow = resumeObservationUntil > Date.now();
  const shouldPoll =
    shouldPollAnyAgentRun(data) || (inResumeWindow && data !== null);

  useEffect(() => {
    if (!shouldPoll) {
      return;
    }

    const interval = setInterval(() => {
      silentRef.current = true;
      setReloadKey((value) => value + 1);
      setNowTick((value) => value + 1);
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [shouldPoll, nowTick, resumeObservationUntil]);

  return { data, loading, error, refresh };
}
