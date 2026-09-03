import { getFirebaseAuth } from "@/lib/kepler/firebase";

export class NotAuthenticatedError extends Error {
  constructor(message = "Not authenticated") {
    super(message);
    this.name = "NotAuthenticatedError";
  }
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_KEPLER_API_BASE_URL?.trim() ?? "";

  if (!raw) {
    throw new Error(
      "NEXT_PUBLIC_KEPLER_API_BASE_URL is not configured. Set it to your Kepler API base URL.",
    );
  }

  return raw.replace(/\/$/, "");
}

async function readErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (
      typeof body === "object" &&
      body !== null &&
      typeof (body as { error?: unknown }).error === "string"
    ) {
      return (body as { error: string }).error;
    }
  } catch {
    // ignore non-JSON error bodies
  }

  return fallback;
}

/**
 * Authenticated fetch for Cloud Run /api/* routes.
 * Mirrors Kepler mobile src/services/api/client.ts.
 * Uses Firebase currentUser.getIdToken() — never logs the token.
 */
export async function authenticatedFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const user = getFirebaseAuth().currentUser;

  if (!user) {
    throw new NotAuthenticatedError();
  }

  const token = await user.getIdToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return fetch(`${getBaseUrl()}${normalizedPath}`, {
    ...init,
    headers,
  });
}

export async function authenticatedJson<T>(
  path: string,
  init: RequestInit = {},
  parse: (value: unknown) => T | null,
): Promise<T> {
  let response: Response;

  try {
    response = await authenticatedFetch(path, init);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      throw error;
    }
    throw new Error("Unable to reach the authenticated API.");
  }

  if (response.status === 401) {
    throw new ApiError("Your session could not be authenticated.", 401);
  }

  if (!response.ok) {
    const message = await readErrorMessage(
      response,
      "Unable to reach the authenticated API.",
    );
    throw new ApiError(message, response.status);
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new Error("Unable to reach the authenticated API.");
  }

  const parsed = parse(payload);

  if (parsed === null) {
    throw new Error("Unable to reach the authenticated API.");
  }

  return parsed;
}
