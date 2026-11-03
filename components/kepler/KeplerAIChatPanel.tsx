"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, LoaderCircle, MessageSquare, Plus, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import { keplerReferenceHref, type KeplerMessageDTO } from "@/lib/kepler/api/keplerConversations";
import type { KeplerChatController } from "@/lib/kepler/hooks/useKeplerChat";
import KeplerAnimatedLogo from "@/components/branding/KeplerAnimatedLogo";
import styles from "./KeplerAIChatPanel.module.css";

const suggestedPrompts = ["Summarize the current project", "Show outstanding tasks", "Highlight project risks", "What's planned for this week?"];
const focus = styles.focus;
const control = `${styles.control} ${focus}`;

function Message({ message, projectId }: { message: KeplerMessageDTO; projectId: string }) {
  const assistant = message.role === "assistant";
  return <article aria-label={assistant ? "Kepler AI message" : "Your message"} className={`${styles.message} ${assistant ? styles.assistant : styles.user}`}>
    <p className={styles.author}>{assistant && <span className={styles.messageIcon}><Sparkles size={12} aria-hidden="true" /></span>}{assistant ? "Kepler AI" : "You"}</p>
    <p className={styles.messageText}>{message.content}</p>
    {assistant && Boolean(message.references?.length) && <ul aria-label="References" className={styles.references}>{message.references?.map((ref, index) => {
      const href = keplerReferenceHref(projectId, ref);
      return <li key={`${ref.kind}:${ref.canonicalId}:${index}`} className={styles.referenceItem}>{href ? <Link href={href} className={`${styles.reference} ${focus}`}>{ref.label}</Link> : <span className={styles.reference}>{ref.label}</span>}</li>;
    })}</ul>}
    {assistant && message.suggestedActions?.map((action, index) => {
      const href = keplerReferenceHref(projectId, action.reference);
      return href ? <Link key={index} href={href} className={`${styles.action} ${focus}`}>{action.label}<ArrowUpRight size={13} aria-hidden="true" className="shrink-0" /></Link> : null;
    })}
  </article>;
}
export default function KeplerAIChatPanel({ onClose, titleId, chat }: { onClose: () => void; titleId: string; chat: KeplerChatController }) {
  const { state, projects, projectsLoading, projectsError } = chat;
  const selected = projects.find(p => p.id === state.projectId);
  const regionRef = useRef<HTMLDivElement>(null);
  const lastMessageId = state.messages.at(-1)?.id;
  useEffect(() => {
    const region = regionRef.current;
    if (region) region.scrollTop = region.scrollHeight;
  }, [lastMessageId, state.conversationId, state.projectId]);
  const busy = state.sending || state.loadingConversations || state.loadingMessages;
  const canCompose = Boolean(selected) && !busy && !state.pending && !state.unavailable && !state.error;
  const canSend = canCompose && Boolean(state.draft.trim()) && state.draft.trim().length <= 4000;
  const pendingVisible = state.pending && !state.messages.some(m => m.id === state.pending?.userMessageId);
  const statusId = `${titleId}-status`;

  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <div className={styles.headerLogo} aria-hidden="true"><KeplerAnimatedLogo width={104} height={104 * 71 / 174} autoPlay={false} wordmarkColor="#0D2343" taglineColor="#64748B" showTagline /></div>
        <h2 id={titleId} className="sr-only">Kepler AI chat</h2>
        <button type="button" onClick={onClose} aria-label="Close Kepler AI" className={`${styles.close} ${focus}`}><X size={17} strokeWidth={1.6} /></button>
      </header>

      {selected && <div className={styles.context}>
        <div><label htmlFor={`${titleId}-project`} className={styles.label}>Project</label>
          {projects.length > 1 ? <div className={styles.selectWrap}><select id={`${titleId}-project`} value={state.projectId} onChange={event => chat.selectProject(event.target.value)} className={control}>{projects.map(p => <option key={p.id} value={p.id}>{p.name || "Untitled project"}</option>)}</select><ChevronDown size={13} aria-hidden="true" className={styles.chevron} /></div> : <p id={`${titleId}-project`} className={styles.singleProject}>{selected.name || "Untitled project"}</p>}
        </div>
        <div className={styles.historyRow}><div className={styles.historyField}><label htmlFor={`${titleId}-conversation`} className={styles.label}>Conversation history</label>
          <div className={styles.selectWrap}><select id={`${titleId}-conversation`} value={state.conversationId ?? ""} disabled={state.loadingConversations} onChange={event => { if (event.target.value) chat.selectConversation(event.target.value); else chat.newConversation(); }} className={control}><option value="">New conversation</option>{state.conversations.map((c, index) => <option key={c.id} value={c.id}>{new Date(c.updatedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} · {index + 1}</option>)}</select><ChevronDown size={13} aria-hidden="true" className={styles.chevron} /></div>
        </div><button type="button" onClick={chat.newConversation} aria-label="New conversation" title="New conversation" className={`${styles.newConversation} ${focus}`}><Plus size={17} strokeWidth={1.6} /></button></div>
        {state.nextConversationCursor && <button type="button" disabled={state.loadingConversations} onClick={() => { void chat.loadMoreConversations(); }} className={`${styles.more} ${focus}`}>Load more conversations</button>}
      </div>}

      <div ref={regionRef} role="region" aria-label="Kepler AI conversation" className={styles.conversation}>
        {projectsLoading ? <p role="status" className={styles.status}>Loading accessible projects…</p> : projectsError ? <div role="alert" className={styles.error}><p className={styles.errorText}>Projects could not be loaded. Chat is unavailable.</p><button type="button" onClick={chat.refreshProjects} className={`${control} ${styles.retry}`}>Retry project discovery</button></div> : !selected ? <div className={styles.empty}><span className={styles.brandIcon}><MessageSquare size={21} aria-hidden="true" /></span><h3 className={styles.emptyTitle}>A project is your starting point.</h3><p className={styles.description}>Projects you own or join will appear here. Select an accessible project to chat with Kepler.</p><Link href="/projects" className={`${styles.action} ${focus}`}>View projects<ArrowUpRight size={14} /></Link></div> : <>
          {state.nextMessageCursor && <button type="button" disabled={state.loadingMessages} onClick={() => { void chat.loadOlder(); }} className={`${control} mb-4 w-full`}>Load earlier messages</button>}
          {(state.loadingConversations || state.loadingMessages) && <p role="status" className={styles.status}><LoaderCircle size={14} aria-hidden="true" className="shrink-0 animate-spin motion-reduce:animate-none" />Loading conversation…</p>}
          {!state.messages.length && !state.pending && !busy && !state.error && <div className={styles.empty}><span aria-hidden="true" className={styles.brandIcon}><MessageSquare size={21} strokeWidth={1.5} /></span><h3 className={styles.emptyTitle}>Your project, in focus.</h3><p className={styles.description}>Ask about {selected.name || "this project"}. Kepler uses the project information your account can access.</p></div>}
          <div role="log" aria-label="Messages" aria-live="polite" aria-relevant="additions text" className={styles.messages}>
            {state.messages.map(message => <Message key={message.id} message={message} projectId={state.projectId} />)}
            {pendingVisible && state.pending && <article aria-label="Your unconfirmed message" className={`${styles.message} ${styles.user}`}><p className={styles.author}>You · {state.sending ? "Sending" : "Not yet confirmed"}</p><p className={styles.messageText}>{state.pending.content}</p></article>}
          </div>
          {state.sending && <p role="status" className={styles.status}><LoaderCircle size={14} aria-hidden="true" className="shrink-0 animate-spin motion-reduce:animate-none" />{state.pending?.processing ? "Response not yet confirmed. Checking the same message…" : "Kepler is responding. This may take over a minute…"}</p>}
          {state.error && <div role="alert" className={styles.error}><p className={styles.errorText}>{state.error.message}</p>{state.error.retry && <button type="button" disabled={busy} onClick={() => { void chat.retry(); }} className={`${control} ${styles.retry}`}>{state.error.retry === "send" ? "Retry original message" : "Reload history"}</button>}</div>}
          {!state.messages.length && !state.pending && <div className="mt-3"><p className={styles.sectionLabel}>Suggested prompts</p><div className={styles.prompts}>{suggestedPrompts.map(prompt => <button key={prompt} type="button" disabled={!canCompose} onClick={() => { void chat.send(prompt); }} className={`${styles.prompt} ${focus}`}>{prompt}</button>)}</div></div>}
        </>}
      </div>

      <form onSubmit={event => { event.preventDefault(); if (canSend) void chat.send(); }} className={styles.composer}>
        <label htmlFor={`${titleId}-message`} className={styles.composerLabel}>Message Kepler AI</label>
        <div className={styles.composerBox}>
          <textarea id={`${titleId}-message`} value={state.draft} onChange={event => chat.setDraft(event.target.value)} disabled={!canCompose} maxLength={4000} rows={2} aria-describedby={statusId} placeholder={selected ? "Ask about this project…" : "Select an accessible project"} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (canSend) void chat.send(); } }} className={styles.input} />
          <div className={styles.composerActions}><span className={styles.counter}>{state.draft.length}/4,000</span><button type="submit" disabled={!canSend} aria-label="Send message" title="Send message" className={`${styles.send} ${focus}`}>{state.sending ? <LoaderCircle size={16} aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <Send size={16} aria-hidden="true" />}<span className="sr-only">Send</span></button></div>
        </div>
        <p id={statusId} className={styles.disclaimer}><ShieldCheck size={12} aria-hidden="true" className="mt-0.5 shrink-0" />Project-scoped assistance. Verify AI responses before acting.</p>
      </form>
    </div>
  );
}
