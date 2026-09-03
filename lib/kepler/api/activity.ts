import { authenticatedJson } from "@/lib/kepler/api/client";

export type ActivityActorType = "human" | "agent" | "system";

export type ActivityEventType =
  | "assignment_created"
  | "assignment_accepted"
  | "assignment_started"
  | "assignment_ready_for_review"
  | "assignment_sent_back"
  | "assignment_continued"
  | "assignment_completed"
  | "assignment_reopened"
  | "assignment_cancelled"
  | "measurement_submitted"
  | "measurement_accepted"
  | "measurement_rejected"
  | "delta_created"
  | "agent_evidence_requested"
  | "agent_completed"
  | "agent_escalated"
  | "invitation_created"
  | "invitation_accepted"
  | "member_removed"
  | "feed_post_edited"
  | "feed_post_deleted"
  | string;

export type ActivityRelatedRefs = {
  workPackageId?: string;
  assignmentId?: string;
  projectMemberId?: string;
  planItemId?: string;
  measurementId?: string;
  evidenceId?: string;
  deltaId?: string;
  agentRunId?: string;
  invitationId?: string;
};

export type ActivityEvent = {
  id: string;
  projectId: string;
  type: ActivityEventType;
  actorType: ActivityActorType | string;
  actorUid?: string;
  subjectType: string;
  subjectId: string;
  sourceType: string;
  sourceId: string;
  related: ActivityRelatedRefs;
  metadata?: unknown;
  scopeWorkPackageIds?: string[];
  scopePlanItemIds?: string[];
  createdAt: string;
};

export type ActivityPage = {
  items: ActivityEvent[];
  nextCursor: string | null;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseRelated(value: unknown): ActivityRelatedRefs {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }
  const record = value as Record<string, unknown>;
  const related: ActivityRelatedRefs = {};
  const keys = [
    "workPackageId",
    "assignmentId",
    "projectMemberId",
    "planItemId",
    "measurementId",
    "evidenceId",
    "deltaId",
    "agentRunId",
    "invitationId",
  ] as const;
  for (const key of keys) {
    if (isNonEmptyString(record[key])) {
      related[key] = record[key].trim();
    }
  }
  return related;
}

function parseIdArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const ids = value.filter(isNonEmptyString).map((id) => id.trim());
  return ids.length > 0 ? ids : undefined;
}

function parseActivityEvent(value: unknown): ActivityEvent | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (
    !isNonEmptyString(record.id) ||
    !isNonEmptyString(record.projectId) ||
    !isNonEmptyString(record.type) ||
    !isNonEmptyString(record.actorType) ||
    !isNonEmptyString(record.subjectType) ||
    !isNonEmptyString(record.subjectId) ||
    !isNonEmptyString(record.sourceType) ||
    !isNonEmptyString(record.sourceId) ||
    !isNonEmptyString(record.createdAt)
  ) {
    return null;
  }

  const event: ActivityEvent = {
    id: record.id.trim(),
    projectId: record.projectId.trim(),
    type: record.type.trim(),
    actorType: record.actorType.trim(),
    subjectType: record.subjectType.trim(),
    subjectId: record.subjectId.trim(),
    sourceType: record.sourceType.trim(),
    sourceId: record.sourceId.trim(),
    related: parseRelated(record.related),
    createdAt: record.createdAt.trim(),
  };

  if (isNonEmptyString(record.actorUid)) {
    event.actorUid = record.actorUid.trim();
  }

  if (record.metadata !== undefined) {
    event.metadata = record.metadata;
  }

  const scopeWp = parseIdArray(record.scopeWorkPackageIds);
  if (scopeWp) {
    event.scopeWorkPackageIds = scopeWp;
  }

  const scopePlan = parseIdArray(record.scopePlanItemIds);
  if (scopePlan) {
    event.scopePlanItemIds = scopePlan;
  }

  return event;
}

function parseActivityPage(value: unknown): ActivityPage | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.items)) {
    return null;
  }

  const items: ActivityEvent[] = [];
  for (const entry of record.items) {
    const parsed = parseActivityEvent(entry);
    if (!parsed) {
      return null;
    }
    items.push(parsed);
  }

  const nextCursor =
    typeof record.nextCursor === "string" && record.nextCursor.trim()
      ? record.nextCursor.trim()
      : null;

  return { items, nextCursor };
}

/** GET /api/projects/:projectId/activity?limit=&cursor= */
export async function getProjectActivity(
  projectId: string,
  options?: { limit?: number; cursor?: string | null },
): Promise<ActivityPage> {
  const id = projectId.trim();
  if (!id) {
    throw new Error("projectId is required");
  }

  const params = new URLSearchParams();
  if (options?.limit != null) {
    params.set("limit", String(options.limit));
  }
  if (options?.cursor) {
    params.set("cursor", options.cursor);
  }

  const query = params.toString();
  const path = `/api/projects/${encodeURIComponent(id)}/activity${
    query ? `?${query}` : ""
  }`;

  return authenticatedJson(path, {}, parseActivityPage);
}

export function formatActivityEventLabel(type: string): string {
  const labels: Record<string, string> = {
    assignment_created: "Assignment created",
    assignment_accepted: "Assignment accepted",
    assignment_started: "Assignment started",
    assignment_ready_for_review: "Assignment ready for review",
    assignment_sent_back: "Assignment sent back",
    assignment_continued: "Assignment continued",
    assignment_completed: "Assignment completed",
    assignment_reopened: "Assignment reopened",
    assignment_cancelled: "Assignment cancelled",
    measurement_submitted: "Measurement submitted",
    measurement_accepted: "Measurement accepted",
    measurement_rejected: "Measurement rejected",
    delta_created: "Delta created",
    agent_evidence_requested: "Evidence requested",
    agent_completed: "Agent completed",
    agent_escalated: "Agent escalated",
    invitation_created: "Invitation created",
    invitation_accepted: "Invitation accepted",
    member_removed: "Member removed",
    feed_post_edited: "Feed post edited",
    feed_post_deleted: "Feed post deleted",
  };

  return labels[type] ?? type.replace(/_/g, " ");
}
