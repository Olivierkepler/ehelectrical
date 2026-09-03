import {
  ApiError,
  NotAuthenticatedError,
  authenticatedJson,
} from "@/lib/kepler/api/client";
import { dedupeAsync } from "@/lib/kepler/api/dedupe";
import { parseDelta, type Delta } from "@/lib/kepler/api/deltas";

export type MeasurementType = "length" | "area" | "count" | "volume";
export type MeasurementReviewStatus = "pending" | "accepted" | "rejected";

/** GET /api/projects/:projectId/measurements item shape. */
export type Measurement = {
  id: string;
  localMeasurementId: string;
  projectId: string;
  planItemId: string;
  type: MeasurementType;
  label: string;
  value: number;
  unit: string;
  createdAt: string;
  capturedByUid?: string;
  reviewStatus?: MeasurementReviewStatus;
  reviewedByUid?: string;
  reviewedAt?: string;
  reviewNote?: string;
  capturedByProjectMemberId?: string;
  submittedAssignmentId?: string;
  submittedWorkPackageId?: string;
};

/**
 * Create-only POST /api/measurements body.
 * Must not include server-managed review/provenance fields.
 */
export type CreateMeasurementInput = {
  id: string;
  localMeasurementId: string;
  projectId: string;
  planItemId: string;
  type: MeasurementType;
  label: string;
  value: number;
  unit: string;
  createdAt: string;
};

const MEASUREMENT_TYPES: readonly MeasurementType[] = [
  "length",
  "area",
  "count",
  "volume",
];

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === "string";
}

function isMeasurement(value: unknown): value is Measurement {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  if (
    record.reviewStatus !== undefined &&
    record.reviewStatus !== "pending" &&
    record.reviewStatus !== "accepted" &&
    record.reviewStatus !== "rejected"
  ) {
    return false;
  }

  return (
    typeof record.id === "string" &&
    typeof record.localMeasurementId === "string" &&
    typeof record.projectId === "string" &&
    typeof record.planItemId === "string" &&
    typeof record.type === "string" &&
    (MEASUREMENT_TYPES as readonly string[]).includes(record.type) &&
    typeof record.label === "string" &&
    typeof record.value === "number" &&
    Number.isFinite(record.value) &&
    typeof record.unit === "string" &&
    typeof record.createdAt === "string" &&
    isOptionalString(record.capturedByUid) &&
    isOptionalString(record.reviewedByUid) &&
    isOptionalString(record.reviewedAt) &&
    isOptionalString(record.reviewNote) &&
    isOptionalString(record.capturedByProjectMemberId) &&
    isOptionalString(record.submittedAssignmentId) &&
    isOptionalString(record.submittedWorkPackageId)
  );
}

function parseMeasurements(value: unknown): Measurement[] | null {
  if (!Array.isArray(value) || !value.every(isMeasurement)) {
    return null;
  }
  return value;
}

/** GET /api/projects/:projectId/measurements */
export async function getProjectMeasurements(
  projectId: string,
): Promise<Measurement[]> {
  const id = projectId.trim();
  if (!id) {
    throw new Error("projectId is required");
  }

  return dedupeAsync(`GET /api/projects/${id}/measurements`, () =>
    authenticatedJson(
      `/api/projects/${encodeURIComponent(id)}/measurements`,
      {},
      parseMeasurements,
    ),
  );
}

function parseMeasurement(value: unknown): Measurement | null {
  return isMeasurement(value) ? value : null;
}

/**
 * POST /api/measurements — create-only field measurement.
 * Owner creates are accepted server-side; does not create a Delta.
 */
export async function createProjectMeasurement(
  input: CreateMeasurementInput,
): Promise<Measurement> {
  const body: CreateMeasurementInput = {
    id: input.id.trim(),
    localMeasurementId: input.localMeasurementId.trim(),
    projectId: input.projectId.trim(),
    planItemId: input.planItemId.trim(),
    type: input.type,
    label: input.label,
    value: input.value,
    unit: input.unit,
    createdAt: input.createdAt,
  };

  if (
    !body.id ||
    !body.localMeasurementId ||
    body.localMeasurementId.includes("/") ||
    !body.projectId ||
    !body.planItemId ||
    !body.label.trim() ||
    !body.unit.trim() ||
    !body.createdAt.trim() ||
    !Number.isFinite(body.value)
  ) {
    throw new ApiError("Invalid measurement data.", 400);
  }

  return authenticatedJson(
    "/api/measurements",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    parseMeasurement,
  );
}

/** User-safe messages for create measurement failures. */
export function mapCreateMeasurementError(error: unknown): string {
  if (
    error instanceof NotAuthenticatedError ||
    (error instanceof ApiError && error.status === 401)
  ) {
    return "Your session could not be authenticated.";
  }

  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return "Invalid measurement data.";
      case 404:
        return "This measurement is not available for contribution.";
      case 409:
        return "This measurement was already recorded.";
      default:
        return "Unable to record measurement.";
    }
  }

  return "Unable to record measurement.";
}

/**
 * Collision-resistant local id + remote-compatible document id.
 * Format matches collaborator convention for future compatibility.
 */
export function createMeasurementClientIds(projectId: string): {
  localMeasurementId: string;
  id: string;
} {
  const project = projectId.trim();
  const localMeasurementId = `measurement-${crypto.randomUUID()}`;
  return {
    localMeasurementId,
    id: `${project}_${localMeasurementId}`,
  };
}

export type MeasurementReconcileOutcome = "created" | "existing" | "no_delta";

export type MeasurementReconcileResult =
  | {
      outcome: "created" | "existing";
      measurementId: string;
      delta: Delta;
    }
  | {
      outcome: "no_delta";
      reason: "zero_difference";
      measurementId: string;
      delta: null;
    };

/**
 * POST /api/projects/:projectId/measurements/:measurementId/reconcile
 * Empty body. Server calculates Plan-vs-Reality from canonical records.
 */
export async function reconcileProjectMeasurement(
  projectId: string,
  measurementId: string,
): Promise<MeasurementReconcileResult> {
  const project = projectId.trim();
  const measurement = measurementId.trim();

  if (!project || !measurement) {
    throw new ApiError("Invalid reconciliation request.", 400);
  }

  return authenticatedJson(
    `/api/projects/${encodeURIComponent(project)}/measurements/${encodeURIComponent(measurement)}/reconcile`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
    (value): MeasurementReconcileResult | null => {
      if (typeof value !== "object" || value === null) {
        return null;
      }
      const record = value as Record<string, unknown>;
      if (typeof record.measurementId !== "string") {
        return null;
      }

      if (record.outcome === "no_delta") {
        if (
          record.reason !== "zero_difference" ||
          record.delta !== null
        ) {
          return null;
        }
        return {
          outcome: "no_delta",
          reason: "zero_difference",
          measurementId: record.measurementId,
          delta: null,
        };
      }

      if (record.outcome !== "created" && record.outcome !== "existing") {
        return null;
      }

      const delta = parseDelta(record.delta);
      if (!delta) {
        return null;
      }

      return {
        outcome: record.outcome,
        measurementId: record.measurementId,
        delta,
      };
    },
  );
}

/** User-safe messages for reconcile failures after measurement create. */
export function mapReconcileMeasurementError(error: unknown): {
  kind: "ineligible" | "unavailable" | "auth" | "network";
  message: string;
} {
  if (
    error instanceof NotAuthenticatedError ||
    (error instanceof ApiError && error.status === 401)
  ) {
    return {
      kind: "auth",
      message: "Your session could not be authenticated.",
    };
  }

  if (error instanceof ApiError) {
    if (error.status === 400) {
      return {
        kind: "ineligible",
        message:
          "Variance could not be calculated from the current plan data.",
      };
    }
    if (error.status === 404) {
      return {
        kind: "unavailable",
        message: "Variance analysis is not available for this measurement.",
      };
    }
  }

  return {
    kind: "network",
    message: "Variance analysis could not complete.",
  };
}

export function effectiveMeasurementReviewStatus(
  measurement: Pick<Measurement, "reviewStatus">,
): MeasurementReviewStatus {
  return measurement.reviewStatus ?? "accepted";
}

export function formatMeasurementReviewLabel(
  status: MeasurementReviewStatus,
): string {
  switch (status) {
    case "pending":
      return "Pending review";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}
