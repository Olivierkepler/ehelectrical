"use client";

import { useState } from "react";
import { UserRound } from "lucide-react";

import WorkspaceSectionHeader from "@/components/kepler/WorkspaceSectionHeader";
import WorkspaceSectionState from "@/components/kepler/WorkspaceSectionState";
import {
  formatTeamRoleLabel,
  formatTeamStatusLabel,
  teamPersonPrimaryLabel,
  type ProjectMemberStatus,
  type ProjectTeamPerson,
} from "@/lib/kepler/api/projectTeam";
import { useProjectTeam } from "@/lib/kepler/hooks/useProjectTeam";
import { useProjectWorkspace } from "@/lib/kepler/hooks/useProjectWorkspace";

function TeamAvatar({ url }: { url: string | null }) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(url && !broken);

  return (
    <span
      className="
        flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        overflow-hidden
        rounded-full
        border
        border-[var(--kepler-border)]
        bg-[var(--kepler-background)]
        text-[var(--kepler-navy)]
      "
      aria-hidden="true"
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url ?? ""}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <UserRound size={15} strokeWidth={1.75} />
      )}
    </span>
  );
}

function roleClass(role: string): string {
  if (role === "owner") {
    return "bg-[var(--kepler-navy)]/[0.06] text-[var(--kepler-navy)]";
  }
  return "border border-[var(--kepler-border)] text-[var(--kepler-secondary)]";
}

function statusClass(status: ProjectMemberStatus): string {
  if (status === "active") {
    return "border border-[var(--kepler-border)] text-[var(--kepler-secondary)]";
  }
  return "border border-[var(--kepler-border)] text-[var(--kepler-muted)]";
}

function TeamRow({
  person,
  showStatus,
}: {
  person: ProjectTeamPerson;
  showStatus: boolean;
}) {
  const primary = teamPersonPrimaryLabel(person);
  const email =
    person.email?.trim() && person.email.trim() !== primary
      ? person.email.trim()
      : null;

  return (
    <tr className="border-b border-[var(--kepler-border)]">
      <td className="py-2.5 pr-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <TeamAvatar key={person.avatarUrl ?? person.id} url={person.avatarUrl} />
          <div className="min-w-0">
            <p className="flex min-w-0 items-baseline gap-2">
              <span className="truncate text-[14px] font-semibold leading-snug text-[var(--kepler-ink)]">
                {primary ?? (person.isCurrentUser ? "You" : "—")}
              </span>
              {person.isCurrentUser && primary ? (
                <span className="shrink-0 text-[11px] font-medium text-[var(--kepler-muted)]">
                  You
                </span>
              ) : null}
            </p>
            {email ? (
              <p className="mt-0.5 truncate text-[12px] text-[var(--kepler-muted)]">
                {email}
              </p>
            ) : null}
          </div>
        </div>
      </td>
      <td className="py-2.5 pr-4">
        {person.role ? (
          <span
            className={`inline-flex rounded-[3px] px-2 py-0.5 text-[11px] font-medium ${roleClass(person.role)}`}
          >
            {formatTeamRoleLabel(person.role)}
          </span>
        ) : (
          "—"
        )}
      </td>
      {showStatus ? (
        <td className="py-2.5">
          {person.membershipStatus ? (
            <span
              className={`inline-flex rounded-[3px] px-2 py-0.5 text-[11px] font-medium ${statusClass(person.membershipStatus)}`}
            >
              {formatTeamStatusLabel(person.membershipStatus)}
            </span>
          ) : (
            "—"
          )}
        </td>
      ) : null}
    </tr>
  );
}

export default function ProjectTeamPage() {
  const { unavailable, loading: workspaceLoading } = useProjectWorkspace();
  const { data, loading, error, refresh } = useProjectTeam();

  if (unavailable || workspaceLoading) {
    return null;
  }

  const showStatus = Boolean(
    data?.some((person) => person.membershipStatus !== null),
  );

  return (
    <section aria-labelledby="team-heading">
      <WorkspaceSectionHeader
        eyebrow="Team"
        title="Project team"
        count={data && data.length > 0 ? data.length : null}
        countLabel={data?.length === 1 ? "member" : "members"}
      />
      <h2 id="team-heading" className="sr-only">
        Project team
      </h2>

      <WorkspaceSectionState
        loading={loading}
        error={error}
        onRetry={refresh}
        empty={!loading && !error && data !== null && data.length === 0}
        emptyTitle="No project members to show"
        resourceLabel="project team"
        skeleton="roster"
        skeletonRows={5}
      >
        {data && data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-t border-[var(--kepler-border)] text-left text-[13px]">
              <thead>
                <tr className="border-b border-[var(--kepler-border)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--kepler-muted)]">
                  <th className="py-2.5 pr-4 font-semibold">Person</th>
                  <th className="py-2.5 pr-4 font-semibold">Role</th>
                  {showStatus ? (
                    <th className="py-2.5 font-semibold">Status</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {data.map((person) => (
                  <TeamRow
                    key={person.id}
                    person={person}
                    showStatus={showStatus}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </WorkspaceSectionState>
    </section>
  );
}
