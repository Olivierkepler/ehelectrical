"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ApiError } from "@/lib/kepler/api/client";
import {
  getProjectDetail,
  type ProjectDetail,
} from "@/lib/kepler/api/projectDetail";
import {
  type DiscoveredProject,
  type ProjectMemberRole,
} from "@/lib/kepler/api/projects";
import { useAuth } from "@/lib/kepler/AuthProvider";
import { useMyProjects } from "@/lib/kepler/hooks/useMyProjects";

type ProjectWorkspaceValue = {
  projectId: string;
  membership: DiscoveredProject | null;
  membershipRole: ProjectMemberRole | null;
  project: ProjectDetail | null;
  loading: boolean;
  unavailable: boolean;
  error: string | null;
  refresh: () => void;
  /** Bumped after measurement writes so Field refetches from the API. */
  measurementsEpoch: number;
  invalidateMeasurements: () => void;
  deltasEpoch: number;
  invalidateDeltas: () => void;
  activityEpoch: number;
  invalidateActivity: () => void;
  evidenceEpoch: number;
  invalidateEvidence: () => void;
  agentRunsEpoch: number;
  invalidateAgentRuns: () => void;
  /** Epoch ms until which AgentRun polling continues after Evidence upload. */
  resumeObservationUntil: number;
  beginAgentRunResumeObservation: () => void;
};

const ProjectWorkspaceContext = createContext<ProjectWorkspaceValue | null>(
  null,
);

export function ProjectWorkspaceProvider({
  projectId,
  children,
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const {
    data: portfolio,
    loading: portfolioLoading,
    error: portfolioError,
    refresh: refreshPortfolio,
  } = useMyProjects();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [measurementsEpoch, setMeasurementsEpoch] = useState(0);
  const [deltasEpoch, setDeltasEpoch] = useState(0);
  const [activityEpoch, setActivityEpoch] = useState(0);
  const [evidenceEpoch, setEvidenceEpoch] = useState(0);
  const [agentRunsEpoch, setAgentRunsEpoch] = useState(0);
  const [resumeObservationUntil, setResumeObservationUntil] = useState(0);

  const invalidateMeasurements = useCallback(() => {
    setMeasurementsEpoch((value) => value + 1);
  }, []);

  const invalidateDeltas = useCallback(() => {
    setDeltasEpoch((value) => value + 1);
  }, []);

  const invalidateActivity = useCallback(() => {
    setActivityEpoch((value) => value + 1);
  }, []);

  const invalidateEvidence = useCallback(() => {
    setEvidenceEpoch((value) => value + 1);
  }, []);

  const invalidateAgentRuns = useCallback(() => {
    setAgentRunsEpoch((value) => value + 1);
  }, []);

  const beginAgentRunResumeObservation = useCallback(() => {
    setResumeObservationUntil(Date.now() + 30_000);
    setAgentRunsEpoch((value) => value + 1);
  }, []);

  const membership = useMemo(() => {
    if (!portfolio || !projectId) return null;
    return portfolio.find((item) => item.id === projectId) ?? null;
  }, [portfolio, projectId]);

  const refresh = useCallback(() => {
    refreshPortfolio();
    setReloadKey((value) => value + 1);
  }, [refreshPortfolio]);

  useEffect(() => {
    if (authLoading || portfolioLoading) {
      return;
    }

    if (!user || !projectId || !membership) {
      setProject(null);
      setDetailError(null);
      setDetailLoading(false);
      return;
    }

    let cancelled = false;
    setDetailLoading(true);
    setDetailError(null);

    getProjectDetail(projectId)
      .then((detail) => {
        if (!cancelled) {
          setProject(detail);
          setDetailLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setProject(null);
          if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
            setDetailError("unavailable");
          } else {
            setDetailError(
              err instanceof Error ? err.message : "Unable to load project.",
            );
          }
          setDetailLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, portfolioLoading, user, projectId, membership, reloadKey]);

  const portfolioSettled = !authLoading && !portfolioLoading;
  const unavailable =
    portfolioSettled &&
    !portfolioError &&
    (!membership || detailError === "unavailable");

  const loading =
    authLoading ||
    portfolioLoading ||
    (Boolean(membership) && detailLoading && !project);

  const error =
    portfolioError ||
    (detailError && detailError !== "unavailable" ? detailError : null);

  const value: ProjectWorkspaceValue = {
    projectId,
    membership,
    membershipRole: membership?.membership.role ?? null,
    project,
    loading,
    unavailable,
    error,
    refresh,
    measurementsEpoch,
    invalidateMeasurements,
    deltasEpoch,
    invalidateDeltas,
    activityEpoch,
    invalidateActivity,
    evidenceEpoch,
    invalidateEvidence,
    agentRunsEpoch,
    invalidateAgentRuns,
    resumeObservationUntil,
    beginAgentRunResumeObservation,
  };

  return (
    <ProjectWorkspaceContext.Provider value={value}>
      {children}
    </ProjectWorkspaceContext.Provider>
  );
}

export function useProjectWorkspace(): ProjectWorkspaceValue {
  const value = useContext(ProjectWorkspaceContext);
  if (!value) {
    throw new Error(
      "useProjectWorkspace must be used within ProjectWorkspaceProvider",
    );
  }
  return value;
}
