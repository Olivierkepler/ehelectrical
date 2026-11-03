import {
  keplerConversationsApi, KeplerChatError, chatErrorMessage,
  type KeplerConversationsApi, type KeplerConversationDTO, type KeplerMessageDTO, type KeplerSubmission,
} from "./api/keplerConversations";

type Failure = { message: string; retry: "send" | "messages" | "conversations" | null };
export type PendingMessage = KeplerSubmission & { userMessageId?: string; processing: boolean };
type Thread = {
  id: string | null; messages: KeplerMessageDTO[]; cursor: string | null; loaded: boolean;
  draft: string; pending: PendingMessage | null; sending: boolean; loading: boolean; error: Failure | null;
  unavailable: boolean; creationUncertain: boolean; controller: AbortController | null; read: AbortController | null;
};
type Project = {
  id: string; conversations: KeplerConversationDTO[]; cursor: string | null; loaded: boolean;
  loading: boolean; chosen: boolean; active: string | null; threads: Map<string, Thread>;
  error: Failure | null; read: AbortController | null;
};
export type KeplerChatSnapshot = {
  projectId: string; conversationId: string | null; conversations: KeplerConversationDTO[];
  messages: KeplerMessageDTO[]; nextConversationCursor: string | null; nextMessageCursor: string | null;
  draft: string; pending: PendingMessage | null; sending: boolean; loadingConversations: boolean;
  loadingMessages: boolean; error: Failure | null; unavailable: boolean;
};
export const emptyChatSnapshot: KeplerChatSnapshot = {
  projectId: "", conversationId: null, conversations: [], messages: [], nextConversationCursor: null,
  nextMessageCursor: null, draft: "", pending: null, sending: false, loadingConversations: false,
  loadingMessages: false, error: null, unavailable: false,
};
const threadKey = (id: string | null) => id === null ? "draft" : `conversation:${id}`;
function newThread(id: string | null): Thread {
  return { id, messages: [], cursor: null, loaded: false, draft: "", pending: null, sending: false, loading: false, error: null, unavailable: false, creationUncertain: false, controller: null, read: null };
}
export function mergeKeplerMessages(previous: KeplerMessageDTO[], incoming: KeplerMessageDTO[]) {
  return [...new Map([...previous, ...incoming].map(m => [m.id, m])).values()].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt) || (a.role === b.role ? a.id.localeCompare(b.id) : a.role === "user" ? -1 : 1));
}
function mergeConversations(a: KeplerConversationDTO[], b: KeplerConversationDTO[]) {
  return [...new Map([...a, ...b].map(c => [c.id, c])).values()].sort((x, y) => Date.parse(y.updatedAt) - Date.parse(x.updatedAt));
}
function pause(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => { clearTimeout(timer); signal.removeEventListener("abort", abort); reject(new KeplerChatError("Request interrupted.", null, "cancelled")); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, ms);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
}

/** One controller per authenticated workspace, shared by the desktop and mobile views. No tokens or transcripts in browser storage. */
export class KeplerChatStore {
  private projects = new Map<string, Project>();
  private allowed = new Set<string>();
  private active = "";
  private enabled = false;
  private listeners = new Set<() => void>();
  private snapshot = emptyChatSnapshot;
  constructor(
    private api: KeplerConversationsApi = keplerConversationsApi,
    private wait: (ms: number, signal: AbortSignal) => Promise<void> = pause,
    private uuid: () => string = () => crypto.randomUUID(),
  ) {}
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  getSnapshot = () => this.snapshot;
  private project() { return this.projects.get(this.active); }
  private thread(p: Project) {
    const key = threadKey(p.active);
    let t = p.threads.get(key);
    if (!t) { t = newThread(p.active); p.threads.set(key, t); }
    return t;
  }
  private emit() {
    const p = this.project();
    const t = p ? this.thread(p) : null;
    this.snapshot = p && t ? {
      projectId: p.id, conversationId: t.id, conversations: [...p.conversations], messages: [...t.messages],
      nextConversationCursor: p.cursor, nextMessageCursor: t.cursor, draft: t.draft,
      pending: t.pending ? { ...t.pending } : null, sending: t.sending,
      loadingConversations: p.loading, loadingMessages: t.loading, error: t.error ?? p.error, unavailable: t.unavailable,
    } : emptyChatSnapshot;
    this.listeners.forEach(l => l());
  }
  setProjects(ids: string[]) {
    const next = new Set(ids);
    for (const [id, p] of this.projects) {
      if (!next.has(id)) { this.cancelProject(p); this.projects.delete(id); }
    }
    this.allowed = next;
    if (!next.has(this.active)) this.selectProject(ids[0] ?? "");
    else if (this.enabled) this.ensureLoaded();
  }
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    // Closing a view never cancels a winning request or resets its conversation.
    if (enabled) this.ensureLoaded();
  }
  selectProject = (id: string) => {
    if (id && !this.allowed.has(id)) return;
    const old = this.project();
    if (old && old.id !== id) this.cancelProject(old);
    this.active = id;
    if (id && !this.projects.has(id)) this.projects.set(id, { id, conversations: [], cursor: null, loaded: false, loading: false, chosen: false, active: null, threads: new Map(), error: null, read: null });
    this.emit();
    if (this.enabled) this.ensureLoaded();
  };
  private ensureLoaded() {
    const p = this.project();
    if (!p) return;
    if (!p.loaded && !p.loading) void this.loadConversations();
    else if (p.active && !this.thread(p).loaded && !this.thread(p).loading) void this.loadMessages();
  }
  private cancelProject(p: Project) {
    p.read?.abort(); p.read = null; p.loading = false;
    for (const t of p.threads.values()) {
      t.read?.abort(); t.read = null; t.loading = false;
      if (t.controller) {
        t.controller.abort(); t.controller = null; t.sending = false;
        if (t.pending) {
          if (!t.id) t.creationUncertain = true;
          t.error = t.creationUncertain
            ? { message: "Conversation creation was interrupted. Reload history and select the conversation before sending again.", retry: "conversations" }
            : { message: "The request was interrupted and may have been accepted. Retry will reuse the original message.", retry: "send" };
        }
      }
    }
  }
  suspend = () => { for (const p of this.projects.values()) this.cancelProject(p); this.emit(); };
  setDraft = (draft: string) => { const p = this.project(); if (p) { const t = this.thread(p); if (!t.pending) { t.draft = draft; if (t.error?.retry === null && !t.unavailable) t.error = null; this.emit(); } } };
  selectConversation = (id: string) => {
    const p = this.project();
    if (!p || !p.conversations.some(c => c.id === id)) return;
    this.cancelProject(p);
    p.active = id; p.chosen = true;
    this.emit();
    if (this.enabled && !this.thread(p).loaded) void this.loadMessages();
  };
  newConversation = () => {
    const p = this.project();
    if (!p) return;
    this.cancelProject(p);
    // Creating a new thread is an explicit user action; it makes no backend request.
    p.active = null; p.chosen = true; p.error = null;
    p.threads.set(threadKey(null), newThread(null));
    this.emit();
  };
  loadConversations = async (more = false) => {
    const p = this.project();
    if (!p || p.loading || more && !p.cursor) return;
    const cursor = more ? p.cursor : null;
    const controller = new AbortController();
    p.read = controller; p.loading = true; p.error = null; this.emit();
    try {
      const page = await this.api.list(p.id, cursor, controller.signal);
      if (controller.signal.aborted || p.read !== controller) return;
      p.conversations = more ? mergeConversations(p.conversations, page.items) : mergeConversations([], page.items);
      p.cursor = page.nextCursor === cursor ? null : page.nextCursor; p.loaded = true;
      if (!p.chosen && p.conversations.length) {
        // A draft typed while history loads must not be replaced by an older conversation.
        if (!this.thread(p).draft && !this.thread(p).pending) p.active = p.conversations[0].id;
        p.chosen = true;
      }
    } catch (error) {
      if (controller.signal.aborted || p.read !== controller) return;
      p.error = { message: chatErrorMessage(error), retry: "conversations" };
      if (error instanceof KeplerChatError && [401, 403, 404].includes(error.status ?? 0)) {
        p.conversations = [];
        for (const t of p.threads.values()) { t.messages = []; t.unavailable = true; }
        p.error.retry = null;
      }
    } finally {
      if (p.read === controller) {
        p.read = null; p.loading = false; this.emit();
        if (p.id === this.active && p.active && !this.thread(p).loaded && !p.error) void this.loadMessages();
      }
    }
  };
  loadMessages = async (older = false) => {
    const p = this.project();
    if (!p) return;
    const t = this.thread(p);
    if (!t.id || t.loading || older && !t.cursor) return;
    const cursor = older ? t.cursor : null;
    const controller = new AbortController();
    t.read = controller; t.loading = true; if (t.error?.retry === "messages") t.error = null; this.emit();
    try {
      const page = await this.api.messages(p.id, t.id, cursor, controller.signal);
      if (controller.signal.aborted || t.read !== controller) return;
      t.messages = mergeKeplerMessages(t.messages, page.items); t.cursor = page.nextCursor === cursor ? null : page.nextCursor;
      t.loaded = true; t.unavailable = false;
    } catch (error) {
      if (controller.signal.aborted || t.read !== controller) return;
      t.error = { message: chatErrorMessage(error), retry: "messages" };
      if (error instanceof KeplerChatError && [401, 403, 404].includes(error.status ?? 0)) { t.messages = []; t.unavailable = true; t.error.retry = null; }
    } finally {
      if (t.read === controller) { t.read = null; t.loading = false; this.emit(); }
    }
  };
  send = async (suggestion?: string) => {
    const p = this.project();
    if (!p || p.loading || p.error || !this.allowed.has(p.id)) return;
    const t = this.thread(p);
    if (t.sending || t.pending || t.unavailable || t.loading || t.error) return;
    const content = (suggestion ?? t.draft).trim();
    if (!content || content.length > 4000) { t.error = { message: "Enter a message of 1–4,000 characters.", retry: null }; this.emit(); return; }
    t.pending = { content, clientMessageId: this.uuid(), processing: false }; t.draft = ""; p.chosen = true;
    await this.submit(p, t);
  };
  retry = async () => {
    const p = this.project();
    if (!p) return;
    const t = this.thread(p);
    const error = t.error ?? p.error;
    if (error?.retry === "send" && t.pending && !t.sending && !t.creationUncertain && !t.unavailable) await this.submit(p, t);
    else if (error?.retry === "messages") await this.loadMessages();
    else if (error?.retry === "conversations") await this.loadConversations();
  };
  private async submit(p: Project, t: Thread) {
    if (!t.pending || !this.allowed.has(p.id)) return;
    const pending = t.pending;
    const controller = new AbortController();
    t.controller = controller; t.sending = true; t.error = null; this.emit();
    try {
      if (!t.id) {
        const created = await this.api.create(p.id, controller.signal);
        if (controller.signal.aborted || t.controller !== controller) return;
        p.threads.delete(threadKey(null)); t.id = created.id; p.threads.set(threadKey(t.id), t);
        p.active = t.id; p.conversations = mergeConversations(p.conversations, [created]); t.loaded = true;
        this.emit();
      }
      for (let attempt = 0; attempt < 4; attempt++) {
        const result = await this.api.post(p.id, t.id, { content: pending.content, clientMessageId: pending.clientMessageId }, controller.signal);
        if (controller.signal.aborted || t.controller !== controller) return;
        pending.userMessageId = result.data.userMessage.id;
        t.messages = mergeKeplerMessages(t.messages, [result.data.userMessage, ...(result.data.assistantMessage ? [result.data.assistantMessage] : [])]);
        if (result.status !== 202) {
          t.pending = null; t.error = null;
          const updatedAt = result.data.assistantMessage?.createdAt ?? result.data.userMessage.createdAt;
          p.conversations = mergeConversations(p.conversations, p.conversations.filter(c => c.id === t.id).map(c => ({ ...c, updatedAt })));
          break;
        }
        pending.processing = true; this.emit();
        if (attempt === 3) {
          t.error = { message: "Kepler still reports processing. Completion is not confirmed. Retry will reuse this message; it will not create another one.", retry: "send" };
          break;
        }
        await this.wait([2000, 4000, 8000][attempt], controller.signal);
      }
    } catch (error) {
      if (controller.signal.aborted || t.controller !== controller) return;
      const status = error instanceof KeplerChatError ? error.status : null;
      if (!t.id) {
        t.creationUncertain = true;
        t.error = [400, 401, 403, 404, 409].includes(status ?? 0)
          ? { message: chatErrorMessage(error), retry: null }
          : { message: "Conversation creation could not be confirmed. Reload history and select it before sending again.", retry: "conversations" };
      } else {
        t.error = { message: chatErrorMessage(error), retry: [400, 401, 403, 404, 409].includes(status ?? 0) ? null : "send" };
      }
      if ([401, 403, 404].includes(status ?? 0)) { t.messages = []; t.unavailable = true; if (t.error) t.error.retry = null; }
    } finally {
      if (t.controller === controller) { t.controller = null; t.sending = false; this.emit(); }
    }
  }
}
