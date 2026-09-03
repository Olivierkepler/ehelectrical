import { authenticatedJson } from "@/lib/kepler/api/client";
import { dedupeAsync } from "@/lib/kepler/api/dedupe";
import type { ProjectStatus } from "@/lib/kepler/api/projects";

/** Canonical GET /api/projects/:projectId response. */
export type ProjectDetail = {
  id: string;
  localProjectId: string;
  ownerUid: string;
  name: string;
  location: string;
  status: ProjectStatus;
  progress: number;
  openDeltas: number;
  assignedTasks: number;
};

const PROJECT_STATUSES: readonly ProjectStatus[] = [
  "active",
  "planning",
  "completed",
  "on-hold",
];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseProjectDetail(value: unknown): ProjectDetail | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (
    !isNonEmptyString(record.id) ||
    !isNonEmptyString(record.localProjectId) ||
    !isNonEmptyString(record.ownerUid) ||
    typeof record.name !== "string" ||
    typeof record.location !== "string" ||
    typeof record.status !== "string" ||
    !(PROJECT_STATUSES as readonly string[]).includes(record.status) ||
    typeof record.progress !== "number" ||
    !Number.isFinite(record.progress) ||
    typeof record.openDeltas !== "number" ||
    !Number.isFinite(record.openDeltas) ||
    typeof record.assignedTasks !== "number" ||
    !Number.isFinite(record.assignedTasks)
  ) {
    return null;
  }

  return {
    id: record.id.trim(),
    localProjectId: record.localProjectId.trim(),
    ownerUid: record.ownerUid.trim(),
    name: record.name,
    location: record.location,
    status: record.status as ProjectStatus,
    progress: record.progress,
    openDeltas: record.openDeltas,
    assignedTasks: record.assignedTasks,
  };
}

/** GET /api/projects/:projectId — membership-aware project core. */
export async function getProjectDetail(
  projectId: string,
): Promise<ProjectDetail> {
  const id = projectId.trim();
  if (!id) {
    throw new Error("projectId is required");
  }

  return dedupeAsync(`GET /api/projects/${id}`, () =>
    authenticatedJson(
      `/api/projects/${encodeURIComponent(id)}`,
      {},
      parseProjectDetail,
    ),
  );
}
