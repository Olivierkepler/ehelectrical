/**
 * Presentation-only AgentSummary formatting.
 * Run: npx tsx lib/kepler/agentSummaryPresentation.selftest.ts
 */
import type { AgentSummary } from "./api/agentRuns";
import {
  buildAssessmentSections,
  formatAgentSummaryText,
  formatAssessmentCurrency,
  formatAssessmentDeltaHeader,
  formatAssessmentDurationDays,
  formatAssessmentLaborHours,
  joinAssessmentClauses,
} from "./agentSummaryPresentation";
import { MINUS_SIGN, formatSignedPercent1, formatSignedQuantity } from "./formatQuantity";

function check(condition: boolean, label: string) {
  if (!condition) {
    throw new Error(`FAIL: ${label}`);
  }
  console.log(`PASS: ${label}`);
}

const minus = MINUS_SIGN;

check(
  formatAgentSummaryText("12.166666666666667 ft") === "12.17 ft",
  "A 12.166666666666667 ft → 12.17 ft",
);

check(
  formatAgentSummaryText("-27.83333333333333 ft") === `${minus}27.83 ft`,
  "B -27.83333333333333 ft → −27.83 ft",
);

check(
  formatAgentSummaryText("-69.58333333333333%") === `${minus}69.6%`,
  "C -69.58333333333333% → −69.6%",
);

check(
  formatAgentSummaryText("-8.350000000000001 hours") === `${minus}8.35 hours`,
  "D -8.350000000000001 hours → −8.35 hours",
);

check(
  formatAgentSummaryText("-1.391666666666667 days") === `${minus}1.39 days`,
  "E -1.391666666666667 days → −1.39 days",
);

check(formatAgentSummaryText("40 ft") === "40 ft", "F 40 ft stays 40 ft");

const architectural = `Documented as 12'-2" 12.166666666666667 ft`;
check(
  formatAgentSummaryText(architectural) === `Documented as 12'-2" 12.17 ft`,
  "G architectural 12'-2\" preserved; decimal ft rounded",
);
check(
  formatAgentSummaryText(`12'-2"`) === `12'-2"`,
  "G architectural notation unchanged when alone",
);

const prose = "Review remaining framing before close-in.";
check(
  formatAgentSummaryText(prose) === prose,
  "H normal prose without numeric units unchanged",
);
check(
  formatAgentSummaryText("There are 3 photos on file.") ===
    "There are 3 photos on file.",
  "H bare counts without construction units unchanged",
);

check(formatSignedQuantity(-0.004) === "0", "I negative zero does not render as −0");
check(formatSignedQuantity(-0) === "0", "I signed -0 is 0");
check(formatSignedPercent1(-0.04) === "0%", "I percent rounded to zero is 0%");
check(!formatSignedQuantity(-0.004).includes(minus), "I no minus on rounded zero");

check(formatAssessmentCurrency(NaN) === null, "non-finite currency omitted");
check(formatAssessmentCurrency(Infinity) === null, "non-finite +Inf currency omitted");
check(formatAssessmentDurationDays(Number.NaN) === null, "non-finite days omitted");
check(formatAssessmentLaborHours(-Infinity) === null, "non-finite labor omitted");

check(formatAssessmentCurrency(-334) === `${minus}$334`, "L -334 → −$334");
check(formatAssessmentCurrency(-334.5) === `${minus}$334.50`, "L -334.5 → −$334.50");
check(formatAssessmentCurrency(1234.5) === "$1,234.50", "M 1234.5 → $1,234.50");

check(formatAssessmentLaborHours(-8.350000000000001) === `${minus}8.35 hr`, "labor hours");
check(formatAssessmentLaborHours(8) === "8 hr", "labor integer 8 hr");
check(
  formatAssessmentDurationDays(-1.391666666666667) === `${minus}1.39 days`,
  "schedule days",
);
check(formatAssessmentDurationDays(1) === "1 day", "schedule singular day");
check(formatAssessmentDurationDays(2) === "2 days", "schedule plural days");

const varianceProse =
  "The field measurement of 12.166666666666667 ft for the conference room wall represents a variance of -27.83333333333333 ft -69.58333333333333% from the planned 40 ft.";
const formattedVariance = formatAgentSummaryText(varianceProse);
check(
  formattedVariance ===
    `The field measurement of 12.17 ft for the conference room wall represents a variance of ${minus}27.83 ft (${minus}69.6%) from the planned 40 ft.`,
  "variance prose rounded with percent parentheses",
);
check(!formattedVariance.includes("166666"), "no raw float tail in variance prose");
check(!formattedVariance.includes("583333"), "no raw percent tail in variance prose");

check(
  joinAssessmentClauses(["Relevant", "The photo matches the planned 40 ft.", "Photo"]) ===
    "Relevant. The photo matches the planned 40 ft. Photo",
  "K join does not produce ft.. Photo",
);
check(
  !joinAssessmentClauses(["Relevant", "Measured 40 ft.", "Photo"]).includes("ft.."),
  "K no duplicate punctuation at UI join boundary",
);

function emptyImpact(): AgentSummary["documentedImpact"] {
  return {
    plannedValue: null,
    actualValue: null,
    difference: null,
    percentDifference: null,
    costImpact: null,
    laborImpactHours: null,
    scheduleImpactDays: null,
  };
}

const productionLike: AgentSummary = {
  id: "agent-summary:x",
  agentRunId: "field-variance:test",
  projectId: "p1",
  createdAt: "2026-01-01T01:00:00.000Z",
  varianceSummary: varianceProse,
  documentationSummary: `Tape reads 12'-2" 12.166666666666667 ft at the opening.`,
  evidenceAssessment: {
    evidenceId: "ev-photo-1",
    evidenceType: "photo",
    relevance: "relevant",
    userVisibleRationale: "The photo is consistent with the planned 40 ft.",
  },
  documentedImpact: {
    plannedValue: 40,
    actualValue: 12.166666666666666,
    difference: -27.833333333333332,
    percentDifference: -69.58333333333333,
    costImpact: -334,
    laborImpactHours: -8.350000000000001,
    scheduleImpactDays: -1.391666666666667,
  },
  recommendedHumanNextStep: "Confirm remaining length before close-in.",
  sourceRefs: { evidenceIds: ["ev-photo-1"] },
};

const sections = buildAssessmentSections(productionLike);
const byId = Object.fromEntries(sections.map((section) => [section.id, section.body]));

check(
  byId.variance === formattedVariance,
  "variance section uses presentation formatting",
);
check(
  byId.evidence ===
    "Relevant. The photo is consistent with the planned 40 ft. Photo",
  "K evidence section 40 ft. Photo",
);
check(!byId.evidence.includes(".."), "K evidence body has no ..");
check(
  byId.documentation.includes(`12'-2"`),
  "documentation preserves architectural notation",
);
check(
  byId.documentation.includes("12.17 ft"),
  "documentation rounds decimal feet",
);
check(
  byId.documented_impact ===
    `Planned 40 · Field 12.17 · Difference ${minus}27.83 · Variance ${minus}69.6% · Cost ${minus}$334 · Labor ${minus}8.35 hr · Schedule ${minus}1.39 days`,
  "documented impact compact formatting",
);
check(
  byId.recommended_next_step === "Confirm remaining length before close-in.",
  "recommended next step preserved",
);

const omittedCost: AgentSummary = {
  ...productionLike,
  documentedImpact: {
    ...productionLike.documentedImpact,
    costImpact: null,
    laborImpactHours: null,
    scheduleImpactDays: null,
  },
};
const omittedSections = buildAssessmentSections(omittedCost);
const omittedImpact = omittedSections.find((s) => s.id === "documented_impact")?.body ?? "";
check(!omittedImpact.includes("Cost"), "J missing cost omitted");
check(!omittedImpact.includes("Labor"), "J missing labor omitted");
check(!omittedImpact.includes("Schedule"), "J missing schedule omitted");
check(omittedImpact.includes("Planned 40"), "J present planned value still shown");

const emptySections = buildAssessmentSections({
  ...productionLike,
  varianceSummary: "  ",
  documentationSummary: "",
  recommendedHumanNextStep: null,
  evidenceAssessment: {
    evidenceId: null,
    evidenceType: null,
    relevance: null,
    userVisibleRationale: null,
  },
  documentedImpact: emptyImpact(),
});
check(emptySections.length === 0, "J fully missing optional sections omitted");

check(
  formatAssessmentDeltaHeader({
    plannedValue: 40,
    actualValue: 12.166666666666667,
    difference: -27.83333333333333,
    percentDifference: -69.58333333333333,
    unit: "ft",
  }) ===
    `Plan 40 ft · Field 12.17 ft · Variance ${minus}27.83 ft (${minus}69.6%)`,
  "assessment delta header",
);

const originalVariance = productionLike.varianceSummary;
formatAgentSummaryText(originalVariance);
check(
  productionLike.varianceSummary === originalVariance,
  "formatter does not mutate source summary text",
);

console.log("ALL AGENT SUMMARY PRESENTATION SELFTESTS PASSED");
