import { ApiError } from "@/lib/kepler/api/client";
import type {
  AgentRunSummary,
  AgentSummary,
  AgentSummaryDocumentedImpact,
} from "@/lib/kepler/api/agentRuns";
import type { EvidenceListItem } from "@/lib/kepler/api/evidence";
import {
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
    parts.push(rationale);
  }
  if (assessment.evidenceType === "photo" || assessment.evidenceType === "note") {
    parts.push(assessment.evidenceType === "photo" ? "Photo" : "Note");
  }
  return parts.length > 0 ? parts.join(". ") : null;
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
    lines.push(formatSignedPercent1(impact.percentDifference));
  }
  if (impact.costImpact !== null && Number.isFinite(impact.costImpact)) {
    lines.push(`Cost ${formatSignedQuantity(impact.costImpact)}`);
  }
  if (
    impact.laborImpactHours !== null &&
    Number.isFinite(impact.laborImpactHours)
  ) {
    lines.push(`Labor ${formatSignedQuantity(impact.laborImpactHours)} hr`);
  }
  if (
    impact.scheduleImpactDays !== null &&
    Number.isFinite(impact.scheduleImpactDays)
  ) {
    const unit = Math.abs(impact.scheduleImpactDays) === 1 ? "day" : "days";
    lines.push(
      `Schedule ${formatSignedQuantity(impact.scheduleImpactDays)} ${unit}`,
    );
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
    sections.push({ id: "variance", eyebrow: "Variance", body: variance });
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
      body: documentation,
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
      body: nextStep,
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
