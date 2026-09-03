/**
 * Presentation-only quantity formatting.
 * Does not mutate source values or participate in calculations.
 */

/** Typographic minus for signed numeric display. */
export const MINUS_SIGN = "\u2212";

export function formatQuantity(
  value: number,
  maxFractionDigits = 2,
): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  if (Object.is(value, -0) || value === 0) {
    return "0";
  }

  if (Number.isInteger(value)) {
    return value < 0 ? `${MINUS_SIGN}${String(Math.abs(value))}` : String(value);
  }

  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: 0,
    useGrouping: false,
  }).format(Math.abs(value));

  if (formatted === "0") {
    return "0";
  }

  return value < 0 ? `${MINUS_SIGN}${formatted}` : formatted;
}

function signedFromAbsolute(
  value: number,
  formattedAbs: string,
): string {
  if (formattedAbs === "0" || formattedAbs === "—") {
    return formattedAbs;
  }
  if (value < 0) {
    return `${MINUS_SIGN}${formattedAbs}`;
  }
  if (value > 0) {
    return `+${formattedAbs}`;
  }
  return formattedAbs;
}

export function formatSignedQuantity(
  value: number,
  maxFractionDigits = 2,
): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  const formatted = formatQuantity(Math.abs(value), maxFractionDigits);
  return signedFromAbsolute(value, formatted);
}

export function formatSignedPercent1(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }
  const formatted = formatQuantity(Math.abs(value), 1);
  if (formatted === "0") {
    return "0%";
  }
  return `${signedFromAbsolute(value, formatted)}%`;
}
