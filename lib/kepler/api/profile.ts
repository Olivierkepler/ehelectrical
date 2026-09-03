import { authenticatedJson } from "@/lib/kepler/api/client";
import { dedupeAsync } from "@/lib/kepler/api/dedupe";

export type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  createdAt: string | null;
  updatedAt: string | null;
  avatarUrl: string | null;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseUserProfile(value: unknown): UserProfile | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (!isNonEmptyString(record.uid)) {
    return null;
  }

  return {
    uid: record.uid.trim(),
    displayName:
      typeof record.displayName === "string" ? record.displayName.trim() : "",
    email: typeof record.email === "string" ? record.email.trim() : "",
    createdAt:
      typeof record.createdAt === "string" ? record.createdAt.trim() : null,
    updatedAt:
      typeof record.updatedAt === "string" ? record.updatedAt.trim() : null,
    avatarUrl:
      typeof record.avatarUrl === "string" && record.avatarUrl.trim()
        ? record.avatarUrl.trim()
        : null,
  };
}

/** GET /api/me/profile — presentation metadata only. */
export async function getOwnUserProfile(): Promise<UserProfile> {
  return dedupeAsync("GET /api/me/profile", () =>
    authenticatedJson("/api/me/profile", {}, parseUserProfile),
  );
}
