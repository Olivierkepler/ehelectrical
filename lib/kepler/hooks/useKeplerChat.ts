"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { KeplerChatStore, emptyChatSnapshot } from "../keplerChatStore";
import { useWorkspaceProjects } from "./useWorkspaceProjects";

/** The shell calls this once and passes the resulting controller to both presentation views. */
export function useKeplerChat(open: boolean) {
  const portfolio = useWorkspaceProjects();
  const [store] = useState(() => new KeplerChatStore());
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, () => emptyChatSnapshot);
  const projects = !portfolio.loading && !portfolio.error ? portfolio.data ?? [] : [];
  // ID serialization avoids refetching just because a provider rerenders.
  const projectIds = JSON.stringify(projects.map(p => p.id));
  useEffect(() => { store.setProjects(JSON.parse(projectIds) as string[]); }, [store, projectIds]);
  useEffect(() => { store.setEnabled(open); }, [store, open]);
  useEffect(() => () => store.suspend(), [store]);
  const authorized = projects.some(p => p.id === state.projectId);
  return {
    state: authorized ? state : emptyChatSnapshot, projects,
    projectsLoading: portfolio.loading, projectsError: Boolean(portfolio.error), refreshProjects: portfolio.refresh,
    selectProject: store.selectProject, selectConversation: store.selectConversation, newConversation: store.newConversation,
    setDraft: store.setDraft, send: store.send, retry: store.retry,
    loadOlder: () => store.loadMessages(true), loadMoreConversations: () => store.loadConversations(true),
  };
}
export type KeplerChatController = ReturnType<typeof useKeplerChat>;
