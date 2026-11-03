import { authenticatedFetch, NotAuthenticatedError } from "./client";

export type KeplerConversationDTO = { id: string; projectId: string; createdAt: string; updatedAt: string };
export type KeplerReference = {
  kind: "project" | "plan_item" | "work_package" | "measurement" | "delta" | "activity" | "agent_run";
  canonicalId: string;
  label: string;
};
export type KeplerSuggestedAction = { kind: "navigate"; label: string; reference: KeplerReference };
export type KeplerMessageDTO = {
  id: string; conversationId: string; role: "user" | "assistant"; content: string; createdAt: string;
  references?: KeplerReference[]; suggestedActions?: KeplerSuggestedAction[];
};
export type KeplerConversationPage = { items: KeplerConversationDTO[]; nextCursor: string | null };
export type KeplerMessagePage = { items: KeplerMessageDTO[]; nextCursor: string | null };
export type KeplerMessagePostResult = {
  userMessage: KeplerMessageDTO;
  assistantMessage: KeplerMessageDTO | null;
  generationStatus: "completed" | "processing";
};
export type KeplerSubmission = { content: string; clientMessageId: string };
export type KeplerPostResponse = { status: 200 | 201 | 202; data: KeplerMessagePostResult };

export class KeplerChatError extends Error {
  constructor(message: string, readonly status: number | null = null, readonly kind: "http" | "network" | "timeout" | "cancelled" | "protocol" = "http") {
    super(message);
    this.name = "KeplerChatError";
  }
}

export function chatErrorMessage(error: unknown): string {
  if (error instanceof KeplerChatError) return error.message;
  return "Kepler AI could not be reached. Your message has not been confirmed; retry it safely.";
}

function statusMessage(status: number): string {
  switch (status) {
    case 400: return "The message was not accepted. Check its content and length.";
    case 401: return "Your session could not be authenticated. Sign in again to continue.";
    case 403: case 404: return "This project or conversation is unavailable to your account.";
    case 409: return "This message conflicts with an earlier submission. It has not been resent with a new ID. Start a new conversation if needed.";
    case 429: return "Kepler AI is receiving too many requests. Wait before retrying this message.";
    case 503: return "Kepler could not generate a response. Retry will reuse the original message.";
    default: return "Kepler AI could not complete the request. Retry the original message safely.";
  }
}

const record = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const nonempty = (v: unknown): v is string => typeof v === "string" && Boolean(v.trim());
const timestamp = (v: unknown): v is string => nonempty(v) && Number.isFinite(Date.parse(v));
const kinds = new Set(["project", "plan_item", "work_package", "measurement", "delta", "activity", "agent_run"]);
function reference(v: unknown): v is KeplerReference {
  return record(v) && typeof v.kind === "string" && kinds.has(v.kind) && nonempty(v.canonicalId) && typeof v.label === "string";
}
function action(v: unknown): v is KeplerSuggestedAction {
  return record(v) && v.kind === "navigate" && typeof v.label === "string" && reference(v.reference);
}
function conversation(v: unknown): v is KeplerConversationDTO {
  return record(v) && nonempty(v.id) && nonempty(v.projectId) && timestamp(v.createdAt) && timestamp(v.updatedAt);
}
function message(v: unknown): v is KeplerMessageDTO {
  return record(v) && nonempty(v.id) && nonempty(v.conversationId) && (v.role === "user" || v.role === "assistant") && typeof v.content === "string" && timestamp(v.createdAt)
    && (v.references === undefined || Array.isArray(v.references) && v.references.every(reference))
    && (v.suggestedActions === undefined || Array.isArray(v.suggestedActions) && v.suggestedActions.every(action));
}
function page<T>(v: unknown, item: (value: unknown) => value is T): v is { items: T[]; nextCursor: string | null } {
  return record(v) && Array.isArray(v.items) && v.items.every(item) && (v.nextCursor === null || nonempty(v.nextCursor));
}
function protocol(): never { throw new KeplerChatError("Kepler returned an unexpected response. Reload history before retrying.", null, "protocol"); }
function projectPath(projectId: string) {
  if (!projectId.trim()) throw new KeplerChatError("Select an accessible project first.", 400);
  return `/api/projects/${encodeURIComponent(projectId)}/kepler/conversations`;
}
function messagePath(projectId: string, conversationId: string) {
  if (!conversationId.trim()) throw new KeplerChatError("Select a conversation first.", 400);
  return `${projectPath(projectId)}/${encodeURIComponent(conversationId)}/messages`;
}
function query(cursor?: string | null) {
  const params = new URLSearchParams({ limit: "30" });
  if (cursor) params.set("cursor", cursor);
  return `?${params}`;
}

/** Longer than the backend's approximately 75s winning request. Abort stops waiting, not server execution. */
async function request(path: string, init: RequestInit, signal: AbortSignal, timeoutMs = 90_000, transport = authenticatedFetch): Promise<{ status: number; body: unknown }> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener("abort", abort, { once: true });
  if (signal.aborted) controller.abort();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  try {
    const response = await transport(path, { ...init, signal: controller.signal });
    if (!response.ok) throw new KeplerChatError(statusMessage(response.status), response.status);
    const body: unknown = await response.json();
    return { status: response.status, body };
  } catch (error) {
    if (signal.aborted) throw new KeplerChatError("Request interrupted. Retry will reuse the original message.", null, "cancelled");
    if (timedOut) throw new KeplerChatError("Kepler is taking longer than expected. The request may still have been accepted; retry the same message.", null, "timeout");
    if (error instanceof NotAuthenticatedError) throw new KeplerChatError(statusMessage(401), 401);
    if (error instanceof KeplerChatError) throw error;
    if (error instanceof SyntaxError) return protocol();
    throw new KeplerChatError("Unable to reach Kepler AI. The request may have been accepted; retry the same message.", null, "network");
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", abort);
  }
}

export function createKeplerConversationsApi(transport = authenticatedFetch, timeoutMs = 90_000) {
  const call = (path: string, init: RequestInit, signal: AbortSignal) => request(path, init, signal, timeoutMs, transport);
  return {
  async list(projectId: string, cursor: string | null, signal: AbortSignal): Promise<KeplerConversationPage> {
    const { body } = await call(projectPath(projectId) + query(cursor), {}, signal);
    if (!page(body, conversation) || body.items.some(c => c.projectId !== projectId)) return protocol();
    return body;
  },
  async create(projectId: string, signal: AbortSignal): Promise<KeplerConversationDTO> {
    const { body } = await call(projectPath(projectId), { method: "POST", body: "{}" }, signal);
    if (!conversation(body) || body.projectId !== projectId) return protocol();
    return body;
  },
  async messages(projectId: string, conversationId: string, cursor: string | null, signal: AbortSignal): Promise<KeplerMessagePage> {
    const { body } = await call(messagePath(projectId, conversationId) + query(cursor), {}, signal);
    if (!page(body, message) || body.items.some(m => m.conversationId !== conversationId)) return protocol();
    return body;
  },
  async post(projectId: string, conversationId: string, submission: KeplerSubmission, signal: AbortSignal): Promise<KeplerPostResponse> {
    if (!submission.content.trim() || submission.content !== submission.content.trim() || submission.content.length > 4000 || !nonempty(submission.clientMessageId)) throw new KeplerChatError("Enter a message of 1–4,000 characters.", 400);
    const { status, body } = await call(messagePath(projectId, conversationId), { method: "POST", body: JSON.stringify(submission) }, signal);
    if ((status !== 200 && status !== 201 && status !== 202) || !record(body) || !message(body.userMessage) || body.userMessage.role !== "user" || body.userMessage.conversationId !== conversationId || body.userMessage.content !== submission.content
      || (body.assistantMessage !== null && (!message(body.assistantMessage) || body.assistantMessage.role !== "assistant" || body.assistantMessage.conversationId !== conversationId))
      || (body.generationStatus !== "completed" && body.generationStatus !== "processing")
      || (status === 202 ? body.generationStatus !== "processing" || body.assistantMessage !== null : body.generationStatus !== "completed" || body.assistantMessage === null)) return protocol();
    return { status, data: body as KeplerMessagePostResult };
  },
  };
}
export const keplerConversationsApi = createKeplerConversationsApi();
export type KeplerConversationsApi = typeof keplerConversationsApi;

/** Model output never supplies a URL; destinations are fixed, project-scoped app sections. */
export function keplerReferenceHref(projectId: string, ref: KeplerReference): string | null {
  if (!projectId) return null;
  const base = `/projects/${encodeURIComponent(projectId)}`;
  switch (ref.kind) {
    case "project": return ref.canonicalId === projectId ? base : null;
    case "plan_item": return `${base}/plan`;
    case "measurement": return `${base}/field`;
    case "delta": return `${base}/deltas`;
    case "activity": return `${base}/activity`;
    case "agent_run": return `${base}/agent`;
    default: return null;
  }
}
