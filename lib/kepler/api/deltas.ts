import { authenticatedJson } from "@/lib/kepler/api/client";
import { dedupeAsync } from "@/lib/kepler/api/dedupe";

export type DeltaStatus = "open" | "accepted" | "rejected" | "resolved";

/** GET /api/projects/:projectId/deltas item shape. */
export type Delta = {
  id: string;
  localDeltaId: string;
  projectId: string;
  planItemId: string;
  measurementId: string;
  type: "length";
  plannedValue: number;
  actualValue: number;
  difference: number;
  percentDifference: number | null;
  unit: string;
  unitCost: number;
  costImpact: number;
  productionRatePerDay: number;
  scheduleImpactDays: number;
  laborHoursPerUnit: number;
  laborImpactHours: number;
  status: DeltaStatus;
  dispositionReason: string;
  disposedAt: string | null;
  createdAt: string;
};

function normalizeStatus(value: unknown): DeltaStatus | null {
  if (value === "reviewed") {
    return "accepted";
  }
  if (
    value === "open" ||
    value === "accepted" ||
    value === "rejected" ||
    value === "resolved"
  ) {
    return value;
  }
  return null;
}

function isDelta(value: unknown): value is Delta {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  const status = normalizeStatus(record.status);
  const percentOk =
    record.percentDifference === null ||
    typeof record.percentDifference === "number";

  if (
    typeof record.id !== "string" ||
    typeof record.localDeltaId !== "string" ||
    typeof record.projectId !== "string" ||
    typeof record.planItemId !== "string" ||
    typeof record.measurementId !== "string" ||
    record.type !== "length" ||
    typeof record.plannedValue !== "number" ||
    typeof record.actualValue !== "number" ||
    typeof record.difference !== "number" ||
    !percentOk ||
    typeof record.unit !== "string" ||
    typeof record.unitCost !== "number" ||
    typeof record.costImpact !== "number" ||
    typeof record.productionRatePerDay !== "number" ||
    typeof record.scheduleImpactDays !== "number" ||
    typeof record.laborHoursPerUnit !== "number" ||
    typeof record.laborImpactHours !== "number" ||
    status === null ||
    typeof record.dispositionReason !== "string" ||
    (record.disposedAt !== null && typeof record.disposedAt !== "string") ||
    typeof record.createdAt !== "string"
  ) {
    return false;
  }

  (record as { status: DeltaStatus }).status = status;
  return true;
}

function parseDeltas(value: unknown): Delta[] | null {
  if (!Array.isArray(value) || !value.every(isDelta)) {
    return null;
  }
  return value;
}

/** Parse a single Delta document (used by reconcile response). */
export function parseDelta(value: unknown): Delta | null {
  return isDelta(value) ? value : null;
}

/** GET /api/projects/:projectId/deltas */
export async function getProjectDeltas(projectId: string): Promise<Delta[]> {
  const id = projectId.trim();
  if (!id) {
    throw new Error("projectId is required");
  }

  return dedupeAsync(`GET /api/projects/${id}/deltas`, () =>
    authenticatedJson(
      `/api/projects/${encodeURIComponent(id)}/deltas`,
      {},
      parseDeltas,
    ),
  );
}

export function formatDeltaStatusLabel(status: DeltaStatus): string {
  switch (status) {
    case "open":
      return "Open";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    case "resolved":
      return "Resolved";
    default:
      return status;
  }
}
