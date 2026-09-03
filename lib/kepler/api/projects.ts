import { authenticatedJson } from "@/lib/kepler/api/client";
import { dedupeAsync } from "@/lib/kepler/api/dedupe";

export type ProjectStatus =
  | "active"
  | "planning"
  | "completed"
  | "on-hold";

export type ProjectMemberRole =
  | "owner"
  | "project_admin"
  | "contractor"
  | "field_member"
  | "viewer";

export type DiscoveredProject = {
  id: string;
  localProjectId: string;
  name: string;
  location: string;
  status: ProjectStatus;
  ownerUid: string;
  membership: {
    role: ProjectMemberRole;
    status: "active";
  };
};

const PROJECT_STATUSES: readonly ProjectStatus[] = [
  "active",
  "planning",
  "completed",
  "on-hold",
];

const PROJECT_MEMBER_ROLES: readonly ProjectMemberRole[] = [
  "owner",
  "project_admin",
  "contractor",
  "field_member",
  "viewer",
];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isDiscoveredProject(value: unknown): value is DiscoveredProject {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  const membership = record.membership;

  if (typeof membership !== "object" || membership === null) {
    return false;
  }

  const membershipRecord = membership as Record<string, unknown>;

  return (
    isNonEmptyString(record.id) &&
    isNonEmptyString(record.localProjectId) &&
    typeof record.name === "string" &&
    typeof record.location === "string" &&
    typeof record.status === "string" &&
    (PROJECT_STATUSES as readonly string[]).includes(record.status) &&
    isNonEmptyString(record.ownerUid) &&
    typeof membershipRecord.role === "string" &&
    (PROJECT_MEMBER_ROLES as readonly string[]).includes(
      membershipRecord.role,
    ) &&
    membershipRecord.status === "active"
  );
}

function parseDiscoveredProjects(value: unknown): DiscoveredProject[] | null {
  if (!Array.isArray(value) || !value.every(isDiscoveredProject)) {
    return null;
  }

  return value;
}

/** GET /api/me/projects — membership + legacy-owner discovery portfolio. */
export async function getMyDiscoveredProjects(): Promise<DiscoveredProject[]> {
  return dedupeAsync("GET /api/me/projects", () =>
    authenticatedJson("/api/me/projects", {}, parseDiscoveredProjects),
  );
}

export function formatProjectStatusLabel(status: ProjectStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "planning":
      return "Planning";
    case "completed":
      return "Completed";
    case "on-hold":
      return "On hold";
    default:
      return status;
  }
}

export function formatProjectRoleLabel(role: ProjectMemberRole): string {
  switch (role) {
    case "owner":
      return "Owner";
    case "project_admin":
      return "Project admin";
    case "contractor":
      return "Contractor";
    case "field_member":
      return "Field member";
    case "viewer":
      return "Viewer";
    default:
      return role;
  }
}
