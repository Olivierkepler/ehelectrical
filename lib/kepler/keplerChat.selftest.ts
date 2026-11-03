/** Offline contract/state-machine fixtures. Run with the repository's available TS runner; never calls a live API. */
import assert from "node:assert/strict";
import { createKeplerConversationsApi, KeplerChatError, keplerReferenceHref, type KeplerConversationDTO, type KeplerMessageDTO, type KeplerPostResponse, type KeplerConversationsApi } from "./api/keplerConversations";
import { KeplerChatStore, mergeKeplerMessages } from "./keplerChatStore";

const time = "2026-11-02T12:00:00.000Z";
const conv = (id = "c1", projectId = "p1"): KeplerConversationDTO => ({ id, projectId, createdAt: time, updatedAt: time });
const msg = (id: string, role: "user" | "assistant", conversationId = "c1", content = role === "user" ? "Hello" : "Fixture response", createdAt = time): KeplerMessageDTO => ({ id, role, conversationId, content, createdAt });
const result = (status: 200 | 201 | 202 = 200, conversationId = "c1", content = "Hello"): KeplerPostResponse => ({ status, data: { userMessage: msg("u1", "user", conversationId, content), assistantMessage: status === 202 ? null : msg("a1", "assistant", conversationId), generationStatus: status === 202 ? "processing" : "completed" } });
const signal = () => new AbortController().signal;
const tick = async () => { for (let i = 0; i < 4; i++) await new Promise(r => setTimeout(r, 0)); };
function deferred<T>() { let resolve!: (v: T) => void; const promise = new Promise<T>(r => { resolve = r; }); return { promise, resolve }; }
function fakeApi(overrides: Partial<KeplerConversationsApi> = {}): KeplerConversationsApi {
  return {
    list: async () => ({ items: [], nextCursor: null }), create: async p => conv("c1", p),
    messages: async () => ({ items: [], nextCursor: null }), post: async (_p, c, s) => result(200, c, s.content), ...overrides,
  };
}
async function storeWith(api: KeplerConversationsApi, wait?: (ms: number, signal: AbortSignal) => Promise<void>) {
  let n = 0;
  const store = new KeplerChatStore(api, wait ?? (async () => {}), () => `fixture-uuid-${++n}`);
  store.setProjects(["p1", "p2"]); store.setEnabled(true); await tick(); return store;
}
let passed = 0;
async function test(name: string, run: () => unknown | Promise<unknown>) { await run(); passed++; console.log(`PASS ${name}`); }

async function main() {
  await test("API: create, list pagination, history scope and 200/201/202", async () => {
    const calls: { path: string; init: RequestInit }[] = [];
    let response: unknown = conv(); let status = 201;
    const api = createKeplerConversationsApi(async (path, init = {}) => { calls.push({ path, init }); return new Response(JSON.stringify(response), { status }); });
    assert.equal((await api.create("p1", signal())).id, "c1"); assert.equal(calls[0].init.method, "POST");
    response = { items: [conv()], nextCursor: "page 2/+" }; status = 200;
    await api.list("p1", "page 1/+", signal()); assert.match(calls.at(-1)!.path, /limit=30&cursor=page\+1%2F%2B/);
    response = { items: [msg("a", "assistant")], nextCursor: null }; await api.messages("p1", "c1", null, signal());
    for (const code of [200, 201, 202] as const) { status = code; response = result(code).data; assert.equal((await api.post("p1", "c1", { content: "Hello", clientMessageId: "same-id" }, signal())).status, code); }
    assert.deepEqual(JSON.parse(calls.at(-1)!.init.body as string), { content: "Hello", clientMessageId: "same-id" });
  });
  for (const code of [400, 401, 403, 404, 409, 429, 503]) await test(`API: safe HTTP ${code}`, async () => {
    const api = createKeplerConversationsApi(async () => new Response(JSON.stringify({ error: "secret stack trace" }), { status: code }));
    await assert.rejects(api.post("p1", "c1", { content: "Hello", clientMessageId: "id" }, signal()), e => e instanceof KeplerChatError && e.status === code && !e.message.includes("secret"));
  });
  await test("API: rejects cross-project/conversation data and malformed 202", async () => {
    let body: unknown = { items: [conv("c1", "foreign")], nextCursor: null };
    let status = 200;
    const api = createKeplerConversationsApi(async () => new Response(JSON.stringify(body), { status }));
    await assert.rejects(api.list("p1", null, signal()), /unexpected/);
    body = { items: [msg("m1", "assistant", "foreign")], nextCursor: null };
    await assert.rejects(api.messages("p1", "c1", null, signal()), /unexpected/);
    status = 202; body = result(200).data;
    await assert.rejects(api.post("p1", "c1", { content: "Hello", clientMessageId: "id" }, signal()), /unexpected/);
    status = 200; body = { ...result().data, assistantMessage: { ...msg("a1", "assistant"), suggestedActions: [{ kind: "navigate", label: "unsafe", reference: { kind: "external", canonicalId: "javascript:alert(1)", label: "x" } }] } };
    await assert.rejects(api.post("p1", "c1", { content: "Hello", clientMessageId: "id" }, signal()), /unexpected/);
  });
  await test("API: validation prevents a request, safe deadlines and cancellation", async () => {
    let calls = 0;
    const api = createKeplerConversationsApi(async () => { calls++; return new Response("{}"); });
    await assert.rejects(api.post("p1", "c1", { content: "x".repeat(4001), clientMessageId: "id" }, signal()), /4,000/); assert.equal(calls, 0);
    const slow = createKeplerConversationsApi(async (_path, init) => new Promise((_resolve, reject) => { init?.signal?.addEventListener("abort", () => reject(new Error("aborted"))); }), 5);
    await assert.rejects(slow.list("p1", null, signal()), e => e instanceof KeplerChatError && e.kind === "timeout");
    const controller = new AbortController(); const pending = slow.list("p1", null, controller.signal); controller.abort();
    await assert.rejects(pending, e => e instanceof KeplerChatError && e.kind === "cancelled");
  });
  await test("Navigation: only fixed in-app sections, foreign project and unsupported references disabled", () => {
    assert.equal(keplerReferenceHref("p1", { kind: "project", canonicalId: "foreign", label: "x" }), null);
    assert.equal(keplerReferenceHref("p1", { kind: "work_package", canonicalId: "w", label: "x" }), null);
    assert.equal(keplerReferenceHref("p1", { kind: "delta", canonicalId: "https://evil.test", label: "x" }), "/projects/p1/deltas");
  });
  await test("Store: no create on opening, trim, one create/send for duplicate clicks, preserve closed conversation", async () => {
    let creates = 0, posts = 0; const pending = deferred<KeplerPostResponse>();
    const store = await storeWith(fakeApi({ create: async p => { creates++; return conv("c1", p); }, post: async () => { posts++; return pending.promise; } }));
    assert.equal(creates, 0); store.setDraft("  Hello  "); const send = store.send(); await store.send(); await tick();
    assert.equal(creates, 1); assert.equal(posts, 1); assert.equal(store.getSnapshot().pending?.content, "Hello");
    store.setEnabled(false); store.setEnabled(true); assert.equal(creates, 1); assert.equal(posts, 1);
    pending.resolve(result()); await send;
    assert.equal(store.getSnapshot().conversationId, "c1"); assert.equal(store.getSnapshot().messages.length, 2);
    store.newConversation(); assert.equal(creates, 1); assert.equal(store.getSnapshot().conversationId, null);
  });
  await test("Store: 202 retries exact original body, merges canonical messages without duplicates", async () => {
    const submissions: string[] = []; const delays: number[] = [];
    const store = await storeWith(fakeApi({ post: async (_p, c, s) => { submissions.push(JSON.stringify(s)); return result(submissions.length < 3 ? 202 : 201, c, s.content); } }), async ms => { delays.push(ms); });
    store.setDraft("Hello"); await store.send();
    assert.equal(submissions.length, 3); assert.equal(new Set(submissions).size, 1); assert.deepEqual(delays, [2000, 4000]);
    assert.equal(store.getSnapshot().messages.length, 2); assert.equal(store.getSnapshot().pending, null);
  });
  await test("Store: processing is bounded, user retry retains ID", async () => {
    const submissions: string[] = [];
    const store = await storeWith(fakeApi({ post: async (_p, c, s) => { submissions.push(JSON.stringify(s)); return result(submissions.length <= 4 ? 202 : 200, c, s.content); } }));
    store.setDraft("Hello"); await store.send(); assert.equal(submissions.length, 4); assert.equal(store.getSnapshot().error?.retry, "send");
    await store.retry(); assert.equal(submissions.length, 5); assert.equal(new Set(submissions).size, 1);
  });
  await test("Store: 503/network failure requires manual same-ID retry", async () => {
    for (const error of [new KeplerChatError("generation failed", 503), new KeplerChatError("uncertain", null, "network")]) {
      const ids: string[] = [];
      const store = await storeWith(fakeApi({ post: async (_p, c, s) => { ids.push(s.clientMessageId); if (ids.length === 1) throw error; return result(200, c, s.content); } }));
      store.setDraft("Hello"); await store.send(); assert.equal(ids.length, 1); await store.retry(); assert.deepEqual(ids, ["fixture-uuid-1", "fixture-uuid-1"]);
    }
  });
  for (const code of [400, 401, 404, 409]) await test(`Store: ${code} does not retry or allocate a replacement ID`, async () => {
    let count = 0;
    const store = await storeWith(fakeApi({ post: async () => { count++; throw new KeplerChatError("blocked", code); } }));
    store.setDraft("Hello"); await store.send(); await store.retry(); await store.send();
    assert.equal(count, 1); assert.equal(store.getSnapshot().pending?.clientMessageId, "fixture-uuid-1");
    assert.equal(store.getSnapshot().unavailable, [401, 404].includes(code));
  });
  await test("Store: conversation/message pagination, deduplication and oldest-first order", async () => {
    const cursors: (string | null)[] = [];
    const store = await storeWith(fakeApi({ list: async (_p, cursor) => ({ items: [conv(cursor ? "c2" : "c1")], nextCursor: cursor ? null : "next-conversations" }), messages: async (_p, c, cursor) => { cursors.push(cursor); return { items: cursor ? [msg("old", "user", c, "Older", "2026-11-01T00:00:00Z"), msg("a1", "assistant", c)] : [msg("a1", "assistant", c), msg("u1", "user", c)], nextCursor: cursor ? null : "earlier" }; } }));
    await store.loadMessages(true); assert.deepEqual(cursors, [null, "earlier"]); assert.deepEqual(store.getSnapshot().messages.map(m => m.id), ["old", "u1", "a1"]);
    await store.loadConversations(true); assert.equal(store.getSnapshot().conversations.length, 2);
    store.selectConversation("c2"); assert.equal(store.getSnapshot().messages.length, 0); await tick(); assert(store.getSnapshot().messages.every(m => m.conversationId === "c2"));
    assert.equal(mergeKeplerMessages([msg("x", "user")], [msg("x", "user")]).length, 1);
  });
  await test("Store: late history from another conversation never appears", async () => {
    const late = deferred<{ items: KeplerMessageDTO[]; nextCursor: null }>();
    const store = await storeWith(fakeApi({ list: async () => ({ items: [conv(), conv("c2")], nextCursor: null }), messages: async (_p, c) => c === "c1" ? late.promise : { items: [msg("other", "assistant", c)], nextCursor: null } }));
    store.selectConversation("c2"); await tick(); late.resolve({ items: [msg("late", "assistant")], nextCursor: null }); await tick();
    assert.deepEqual(store.getSnapshot().messages.map(m => m.id), ["other"]);
  });
  await test("Store: switch projects clears transcript, late send cannot leak, pending retry retains ID", async () => {
    const late = deferred<KeplerPostResponse>(); let count = 0; const ids: string[] = [];
    const store = await storeWith(fakeApi({ post: async (_p, c, s) => { ids.push(s.clientMessageId); return ++count === 1 ? late.promise : result(200, c, s.content); } }));
    store.setDraft("Hello"); const sending = store.send(); await tick();
    store.selectProject("p2"); assert.equal(store.getSnapshot().messages.length, 0); assert.equal(store.getSnapshot().pending, null);
    late.resolve(result()); await sending; assert.equal(store.getSnapshot().projectId, "p2"); assert.equal(store.getSnapshot().messages.length, 0);
    store.selectProject("p1"); await tick(); await store.retry(); assert.deepEqual(ids, ["fixture-uuid-1", "fixture-uuid-1"]);
    store.setProjects(["p2"]); store.selectProject("p1"); assert.equal(store.getSnapshot().projectId, "p2"); assert.equal(store.getSnapshot().messages.length, 0);
  });
  await test("Store: uncertain conversation creation never blindly creates again", async () => {
    let creates = 0;
    const store = await storeWith(fakeApi({ create: async () => { creates++; throw new KeplerChatError("uncertain", null, "timeout"); } }));
    store.setDraft("Hello"); await store.send(); await store.retry(); await store.send(); assert.equal(creates, 1);
  });
  await test("Store: authentication failure during creation remains explicit and cannot auto-retry", async () => {
    let creates = 0;
    const store = await storeWith(fakeApi({ create: async () => { creates++; throw new KeplerChatError("Sign in again to continue.", 401); } }));
    store.setDraft("Hello"); await store.send(); await store.retry();
    assert.equal(creates, 1); assert.match(store.getSnapshot().error?.message ?? "", /Sign in/); assert.equal(store.getSnapshot().unavailable, true);
  });
  await test("Store: empty portfolio and separate user controllers expose no prior-user data", async () => {
    const first = await storeWith(fakeApi()); first.setDraft("Hello"); await first.send(); first.suspend();
    const second = new KeplerChatStore(fakeApi()); second.setProjects([]); second.setEnabled(true); await second.send("Hello");
    assert.equal(second.getSnapshot().messages.length, 0); assert.equal(second.getSnapshot().projectId, "");
  });
  console.log(`${passed} offline chat fixtures passed; no live requests.`);
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
