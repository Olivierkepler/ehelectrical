import { authenticatedJson } from "@/lib/kepler/api/client";
import { dedupeAsync } from "@/lib/kepler/api/dedupe";
import {
  formatProjectRoleLabel,
  type ProjectMemberRole,
} from "@/lib/kepler/api/projects";

const PROJECT_MEMBER_ROLES: readonly ProjectMemberRole[] = [
  "owner",
  "project_admin",
  "contractor",
  "field_member",
  "viewer",
];

export type ProjectMemberStatus = "invited" | "active" | "removed";

const PROJECT_MEMBER_STATUSES: readonly ProjectMemberStatus[] = [
  "invited",
  "active",
  "removed",
];

/** Canonical GET /api/projects/:projectId/members item (owner-only). */
export type ProjectMemberRecord = {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  status: ProjectMemberStatus;
  invitedBy: string;
  createdAt: string;
  updatedAt: string;
  /** Phase 2E-E optional presentation fields (trusted server-side). */
  displayName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

/**
 * GET /api/projects/:projectId/conversations/messageable-members item.
 * Active members excluding the caller. No membership status field.
 */
export type MessageableMember = {
  projectMemberId: string;
  userId: string;
  role: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
};

/** Presentation row. Only fields the selected contract actually supplied. */
export type ProjectTeamPerson = {
  id: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: string | null;
  membershipStatus: ProjectMemberStatus | null;
  isCurrentUser: boolean;
};

export type OwnTeamIdentity = {
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isProjectMemberRole(value: unknown): value is ProjectMemberRole {
  return (
    typeof value === "string" &&
    (PROJECT_MEMBER_ROLES as readonly string[]).includes(value)
  );
}

function isProjectMemberStatus(value: unknown): value is ProjectMemberStatus {
  return (
    typeof value === "string" &&
    (PROJECT_MEMBER_STATUSES as readonly string[]).includes(value)
  );
}

function isOptionalStringOrNull(value: unknown): value is string | null | undefined {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string")
  );
}

function isProjectMemberRecord(value: unknown): value is ProjectMemberRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    isNonEmptyString(record.id) &&
    isNonEmptyString(record.projectId) &&
    isNonEmptyString(record.userId) &&
    isProjectMemberRole(record.role) &&
    isProjectMemberStatus(record.status) &&
    typeof record.invitedBy === "string" &&
    typeof record.createdAt === "string" &&
    typeof record.updatedAt === "string" &&
    isOptionalStringOrNull(record.displayName) &&
    isOptionalStringOrNull(record.email) &&
    isOptionalStringOrNull(record.avatarUrl) &&
    !("avatarStoragePath" in record)
  );
}

function parseOptionalPresentation(
  value: unknown,
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return undefined;
}

function parseProjectMembers(value: unknown): ProjectMemberRecord[] | null {
  if (!Array.isArray(value) || !value.every(isProjectMemberRecord)) {
    return null;
  }
  return value.map((member) => ({
    id: member.id.trim(),
    projectId: member.projectId.trim(),
    userId: member.userId.trim(),
    role: member.role,
    status: member.status,
    invitedBy: member.invitedBy.trim(),
    createdAt: member.createdAt.trim(),
    updatedAt: member.updatedAt.trim(),
    displayName: parseOptionalPresentation(member.displayName),
    email: parseOptionalPresentation(member.email),
    avatarUrl: parseOptionalPresentation(member.avatarUrl),
  }));
}

function parseMessageableMember(value: unknown): MessageableMember | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (
    !isNonEmptyString(record.projectMemberId) ||
    !isNonEmptyString(record.userId) ||
    !isNonEmptyString(record.role)
  ) {
    return null;
  }
  return {
    projectMemberId: record.projectMemberId.trim(),
    userId: record.userId.trim(),
    role: record.role.trim(),
    displayName:
      typeof record.displayName === "string"
        ? record.displayName.trim() || null
        : null,
    email:
      typeof record.email === "string" ? record.email.trim() || null : null,
    avatarUrl:
      typeof record.avatarUrl === "string" && record.avatarUrl.trim()
        ? record.avatarUrl.trim()
        : null,
  };
}

function parseMessageableMembers(value: unknown): MessageableMember[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const items = value.map(parseMessageableMember);
  if (items.some((item) => item === null)) {
    return null;
  }
  return items as MessageableMember[];
}

/** GET /api/projects/:projectId/members — owner-only on the backend. */
export async function getProjectMembers(
  projectId: string,
): Promise<ProjectMemberRecord[]> {
  const id = projectId.trim();
  if (!id) {
    throw new Error("projectId is required");
  }
  return dedupeAsync(`GET /api/projects/${id}/members`, () =>
    authenticatedJson(
      `/api/projects/${encodeURIComponent(id)}/members`,
      {},
      parseProjectMembers,
    ),
  );
}

/** GET /api/projects/:projectId/conversations/messageable-members */
export async function getMessageableMembers(
  projectId: string,
): Promise<MessageableMember[]> {
  const id = projectId.trim();
  if (!id) {
    throw new Error("projectId is required");
  }
  return dedupeAsync(
    `GET /api/projects/${id}/conversations/messageable-members`,
    () =>
      authenticatedJson(
        `/api/projects/${encodeURIComponent(id)}/conversations/messageable-members`,
        {},
        parseMessageableMembers,
      ),
  );
}

export function presentProjectMember(
  member: ProjectMemberRecord,
  currentUserId: string | null,
  own: OwnTeamIdentity | null,
): ProjectTeamPerson {
  const isCurrentUser = Boolean(
    currentUserId && member.userId === currentUserId,
  );
  const backendName = member.displayName?.trim() || null;
  const backendEmail = member.email?.trim() || null;
  const backendAvatar = member.avatarUrl?.trim() || null;
  const ownName = own?.displayName?.trim() || null;
  const ownEmail = own?.email?.trim() || null;
  const ownAvatar = own?.avatarUrl?.trim() || null;

  return {
    id: member.id,
    displayName: backendName || (isCurrentUser ? ownName : null),
    email: backendEmail || (isCurrentUser ? ownEmail : null),
    avatarUrl: backendAvatar || (isCurrentUser ? ownAvatar : null),
    role: member.role,
    membershipStatus: member.status,
    isCurrentUser,
  };
}

export function presentMessageableMember(
  member: MessageableMember,
  currentUserId: string | null,
): ProjectTeamPerson {
  return {
    id: member.projectMemberId,
    displayName: member.displayName,
    email: member.email,
    avatarUrl: member.avatarUrl,
    role: member.role,
    membershipStatus: null,
    isCurrentUser: Boolean(currentUserId && member.userId === currentUserId),
  };
}

export function formatTeamRoleLabel(role: string): string {
  if (isProjectMemberRole(role)) {
    return formatProjectRoleLabel(role);
  }
  return role;
}

export function formatTeamStatusLabel(status: ProjectMemberStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "invited":
      return "Invited";
    case "removed":
      return "Removed";
    default:
      return status;
  }
}

export function teamPersonPrimaryLabel(person: ProjectTeamPerson): string | null {
  const name = person.displayName?.trim();
  if (name) {
    return name;
  }
  const email = person.email?.trim();
  if (email) {
    return email;
  }
  return null;
}
