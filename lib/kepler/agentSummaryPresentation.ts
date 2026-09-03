import { ApiError } from "@/lib/kepler/api/client";
import type {
  AgentRunSummary,
  AgentSummary,
  AgentSummaryDocumentedImpact,
} from "@/lib/kepler/api/agentRuns";
import type { EvidenceListItem } from "@/lib/kepler/api/evidence";
import {
  MINUS_SIGN,
  formatQuantity,
  formatSignedPercent1,
  formatSignedQuantity,
} from "@/lib/kepler/formatQuantity";

export type AssessmentSectionId =
  | "variance"
  | "evidence"
  | "documentation"
  | "documented_impact"
  | "recommended_next_step";

export type AssessmentSection = {
  id: AssessmentSectionId;
  eyebrow: string;
  body: string;
};

export type EvidenceReviewedRow = {
  kindLabel: string;
  whenLabel: string | null;
};

export type EvidenceReviewed = {
  matchedCount: number;
  unmatchedCount: number;
  rows: EvidenceReviewedRow[];
};

/**
 * Owner-only full AgentSummary. Non-owners may still read AgentRun rationale.
 */
export function canViewAgentSummary(
  isActualOwner: boolean,
  run: AgentRunSummary | null,
): boolean {
  if (!isActualOwner || !run) {
    return false;
  }

  if (run.status !== "completed") {
    return false;
  }

  return (
    run.outcome?.kind === "summary_ready" &&
    Boolean(run.outcome.summaryId?.trim())
  );
}

export function formatEvidenceWhen(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function trimText(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseProseNumber(raw: string): number {
  return Number(raw.replaceAll(MINUS_SIGN, "-"));
}

function formatProseNumeric(
  raw: string,
  maxFractionDigits: number,
): string {
  const value = parseProseNumber(raw);
  if (!Number.isFinite(value)) {
    return raw;
  }

  const abs = formatQuantity(Math.abs(value), maxFractionDigits);
  if (abs === "0" || abs === "—") {
    return abs === "—" ? raw : "0";
  }
  if (value < 0) {
    return `${MINUS_SIGN}${abs}`;
  }
  if (raw.trim().startsWith("+")) {
    return `+${abs}`;
  }
  return abs;
}

/**
 * Display-only currency. Whole dollars omit cents; otherwise 2 decimals.
 * Returns null for non-finite values so callers can omit.
 */
export function formatAssessmentCurrency(value: number): string | null {
  if (!Number.isFinite(value)) {
    return null;
  }

  const cents = Math.round(value * 100);
  if (cents === 0) {
    return "$0";
  }

  const absCents = Math.abs(cents);
  const dollars = Math.floor(absCents / 100);
  const remainder = absCents % 100;
  const grouped = dollars.toLocaleString("en-US");
  const amount =
    remainder === 0
      ? `$${grouped}`
      : `$${grouped}.${String(remainder).padStart(2, "0")}`;

  return cents < 0 ? `${MINUS_SIGN}${amount}` : amount;
}

function formatAssessmentSigned(value: number, maxFractionDigits = 2): string | null {
  if (!Number.isFinite(value)) {
    return null;
  }
  const abs = formatQuantity(Math.abs(value), maxFractionDigits);
  if (abs === "—") {
    return null;
  }
  if (abs === "0") {
    return "0";
  }
  if (value < 0) {
    return `${MINUS_SIGN}${abs}`;
  }
  return abs;
}

export function formatAssessmentLaborHours(value: number): string | null {
  const signed = formatAssessmentSigned(value);
  return signed === null ? null : `${signed} hr`;
}

export function formatAssessmentDurationDays(value: number): string | null {
  const signed = formatAssessmentSigned(value);
  if (signed === null) {
    return null;
  }
  const absLabel = formatQuantity(Math.abs(value));
  const unit = absLabel === "1" ? "day" : "days";
  return `${signed} ${unit}`;
}

export type AssessmentDeltaHeaderValues = {
  plannedValue: number;
  actualValue: number;
  difference: number;
  percentDifference: number | null;
  unit: string;
};

/** Compact Delta header for the assessment sheet. Presentation only. */
export function formatAssessmentDeltaHeader(
  delta: AssessmentDeltaHeaderValues,
): string {
  const unit = delta.unit.trim();
  const plan = formatQuantity(delta.plannedValue);
  const field = formatQuantity(delta.actualValue);
  const variance = formatSignedQuantity(delta.difference);
  const percent = formatSignedPercent1(delta.percentDifference);
  return `Plan ${plan} ${unit} · Field ${field} ${unit} · Variance ${variance} ${unit} (${percent})`;
}

/**
 * Conservative prose normalization for AgentSummary text at render time.
 * Does not write back to the API. Leaves architectural notation like 12'-2" intact.
 */
export function formatAgentSummaryText(text: string): string {
  let out = text;

  out = out.replace(
    /([+\u2212-]?(?:\d+\.\d+|\d+))(\s*ft)\b/g,
    (_match, raw: string, unit: string) =>
      `${formatProseNumeric(raw, 2)}${unit}`,
  );

  out = out.replace(
    /([+\u2212-]?(?:\d+\.\d+|\d+))(\s*%)/g,
    (_match, raw: string, unit: string) =>
      `${formatProseNumeric(raw, 1)}${unit}`,
  );

  out = out.replace(
    /([+\u2212-]?(?:\d+\.\d+|\d+))(\s*(?:hours|hour|hr))\b/gi,
    (_match, raw: string, unit: string) =>
      `${formatProseNumeric(raw, 2)}${unit}`,
  );

  out = out.replace(
    /([+\u2212-]?(?:\d+\.\d+|\d+))(\s*(?:days|day))\b/gi,
    (_match, raw: string, unit: string) =>
      `${formatProseNumeric(raw, 2)}${unit}`,
  );

  out = out.replace(
    /([+\u2212-])?\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)/g,
    (match, sign: string | undefined, amount: string) => {
      const value = Number(
        `${sign === MINUS_SIGN || sign === "-" ? "-" : sign === "+" ? "" : ""}${amount.replaceAll(",", "")}`,
      );
      if (!Number.isFinite(value)) {
        return match;
      }
      const formatted = formatAssessmentCurrency(value);
      return formatted ?? match;
    },
  );

  out = out.replace(
    /(\bft)(\s+)(?!\()([+\u2212]?\d+(?:\.\d+)?%)/g,
    "$1$2($3)",
  );

  return out;
}

/** Join UI clauses without creating "ft.. Photo" from trailing periods. */
export function joinAssessmentClauses(parts: readonly string[]): string {
  const cleaned = parts.map((part) => part.trim()).filter((part) => part.length > 0);
  if (cleaned.length === 0) {
    return "";
  }

  let result = cleaned[0];
  for (let i = 1; i < cleaned.length; i += 1) {
    const next = cleaned[i];
    if (/[.!?]$/.test(result)) {
      result = `${result} ${next}`;
    } else {
      result = `${result}. ${next}`;
    }
  }
  return result;
}

function formatEvidenceRelevance(value: string | null): string | null {
  switch (value) {
    case "relevant":
      return "Relevant";
    case "possibly_relevant":
      return "Possibly relevant";
    case "not_relevant":
      return "Not relevant";
    case "insufficient_information":
      return "Insufficient information";
    case "unsupported_media":
      return "Unsupported media";
    default:
      return null;
  }
}

function evidenceAssessmentBody(summary: AgentSummary): string | null {
  const assessment = summary.evidenceAssessment;
  const parts: string[] = [];
  const relevance = formatEvidenceRelevance(assessment.relevance);
  const rationale = trimText(assessment.userVisibleRationale);
  if (relevance) {
    parts.push(relevance);
  }
  if (rationale) {
    parts.push(formatAgentSummaryText(rationale));
  }
  if (assessment.evidenceType === "photo" || assessment.evidenceType === "note") {
    parts.push(assessment.evidenceType === "photo" ? "Photo" : "Note");
  }
  const joined = joinAssessmentClauses(parts);
  return joined.length > 0 ? joined : null;
}

function documentedImpactBody(
  impact: AgentSummaryDocumentedImpact,
): string | null {
  const lines: string[] = [];

  if (impact.plannedValue !== null && Number.isFinite(impact.plannedValue)) {
    lines.push(`Planned ${formatQuantity(impact.plannedValue)}`);
  }
  if (impact.actualValue !== null && Number.isFinite(impact.actualValue)) {
    lines.push(`Field ${formatQuantity(impact.actualValue)}`);
  }
  if (impact.difference !== null && Number.isFinite(impact.difference)) {
    lines.push(`Difference ${formatSignedQuantity(impact.difference)}`);
  }
  if (
    impact.percentDifference !== null &&
    Number.isFinite(impact.percentDifference)
  ) {
    lines.push(`Variance ${formatSignedPercent1(impact.percentDifference)}`);
  }
  if (impact.costImpact !== null && Number.isFinite(impact.costImpact)) {
    const cost = formatAssessmentCurrency(impact.costImpact);
    if (cost) {
      lines.push(`Cost ${cost}`);
    }
  }
  if (
    impact.laborImpactHours !== null &&
    Number.isFinite(impact.laborImpactHours)
  ) {
    const labor = formatAssessmentLaborHours(impact.laborImpactHours);
    if (labor) {
      lines.push(`Labor ${labor}`);
    }
  }
  if (
    impact.scheduleImpactDays !== null &&
    Number.isFinite(impact.scheduleImpactDays)
  ) {
    const schedule = formatAssessmentDurationDays(impact.scheduleImpactDays);
    if (schedule) {
      lines.push(`Schedule ${schedule}`);
    }
  }

  return lines.length > 0 ? lines.join(" · ") : null;
}

/** Structured assessment sections. Empty fields are omitted. */
export function buildAssessmentSections(
  summary: AgentSummary,
): AssessmentSection[] {
  const sections: AssessmentSection[] = [];
  const variance = trimText(summary.varianceSummary);
  if (variance) {
    sections.push({
      id: "variance",
      eyebrow: "Variance",
      body: formatAgentSummaryText(variance),
    });
  }

  const evidence = evidenceAssessmentBody(summary);
  if (evidence) {
    sections.push({ id: "evidence", eyebrow: "Evidence", body: evidence });
  }

  const documentation = trimText(summary.documentationSummary);
  if (documentation) {
    sections.push({
      id: "documentation",
      eyebrow: "Documentation",
      body: formatAgentSummaryText(documentation),
    });
  }

  const impact = documentedImpactBody(summary.documentedImpact);
  if (impact) {
    sections.push({
      id: "documented_impact",
      eyebrow: "Documented impact",
      body: impact,
    });
  }

  const nextStep = trimText(summary.recommendedHumanNextStep);
  if (nextStep) {
    sections.push({
      id: "recommended_next_step",
      eyebrow: "Recommended next step",
      body: formatAgentSummaryText(nextStep),
    });
  }

  return sections;
}

export function matchEvidenceReviewed(
  evidenceIds: string[] | undefined,
  evidence: EvidenceListItem[] | null | undefined,
): EvidenceReviewed {
  const ids = (evidenceIds ?? []).map((id) => id.trim()).filter(Boolean);
  const catalog = evidence ?? [];
  const rows: EvidenceReviewedRow[] = [];
  let unmatchedCount = 0;

  for (const id of ids) {
    const item = catalog.find((entry) => entry.id === id);
    if (!item) {
      unmatchedCount += 1;
      continue;
    }
    rows.push({
      kindLabel: item.type === "note" ? "Note" : "Photo",
      whenLabel: formatEvidenceWhen(item.createdAt),
    });
  }

  return {
    matchedCount: rows.length,
    unmatchedCount,
    rows,
  };
}

export function summaryFetchErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return "Assessment is unavailable.";
  }
  if (error instanceof ApiError && error.status === 401) {
    return "Your session could not be authenticated.";
  }
  return "Unable to load assessment";
}
