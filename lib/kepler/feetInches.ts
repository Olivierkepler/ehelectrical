/**
 * Length input helpers matching Kepler mobile MeasurementScreen.
 * Submission value must not be rounded.
 */

export function feetAndInchesToFeet(feet: number, inches: number): number {
  return feet + inches / 12;
}

export type FeetInchesValidation =
  | { ok: true; value: number }
  | { ok: false; message: string };

/**
 * Parses feet/inches text fields the same way as mobile
 * (empty → 0) and enforces mobile save rules.
 */
export function validateFeetInchesInput(
  feetText: string,
  inchesText: string,
): FeetInchesValidation {
  const feet = Number(feetText || 0);
  const inches = Number(inchesText || 0);

  if (
    !Number.isFinite(feet) ||
    !Number.isFinite(inches) ||
    feet < 0 ||
    inches < 0 ||
    inches >= 12 ||
    feetAndInchesToFeet(feet, inches) <= 0
  ) {
    return {
      ok: false,
      message: "Enter a valid length before saving.",
    };
  }

  return { ok: true, value: feetAndInchesToFeet(feet, inches) };
}

/** True when a plan item matches mobile owner Measure eligibility. */
export function isLengthFeetPlanItem(item: {
  type: string;
  unit: string;
}): boolean {
  return item.type === "length" && item.unit === "ft";
}
