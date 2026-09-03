import {
  authenticatedFetch,
  authenticatedJson,
  NotAuthenticatedError,
  ApiError,
} from "@/lib/kepler/api/client";
import { dedupeAsync } from "@/lib/kepler/api/dedupe";

export type EvidenceType = "photo" | "note";

/**
 * List item from GET /api/projects/:projectId/evidence
 * (ownerUid stripped by backend toEvidenceListItem).
 */
export type EvidenceListItem = {
  id: string;
  projectId: string;
  localEvidenceId: string;
  type: EvidenceType;
  note: string;
  objectPath: string | null;
  contentType: string | null;
  createdAt: string;
  localMeasurementId: string | null;
  localDeltaId: string | null;
  capturedByUid?: string;
};

export type EvidenceReadUrlResponse = {
  remoteEvidenceId: string;
  readUrl: string;
  objectPath: string;
  expiresAt: string;
};

/** POST /api/projects/:projectId/evidence/upload-url */
export type EvidenceUploadUrlRequest = {
  localEvidenceId: string;
  contentType: string;
  localDeltaId: string;
  /** Always null for Phase 2G-A Delta-linked uploads. */
  localMeasurementId?: null;
};

export type EvidenceUploadUrlResponse = {
  remoteEvidenceId: string;
  localEvidenceId: string;
  uploadUrl: string;
  objectPath: string;
  contentType: string;
  expiresAt: string;
};

/** POST /api/projects/:projectId/evidence — photo commit */
export type CreateEvidencePhotoRequest = {
  localEvidenceId: string;
  type: "photo";
  note: string;
  createdAt: string;
  objectPath: string;
  contentType: string;
  localMeasurementId: null;
  localDeltaId: string;
};

export type CreateEvidenceResult = {
  evidence: EvidenceListItem;
  /** 201 = new Evidence; 200 = idempotent existing. */
  created: boolean;
};

/** Web-safe MIME allowlist (agent-compatible; HEIC omitted). */
export const WEB_EVIDENCE_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type WebEvidencePhotoMimeType =
  (typeof WEB_EVIDENCE_PHOTO_MIME_TYPES)[number];

/** Align with agent multimodal load limit (DEFAULT_MAX_MULTIMODAL_IMAGE_BYTES). */
export const WEB_EVIDENCE_MAX_PHOTO_BYTES = 8 * 1024 * 1024;

function isEvidenceListItem(value: unknown): value is EvidenceListItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  const localMeasurementId =
    record.localMeasurementId === undefined || record.localMeasurementId === null
      ? null
      : typeof record.localMeasurementId === "string"
        ? record.localMeasurementId
        : undefined;
  const localDeltaId =
    record.localDeltaId === undefined || record.localDeltaId === null
      ? null
      : typeof record.localDeltaId === "string"
        ? record.localDeltaId
        : undefined;

  if (localMeasurementId === undefined || localDeltaId === undefined) {
    return false;
  }

  if (localMeasurementId !== null && localDeltaId !== null) {
    return false;
  }

  if (
    typeof record.id !== "string" ||
    typeof record.projectId !== "string" ||
    typeof record.localEvidenceId !== "string" ||
    (record.type !== "photo" && record.type !== "note") ||
    typeof record.note !== "string" ||
    (record.objectPath !== null && typeof record.objectPath !== "string") ||
    (record.contentType !== null && typeof record.contentType !== "string") ||
    typeof record.createdAt !== "string" ||
    (record.capturedByUid !== undefined &&
      typeof record.capturedByUid !== "string")
  ) {
    return false;
  }

  (record as { localMeasurementId: string | null }).localMeasurementId =
    localMeasurementId;
  (record as { localDeltaId: string | null }).localDeltaId = localDeltaId;

  return true;
}

function parseEvidenceList(value: unknown): EvidenceListItem[] | null {
  if (!Array.isArray(value) || !value.every(isEvidenceListItem)) {
    return null;
  }
  return value;
}

function parseReadUrl(value: unknown): EvidenceReadUrlResponse | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.remoteEvidenceId !== "string" ||
    typeof record.readUrl !== "string" ||
    typeof record.objectPath !== "string" ||
    typeof record.expiresAt !== "string"
  ) {
    return null;
  }
  return {
    remoteEvidenceId: record.remoteEvidenceId,
    readUrl: record.readUrl,
    objectPath: record.objectPath,
    expiresAt: record.expiresAt,
  };
}

function parseUploadUrl(value: unknown): EvidenceUploadUrlResponse | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.remoteEvidenceId !== "string" ||
    typeof record.localEvidenceId !== "string" ||
    typeof record.uploadUrl !== "string" ||
    typeof record.objectPath !== "string" ||
    typeof record.contentType !== "string" ||
    typeof record.expiresAt !== "string"
  ) {
    return null;
  }
  return {
    remoteEvidenceId: record.remoteEvidenceId,
    localEvidenceId: record.localEvidenceId,
    uploadUrl: record.uploadUrl,
    objectPath: record.objectPath,
    contentType: record.contentType,
    expiresAt: record.expiresAt,
  };
}

export function isWebEvidencePhotoMimeType(
  value: string,
): value is WebEvidencePhotoMimeType {
  return (WEB_EVIDENCE_PHOTO_MIME_TYPES as readonly string[]).includes(value);
}

export function createLocalEvidenceId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `evidence-${crypto.randomUUID()}`;
  }
  return `evidence-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

/** GET /api/projects/:projectId/evidence */
export async function getProjectEvidence(
  projectId: string,
): Promise<EvidenceListItem[]> {
  const id = projectId.trim();
  if (!id) {
    throw new Error("projectId is required");
  }

  return dedupeAsync(`GET /api/projects/${id}/evidence`, () =>
    authenticatedJson(
      `/api/projects/${encodeURIComponent(id)}/evidence`,
      {},
      parseEvidenceList,
    ),
  );
}

/**
 * POST /api/projects/:projectId/evidence/:evidenceId/read-url
 * Authorized read-access only — does not mutate evidence.
 */
export async function getEvidenceReadUrl(
  projectId: string,
  evidenceId: string,
): Promise<EvidenceReadUrlResponse> {
  const pid = projectId.trim();
  const eid = evidenceId.trim();
  if (!pid || !eid) {
    throw new Error("projectId and evidenceId are required");
  }

  let response: Response;
  try {
    response = await authenticatedFetch(
      `/api/projects/${encodeURIComponent(pid)}/evidence/${encodeURIComponent(eid)}/read-url`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      throw error;
    }
    throw new Error("Unable to load evidence preview.");
  }

  if (response.status === 401) {
    throw new ApiError("Your session could not be authenticated.", 401);
  }

  if (!response.ok) {
    throw new ApiError("Unable to load evidence preview.", response.status);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Unable to load evidence preview.");
  }

  const parsed = parseReadUrl(payload);
  if (!parsed) {
    throw new Error("Unable to load evidence preview.");
  }

  return parsed;
}

/**
 * POST /api/projects/:projectId/evidence/upload-url
 * Returns a short-lived signed PUT URL. Do not persist uploadUrl.
 */
export async function requestEvidenceUploadUrl(
  projectId: string,
  request: EvidenceUploadUrlRequest,
): Promise<EvidenceUploadUrlResponse> {
  const pid = projectId.trim();
  const localEvidenceId = request.localEvidenceId.trim();
  const contentType = request.contentType.trim();
  const localDeltaId = request.localDeltaId.trim();

  if (!pid || !localEvidenceId || !contentType || !localDeltaId) {
    throw new Error("Evidence upload context is incomplete.");
  }

  let response: Response;
  try {
    response = await authenticatedFetch(
      `/api/projects/${encodeURIComponent(pid)}/evidence/upload-url`,
      {
        method: "POST",
        body: JSON.stringify({
          localEvidenceId,
          contentType,
          localDeltaId,
          localMeasurementId: null,
        }),
      },
    );
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      throw error;
    }
    throw new Error("Unable to prepare evidence upload.");
  }

  if (response.status === 401) {
    throw new ApiError("Your session could not be authenticated.", 401);
  }

  if (response.status === 404 || response.status === 403) {
    throw new ApiError("Unable to prepare evidence upload for this project.", response.status);
  }

  if (response.status === 400) {
    throw new ApiError("Unsupported photo or invalid evidence upload request.", 400);
  }

  if (!response.ok) {
    throw new ApiError("Unable to prepare evidence upload.", response.status);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Unable to prepare evidence upload.");
  }

  const parsed = parseUploadUrl(payload);
  if (!parsed) {
    throw new Error("Unable to prepare evidence upload.");
  }

  return parsed;
}

/**
 * PUT file bytes to the signed upload URL from requestEvidenceUploadUrl.
 * Does not use Firebase Storage or GCS credentials.
 */
export async function putEvidencePhotoToSignedUrl(input: {
  uploadUrl: string;
  contentType: string;
  file: Blob;
}): Promise<void> {
  const uploadUrl = input.uploadUrl.trim();
  const contentType = input.contentType.trim();

  if (!uploadUrl || !contentType) {
    throw new Error("Upload preparation is incomplete.");
  }

  let response: Response;
  try {
    response = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: input.file,
    });
  } catch {
    throw new Error("Photo upload failed. Try again.");
  }

  if (!response.ok) {
    throw new Error("Photo upload failed. Try again.");
  }
}

/**
 * POST /api/projects/:projectId/evidence
 * Commit photo Evidence metadata after a successful GCS PUT.
 * 201 = new; 200 = idempotent existing.
 */
export async function createEvidencePhoto(
  projectId: string,
  request: CreateEvidencePhotoRequest,
): Promise<CreateEvidenceResult> {
  const pid = projectId.trim();
  const localEvidenceId = request.localEvidenceId.trim();
  const localDeltaId = request.localDeltaId.trim();
  const objectPath = request.objectPath.trim();
  const contentType = request.contentType.trim();

  if (
    !pid ||
    !localEvidenceId ||
    !localDeltaId ||
    !objectPath ||
    !contentType ||
    request.type !== "photo" ||
    request.localMeasurementId !== null
  ) {
    throw new Error("Evidence commit context is incomplete.");
  }

  let response: Response;
  try {
    response = await authenticatedFetch(
      `/api/projects/${encodeURIComponent(pid)}/evidence`,
      {
        method: "POST",
        body: JSON.stringify({
          localEvidenceId,
          type: "photo",
          note: request.note,
          createdAt: request.createdAt,
          objectPath,
          contentType,
          localMeasurementId: null,
          localDeltaId,
        }),
      },
    );
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      throw error;
    }
    throw new Error("Unable to save evidence.");
  }

  if (response.status === 401) {
    throw new ApiError("Your session could not be authenticated.", 401);
  }

  if (response.status === 404 || response.status === 403) {
    throw new ApiError("Unable to save evidence for this project.", response.status);
  }

  if (response.status === 400) {
    throw new ApiError("Invalid evidence payload.", 400);
  }

  if (response.status !== 200 && response.status !== 201) {
    throw new ApiError("Unable to save evidence.", response.status);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Unable to save evidence.");
  }

  if (!isEvidenceListItem(payload)) {
    throw new Error("Unable to save evidence.");
  }

  return {
    evidence: payload,
    created: response.status === 201,
  };
}
