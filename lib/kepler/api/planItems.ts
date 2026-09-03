import { authenticatedJson } from "@/lib/kepler/api/client";
import { dedupeAsync } from "@/lib/kepler/api/dedupe";

export type PlanItemType = "length" | "area" | "count" | "volume";
export type PlanItemOrigin = "manual" | "plan_import";

/** GET /api/projects/:projectId/plan-items item shape. */
export type PlanItem = {
  id: string;
  localPlanItemId: string;
  projectId: string;
  type: PlanItemType;
  label: string;
  plannedValue: number;
  unit: string;
  unitCost: number;
  productionRatePerDay: number;
  laborHoursPerUnit: number;
  origin?: PlanItemOrigin;
  planImportId?: string;
  planImportCandidateId?: string;
};

const PLAN_ITEM_TYPES: readonly PlanItemType[] = [
  "length",
  "area",
  "count",
  "volume",
];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPlanItem(value: unknown): value is PlanItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  if (
    !isNonEmptyString(record.id) ||
    !isNonEmptyString(record.localPlanItemId) ||
    !isNonEmptyString(record.projectId) ||
    typeof record.type !== "string" ||
    !(PLAN_ITEM_TYPES as readonly string[]).includes(record.type) ||
    typeof record.label !== "string" ||
    typeof record.plannedValue !== "number" ||
    !Number.isFinite(record.plannedValue) ||
    typeof record.unit !== "string" ||
    typeof record.unitCost !== "number" ||
    !Number.isFinite(record.unitCost) ||
    typeof record.productionRatePerDay !== "number" ||
    !Number.isFinite(record.productionRatePerDay) ||
    typeof record.laborHoursPerUnit !== "number" ||
    !Number.isFinite(record.laborHoursPerUnit)
  ) {
    return false;
  }

  if (
    record.origin !== undefined &&
    record.origin !== "manual" &&
    record.origin !== "plan_import"
  ) {
    return false;
  }

  if (
    record.planImportId !== undefined &&
    typeof record.planImportId !== "string"
  ) {
    return false;
  }

  if (
    record.planImportCandidateId !== undefined &&
    typeof record.planImportCandidateId !== "string"
  ) {
    return false;
  }

  return true;
}

function parsePlanItems(value: unknown): PlanItem[] | null {
  if (!Array.isArray(value) || !value.every(isPlanItem)) {
    return null;
  }
  return value;
}

/** GET /api/projects/:projectId/plan-items */
export async function getProjectPlanItems(
  projectId: string,
): Promise<PlanItem[]> {
  const id = projectId.trim();
  if (!id) {
    throw new Error("projectId is required");
  }

  return dedupeAsync(`GET /api/projects/${id}/plan-items`, () =>
    authenticatedJson(
      `/api/projects/${encodeURIComponent(id)}/plan-items`,
      {},
      parsePlanItems,
    ),
  );
}

export function formatPlanItemTypeLabel(type: PlanItemType): string {
  switch (type) {
    case "length":
      return "Length";
    case "area":
      return "Area";
    case "count":
      return "Count";
    case "volume":
      return "Volume";
    default:
      return type;
  }
}

export function formatPlanItemOriginLabel(origin: PlanItemOrigin): string {
  switch (origin) {
    case "manual":
      return "Manual";
    case "plan_import":
      return "Plan import";
    default:
      return origin;
  }
}
