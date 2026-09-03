import {
  createEvidencePhoto,
  createLocalEvidenceId,
  isWebEvidencePhotoMimeType,
  putEvidencePhotoToSignedUrl,
  requestEvidenceUploadUrl,
  WEB_EVIDENCE_MAX_PHOTO_BYTES,
  type CreateEvidenceResult,
  type EvidenceUploadUrlResponse,
  type WebEvidencePhotoMimeType,
} from "@/lib/kepler/api/evidence";
import { ApiError, NotAuthenticatedError } from "@/lib/kepler/api/client";

export type DeltaEvidenceFileValidation =
  | { ok: true; contentType: WebEvidencePhotoMimeType }
  | { ok: false; message: string };

export function validateDeltaEvidencePhotoFile(
  file: File | null,
): DeltaEvidenceFileValidation {
  if (!file) {
    return { ok: false, message: "Select a photo to continue." };
  }

  if (file.size <= 0) {
    return { ok: false, message: "Select a photo to continue." };
  }

  if (file.size > WEB_EVIDENCE_MAX_PHOTO_BYTES) {
    return { ok: false, message: "Photo is too large." };
  }

  const mime = file.type.trim().toLowerCase();
  if (!isWebEvidencePhotoMimeType(mime)) {
    return { ok: false, message: "Unsupported photo format." };
  }

  return { ok: true, contentType: mime };
}

export function formatEvidenceFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "—";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export type DeltaEvidenceUploadPhase =
  | "idle"
  | "preparing"
  | "uploading"
  | "committing";

export type DeltaEvidenceUploadSuccess = CreateEvidenceResult & {
  localEvidenceId: string;
};

/**
 * Owner Delta-linked photo Evidence:
 * upload-url → GCS PUT → Evidence commit.
 * Does not call agent /resume or Cloud Tasks.
 */
export async function uploadDeltaLinkedPhotoEvidence(input: {
  projectId: string;
  localDeltaId: string;
  file: File;
  /** Reuse after PUT success when commit failed. */
  localEvidenceId?: string;
  /** After successful PUT: retry commit without re-uploading. */
  committedObject?: Pick<
    EvidenceUploadUrlResponse,
    "objectPath" | "contentType"
  > | null;
  createdAt?: string;
  onPhase?: (phase: DeltaEvidenceUploadPhase) => void;
  /** Called once PUT succeeds so commit retries can skip re-upload. */
  onPutSuccess?: (
    uploaded: Pick<EvidenceUploadUrlResponse, "objectPath" | "contentType">,
  ) => void;
}): Promise<{
  result: DeltaEvidenceUploadSuccess;
  /** Present after PUT so commit-only retries can avoid re-upload. */
  uploadedObject: Pick<EvidenceUploadUrlResponse, "objectPath" | "contentType">;
  localEvidenceId: string;
  createdAt: string;
}> {
  const projectId = input.projectId.trim();
  const localDeltaId = input.localDeltaId.trim();
  if (!projectId || !localDeltaId) {
    throw new Error("Evidence context is incomplete.");
  }

  const validation = validateDeltaEvidencePhotoFile(input.file);
  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const localEvidenceId =
    input.localEvidenceId?.trim() || createLocalEvidenceId();
  const createdAt = input.createdAt ?? new Date().toISOString();

  let objectPath = input.committedObject?.objectPath?.trim() ?? "";
  let contentType =
    input.committedObject?.contentType?.trim() || validation.contentType;

  if (!objectPath) {
    input.onPhase?.("preparing");
    let signed: EvidenceUploadUrlResponse;
    try {
      signed = await requestEvidenceUploadUrl(projectId, {
        localEvidenceId,
        contentType: validation.contentType,
        localDeltaId,
        localMeasurementId: null,
      });
    } catch (error) {
      throw mapUploadPrepError(error);
    }

    // Ephemeral — never log or persist signed.uploadUrl.
    input.onPhase?.("uploading");
    try {
      await putEvidencePhotoToSignedUrl({
        uploadUrl: signed.uploadUrl,
        contentType: signed.contentType,
        file: input.file,
      });
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Photo upload failed. Try again.");
    }

    objectPath = signed.objectPath;
    contentType = signed.contentType;
    input.onPutSuccess?.({ objectPath, contentType });
  }

  input.onPhase?.("committing");
  let result: CreateEvidenceResult;
  try {
    result = await createEvidencePhoto(projectId, {
      localEvidenceId,
      type: "photo",
      note: "",
      createdAt,
      objectPath,
      contentType,
      localMeasurementId: null,
      localDeltaId,
    });
  } catch (error) {
    throw mapCommitError(error);
  }

  return {
    result: { ...result, localEvidenceId },
    uploadedObject: { objectPath, contentType },
    localEvidenceId,
    createdAt,
  };
}

function mapUploadPrepError(error: unknown): Error {
  if (error instanceof NotAuthenticatedError) {
    return new ApiError("Your session could not be authenticated.", 401);
  }
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return new ApiError("Your session could not be authenticated.", 401);
    }
    if (error.status === 403 || error.status === 404) {
      return new ApiError(
        "Unable to prepare evidence upload for this project.",
        error.status,
      );
    }
    if (error.status === 400) {
      return new ApiError("Unsupported photo or invalid upload request.", 400);
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error;
  }
  return new Error("Unable to prepare evidence upload.");
}

function mapCommitError(error: unknown): Error {
  if (error instanceof NotAuthenticatedError) {
    return new ApiError("Your session could not be authenticated.", 401);
  }
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return new ApiError("Your session could not be authenticated.", 401);
    }
    if (error.status === 403 || error.status === 404) {
      return new ApiError(
        "Unable to save evidence for this project.",
        error.status,
      );
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error;
  }
  return new Error("Unable to save evidence.");
}
