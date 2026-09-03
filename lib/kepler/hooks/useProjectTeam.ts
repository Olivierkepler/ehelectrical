"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ApiError } from "@/lib/kepler/api/client";
import {
  getMessageableMembers,
  getProjectMembers,
  presentMessageableMember,
  presentProjectMember,
  type MessageableMember,
  type ProjectMemberRecord,
  type ProjectTeamPerson,
} from "@/lib/kepler/api/projectTeam";
import { useAuth } from "@/lib/kepler/AuthProvider";
import { useOwnProfile } from "@/lib/kepler/hooks/useOwnProfile";
import { useProjectWorkspace } from "@/lib/kepler/hooks/useProjectWorkspace";

type RawTeam =
  | { source: "members"; items: ProjectMemberRecord[] }
  | { source: "messageable"; items: MessageableMember[] };

export function useProjectTeam() {
  const { user, loading: authLoading } = useAuth();
  const { data: profile } = useOwnProfile();
  const { projectId, membership, membershipRole, unavailable } =
    useProjectWorkspace();
  const [raw, setRaw] = useState<RawTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!user || !membership || unavailable) {
      setRaw(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const request =
      membershipRole === "owner"
        ? getProjectMembers(projectId).then(
            (items) => ({ source: "members", items }) as const,
          )
        : getMessageableMembers(projectId).then(
            (items) => ({ source: "messageable", items }) as const,
          );

    request
      .then((result) => {
        if (!cancelled) {
          setRaw(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setRaw(null);
          if (
            err instanceof ApiError &&
            (err.status === 403 || err.status === 404)
          ) {
            setError("unavailable");
          } else {
            setError(
              err instanceof Error
                ? err.message
                : "Unable to load project team.",
            );
          }
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    user,
    membership,
    membershipRole,
    unavailable,
    projectId,
    reloadKey,
  ]);

  const data = useMemo<ProjectTeamPerson[] | null>(() => {
    if (!raw) {
      return null;
    }
    const currentUserId = user?.uid ?? null;
    if (raw.source === "members") {
      const own = {
        displayName: profile?.displayName?.trim() || user?.displayName || null,
        email: profile?.email?.trim() || user?.email || null,
        avatarUrl: profile?.avatarUrl?.trim() || user?.photoURL || null,
      };
      return raw.items.map((member) =>
        presentProjectMember(member, currentUserId, own),
      );
    }
    return raw.items.map((member) =>
      presentMessageableMember(member, currentUserId),
    );
  }, [raw, user, profile]);

  return { data, loading, error, refresh };
}
