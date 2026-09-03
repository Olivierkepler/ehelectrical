/**
 * Presentation-only quantity formatting.
 * Does not mutate source values or participate in calculations.
 */
export function formatQuantity(
  value: number,
  maxFractionDigits = 2,
): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: 0,
    useGrouping: false,
  }).format(value);
}

export function formatSignedQuantity(
  value: number,
  maxFractionDigits = 2,
): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  const formatted = formatQuantity(Math.abs(value), maxFractionDigits);
  if (value > 0) {
    return `+${formatted}`;
  }
  if (value < 0) {
    return `-${formatted}`;
  }
  return formatted;
}

export function formatSignedPercent1(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }
  const formatted = formatQuantity(Math.abs(value), 1);
  if (value > 0) {
    return `+${formatted}%`;
  }
  if (value < 0) {
    return `-${formatted}%`;
  }
  return `${formatted}%`;
}
