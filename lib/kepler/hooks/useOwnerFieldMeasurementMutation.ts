"use client";

import { useCallback } from "react";

import type { PlanItem } from "@/lib/kepler/api/planItems";
import {
  createMeasurementClientIds,
  createProjectMeasurement,
  mapCreateMeasurementError,
  mapReconcileMeasurementError,
  reconcileProjectMeasurement,
  type Measurement,
  type MeasurementReconcileResult,
} from "@/lib/kepler/api/measurements";
import { useProjectWorkspace } from "@/lib/kepler/hooks/useProjectWorkspace";

export type OwnerFieldMeasurementFlowResult =
  | {
      status: "complete";
      measurement: Measurement;
      reconcile: MeasurementReconcileResult;
    }
  | {
      status: "measurement_failed";
      message: string;
    }
  | {
      status: "reconcile_failed";
      measurement: Measurement;
      message: string;
      reconcileKind: "ineligible" | "unavailable" | "auth" | "network";
      canRetryAnalysis: boolean;
    };

export type OwnerReconcileRetryResult =
  | {
      status: "complete";
      reconcile: MeasurementReconcileResult;
    }
  | {
      status: "reconcile_failed";
      message: string;
      reconcileKind: "ineligible" | "unavailable" | "auth" | "network";
      canRetryAnalysis: boolean;
    };

/**
 * Orchestrates owner field measurement create + server reconcile.
 * UI must not calculate Plan-vs-Reality arithmetic.
 */
export function useOwnerFieldMeasurementMutation() {
  const {
    projectId,
    invalidateMeasurements,
    invalidateDeltas,
    invalidateActivity,
  } = useProjectWorkspace();

  const refreshReads = useCallback(() => {
    invalidateMeasurements();
    invalidateDeltas();
    invalidateActivity();
  }, [invalidateMeasurements, invalidateDeltas, invalidateActivity]);

  const recordAndReconcile = useCallback(
    async (input: {
      planItem: PlanItem;
      value: number;
    }): Promise<OwnerFieldMeasurementFlowResult> => {
      const ids = createMeasurementClientIds(projectId);

      let measurement: Measurement;
      try {
        measurement = await createProjectMeasurement({
          id: ids.id,
          localMeasurementId: ids.localMeasurementId,
          projectId,
          planItemId: input.planItem.id,
          type: input.planItem.type,
          label: input.planItem.label,
          value: input.value,
          unit: input.planItem.unit,
          createdAt: new Date().toISOString(),
        });
      } catch (error: unknown) {
        return {
          status: "measurement_failed",
          message: mapCreateMeasurementError(error),
        };
      }

      invalidateMeasurements();

      try {
        const reconcile = await reconcileProjectMeasurement(
          projectId,
          measurement.id,
        );
        refreshReads();
        return {
          status: "complete",
          measurement,
          reconcile,
        };
      } catch (error: unknown) {
        const mapped = mapReconcileMeasurementError(error);
        invalidateMeasurements();
        return {
          status: "reconcile_failed",
          measurement,
          message: mapped.message,
          reconcileKind: mapped.kind,
          canRetryAnalysis:
            mapped.kind === "network" ||
            mapped.kind === "auth" ||
            mapped.kind === "ineligible",
        };
      }
    },
    [projectId, invalidateMeasurements, refreshReads],
  );

  const retryReconcile = useCallback(
    async (measurementId: string): Promise<OwnerReconcileRetryResult> => {
      try {
        const reconcile = await reconcileProjectMeasurement(
          projectId,
          measurementId,
        );
        refreshReads();
        return { status: "complete", reconcile };
      } catch (error: unknown) {
        const mapped = mapReconcileMeasurementError(error);
        return {
          status: "reconcile_failed",
          message: mapped.message,
          reconcileKind: mapped.kind,
          canRetryAnalysis:
            mapped.kind === "network" ||
            mapped.kind === "auth" ||
            mapped.kind === "ineligible",
        };
      }
    },
    [projectId, refreshReads],
  );

  return { recordAndReconcile, retryReconcile };
}
